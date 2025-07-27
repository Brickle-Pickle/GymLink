import { getDB } from '../config/database';
import { ObjectId } from 'mongodb';

class Exercise {
    constructor(exerciseData) {
        this.name = exerciseData.name;
        this.type = exerciseData.type; // 'reps-only', 'time-only', 'reps-weight', 'reps-time'
        this.category = exerciseData.category;
        this.equipment = exerciseData.equipment;
        this.difficulty = exerciseData.difficulty; // 'beginner', 'intermediate', 'advanced'
        this.description = exerciseData.description;
        this.instructions = exerciseData.instructions || [];
        this.isPublic = exerciseData.isPublic !== undefined ? exerciseData.isPublic : true;
        this.createdBy = exerciseData.createdBy;
        this.createdAt = exerciseData.createdAt || new Date();
        this.updatedAt = exerciseData.updatedAt || new Date();
        this.reportCount = exerciseData.reportCount || 0;
    }

    // Create new exercise
    static async create(exerciseData) {
        const db = getDB();
        const exercise = new Exercise(exerciseData);
        const result = await db.collection('exercises').insertOne(exercise);
        return { _id: result.insertedId, ...exercise };
    }

    // Find all exercises with optional filters
    static async findAll(filters = {}, options = {}) {
        const db = getDB();
        const { page = 1, limit = 20, sortBy = 'name', sortOrder = 1 } = options;
        
        const query = {};
        
        // Apply filters
        if (filters.category) query.category = filters.category;
        if (filters.difficulty) query.difficulty = filters.difficulty;
        if (filters.equipment) query.equipment = new RegExp(filters.equipment, 'i');
        if (filters.isPublic !== undefined) query.isPublic = filters.isPublic;
        if (filters.createdBy) query.createdBy = filters.createdBy;
        if (filters.search) {
            query.$or = [
                { name: new RegExp(filters.search, 'i') },
                { description: new RegExp(filters.search, 'i') }
            ];
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder };

        const exercises = await db.collection('exercises')
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await db.collection('exercises').countDocuments(query);

        return {
            exercises,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Find exercise by ID
    static async findById(id) {
        const db = getDB();
        return await db.collection('exercises').findOne({ _id: new ObjectId(id) });
    }

    // Update exercise
    static async updateById(id, updateData) {
        const db = getDB();
        updateData.updatedAt = new Date();
        const result = await db.collection('exercises').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return result.modifiedCount > 0;
    }

    // Delete exercise
    static async deleteById(id) {
        const db = getDB();
        const result = await db.collection('exercises').deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    // Get exercise categories
    static async getCategories() {
        const db = getDB();
        return await db.collection('exercises').distinct('category');
    }

    // Get equipment types
    static async getEquipment() {
        const db = getDB();
        return await db.collection('exercises').distinct('equipment');
    }
}

export default Exercise;