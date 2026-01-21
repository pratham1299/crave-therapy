import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token) => {
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const { data } = await api.get('/auth/me');
            setUser(data.data);
            // Clear cart if staff/admin on page load
            if (data.data.role === 'staff' || data.data.role === 'admin') {
                localStorage.removeItem('cart');
            }
        } catch (error) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        setUser(data.data);
        // Clear cart if staff/admin logs in
        if (data.data.role === 'staff' || data.data.role === 'admin') {
            localStorage.removeItem('cart');
        }
        return data.data;
    };

    const register = async (name, email, phone, password) => {
        const { data } = await api.post('/auth/register', { name, email, phone, password });
        localStorage.setItem('token', data.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        setUser(data.data);
        return data.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isStaff = user && (user.role === 'staff' || user.role === 'admin');

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isStaff }}>
            {children}
        </AuthContext.Provider>
    );
};
