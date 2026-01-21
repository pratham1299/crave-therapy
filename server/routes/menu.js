import express from 'express';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// @route   GET /api/menu
// @desc    Get all active menu items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { mood, category } = req.query;
        const filter = { isActive: true };

        if (mood) filter.mood = mood;
        if (category) filter.category = category;

        const items = await MenuItem.find(filter).populate('mood', 'name slug emoji color');
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id).populate('mood');
        if (!item) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
