import { AdminPanelSkeleton } from '../../components/admin/AdminSkeleton';
import { useState, useEffect } from 'react';
import { collection, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { Mail, Trash2, Clock, Phone, Inbox } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export default function ContactMessages() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Load from Firestore in real-time
  useEffect(() => {
    try {
      const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          // Initialize mock messages for demonstration if firestore collection empty
          const mockMsgs: ContactMessage[] = [
            { id: '1', name: 'Rajesh Gawande', email: 'rajesh@gmail.com', phone: '9876543210', message: 'Hello, I want to list my cotton trading business on your directory. How do I proceed and what are the charges?', status: 'unread', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            { id: '2', name: 'Anjali Deshmukh', email: 'anjali.d@yahoo.com', phone: '8877665544', message: 'I loved the coverage of the local cricket league! Can you post about our upcoming school science exhibition too?', status: 'read', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() }
          ];
          setMessages(mockMsgs);
        } else {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage));
          setMessages(list);
          
          // Re-sync selected message if it was updated
          if (selectedMessage) {
            const updated = list.find(m => m.id === selectedMessage.id);
            if (updated) setSelectedMessage(updated);
          }
        }
        setLoading(false);
      }, (err) => {
        console.error("Firestore contactMessages listener failed:", err);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [selectedMessage]);

  const markAsRead = async (message: ContactMessage) => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
        success('Message marked as read. (Mock Mode)');
      } else {
        await updateDoc(doc(db, 'contactMessages', message.id), {
          status: 'read'
        });
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
        success('Message marked as read.');
      }
    } catch (err: any) {
      console.error("Firestore message read update error:", err);
      error(`Failed to update message status: ${err.message || err}`);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this message?')) return;
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        success('Message deleted from mock view.');
      } else {
        await deleteDoc(doc(db, 'contactMessages', id));
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        success('Message deleted successfully.');
      }
    } catch (err: any) {
      console.error("Firestore message delete error:", err);
      error(`Failed to delete message: ${err.message || err}`);
    }
  };

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      markAsRead(msg);
    }
  };

  if (loading) {
    return <AdminPanelSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Mail className="w-8 h-8 text-orange-500" /> Contact Form Submissions
        </h2>
        <p className="text-slate-400 text-sm mt-1">Review feedback, suggestions, and queries sent by website users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/20">
        
        {/* Messages List Sidebar */}
        <div className="lg:col-span-1 border-r border-slate-850 flex flex-col h-full bg-slate-950/30">
          <div className="p-4 border-b border-slate-850 bg-slate-950/50 flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Inbox className="w-4 h-4 text-orange-400" /> Inbox Submissions ({messages.filter(m => m.status === 'unread').length} Unread)
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850/60 scrollbar-thin">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`w-full text-left p-4 flex flex-col gap-1 transition-all ${
                  selectedMessage?.id === msg.id 
                    ? 'bg-orange-500/10 border-l-4 border-orange-500' 
                    : 'hover:bg-slate-900/40 border-l-4 border-transparent'
                } ${msg.status === 'unread' ? 'font-bold' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${msg.status === 'unread' ? 'text-white' : 'text-slate-400'}`}>
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0 font-normal">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <span className="text-xs text-slate-400 truncate">{msg.email}</span>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 font-normal leading-relaxed">
                  {msg.message}
                </p>
              </button>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-sm italic">
                No submissions received yet.
              </div>
            )}
          </div>
        </div>

        {/* Message Content Pane */}
        <div className="lg:col-span-2 flex flex-col h-full bg-slate-950/10">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Actions Header */}
              <div className="p-4 border-b border-slate-850 bg-slate-950/30 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    selectedMessage.status === 'read' 
                      ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                  }`}>
                    {selectedMessage.status === 'read' ? 'Read' : 'Unread'}
                  </span>
                </div>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-455 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-950/20 transition-all hover:bg-rose-955/20"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Message
                </button>
              </div>

              {/* Message Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Sender card */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">
                    {selectedMessage.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white leading-tight">{selectedMessage.name}</h3>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-350">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedMessage.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedMessage.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Message Content</h4>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <Mail className="w-12 h-12 text-slate-700 animate-pulse" />
              <p className="text-sm">Select a submission from the inbox to read details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
