import express from 'express';
import Mood from '../models/Mood.js';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// @route   GET /api/moods
// @desc    Get all active moods with their menu items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const moods = await Mood.find({ isActive: true }).sort('order');

        // Get menu items for each mood
        const moodsWithItems = await Promise.all(
            moods.map(async (mood) => {
                const items = await MenuItem.find({ mood: mood._id, isActive: true });
                return {
                    ...mood.toObject(),
                    items
                };
            })
        );

        res.json({ success: true, data: moodsWithItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/moods/:slug
// @desc    Get single mood by slug with menu items
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const mood = await Mood.findOne({ slug: req.params.slug, isActive: true });
        if (!mood) {
            return res.status(404).json({ success: false, message: 'Mood not found' });
        }

        const items = await MenuItem.find({ mood: mood._id, isActive: true });

        res.json({
            success: true,
            data: { ...mood.toObject(), items }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
