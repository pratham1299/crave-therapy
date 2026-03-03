import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mood from './models/Mood.js';
import MenuItem from './models/MenuItem.js';
import Coupon from './models/Coupon.js';
import User from './models/User.js';

dotenv.config();

const moods = [
    {
        name: 'Heartbroken',
        slug: 'heartbroken',
        emoji: '💔',
        title: 'Symptom: Heartbroken',
        treatment: 'Treatment for: Sadness, loneliness, and bad texts',
        color: '#FF6B9D',
        bgColor: '#FFF0F5',
        order: 1
    },
    {
        name: 'Angry & Frustrated',
        slug: 'angry',
        emoji: '😤',
        title: 'Symptom: Angry & Frustrated',
        treatment: 'Treatment for: Bad bosses, traffic, and general annoyance',
        color: '#FF4444',
        bgColor: '#FFF5F5',
        order: 2
    },
    {
        name: 'Stressed',
        slug: 'stressed',
        emoji: '😰',
        title: 'Symptom: Stressed',
        treatment: 'Treatment for: Deadlines, overthinking, and anxiety',
        color: '#6B5B95',
        bgColor: '#F5F0FF',
        order: 3
    },
    {
        name: 'Hyper',
        slug: 'hyper',
        emoji: '⚡',
        title: 'Symptom: Hyper',
        treatment: 'Treatment for: Too much energy and restlessness',
        color: '#FFB347',
        bgColor: '#FFFAF0',
        order: 4
    }
];

const menuItems = [
    // Heartbroken
    { name: 'The "Comfort Hug" Pasta', description: 'Masala Macaroni cooked in a creamy tomato sauce. Loaded with cheese to fill the void.', price: 129, category: 'main', moodSlug: 'heartbroken', isPopular: true },
    { name: 'The "I Don\'t Care" Burger', description: 'Double potato patty, extra mayo, zero judgment. Soft bun, easy to eat while crying.', price: 99, category: 'main', moodSlug: 'heartbroken' },
    { name: 'Emotional Support Fries', description: 'Loaded cheese fries with all the toppings you deserve.', price: 89, category: 'side', moodSlug: 'heartbroken' },
    { name: 'Breakup Brownie', description: 'Warm chocolate brownie with ice cream. Because you deserve this.', price: 79, category: 'dessert', moodSlug: 'heartbroken' },

    // Angry
    { name: 'The "Rage Release" Burger', description: 'Crispy fried patty drowned in spicy Schezwan sauce & Jalapeños. It bites back.', price: 119, category: 'main', moodSlug: 'angry', isPopular: true, isSpicy: true },
    { name: 'The "Crunch Therapy" Wrap', description: 'Toasted tortilla filled with crushed nachos, salsa, and spicy veggies. Loud crunch guaranteed.', price: 109, category: 'main', moodSlug: 'angry', isSpicy: true },
    { name: 'The "One-Hand" Wrap', description: 'Classic Butter Paneer rolled tight in a paratha. No mess, so you don\'t have to pause.', price: 119, category: 'main', moodSlug: 'angry' },
    { name: 'Fury Fries', description: 'Extra spicy peri-peri seasoned fries. Handle with caution.', price: 79, category: 'side', moodSlug: 'angry', isSpicy: true },

    // Stressed
    { name: 'Chill Pill Sandwich', description: 'Classic grilled cheese sandwich. Simple, warm, and comforting.', price: 89, category: 'main', moodSlug: 'stressed' },
    { name: 'Zen Garden Bowl', description: 'Fresh mixed greens with hummus, feta, and olive oil dressing.', price: 129, category: 'main', moodSlug: 'stressed', isPopular: true },
    { name: 'Calm Down Chai', description: 'Masala chai served with butter cookies. Take a deep breath.', price: 59, category: 'drink', moodSlug: 'stressed' },
    { name: 'Stress Ball Momos', description: 'Steamed vegetable momos with soothing soup.', price: 99, category: 'main', moodSlug: 'stressed' },

    // Hyper
    { name: 'Energy Burst Bowl', description: 'Protein-packed rice bowl with grilled veggies and tangy sauce.', price: 149, category: 'main', moodSlug: 'hyper', isPopular: true },
    { name: 'Hyperactive Wings', description: 'Crispy fried wings tossed in zesty sauce. Finger-licking good.', price: 139, category: 'main', moodSlug: 'hyper' },
    { name: 'Sugar Rush Shake', description: 'Chocolate peanut butter milkshake with extra whipped cream.', price: 99, category: 'drink', moodSlug: 'hyper' },
    { name: 'Power Up Pizza', description: 'Loaded mini pizza with all your favorite toppings.', price: 119, category: 'main', moodSlug: 'hyper' },

    // Side Effects (available for all moods)
    { name: 'Placebo Fries', description: 'Just classic salted fries. Sometimes simple is best.', price: 69, category: 'side', moodSlug: 'heartbroken' },
    { name: 'Shock Therapy Fries', description: 'Loaded fries with spicy sauce overload.', price: 99, category: 'side', moodSlug: 'angry', isSpicy: true },
    { name: 'Garlic Breadsticks', description: 'Freshly baked garlic bread. The crunch you need.', price: 79, category: 'side', moodSlug: 'stressed' },

    // Liquid Prescriptions
    { name: 'The Brain Freeze Cold Coffee', description: 'Strong cold coffee to kickstart your brain.', price: 69, category: 'drink', moodSlug: 'hyper' },
    { name: 'The Detox Masala Lemonade', description: 'Refreshing masala lemonade with mint.', price: 69, category: 'drink', moodSlug: 'stressed' },
    { name: 'The Antidote Virgin Mint Mojito', description: 'Cool mint mojito to refresh your soul.', price: 69, category: 'drink', moodSlug: 'heartbroken' }
];

const coupons = [
    {
        name: 'The Syringe Shot',
        code: 'RELIEF100',
        description: 'Instant Relief Shot - ₹100 OFF your next order',
        type: 'fixed',
        value: 100,
        minOrder: 300,
        isExclusive: false,
        icon: '💉'
    },
    {
        name: 'The Blister Pack',
        code: 'WEEKEND20',
        description: 'Weekend Therapy Pack - 20% OFF weekend orders',
        type: 'percent',
        value: 20,
        maxDiscount: 150,
        isExclusive: false,
        icon: '💊'
    },
    {
        name: 'The Band-Aid Box',
        code: 'B1G1CARE',
        description: 'Emotional Wound Care - Buy 1 Get 1 Free on Doses of Comfort',
        type: 'bogo',
        value: 100,
        isExclusive: true,
        icon: '🩹'
    },
    {
        name: 'The Doctor\'s Note',
        code: 'DOC50',
        description: 'Doctor\'s Orders - ₹50 OFF on any two main courses',
        type: 'fixed',
        value: 50,
        minOrder: 200,
        isExclusive: true,
        icon: '📝'
    },
    {
        name: 'First Dose',
        code: 'FIRSTDOSE',
        description: 'Your first prescription - 15% OFF your first order',
        type: 'percent',
        value: 15,
        maxDiscount: 100,
        isExclusive: true,
        icon: '💊'
    },
    {
        name: 'VIP Patient',
        code: 'VIPCARE',
        description: 'VIP Treatment - Free delivery on all orders',
        type: 'fixed',
        value: 40,
        isExclusive: true,
        icon: '🏥'
    },
    // Counter-only coupons (for staff to apply)
    {
        name: 'Staff Discount',
        code: 'STAFF10',
        description: 'Staff special - 10% off for valued customers',
        type: 'percent',
        value: 10,
        maxDiscount: 100,
        isCounterOnly: true,
        icon: '👨‍💼'
    },
    {
        name: 'Manager Special',
        code: 'MANAGER50',
        description: 'Manager approved - ₹50 instant discount',
        type: 'fixed',
        value: 50,
        minOrder: 200,
        isCounterOnly: true,
        icon: '👔'
    },
    {
        name: 'Loyalty Reward',
        code: 'LOYAL15',
        description: 'Regular customer reward - 15% off',
        type: 'percent',
        value: 15,
        maxDiscount: 150,
        isCounterOnly: true,
        icon: '⭐'
    },
    {
        name: 'Apology Discount',
        code: 'SORRY100',
        description: 'Apologetic gesture - ₹100 off for service issues',
        type: 'fixed',
        value: 100,
        isCounterOnly: true,
        icon: '🙏'
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Mood.deleteMany({});
        await MenuItem.deleteMany({});
        await Coupon.deleteMany({});
        console.log('Cleared existing data');

        // Seed moods
        const createdMoods = await Mood.insertMany(moods);
        console.log(`Created ${createdMoods.length} moods`);

        // Create mood lookup
        const moodMap = {};
        createdMoods.forEach(mood => {
            moodMap[mood.slug] = mood._id;
        });

        // Seed menu items with mood references
        const menuItemsWithMoods = menuItems.map(item => ({
            ...item,
            mood: moodMap[item.moodSlug]
        }));
        const createdItems = await MenuItem.insertMany(menuItemsWithMoods);
        console.log(`Created ${createdItems.length} menu items`);

        // Seed coupons
        const createdCoupons = await Coupon.insertMany(coupons);
        console.log(`Created ${createdCoupons.length} coupons`);

        // Create admin user
        const adminExists = await User.findOne({ email: 'admin@cravetherapy.com' });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@cravetherapy.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Created admin user: admin@cravetherapy.com / admin123');
        }

        // Create staff user
        const staffExists = await User.findOne({ email: 'staff@cravetherapy.com' });
        if (!staffExists) {
            await User.create({
                name: 'Counter Staff',
                email: 'staff@cravetherapy.com',
                password: 'staff123',
                phone: '9876543210',
                role: 'staff'
            });
            console.log('Created staff user: staff@cravetherapy.com / staff123');
        }

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
