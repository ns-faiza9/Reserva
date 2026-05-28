import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { isAuthenticated } from '../utils/auth';

// Pages
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import Resources from '../pages/Resources';
import Bookings from '../pages/Bookings';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Profile from '../pages/Profile';

// Components
import Navbar from '../components/Navbar';
import { pageAnimation } from '../utils/animations';

const PageWrapper = ({ children }) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            variants={pageAnimation}
        >
            {children}
        </motion.div>
    );
};

// Protected Route Wrapper
const ProtectedRoute = () => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return (
        <>
            <div style={{ minHeight: '100vh' }}>
                <Outlet />
            </div>
        </>
    );
};

// Public Route Wrapper
const PublicRoute = () => {
    return <Outlet />;
};

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Landing / Get Started Page */}
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

                {/* Public Auth Routes */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                    <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
                </Route>

                {/* Protected and General Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
                    <Route path="/bookings" element={<PageWrapper><Bookings /></PageWrapper>} />
                    <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                    <Route path="/contact-us" element={<PageWrapper><Contact /></PageWrapper>} />
                    <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
                </Route>

                {/* Default redirect to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

const AppRoutes = () => {
    return <AnimatedRoutes />;
};

export default AppRoutes;
