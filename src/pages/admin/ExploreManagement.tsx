import { AdminGridSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  MapPin, Search, Plus, Edit2, Trash2, X, Upload, Sparkles, Loader 
} from 'lucide-react';
import { exploreSpots } from '../../data/content';

interface PlaceDocument {
  id: string;
  nameEn: string;
  nameMr: string;
  descriptionEn: string;
  descriptionMr: string;
  category: string;
  image: string;
  distance: string;
  mapUrl?: string;
  directionsUrl?: string;
  rating?: number;
}

export default function ExploreManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<PlaceDocument[]>([]);
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
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionMr, setDescriptionMr] = useState('');
  const [category, setCategory] = useState('Temples');
  const [imageUrl, setImageUrl] = useState('');
  const [distance, setDistance] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [directionsUrl, setDirectionsUrl] = useState('');
  const [rating, setRating] = useState(4.5);

  const categories = ['Temples', 'Historical Sites', 'Tourist Attractions'];

  // Load from Firestore using real-time onSnapshot listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      // Initialize mock content
      const mockList: PlaceDocument[] = exploreSpots.map((spot) => ({
        id: spot.id,
        nameEn: spot.name,
        nameMr: spot.name + ' (मराठी)',
        descriptionEn: spot.description,
        descriptionMr: spot.description + ' (मराठी)',
        category: spot.category === 'Temple' ? 'Temples' : 
                  spot.category === 'Heritage' ? 'Historical Sites' : 'Tourist Attractions',
        image: spot.image,
        distance: spot.distance || '1 km',
        mapUrl: spot.mapUrl || '',
        directionsUrl: spot.directionsUrl || '',
        rating: spot.rating || 4.5
      }));
      setPlaces(mockList);
      setLoading(false);
      return;
    }

    // Real Mode: Subscribe to Firestore.
    // Always mirror the live MongoDB collection. We must NOT fall back to
    // static placeholder rows when the collection is empty: those rows carry
    // ids that don't exist in MongoDB, so they cannot be edited or deleted and
    // they make the admin panel disagree with the public website.
    const unsub = onSnapshot(collection(db, 'places'), (snap) => {
      if (false) {
        const mockList: PlaceDocument[] = exploreSpots.map((spot) => ({
          id: spot.id,
          nameEn: spot.name,
          nameMr: spot.name + ' (मराठी)',
          descriptionEn: spot.description,
          descriptionMr: spot.description + ' (मराठी)',
          category: spot.category === 'Temple' ? 'Temples' : 
                    spot.category === 'Heritage' ? 'Historical Sites' : 'Tourist Attractions',
          image: spot.image,
          distance: spot.distance || '1 km',
          mapUrl: spot.mapUrl || '',
          directionsUrl: spot.directionsUrl || '',
          rating: spot.rating || 4.5
        }));
        setPlaces(mockList);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as PlaceDocument));
        setPlaces(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore places loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `places/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      success('Tourist place image uploaded!');
    } catch (err) {
      console.error(err);
      error('Failed to upload. Falling back to local URL preview.');
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddOpen = () => {
    setEditingId(null);
    setNameEn('');
    setNameMr('');
    setDescriptionEn('');
    setDescriptionMr('');
    setCategory('Temples');
    setImageUrl('');
    setDistance('');
    setMapUrl('');
    setDirectionsUrl('');
    setRating(4.5);
    setIsModalOpen(true);
    setActiveTab('english');
  };

  const handleEditOpen = (item: PlaceDocument) => {
    setEditingId(item.id);
    setNameEn(item.nameEn);
    setNameMr(item.nameMr || '');
    setDescriptionEn(item.descriptionEn);
    setDescriptionMr(item.descriptionMr || '');
    setCategory(item.category);
    setImageUrl(item.image);
    setDistance(item.distance);
    setMapUrl(item.mapUrl || '');
    setDirectionsUrl(item.directionsUrl || '');
    setRating(item.rating || 4.5);
    setIsModalOpen(true);
    setActiveTab('english');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !descriptionEn || !imageUrl || !distance) {
      error('Please fill in place name, description, distance, and provide an image.');
      return;
    }

    setFormLoading(true);
    const docData = {
      nameEn,
      nameMr: nameMr || nameEn,
      descriptionEn,
      descriptionMr: descriptionMr || descriptionEn,
      category,
      image: imageUrl,
      distance,
      mapUrl,
      directionsUrl,
      rating,
      updatedAt: new Date().toISOString()
    };

    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        if (editingId) {
          setPlaces(prev => prev.map(p => p.id === editingId ? { ...p, ...docData } : p));
          success('Place updated successfully! (Mock Mode)');
        } else {
          const newId = 'mock-' + Math.random().toString(36).substring(2, 9);
          setPlaces(prev => [{ id: newId, ...docData }, ...prev]);
          success('Place added successfully! (Mock Mode)');
        }
      } else {
        if (editingId) {
          await setDoc(doc(db, 'places', editingId), docData, { merge: true });
          setPlaces(prev => prev.map(p => p.id === editingId ? { ...p, ...docData } : p));
          success('Place updated successfully!');
        } else {
          const docRef = await addDoc(collection(db, 'places'), docData);
          setPlaces(prev => [{ id: docRef.id, ...docData }, ...prev]);
          success('Place added successfully!');
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Firestore places save error:", err);
      error(`Failed to save place details: ${err.message || err}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tourist spot?')) return;
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        setPlaces(prev => prev.filter(p => p.id !== id));
        success('Place removed from mock view.');
      } else {
        await deleteDoc(doc(db, 'places', id));
        setPlaces(prev => prev.filter(p => p.id !== id));
        success('Place deleted successfully!');
      }
    } catch (err: any) {
      console.error("Firestore places delete error:", err);
      error(`Failed to delete place: ${err.message || err}`);
    }
  };

  const filteredPlaces = places.filter((p) => {
    const matchesSearch = p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nameMr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-8 h-8 text-orange-500" /> Explore Malkapur
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage tourist attractions, heritage monuments, and key spots.</p>
        </div>
        <button
          onClick={handleAddOpen}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-slate-950 font-bold text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/10 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Tourist Place
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search spots by name..."
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

      {/* Place Grid */}
      {loading ? (
        <AdminGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((item) => (
            <div key={item.id} className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group">
              <div className="relative h-48 overflow-hidden bg-slate-900 border-b border-slate-850">
                <img
                  src={item.image}
                  alt={item.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold bg-orange-500 text-slate-950 rounded-md">
                  {item.category}
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 text-xs font-semibold bg-slate-950/80 text-white rounded-full">
                  🚗 {item.distance}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-orange-400 transition-colors">
                    {item.nameEn}
                  </h3>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{item.nameMr}</span>
                  <p className="text-slate-400 text-xs mt-3 line-clamp-3 leading-relaxed">
                    {item.descriptionEn}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 mt-5 pt-4">
                  <span className="text-xs text-amber-400 font-bold">⭐ {item.rating}</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditOpen(item)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                      title="Edit Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                      title="Delete Place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPlaces.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm italic">
              No tourist places found matching the filters.
            </div>
          )}
        </div>
      )}

      {/* Place Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" /> {editingId ? 'Edit Tourist Place' : 'Add Tourist Place'}
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
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Place Name</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Shri Sant Gajanan Maharaj Mandir"
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
                      placeholder="Describe the place's history, spiritual value, attraction points..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Place Name (Marathi)</label>
                    <input
                      type="text"
                      value={nameMr}
                      onChange={(e) => setNameMr(e.target.value)}
                      placeholder="ठिकाणाचे नाव (मराठी)..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (Marathi)</label>
                    <textarea
                      value={descriptionMr}
                      onChange={(e) => setDescriptionMr(e.target.value)}
                      rows={4}
                      placeholder="ठिकाणाचे वर्णन मराठीत लिहा..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                    />
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Distance (from City Center)</label>
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 1.5 km or 45 km"
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    required
                  />
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

              {/* Map Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Google Maps Embed URL</label>
                  <input
                    type="text"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    placeholder="iframe src link (https://google.com/maps/embed/...)"
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Directions Navigation URL</label>
                  <input
                    type="text"
                    value={directionsUrl}
                    onChange={(e) => setDirectionsUrl(e.target.value)}
                    placeholder="Direct navigation link (https://google.com/maps/dir/...)"
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Featured Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {imageUrl ? (
                    <div className="relative w-32 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                    placeholder="Or paste external image URL..."
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
