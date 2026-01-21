import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import moodRoutes from './routes/moods.js';
import menuRoutes from './routes/menu.js';
import couponRoutes from './routes/coupons.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import counterRoutes from './routes/counter.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/counter', counterRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '🏥 Crave Therapy API is healthy!' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🏥 Crave Therapy Server running on port ${PORT}`);
});
