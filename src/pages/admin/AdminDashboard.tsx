import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper,
  Calendar,
  Briefcase,
  Video,
  Image,
  Plus,
  Bell,
  Mail,
  ArrowRight,
  TrendingUp,
  Activity,
  Database,
  Loader
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { seedAllDataToFirestore } from '../../utils/seedFirestore';

interface StatsCardProps {
  title: string;
  count: number | string;
  icon: React.ComponentType<any>;
  color: string;
  onClick?: () => void;
}

function StatsCard({ title, count, icon: Icon, color, onClick }: StatsCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-300 group shadow-lg"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">{count}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 text-${color}-400 group-hover:bg-slate-800 transition-colors`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { info, success, error } = useToast();
  const [seeding, setSeeding] = useState(false);

  const [stats, setStats] = useState({
    news: 0,
    events: 0,
    businesses: 0,
    videos: 0,
    gallery: 0,
    submissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [activities] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to collections counts
    const unsubs = [
      onSnapshot(collection(db, 'news'), (snap) => {
        setStats(prev => ({ ...prev, news: snap.size }));
      }, (err) => console.warn("Dashboard news listener failed:", err)),
      onSnapshot(collection(db, 'events'), (snap) => {
        setStats(prev => ({ ...prev, events: snap.size }));
      }, (err) => console.warn("Dashboard events listener failed:", err)),
      onSnapshot(collection(db, 'businesses'), (snap) => {
        setStats(prev => ({ ...prev, businesses: snap.size }));
      }, (err) => console.warn("Dashboard businesses listener failed:", err)),
      onSnapshot(collection(db, 'videos'), (snap) => {
        setStats(prev => ({ ...prev, videos: snap.size }));
      }, (err) => console.warn("Dashboard videos listener failed:", err)),
      onSnapshot(collection(db, 'gallery'), (snap) => {
        setStats(prev => ({ ...prev, gallery: snap.size }));
      }, (err) => console.warn("Dashboard gallery listener failed:", err)),
      onSnapshot(collection(db, 'contactMessages'), (snap) => {
        setStats(prev => ({ ...prev, submissions: snap.size }));
      }, (err) => console.warn("Dashboard messages listener failed:", err))
    ];

    setLoading(false);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const handleQuickAction = (action: string, path: string) => {
    info(`Navigating to ${action}...`);
    navigate(path);
  };

  const handleSeedDatabase = async () => {
    if (seeding) return;
    if (!window.confirm('This will upload ALL website data to Firebase Firestore. Collections that already have data will be skipped. Continue?')) return;
    
    setSeeding(true);
    try {
      const result = await seedAllDataToFirestore();
      if (result.success) {
        const seededCount = Object.values(result.results).filter(r => r.seeded).length;
        const skippedCount = Object.values(result.results).filter(r => !r.seeded).length;
        success(`Database seeded! ${seededCount} collections uploaded, ${skippedCount} already had data.`);
      } else {
        error('Some collections failed to seed. Check console for details.');
      }
    } catch (err: any) {
      console.error('Seed failed:', err);
      error(`Seeding failed: ${err.message || err}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time status of Malkapur Katta website content.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {seeding ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            {seeding ? 'Uploading...' : 'Seed All Data to Firebase'}
          </button>
          <button
            onClick={() => handleQuickAction('Send Notification', '/admin/notifications')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-orange-500 text-slate-950 hover:bg-orange-400 transition-all shadow-md active:scale-95"
          >
            <Bell className="w-3.5 h-3.5" /> Send Push Alert
          </button>
          <button
            onClick={() => handleQuickAction('Add News', '/admin/news')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add News
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatsCard
          title="News Articles"
          count={loading ? '...' : stats.news}
          icon={Newspaper}
          color="orange"
          onClick={() => navigate('/admin/news')}
        />
        <StatsCard
          title="Scheduled Events"
          count={loading ? '...' : stats.events}
          icon={Calendar}
          color="amber"
          onClick={() => navigate('/admin/events')}
        />
        <StatsCard
          title="Local Businesses"
          count={loading ? '...' : stats.businesses}
          icon={Briefcase}
          color="emerald"
          onClick={() => navigate('/admin/businesses')}
        />
        <StatsCard
          title="Videos & Reels"
          count={loading ? '...' : stats.videos}
          icon={Video}
          color="indigo"
          onClick={() => navigate('/admin/videos')}
        />
        <StatsCard
          title="Gallery Images"
          count={loading ? '...' : stats.gallery}
          icon={Image}
          color="pink"
          onClick={() => navigate('/admin/gallery')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Panel */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col h-full">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" /> Quick Operations
          </h3>
          <p className="text-slate-400 text-xs mb-5">Common tasks you can run instantly.</p>
          
          <div className="flex-1 space-y-3">
            {[
              { label: 'Create New Event', path: '/admin/events', detail: 'Announce festivals, matches, or fairs' },
              { label: 'Upload Gallery Photo', path: '/admin/gallery', detail: 'Add community or festival pictures' },
              { label: 'Add Local Business', path: '/admin/businesses', detail: 'Expand the business directory' },
              { label: 'Review Contact Messages', path: '/admin/submissions', detail: `Check submissions (${stats.submissions} unread)`, badge: stats.submissions > 0 }
            ].map((act, index) => (
              <button
                key={index}
                onClick={() => navigate(act.path)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-900 transition-all text-left group"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                    {act.label}
                    {act.badge && (
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{act.detail}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-650 group-hover:text-white transition-colors group-hover:translate-x-1 duration-200" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col h-full">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" /> Recent Activity Log
          </h3>
          <p className="text-slate-400 text-xs mb-5">Latest content actions taken by administrators.</p>

          <div className="flex-1 space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/30 border border-slate-900">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-850 shrink-0 text-slate-400">
                  {act.type === 'news' && <Newspaper className="w-4 h-4 text-orange-400" />}
                  {act.type === 'notification' && <Bell className="w-4 h-4 text-sky-400" />}
                  {act.type === 'event' && <Calendar className="w-4 h-4 text-amber-400" />}
                  {act.type === 'message' && <Mail className="w-4 h-4 text-emerald-400" />}
                  {act.type === 'business' && <Briefcase className="w-4 h-4 text-pink-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white truncate">{act.action}</p>
                    <span className="text-[10px] text-slate-500 shrink-0">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{act.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
