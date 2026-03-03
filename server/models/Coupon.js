import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a coupon name'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['percent', 'fixed', 'bogo'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    minOrder: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    isExclusive: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: '💊'
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        default: null
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isCounterOnly: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Coupon', couponSchema);
