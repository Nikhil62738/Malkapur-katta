import { AdminGridSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, orderBy, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  Newspaper, Search, Plus, Edit2, Trash2, X, 
  Upload, Sparkles, Filter, Loader, Calendar, User
} from 'lucide-react';

interface NewsDocument {
  id: string;
  titleEn: string;
  titleMr: string;
  excerptEn: string;
  excerptMr: string;
  category: string;
  date: string;
  image: string;
  author: string;
  featured: boolean;
  breaking: boolean;
  status: 'draft' | 'published';
  createdAt?: string;
}

export default function NewsManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsDocument[]>([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'english' | 'marathi'>('english');

  // Form Fields
  const [titleEn, setTitleEn] = useState('');
  const [titleMr, setTitleMr] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptMr, setExcerptMr] = useState('');
  const [category, setCategory] = useState('Politics');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const categories = ['Politics', 'Education', 'Sports', 'Culture'];

  // Load News from Firestore using real-time onSnapshot listener
  useEffect(() => {
    // Subscribe to Firestore
    const q = query(collection(db, 'news'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setNews([]);
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsDocument));
        setNews(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore news loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Upload Featured Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `news/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      success('News image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      error('Failed to upload image. Fallback placeholder logic applied.');
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Form for Adding
  const handleAddOpen = () => {
    setEditingId(null);
    setTitleEn('');
    setTitleMr('');
    setExcerptEn('');
    setExcerptMr('');
    setCategory('Politics');
    setAuthor('');
    setDate(new Date().toISOString().split('T')[0]);
    setImageUrl('');
    setFeatured(false);
    setBreaking(false);
    setStatus('published');
    setIsModalOpen(true);
    setActiveTab('english');
  };

  // Open Form for Editing
  const handleEditOpen = (item: NewsDocument) => {
    setEditingId(item.id);
    setTitleEn(item.titleEn);
    setTitleMr(item.titleMr || '');
    setExcerptEn(item.excerptEn);
    setExcerptMr(item.excerptMr || '');
    setCategory(item.category);
    setAuthor(item.author);
    setDate(item.date);
    setImageUrl(item.image);
    setFeatured(item.featured);
    setBreaking(item.breaking || false);
    setStatus(item.status);
    setIsModalOpen(true);
    setActiveTab('english');
  };

  // Save / Update logic
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !excerptEn || !author || !imageUrl) {
      error('Please complete English fields, author name, and upload an image.');
      return;
    }

    setFormLoading(true);
    const docData = {
      titleEn,
      titleMr: titleMr || titleEn,
      excerptEn,
      excerptMr: excerptMr || excerptEn,
      category,
      author,
      date,
      image: imageUrl,
      featured,
      breaking,
      status,
      updatedAt: new Date().toISOString()
    };


    try {
      if (editingId) {
        await setDoc(doc(db, 'news', editingId), docData, { merge: true });
        setNews((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...docData } : item))
        );
        success('News article updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'news'), {
          ...docData,
          createdAt: new Date().toISOString()
        });
        setNews((prev) => [
          { id: docRef.id, ...docData },
          ...prev
        ]);
        success('News article created successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Firestore news save error:", err);
      error(`Failed to save news article: ${err.message || err}`);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete news
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;

    try {
      await deleteDoc(doc(db, 'news', id));
      setNews((prev) => prev.filter((item) => item.id !== id));
      success('News article deleted successfully!');
    } catch (err: any) {
      console.error("Firestore news delete error:", err);
      error(`Failed to delete news article: ${err.message || err}`);
    }
  };

  // Filter & Search computation
  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-orange-500" /> News Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Add, update, and categorize reports for the News Page.</p>
        </div>
        <button
          onClick={handleAddOpen}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-slate-950 font-bold text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/10 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add News Article
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search news by title, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-orange-500/40 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-650"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-850 text-slate-350 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer focus:border-orange-500/40"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-850 text-slate-350 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer focus:border-orange-500/40"
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* News Table/Grid */}
      {loading ? (
        <AdminGridSkeleton />
      ) : (
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/60 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                  <th className="p-4 pl-6">Article</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Author</th>
                  <th className="p-4 text-center">Badges</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100'}
                          alt={item.titleEn}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate max-w-[240px]">{item.titleEn}</h4>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[240px] mt-0.5">{item.titleMr}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-350">{item.category}</td>
                    <td className="p-4 text-sm text-slate-350">{item.date}</td>
                    <td className="p-4 text-sm text-slate-350">{item.author}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.featured && (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Featured
                          </span>
                        )}
                        {item.breaking && (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                            Breaking
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        item.status === 'published' 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/25'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditOpen(item)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                          title="Edit Article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredNews.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-500 text-sm italic">
                      No news articles found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" /> {editingId ? 'Edit News Article' : 'Create News Article'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Form Tabs */}
              <div className="flex border-b border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab('english')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'english'
                      ? 'border-orange-500 text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  English Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('marathi')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'marathi'
                      ? 'border-orange-500 text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Marathi (मराठी) translation
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'english' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title (English)</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="Enter news heading..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Excerpt (English)</label>
                    <textarea
                      value={excerptEn}
                      onChange={(e) => setExcerptEn(e.target.value)}
                      rows={3}
                      placeholder="Write a brief intro/summary of the news article..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650 resize-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title (Marathi)</label>
                    <input
                      type="text"
                      value={titleMr}
                      onChange={(e) => setTitleMr(e.target.value)}
                      placeholder="मराठी बातमीचे शीर्षक..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Excerpt (Marathi)</label>
                    <textarea
                      value={excerptMr}
                      onChange={(e) => setExcerptMr(e.target.value)}
                      rows={3}
                      placeholder="बातमीचा संक्षिप्त सारांश (मराठी)..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Shared Metadata */}
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Author</label>
                  <div className="relative">
                    <User className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Reporter Name"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Publish Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Featured Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {imageUrl ? (
                    <div className="relative w-32 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shrink-0">
                      <img src={imageUrl} alt="News Image Preview" className="w-full h-full object-cover" />
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
                    className="flex-1 bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder:text-slate-650"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white">Featured News</span>
                    <p className="text-[10px] text-slate-500">Show in homepage highlighted stories</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breaking}
                    onChange={(e) => setBreaking(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white">Breaking Alert</span>
                    <p className="text-[10px] text-slate-500">Flashing alert in news ticker</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status === 'published'}
                    onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white">Publish Instantly</span>
                    <p className="text-[10px] text-slate-500">Make visible on frontend immediately</p>
                  </div>
                </label>
              </div>
            </form>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-750 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={formLoading || uploadingImage}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 transition-all flex items-center gap-1.5"
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
