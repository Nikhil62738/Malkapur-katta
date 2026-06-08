import { AdminGridSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  Calendar, Search, Plus, Edit2, Trash2, X, Upload, Sparkles, Loader, Clock, MapPin 
} from 'lucide-react';
interface EventDocument {
  id: string;
  titleEn: string;
  titleMr: string;
  descriptionEn: string;
  descriptionMr: string;
  date: string;
  time: string;
  locationEn: string;
  locationMr: string;
  image: string;
  featured: boolean;
}

export default function EventsManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EventDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'english' | 'marathi'>('english');

  // Fields
  const [titleEn, setTitleEn] = useState('');
  const [titleMr, setTitleMr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionMr, setDescriptionMr] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationEn, setLocationEn] = useState('');
  const [locationMr, setLocationMr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  // Load from Firestore using real-time onSnapshot listener
  useEffect(() => {
    // Subscribe to Firestore
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      if (snap.empty) {
        setItems([]);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventDocument));
        setItems(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore events loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      success('Event banner uploaded successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to upload image. Falls back to preview URL.');
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddOpen = () => {
    setEditingId(null);
    setTitleEn('');
    setTitleMr('');
    setDescriptionEn('');
    setDescriptionMr('');
    setDate('');
    setTime('');
    setLocationEn('');
    setLocationMr('');
    setImageUrl('');
    setFeatured(false);
    setIsModalOpen(true);
    setActiveTab('english');
  };

  const handleEditOpen = (item: EventDocument) => {
    setEditingId(item.id);
    setTitleEn(item.titleEn);
    setTitleMr(item.titleMr || '');
    setDescriptionEn(item.descriptionEn);
    setDescriptionMr(item.descriptionMr || '');
    setDate(item.date);
    setTime(item.time);
    setLocationEn(item.locationEn);
    setLocationMr(item.locationMr || '');
    setImageUrl(item.image);
    setFeatured(item.featured);
    setIsModalOpen(true);
    setActiveTab('english');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !descriptionEn || !imageUrl || !date || !time || !locationEn) {
      error('Please fill in title, description, banner image, date, time, and location.');
      return;
    }

    setFormLoading(true);
    const docData = {
      titleEn,
      titleMr: titleMr || titleEn,
      descriptionEn,
      descriptionMr: descriptionMr || descriptionEn,
      date,
      time,
      locationEn,
      locationMr: locationMr || locationEn,
      image: imageUrl,
      featured,
      updatedAt: new Date().toISOString()
    };


    try {
      if (editingId) {
        await setDoc(doc(db, 'events', editingId), docData, { merge: true });
        setItems(prev => prev.map(p => p.id === editingId ? { ...p, ...docData } : p));
        success('Event updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'events'), docData);
        setItems(prev => [{ id: docRef.id, ...docData }, ...prev]);
        success('Event scheduled successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Firestore events save error:", err);
      error(`Failed to save event details: ${err.message || err}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel and delete this event?')) return;

    try {
      await deleteDoc(doc(db, 'events', id));
      setItems(prev => prev.filter(p => p.id !== id));
      success('Event deleted successfully!');
    } catch (err: any) {
      console.error("Firestore events delete error:", err);
      error(`Failed to delete event: ${err.message || err}`);
    }
  };

  const filteredItems = items.filter((ev) => {
    return ev.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
           ev.titleMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
           ev.locationEn.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-orange-500" /> Events Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Schedule cultural, agricultural, community and sporting events.</p>
        </div>
        <button
          onClick={handleAddOpen}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-slate-950 font-bold text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/10 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-orange-500/40 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-650"
          />
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <AdminGridSkeleton />
      ) : (
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/60 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                  <th className="p-4 pl-6">Event</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.image}
                          alt={item.titleEn}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate max-w-[240px]">{item.titleEn}</h4>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[240px] mt-0.5">{item.titleMr}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-350">
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.date}</span>
                        <span className="text-xs text-slate-500">{item.time}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-350">
                      <div>
                        <span>{item.locationEn}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{item.locationMr}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {item.featured ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditOpen(item)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-500 text-sm italic">
                      No events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" /> {editingId ? 'Edit Event' : 'Schedule Event'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex border-b border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('english')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'english' ? 'border-orange-500 text-white' : 'border-transparent text-slate-500'
                  }`}
                >
                  English Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('marathi')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'marathi' ? 'border-orange-500 text-white' : 'border-transparent text-slate-500'
                  }`}
                >
                  Marathi translation
                </button>
              </div>

              {activeTab === 'english' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event Title</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. Malkapur Cultural Night 2026"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      rows={4}
                      placeholder="Write details of the event..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={locationEn}
                        onChange={(e) => setLocationEn(e.target.value)}
                        placeholder="e.g. Municipal Ground, Malkapur"
                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event Title (Marathi)</label>
                    <input
                      type="text"
                      value={titleMr}
                      onChange={(e) => setTitleMr(e.target.value)}
                      placeholder="कार्यक्रमाचे नाव (मराठी)..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (Marathi)</label>
                    <textarea
                      value={descriptionMr}
                      onChange={(e) => setDescriptionMr(e.target.value)}
                      rows={4}
                      placeholder="कार्यक्रमाचे वर्णन मराठीत लिहा..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location (Marathi)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={locationMr}
                        onChange={(e) => setLocationMr(e.target.value)}
                        placeholder="ठिकाण (मराठी)..."
                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 6:00 PM or 9:00 AM"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event Banner Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {imageUrl ? (
                    <div className="relative w-32 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shrink-0">
                      <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1 right-1 p-1 rounded bg-slate-950/80 text-rose-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-20 border-2 border-dashed border-slate-800 hover:border-orange-500/40 rounded-xl flex flex-col items-center justify-center cursor-pointer shrink-0 transition-colors bg-slate-950/20 group">
                      {uploadingImage ? (
                        <Loader className="w-4 h-4 text-orange-500 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-500 group-hover:text-orange-400" />
                          <span className="text-[10px] text-slate-500 mt-1">Upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste external banner image URL..."
                    className="flex-1 bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-white">Featured Event</span>
                  <p className="text-[10px] text-slate-500">Highlight this event on the home page</p>
                </div>
              </label>
            </form>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-750"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={formLoading || uploadingImage}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 flex items-center gap-1.5"
              >
                {formLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
