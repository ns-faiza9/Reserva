import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { isAuthenticated, isAdmin } from '../utils/auth';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import Resources from '../pages/Resources';
import Bookings from '../pages/Bookings';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Profile from '../pages/Profile';
import AdminResources from '../pages/AdminResources';
import Catalog from '../pages/Catalog';
import { pageAnimation } from '../utils/animations';

const PageWrapper = ({ children }) => (
  <motion.div initial="hidden" animate="visible" exit={{ opacity: 0, y: -12 }}
    variants={pageAnimation}>{children}</motion.div>
);

const ProtectedRoute = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
          <Route path="/bookings" element={<PageWrapper><Bookings /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper>{isAdmin() ? <AdminResources /> : <Navigate to="/resources" replace />}</PageWrapper>} />
        </Route>
        <Route path="/catalog" element={<PageWrapper><Catalog /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact-us" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/venues" element={<Navigate to="/catalog" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
