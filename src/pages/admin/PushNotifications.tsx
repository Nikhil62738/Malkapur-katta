import { AdminGridSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  Bell, Send, Loader, Sparkles, AlertTriangle, ShieldCheck, Clock 
} from 'lucide-react';

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  topic: 'breaking' | 'events' | 'custom';
  sentAt: string;
  status: 'sent' | 'failed';
}

export default function PushNotifications() {
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState<'breaking' | 'events' | 'custom'>('breaking');
  const [targetUrl, setTargetUrl] = useState('');

  // Load past notification logs using real-time onSnapshot listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      // Initialize mock logs
      setLogs([
        { id: '1', title: '🚨 Cotton Rates hit ₹7,200!', body: 'Malkapur Cotton market sets new high record. Tap to see detailed rate charts.', topic: 'breaking', sentAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: 'sent' },
        { id: '2', title: '📅 Cultural Night 2026 Scheduled', body: 'Join us on June 15 at Municipal ground. Lavani and folk performances scheduled!', topic: 'events', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'sent' }
      ]);
      setLoading(false);
      return;
    }

    // Real Mode: Subscribe to Firestore
    const q = query(collection(db, 'notifications'), orderBy('sentAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setLogs([
          { id: '1', title: '🚨 Cotton Rates hit ₹7,200!', body: 'Malkapur Cotton market sets new high record. Tap to see detailed rate charts.', topic: 'breaking', sentAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: 'sent' },
          { id: '2', title: '📅 Cultural Night 2026 Scheduled', body: 'Join us on June 15 at Municipal ground. Lavani and folk performances scheduled!', topic: 'events', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'sent' }
        ]);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationLog));
        setLogs(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore notifications loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      error('Please write a title and notification message body.');
      return;
    }

    setSending(true);
    info('Triggering Cloud Messaging push service...');

    const notificationData = {
      title,
      body,
      topic,
      targetUrl: targetUrl || '/',
      sentAt: new Date().toISOString(),
      status: 'sent' as const
    };

    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        const newId = 'mock-' + Math.random().toString(36).substring(2, 9);
        setLogs(prev => [
          { id: newId, ...notificationData },
          ...prev
        ]);
        success(`Push Notification simulated for subscribers of "${topic}" topic! (Mock Mode)`);
      } else {
        const docRef = await addDoc(collection(db, 'notifications'), notificationData);
        setLogs(prev => [
          { id: docRef.id, ...notificationData },
          ...prev
        ]);
        success(`Push Notification sent to subscribers of "${topic}" topic!`);
      }

      // Reset form
      setTitle('');
      setBody('');
      setTargetUrl('');
    } catch (err: any) {
      console.error("Firestore notification save error:", err);
      error(`Failed to dispatch notification request: ${err.message || err}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Bell className="w-8 h-8 text-orange-500" /> Push Notifications
        </h2>
        <p className="text-slate-400 text-sm mt-1">Broadcast breaking news alerts and upcoming event schedules directly to user devices.</p>
      </div>

      {loading ? (
        <AdminGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notification Creator Form */}
        <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" /> Broadcast Alert Console
          </h3>

          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🚨 Breaking: Cotton Rates Hit New Record!"
                maxLength={60}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Maximum 60 characters recommended.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Type the notification details here..."
                maxLength={160}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650 resize-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Maximum 160 characters. Keep it brief and high-impact.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">FCM Topic Channel</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-3 py-2.5 text-sm outline-none text-slate-350 cursor-pointer"
                >
                  <option value="breaking">Breaking News Subscribers</option>
                  <option value="events">Events & Holiday Updates</option>
                  <option value="custom">General Updates (All Devices)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Redirect Page Route (Optional)</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="e.g. /news or /events"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5 text-xs text-amber-350">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>Warning:</strong> Push notifications are sent instantly to registered subscribers. Please double check all details before broadcasting.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-500/10"
              >
                {sending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Broadcasting Alert...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Broadcast Notification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* History / Send Log */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" /> Dispatch History Log
          </h3>
          <p className="text-slate-400 text-xs mb-5">Audit log of recently transmitted push notifications.</p>

          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-slate-850 bg-slate-900/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                    log.topic === 'breaking' 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : log.topic === 'events' 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {log.topic}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.sentAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-white leading-snug">{log.title}</h4>
                <p className="text-xs text-slate-450 leading-relaxed line-clamp-2">{log.body}</p>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500">
                    🕒 {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sent Successfully
                  </span>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-sm italic">
                No notification history found.
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
