import express from 'express';
import Mood from '../models/Mood.js';
import MenuItem from '../models/MenuItem.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply auth to all admin routes
router.use(protect, adminOnly);

// ============ DASHBOARD ============
router.get('/dashboard', async (req, res) => {
    try {
        const [totalOrders, totalRevenue, totalUsers, todayOrders] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
            User.countDocuments({ role: 'user' }),
            Order.countDocuments({
                createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalUsers,
                todayOrders
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ MOODS CRUD ============
router.get('/moods', async (req, res) => {
    try {
        const moods = await Mood.find().sort('order');
        res.json({ success: true, data: moods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/moods', async (req, res) => {
    try {
        const mood = await Mood.create(req.body);
        res.status(201).json({ success: true, data: mood });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/moods/:id', async (req, res) => {
    try {
        const mood = await Mood.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: mood });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/moods/:id', async (req, res) => {
    try {
        await Mood.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Mood deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ MENU ITEMS CRUD ============
router.get('/menu', async (req, res) => {
    try {
        const items = await MenuItem.find().populate('mood', 'name emoji').sort('-createdAt');
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/menu', async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/menu/:id', async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/menu/:id', async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ COUPONS CRUD ============
router.get('/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort('-createdAt');
        res.json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/coupons', async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/coupons/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/coupons/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ ORDERS MANAGEMENT ============
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('couponApplied', 'code name')
            .sort('-createdAt');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/orders/:id/status', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
