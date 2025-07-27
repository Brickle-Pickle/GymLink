import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

class User {
    constructor(userData) {
        this.email = userData.email;
        this.password = userData.password; // Will be hashed before saving
        this.googleId = userData.googleId || null;
        this.username = userData.username;
        this.createdAt = userData.createdAt || new Date();
        this.lastLogin = userData.lastLogin || null;
        this.isActive = userData.isActive !== undefined ? userData.isActive : true;
        
        // Default settings structure
        this.settings = {
            workoutsPrivate: userData.settings?.workoutsPrivate || false,
            notifications: {
                friendRequests: userData.settings?.notifications?.friendRequests !== undefined 
                    ? userData.settings.notifications.friendRequests : true,
                workoutReminders: userData.settings?.notifications?.workoutReminders !== undefined 
                    ? userData.settings.notifications.workoutReminders : true,
                achievements: userData.settings?.notifications?.achievements !== undefined 
                    ? userData.settings.notifications.achievements : true
            },
            preferences: {
                theme: userData.settings?.preferences?.theme || 'light',
                language: userData.settings?.preferences?.language || 'es',
                units: userData.settings?.preferences?.units || 'metric'
            }
        };
        
        this.friends = userData.friends || [];
        this.friendRequests = {
            sent: userData.friendRequests?.sent || [],
            received: userData.friendRequests?.received || []
        };
        
        // Default stats
        this.stats = {
            totalWorkouts: userData.stats?.totalWorkouts || 0,
            totalExercises: userData.stats?.totalExercises || 0,
            totalSets: userData.stats?.totalSets || 0,
            totalWeight: userData.stats?.totalWeight || 0,
            streak: userData.stats?.streak || 0
        };
    }

    // Hash password before saving
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // Compare password for login
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Create new user
    static async create(userData) {
        const db = getDB();
        
        // Check if email or username already exists
        const existingUser = await db.collection('users').findOne({
            $or: [
                { email: userData.email },
                { username: userData.username }
            ]
        });
        
        if (existingUser) {
            throw new Error('Email or username already exists');
        }

        // Hash password if provided
        if (userData.password) {
            userData.password = await User.hashPassword(userData.password);
        }

        const user = new User(userData);
        const result = await db.collection('users').insertOne(user);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return { _id: result.insertedId, ...userWithoutPassword };
    }

    // Find user by email
    static async findByEmail(email) {
        const db = getDB();
        return await db.collection('users').findOne({ email });
    }

    // Find user by username
    static async findByUsername(username) {
        const db = getDB();
        return await db.collection('users').findOne({ username });
    }

    // Find user by ID
    static async findById(id) {
        const db = getDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
        if (user) {
            // Remove password from returned user
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    // Find user by Google ID
    static async findByGoogleId(googleId) {
        const db = getDB();
        return await db.collection('users').findOne({ googleId });
    }

    // Update user profile
    static async updateById(id, updateData) {
        const db = getDB();
        
        // If updating password, hash it first
        if (updateData.password) {
            updateData.password = await User.hashPassword(updateData.password);
        }

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return result.modifiedCount > 0;
    }

    // Update last login
    static async updateLastLogin(id) {
        const db = getDB();
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: { lastLogin: new Date() } }
        );
        return result.modifiedCount > 0;
    }

    // Add friend
    static async addFriend(userId, friendId) {
        const db = getDB();
        const userObjectId = new ObjectId(userId);
        const friendObjectId = new ObjectId(friendId);

        // Add friend to user's friends list and remove from sent requests
        await db.collection('users').updateOne(
            { _id: userObjectId },
            { 
                $addToSet: { friends: friendObjectId },
                $pull: { 'friendRequests.sent': friendObjectId }
            }
        );

        // Add user to friend's friends list and remove from received requests
        await db.collection('users').updateOne(
            { _id: friendObjectId },
            { 
                $addToSet: { friends: userObjectId },
                $pull: { 'friendRequests.received': userObjectId }
            }
        );

        return true;
    }

    // Send friend request
    static async sendFriendRequest(userId, targetUserId) {
        const db = getDB();
        const userObjectId = new ObjectId(userId);
        const targetObjectId = new ObjectId(targetUserId);

        // Add to sender's sent requests
        await db.collection('users').updateOne(
            { _id: userObjectId },
            { $addToSet: { 'friendRequests.sent': targetObjectId } }
        );

        // Add to receiver's received requests
        await db.collection('users').updateOne(
            { _id: targetObjectId },
            { $addToSet: { 'friendRequests.received': userObjectId } }
        );

        return true;
    }

    // Remove friend
    static async removeFriend(userId, friendId) {
        const db = getDB();
        const userObjectId = new ObjectId(userId);
        const friendObjectId = new ObjectId(friendId);

        // Remove from both users' friends lists
        await db.collection('users').updateOne(
            { _id: userObjectId },
            { $pull: { friends: friendObjectId } }
        );

        await db.collection('users').updateOne(
            { _id: friendObjectId },
            { $pull: { friends: userObjectId } }
        );

        return true;
    }

    // Update user stats
    static async updateStats(userId, statsUpdate) {
        const db = getDB();
        const updateQuery = {};
        
        // Build update query for stats
        Object.keys(statsUpdate).forEach(key => {
            updateQuery[`stats.${key}`] = statsUpdate[key];
        });

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $inc: updateQuery }
        );
        return result.modifiedCount > 0;
    }

    // Update user settings
    static async updateSettings(userId, settingsUpdate) {
        const db = getDB();
        const updateQuery = {};
        
        // Build nested update query for settings
        const flattenSettings = (obj, prefix = 'settings') => {
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const newKey = `${prefix}.${key}`;
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    flattenSettings(value, newKey);
                } else {
                    updateQuery[newKey] = value;
                }
            });
        };

        flattenSettings(settingsUpdate);

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateQuery }
        );
        return result.modifiedCount > 0;
    }

    // Get user's friends with their basic info
    static async getFriends(userId) {
        const db = getDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { friends: 1 } }
        );

        if (!user || !user.friends.length) {
            return [];
        }

        const friends = await db.collection('users').find(
            { _id: { $in: user.friends } },
            { projection: { password: 0, googleId: 0 } }
        ).toArray();

        return friends;
    }

    // Search users by username or email
    static async searchUsers(query, currentUserId, limit = 10) {
        const db = getDB();
        const searchRegex = new RegExp(query, 'i');
        
        const users = await db.collection('users').find(
            {
                _id: { $ne: new ObjectId(currentUserId) },
                $or: [
                    { username: searchRegex },
                    { email: searchRegex }
                ],
                isActive: true
            },
            { 
                projection: { 
                    password: 0, 
                    googleId: 0,
                    friendRequests: 0,
                    settings: 0
                } 
            }
        ).limit(limit).toArray();

        return users;
    }

    // Delete user account
    static async deleteById(id) {
        const db = getDB();
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

export default User;