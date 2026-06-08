import { AdminGridSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  Image as ImageIcon, Search, Plus, Trash2, X, Upload, Sparkles, Loader, Filter 
} from 'lucide-react';
import { galleryItems } from '../../data/content';

interface GalleryDocument {
  id: string;
  title: string;
  category: 'Festival Photos' | 'City Photos';
  image: string;
  storagePath?: string;
  createdAt?: string;
}

export default function GalleryManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GalleryDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal upload states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Festival Photos' | 'City Photos'>('Festival Photos');
  const [imageUrl, setImageUrl] = useState('');
  const [storagePath, setStoragePath] = useState('');

  const categories = ['Festival Photos', 'City Photos'];

  // Load from Firestore using real-time onSnapshot listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      // Initialize mock content
      const mockList: GalleryDocument[] = galleryItems.map((g) => ({
        id: g.id,
        title: g.title,
        category: g.category === 'Festival' ? 'Festival Photos' : 'City Photos',
        image: g.image
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
    const unsub = onSnapshot(collection(db, 'gallery'), (snap) => {
      if (false) {
        const mockList: GalleryDocument[] = galleryItems.map((g) => ({
          id: g.id,
          title: g.title,
          category: g.category === 'Festival' ? 'Festival Photos' : 'City Photos',
          image: g.image
        }));
        setItems(mockList);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryDocument));
        setItems(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore gallery loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const path = `gallery/${Date.now()}_${file.name}`;
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      setStoragePath(path);
      success('Image file uploaded to Storage!');
    } catch (err) {
      console.error(err);
      error('Failed to upload image to Firebase Storage. Using local url.');
      setImageUrl(URL.createObjectURL(file));
      setStoragePath(path);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAdd = () => {
    setTitle('');
    setCategory('Festival Photos');
    setImageUrl('');
    setStoragePath('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      error('Please enter a title and choose/upload a photo.');
      return;
    }

    setFormLoading(true);
    const docData = {
      title,
      category,
      image: imageUrl,
      storagePath,
      createdAt: new Date().toISOString()
    };

    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        const newId = 'mock-' + Math.random().toString(36).substring(2, 9);
        setItems(prev => [{ id: newId, ...docData }, ...prev]);
        success('Photo added to gallery successfully! (Mock Mode)');
      } else {
        const docRef = await addDoc(collection(db, 'gallery'), docData);
        setItems(prev => [{ id: docRef.id, ...docData }, ...prev]);
        success('Photo added to gallery successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Firestore gallery save error:", err);
      error(`Failed to save to gallery: ${err.message || err}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item: GalleryDocument) => {
    if (!window.confirm(`Delete "${item.title}" from the gallery?`)) return;
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        setItems(prev => prev.filter(i => i.id !== item.id));
        success('Photo deleted from mock view.');
      } else {
        // Delete from Storage if it has a storage path
        if (item.storagePath) {
          try {
            const storageRef = ref(storage, item.storagePath);
            await deleteObject(storageRef);
          } catch (storageErr) {
            console.warn("Storage deletion skipped/failed:", storageErr);
          }
        }
        await deleteDoc(doc(db, 'gallery', item.id));
        setItems(prev => prev.filter(i => i.id !== item.id));
        success('Photo deleted from gallery.');
      }
    } catch (err: any) {
      console.error("Firestore gallery delete error:", err);
      error(`Failed to delete photo: ${err.message || err}`);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-orange-500" /> Gallery Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Upload and organize city landmarks and cultural festival photos.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-slate-950 font-bold text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/10 shrink-0"
        >
          <Plus className="w-4 h-4" /> Upload Image
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search gallery by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-orange-500/40 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-650"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
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

      {/* Gallery Cards Grid */}
      {loading ? (
        <AdminGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-850 bg-slate-950 shadow-md">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between z-10">
                <span className="self-start px-2 py-0.5 text-[8px] font-bold bg-orange-500 text-slate-950 rounded-md">
                  {item.category}
                </span>
                
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight truncate">{item.title}</h4>
                  <div className="flex justify-end mt-3 border-t border-slate-800 pt-2">
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:text-slate-950 hover:bg-rose-500 transition-all"
                      title="Delete Image"
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
              No photos found in gallery.
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" /> Upload Image
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Photo Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ganesh Utsav Visarjan"
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'Festival Photos' | 'City Photos')}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-3 py-2.5 text-sm outline-none text-slate-350 cursor-pointer"
                >
                  <option value="Festival Photos">Festival Photos</option>
                  <option value="City Photos">City Photos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Choose Image File</label>
                <div className="flex flex-col gap-4">
                  {imageUrl ? (
                    <div className="relative w-full h-44 rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageUrl(''); setStoragePath(''); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-rose-450 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-36 border-2 border-dashed border-slate-800 hover:border-orange-500/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/20 group">
                      {uploadingImage ? (
                        <Loader className="w-6 h-6 text-orange-500 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-500 group-hover:text-orange-400 mb-2" />
                          <span className="text-xs text-slate-400 font-semibold group-hover:text-orange-450">Upload File to Firebase Storage</span>
                          <span className="text-[10px] text-slate-600 mt-1">PNG, JPG, JPEG up to 5MB</span>
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
                    placeholder="Or paste external picture link..."
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || uploadingImage}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {formLoading ? 'Uploading...' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
