import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Newspaper,
  MapPin,
  Calendar,
  Briefcase,
  Video,
  Image,
  Users,
  Phone,
  Mail,
  Bell,
  Settings,
  LogOut,
  Menu,
  User as UserIcon,
  ChevronDown,
  UserCog,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ThemeToggle from '../ui/ThemeToggle';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  superadmin?: boolean;
  badge?: number;
}

export default function AdminLayout() {
  const { logout, currentUser, hasPermission, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Real-time unread messages count (only meaningful with contact access)
  useEffect(() => {
    if (!(isSuperAdmin || hasPermission('contact') || hasPermission('submissions'))) {
      return;
    }
    try {
      const q = query(collection(db, 'contactMessages'), where('status', '==', 'unread'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadMessages(snapshot.size);
      }, (err) => {
        console.warn("contactMessages listener failed:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Unread messages listener setup failed:", e);
    }
  }, [isSuperAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const allNavItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/home', label: 'Home Page', icon: Home, permission: 'home' },
    { path: '/admin/news', label: 'News Management', icon: Newspaper, permission: 'news' },
    { path: '/admin/explore', label: 'Explore Malkapur', icon: MapPin, permission: 'explore' },
    { path: '/admin/events', label: 'Events Management', icon: Calendar, permission: 'events' },
    { path: '/admin/businesses', label: 'Business Directory', icon: Briefcase, permission: 'businesses' },
    { path: '/admin/videos', label: 'Videos & Reels', icon: Video, permission: 'videos' },
    { path: '/admin/gallery', label: 'Gallery', icon: Image, permission: 'gallery' },
    { path: '/admin/about', label: 'About Page', icon: Users, permission: 'about' },
    { path: '/admin/contact', label: 'Contact Settings', icon: Phone, permission: 'contact' },
    {
      path: '/admin/submissions',
      label: 'Submissions',
      icon: Mail,
      permission: 'submissions',
      badge: unreadMessages > 0 ? unreadMessages : undefined
    },
    { path: '/admin/notifications', label: 'Push Notifications', icon: Bell, permission: 'notifications' },
    { path: '/admin/settings', label: 'Site Settings', icon: Settings, permission: 'settings' },
    { path: '/admin/subadmins', label: 'Sub-Admins', icon: UserCog, superadmin: true }
  ];

  const navItems = allNavItems.filter((item) => {
    if (item.superadmin) return isSuperAdmin;
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Administrator';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 text-slate-200">
      {/* Header / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-slate-950/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
          M
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight text-white">Malkapur Katta</h1>
          <span className="text-[10px] text-orange-400 font-semibold tracking-wider uppercase">Admin Portal</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border-l-2 border-orange-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold text-slate-950 bg-orange-400 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile Summary */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 border border-slate-700">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{currentUser?.email || 'Admin'}</p>
            <span className="text-[10px] text-slate-500">{roleLabel}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay & drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}>
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-850 px-4 py-3 flex items-center justify-between md:justify-end gap-4 shadow-sm">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 px-3 rounded-lg border border-slate-800 bg-slate-950/20 hover:bg-slate-950/40 text-slate-300 hover:text-white transition-all text-sm font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-slate-950 text-[10px] font-bold">
                  A
                </div>
                <span className="hidden sm:inline truncate max-w-[120px]">{currentUser?.email?.split('@')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 text-xs">
                      <p className="text-slate-500">Signed in as</p>
                      <p className="font-semibold text-slate-200 truncate">{currentUser?.email}</p>
                      <p className="text-orange-400 text-[10px] mt-0.5">{roleLabel}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
