const { MongoClient } = require('mongodb');

let db;
let client;

const connectDB = async () => {
    try {
        const uri = process.env.DB_URI;
        
        client = new MongoClient(uri, {
            useUnifiedTopology: true,
        });

        await client.connect();
        db = client.db();
        
        console.log('MongoDB connected successfully');
        
        // Create indexes for better performance
        await createIndexes();
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        // Exercise indexes
        await db.collection('exercises').createIndex({ name: 1 });
        await db.collection('exercises').createIndex({ category: 1 });
        await db.collection('exercises').createIndex({ createdBy: 1 });
        await db.collection('exercises').createIndex({ isPublic: 1 });
        
        // User indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        
        // Workout indexes
        await db.collection('workouts').createIndex({ userId: 1 });
        await db.collection('workouts').createIndex({ createdAt: -1 });
        
        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};

const closeDB = async () => {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
    }
};

module.exports = {
    connectDB,
    getDB,
    closeDB
};