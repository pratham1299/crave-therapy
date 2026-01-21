import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is staff or admin
const staffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Staff access required' });
    }
};

// Apply auth to all counter routes
router.use(protect, staffOrAdmin);

// @route   GET /api/counter/orders
// @desc    Get all unpaid orders (active orders)
// @access  Staff/Admin
router.get('/orders', async (req, res) => {
    try {
        const { search, status, showPaid } = req.query;

        let filter = {};

        // By default show only unpaid orders
        if (showPaid !== 'true') {
            filter.isPaid = false;
        }

        // Filter by status
        if (status && status !== 'all') {
            filter.status = status;
        }

        let orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .populate('couponApplied', 'code name')
            .sort('-createdAt');

        // Search by name or phone
        if (search) {
            const searchLower = search.toLowerCase();
            orders = orders.filter(order => {
                const guestName = order.guestInfo?.name?.toLowerCase() || '';
                const guestPhone = order.guestInfo?.phone || '';
                const userName = order.user?.name?.toLowerCase() || '';
                const userPhone = order.user?.phone || '';
                const table = order.tableNumber?.toLowerCase() || '';

                return guestName.includes(searchLower) ||
                    guestPhone.includes(search) ||
                    userName.includes(searchLower) ||
                    userPhone.includes(search) ||
                    table.includes(searchLower);
            });
        }

        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/counter/orders/:id
// @desc    Get single order details
// @access  Staff/Admin
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('couponApplied', 'code name value type');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/counter/orders/:id/items
// @desc    Update order items (add/remove/modify)
// @access  Staff/Admin
router.put('/orders/:id/items', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.isPaid) {
            return res.status(400).json({ success: false, message: 'Cannot modify a paid order' });
        }

        const { items } = req.body;

        // Recalculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal - order.discount;

        order.items = items;
        order.subtotal = subtotal;
        order.total = Math.max(0, total);

        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/counter/orders/:id/add-item
// @desc    Add item to order
// @access  Staff/Admin
router.post('/orders/:id/add-item', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.isPaid) {
            return res.status(400).json({ success: false, message: 'Cannot modify a paid order' });
        }

        const { menuItemId, quantity = 1 } = req.body;

        // Get menu item details
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        // Check if item already exists in order
        const existingItemIndex = order.items.findIndex(
            item => item.menuItem.toString() === menuItemId
        );

        if (existingItemIndex > -1) {
            order.items[existingItemIndex].quantity += quantity;
        } else {
            order.items.push({
                menuItem: menuItemId,
                name: menuItem.name,
                price: menuItem.price,
                quantity
            });
        }

        // Recalculate totals
        order.subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        order.total = Math.max(0, order.subtotal - order.discount);

        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/counter/orders/:id/remove-item/:itemIndex
// @desc    Remove item from order
// @access  Staff/Admin
router.delete('/orders/:id/remove-item/:itemIndex', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.isPaid) {
            return res.status(400).json({ success: false, message: 'Cannot modify a paid order' });
        }

        const itemIndex = parseInt(req.params.itemIndex);

        if (itemIndex < 0 || itemIndex >= order.items.length) {
            return res.status(400).json({ success: false, message: 'Invalid item index' });
        }

        order.items.splice(itemIndex, 1);

        // Recalculate totals
        order.subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        order.total = Math.max(0, order.subtotal - order.discount);

        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/counter/orders/:id/pay
// @desc    Mark order as paid
// @access  Staff/Admin
router.put('/orders/:id/pay', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.isPaid) {
            return res.status(400).json({ success: false, message: 'Order already paid' });
        }

        order.isPaid = true;
        order.paidAt = new Date();
        order.billedBy = req.user._id;
        order.status = 'delivered';

        await order.save();

        res.json({ success: true, data: order, message: 'Payment recorded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/counter/menu
// @desc    Get all menu items for adding to orders
// @access  Staff/Admin
router.get('/menu', async (req, res) => {
    try {
        const items = await MenuItem.find({ isActive: true })
            .populate('mood', 'name emoji')
            .sort('name');
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/counter/stats
// @desc    Get today's billing stats
// @access  Staff/Admin
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todayPaid, todayPending, todayRevenue] = await Promise.all([
            Order.countDocuments({ isPaid: true, paidAt: { $gte: today } }),
            Order.countDocuments({ isPaid: false }),
            Order.aggregate([
                { $match: { isPaid: true, paidAt: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                todayPaid,
                todayPending,
                todayRevenue: todayRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
