import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    emoji: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    treatment: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    bgColor: {
        type: String,
        default: '#f0f0f0'
    },
    musicUrl: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('Mood', moodSchema);
