import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import MoodSelect from './pages/MoodSelect';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenu from './pages/admin/MenuManager';
import AdminCoupons from './pages/admin/CouponManager';
import AdminOrders from './pages/admin/OrderManager';
import AdminMoods from './pages/admin/MoodManager';
import CounterPortal from './pages/counter/CounterPortal';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="min-h-screen bg-paper bg-graph-paper font-typewriter">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/symptoms" element={<MoodSelect />} />
                            <Route path="/menu/:moodSlug" element={<Menu />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/order-success/:orderId" element={<OrderSuccess />} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/menu" element={<AdminMenu />} />
                            <Route path="/admin/coupons" element={<AdminCoupons />} />
                            <Route path="/admin/orders" element={<AdminOrders />} />
                            <Route path="/admin/moods" element={<AdminMoods />} />

                            {/* Counter/Staff Routes */}
                            <Route path="/counter" element={<CounterPortal />} />
                        </Routes>
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
