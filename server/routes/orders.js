import express from 'express';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order (guest or logged in)
// @access  Public
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { items, guestInfo, couponCode, notes, tableNumber } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Please add items to order' });
        }

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let discount = 0;
        let couponApplied = null;

        // Apply coupon if provided
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon) {
                if (coupon.isExclusive && !req.user) {
                    return res.status(403).json({ success: false, message: 'Login required for this coupon' });
                }
                if (subtotal >= coupon.minOrder) {
                    if (coupon.type === 'percent') {
                        discount = (subtotal * coupon.value) / 100;
                        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
                    } else if (coupon.type === 'fixed') {
                        discount = coupon.value;
                    }
                    couponApplied = coupon._id;

                    // Increment usage count
                    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
                }
            }
        }

        const total = subtotal - discount;

        const order = await Order.create({
            user: req.user ? req.user._id : null,
            guestInfo: req.user ? null : guestInfo,
            items,
            subtotal,
            discount,
            couponApplied,
            couponCode: couponCode?.toUpperCase(),
            total,
            notes,
            tableNumber
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user's orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort('-createdAt')
            .populate('couponApplied');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/orders/guest/:phone
// @desc    Get guest orders by phone number
// @access  Public
router.get('/guest/:phone', async (req, res) => {
    try {
        // Query using the nested object field pattern
        const orders = await Order.find({ 
            user: null, 
            'guestInfo.phone': req.params.phone 
        })
        .sort('-createdAt')
        .populate('couponApplied');
        
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public (for order tracking)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('couponApplied');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
