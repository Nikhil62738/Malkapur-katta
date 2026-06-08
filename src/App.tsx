import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/layout/LoadingScreen';
import PageTransition from './components/layout/PageTransition';
import ScrollToTop from './components/layout/ScrollToTop';
import { PageSkeleton } from './components/ui/SkeletonLoader';
// ProtectedRoute must NOT be lazy — it wraps routes and must be available
// synchronously when React Router resolves the route tree.
import ProtectedRoute from './components/admin/ProtectedRoute';

// Main Site pages
const HomePage = lazy(() => import('./pages/HomePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PollsPage = lazy(() => import('./pages/PollsPage'));

// Admin Shell
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminForgotPassword = lazy(() => import('./pages/admin/AdminForgotPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const HomeManagement = lazy(() => import('./pages/admin/HomeManagement'));
const NewsManagement = lazy(() => import('./pages/admin/NewsManagement'));
const ExploreManagement = lazy(() => import('./pages/admin/ExploreManagement'));
const EventsManagement = lazy(() => import('./pages/admin/EventsManagement'));
const BusinessManagement = lazy(() => import('./pages/admin/BusinessManagement'));
const VideosManagement = lazy(() => import('./pages/admin/VideosManagement'));
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement'));
const AboutManagement = lazy(() => import('./pages/admin/AboutManagement'));
const ContactManagement = lazy(() => import('./pages/admin/ContactManagement'));
const ContactMessages = lazy(() => import('./pages/admin/ContactMessages'));
const PushNotifications = lazy(() => import('./pages/admin/PushNotifications'));
const SettingsManagement = lazy(() => import('./pages/admin/SettingsManagement'));
const SubAdminsManagement = lazy(() => import('./pages/admin/SubAdminsManagement'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Frontend Website */}
        <Route element={<Layout />}>
          <Route index element={<PageTransition><Suspense fallback={<PageSkeleton />}><HomePage /></Suspense></PageTransition>} />
          <Route path="news" element={<PageTransition><Suspense fallback={<PageSkeleton />}><NewsPage /></Suspense></PageTransition>} />
          <Route path="events" element={<PageTransition><Suspense fallback={<PageSkeleton />}><EventsPage /></Suspense></PageTransition>} />
          <Route path="explore" element={<PageTransition><Suspense fallback={<PageSkeleton />}><ExplorePage /></Suspense></PageTransition>} />
          <Route path="videos" element={<PageTransition><Suspense fallback={<PageSkeleton />}><VideosPage /></Suspense></PageTransition>} />
          <Route path="gallery" element={<PageTransition><Suspense fallback={<PageSkeleton />}><GalleryPage /></Suspense></PageTransition>} />
          <Route path="polls" element={<PageTransition><Suspense fallback={<PageSkeleton />}><PollsPage /></Suspense></PageTransition>} />
          <Route path="about" element={<PageTransition><Suspense fallback={<PageSkeleton />}><AboutPage /></Suspense></PageTransition>} />
          <Route path="contact" element={<PageTransition><Suspense fallback={<PageSkeleton />}><ContactPage /></Suspense></PageTransition>} />
        </Route>

        {/* Admin Authentication (public) */}
        <Route path="admin/login" element={<Suspense fallback={<PageSkeleton />}><AdminLogin /></Suspense>} />
        <Route path="admin/forgot-password" element={<Suspense fallback={<PageSkeleton />}><AdminForgotPassword /></Suspense>} />

        {/* Admin Dashboard Console (protected) */}
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageSkeleton />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense>} />
          <Route path="home" element={<ProtectedRoute permission="home"><Suspense fallback={<PageSkeleton />}><HomeManagement /></Suspense></ProtectedRoute>} />
          <Route path="news" element={<ProtectedRoute permission="news"><Suspense fallback={<PageSkeleton />}><NewsManagement /></Suspense></ProtectedRoute>} />
          <Route path="explore" element={<ProtectedRoute permission="explore"><Suspense fallback={<PageSkeleton />}><ExploreManagement /></Suspense></ProtectedRoute>} />
          <Route path="events" element={<ProtectedRoute permission="events"><Suspense fallback={<PageSkeleton />}><EventsManagement /></Suspense></ProtectedRoute>} />
          <Route path="businesses" element={<ProtectedRoute permission="businesses"><Suspense fallback={<PageSkeleton />}><BusinessManagement /></Suspense></ProtectedRoute>} />
          <Route path="videos" element={<ProtectedRoute permission="videos"><Suspense fallback={<PageSkeleton />}><VideosManagement /></Suspense></ProtectedRoute>} />
          <Route path="gallery" element={<ProtectedRoute permission="gallery"><Suspense fallback={<PageSkeleton />}><GalleryManagement /></Suspense></ProtectedRoute>} />
          <Route path="about" element={<ProtectedRoute permission="about"><Suspense fallback={<PageSkeleton />}><AboutManagement /></Suspense></ProtectedRoute>} />
          <Route path="contact" element={<ProtectedRoute permission="contact"><Suspense fallback={<PageSkeleton />}><ContactManagement /></Suspense></ProtectedRoute>} />
          <Route path="submissions" element={<ProtectedRoute permission="submissions"><Suspense fallback={<PageSkeleton />}><ContactMessages /></Suspense></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute permission="notifications"><Suspense fallback={<PageSkeleton />}><PushNotifications /></Suspense></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute permission="settings"><Suspense fallback={<PageSkeleton />}><SettingsManagement /></Suspense></ProtectedRoute>} />
          <Route path="subadmins" element={<ProtectedRoute requireSuperAdmin><Suspense fallback={<PageSkeleton />}><SubAdminsManagement /></Suspense></ProtectedRoute>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ContentProvider>
          <ToastProvider>
            <AuthProvider>
              <LoadingScreen />
              <BrowserRouter>
                <ScrollToTop />
                <AnimatedRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </ContentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
