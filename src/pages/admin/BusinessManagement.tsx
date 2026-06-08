import { AdminGridSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  Briefcase, Search, Plus, Edit2, Trash2, X, Upload, Sparkles, Loader, Phone, MapPin 
} from 'lucide-react';
import { businesses } from '../../data/content';

interface BusinessDocument {
  id: string;
  nameEn: string;
  nameMr: string;
  category: string;
  descriptionEn: string;
  descriptionMr: string;
  image: string; // Business Logo/Cover
  phone: string;
  addressEn: string;
  addressMr: string;
  mapUrl?: string;
  rating?: number;
}

export default function BusinessManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BusinessDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'english' | 'marathi'>('english');

  // Fields
  const [nameEn, setNameEn] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [category, setCategory] = useState('Hotels');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionMr, setDescriptionMr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [addressMr, setAddressMr] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [rating, setRating] = useState(4.5);

  const categories = [
    'Hotels',
    'Restaurants',
    'Hospitals',
    'Medical Stores',
    'Coaching Classes',
    'Event Management'
  ];

  // Load from Firestore using real-time onSnapshot listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      // Initialize mock content
      const mockList: BusinessDocument[] = businesses.map((b) => ({
        id: b.id,
        nameEn: b.name,
        nameMr: b.name + ' (मराठी)',
        category: b.category === 'Hospitality' ? 'Hotels' : 
                  b.category === 'Healthcare' ? 'Hospitals' : 'Restaurants', // Map to matching category
        descriptionEn: b.description,
        descriptionMr: b.description + ' (मराठी)',
        image: b.image,
        phone: b.phone,
        addressEn: 'Main Road, Malkapur',
        addressMr: 'मुख्य रस्ता, मलकापूर',
        mapUrl: '',
        rating: b.rating || 4.5
      }));
      setItems(mockList);
      setLoading(false);
      return;
    }

    // Real Mode: Subscribe to Firestore.
    // Always mirror the live MongoDB collection. We must NOT fall back to
    // static placeholder rows when the collection is empty: those rows carry
    // ids that don't exist in MongoDB, so they cannot be edited or deleted and
    // they make the admin panel disagree with the public website.
    const unsub = onSnapshot(collection(db, 'businesses'), (snap) => {
      if (false) {
        const mockList: BusinessDocument[] = businesses.map((b) => ({
          id: b.id,
          nameEn: b.name,
          nameMr: b.name + ' (मराठी)',
          category: b.category === 'Hospitality' ? 'Hotels' : 
                    b.category === 'Healthcare' ? 'Hospitals' : 'Restaurants',
          descriptionEn: b.description,
          descriptionMr: b.description + ' (मराठी)',
          image: b.image,
          phone: b.phone,
          addressEn: 'Main Road, Malkapur',
          addressMr: 'मुख्य रस्ता, मलकापूर',
          mapUrl: '',
          rating: b.rating || 4.5
        }));
        setItems(mockList);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessDocument));
        setItems(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore businesses loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `businesses/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      success('Logo/Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to upload image. Falls back to local URL preview.');
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddOpen = () => {
    setEditingId(null);
    setNameEn('');
    setNameMr('');
    setCategory('Hotels');
    setDescriptionEn('');
    setDescriptionMr('');
    setImageUrl('');
    setPhone('');
    setAddressEn('');
    setAddressMr('');
    setMapUrl('');
    setRating(4.5);
    setIsModalOpen(true);
    setActiveTab('english');
  };

  const handleEditOpen = (item: BusinessDocument) => {
    setEditingId(item.id);
    setNameEn(item.nameEn);
    setNameMr(item.nameMr || '');
    setCategory(item.category);
    setDescriptionEn(item.descriptionEn);
    setDescriptionMr(item.descriptionMr || '');
    setImageUrl(item.image);
    setPhone(item.phone);
    setAddressEn(item.addressEn);
    setAddressMr(item.addressMr || '');
    setMapUrl(item.mapUrl || '');
    setRating(item.rating || 4.5);
    setIsModalOpen(true);
    setActiveTab('english');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !descriptionEn || !imageUrl || !phone || !addressEn) {
      error('Please complete business name, description, phone, address, and upload a logo.');
      return;
    }

    setFormLoading(true);
    const docData = {
      nameEn,
      nameMr: nameMr || nameEn,
      category,
      descriptionEn,
      descriptionMr: descriptionMr || descriptionEn,
      image: imageUrl,
      phone,
      addressEn,
      addressMr: addressMr || addressEn,
      mapUrl,
      rating,
      updatedAt: new Date().toISOString()
    };

    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        if (editingId) {
          setItems(prev => prev.map(p => p.id === editingId ? { ...p, ...docData } : p));
          success('Business updated successfully! (Mock Mode)');
        } else {
          const newId = 'mock-' + Math.random().toString(36).substring(2, 9);
          setItems(prev => [{ id: newId, ...docData }, ...prev]);
          success('Business added successfully! (Mock Mode)');
        }
      } else {
        if (editingId) {
          await setDoc(doc(db, 'businesses', editingId), docData, { merge: true });
          setItems(prev => prev.map(p => p.id === editingId ? { ...p, ...docData } : p));
          success('Business updated successfully!');
        } else {
          const docRef = await addDoc(collection(db, 'businesses'), docData);
          setItems(prev => [{ id: docRef.id, ...docData }, ...prev]);
          success('Business added successfully!');
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Firestore business save error:", err);
      error(`Failed to save business: ${err.message || err}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this business?')) return;
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        setItems(prev => prev.filter(p => p.id !== id));
        success('Business removed from mock view.');
      } else {
        await deleteDoc(doc(db, 'businesses', id));
        setItems(prev => prev.filter(p => p.id !== id));
        success('Business deleted successfully!');
      }
    } catch (err: any) {
      console.error("Firestore business delete error:", err);
      error(`Failed to delete business: ${err.message || err}`);
    }
  };

  const filteredItems = items.filter((b) => {
    const matchesSearch = b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.phone.includes(searchQuery);
    const matchesCat = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-orange-500" /> Business Directory
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage local service directories, hotels, hospitals, and coaching classes.</p>
        </div>
        <button
          onClick={handleAddOpen}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-slate-950 font-bold text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/10 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Business
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search business by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-orange-500/40 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-650"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-850 text-slate-350 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer focus:border-orange-500/40"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Business Directory list grid */}
      {loading ? (
        <AdminGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group">
              <div className="p-5 flex items-start gap-4">
                <img
                  src={item.image}
                  alt={item.nameEn}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                />
                <div className="min-w-0">
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-900 border border-slate-800 text-orange-400 rounded-md">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-white text-base leading-snug truncate mt-2">
                    {item.nameEn}
                  </h3>
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5">{item.nameMr}</span>
                </div>
              </div>

              <div className="px-5 pb-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                    {item.descriptionEn}
                  </p>
                  
                  <div className="mt-4 space-y-1.5 text-xs text-slate-350">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{item.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="truncate">{item.addressEn}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 mt-5 pt-4">
                  <span className="text-xs text-amber-400 font-bold">⭐ {item.rating}</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditOpen(item)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                      title="Edit Business"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                      title="Delete Business"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm italic">
              No businesses found.
            </div>
          )}
        </div>
      )}

      {/* Business Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" /> {editingId ? 'Edit Business Details' : 'Add Business'}
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
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Name</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Deshmukh Pharmacy"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Description</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      rows={3}
                      placeholder="Enter brief description of services, heritage..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={addressEn}
                        onChange={(e) => setAddressEn(e.target.value)}
                        placeholder="e.g. Market Road, Malkapur"
                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Name (Marathi)</label>
                    <input
                      type="text"
                      value={nameMr}
                      onChange={(e) => setNameMr(e.target.value)}
                      placeholder="व्यवसायाचे नाव (मराठी)..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Description (Marathi)</label>
                    <textarea
                      value={descriptionMr}
                      onChange={(e) => setDescriptionMr(e.target.value)}
                      rows={3}
                      placeholder="वर्णन (मराठी)..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Address (Marathi)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={addressMr}
                        onChange={(e) => setAddressMr(e.target.value)}
                        placeholder="पत्ता (मराठी)..."
                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-3 py-2.5 text-sm outline-none text-slate-350 cursor-pointer"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Google Maps Direction URL</label>
                <input
                  type="text"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="Directions Navigation URL (https://google.com/maps/...)"
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Logo / Cover Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {imageUrl ? (
                    <div className="relative w-32 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shrink-0">
                      <img src={imageUrl} alt="Logo Preview" className="w-full h-full object-cover" />
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
                    placeholder="Or paste external logo image URL..."
                    className="flex-1 bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                  />
                </div>
              </div>
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
