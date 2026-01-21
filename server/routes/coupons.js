import express from 'express';
import Coupon from '../models/Coupon.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/coupons
// @desc    Get available coupons (public + exclusive if logged in)
// @access  Public/Private
router.get('/', optionalAuth, async (req, res) => {
    try {
        const filter = { isActive: true };

        // If not logged in, only show non-exclusive coupons
        if (!req.user) {
            filter.isExclusive = false;
        }

        const coupons = await Coupon.find(filter);
        res.json({ success: true, data: coupons, isLoggedIn: !!req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post('/validate', optionalAuth, async (req, res) => {
    try {
        const { code, subtotal } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        // Check if exclusive and user not logged in
        if (coupon.isExclusive && !req.user) {
            return res.status(403).json({ success: false, message: 'Please login to use this exclusive coupon' });
        }

        // Check minimum order
        if (subtotal < coupon.minOrder) {
            return res.status(400).json({
                success: false,
                message: `Minimum order of ₹${coupon.minOrder} required`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percent') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.type === 'fixed') {
            discount = coupon.value;
        }

        res.json({
            success: true,
            data: {
                coupon,
                discount,
                finalTotal: subtotal - discount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
