import { AdminGridSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { Video, Search, Plus, Edit2, Trash2, X, Sparkles, Link as LinkIcon, Youtube, Instagram, UploadCloud } from 'lucide-react';
import { videos, reels } from '../../data/content';
import { reelsMr } from '../../data/contentMr';

interface VideoDocument {
  id: string;
  type: 'youtube' | 'instagram';
  titleEn: string;
  titleMr: string;
  descriptionEn: string;
  descriptionMr: string;
  videoUrl: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  views: string;
  date: string;
  duration: string;
  featured: boolean;
}

export default function VideosManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VideoDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal editor states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'english' | 'marathi'>('english');

  // Fields
  const [type, setType] = useState<'youtube' | 'instagram'>('youtube');
  const [titleEn, setTitleEn] = useState('');
  const [titleMr, setTitleMr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionMr, setDescriptionMr] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [views, setViews] = useState('0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('0:00');
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState('');

  // Helper: build all mock documents for seeding
  const buildMockDocuments = () => {
    const mockVideos: Omit<VideoDocument, 'id'>[] = videos.map((v) => ({
      type: 'youtube' as const,
      titleEn: v.title,
      titleMr: v.title + ' (मराठी)',
      descriptionEn: v.description,
      descriptionMr: v.description + ' (मराठी)',
      videoUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
      youtubeId: v.youtubeId,
      thumbnailUrl: v.thumbnail,
      views: v.views,
      date: v.date,
      duration: v.duration,
      featured: true
    }));

    const mockReels: Omit<VideoDocument, 'id'>[] = reels.map((r) => {
      const rMr = reelsMr.find(x => x.id === r.id) || r;
      return {
        type: 'instagram' as const,
        titleEn: r.title,
        titleMr: rMr.title,
        descriptionEn: 'Instagram Reel from Malkapur',
        descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील',
        videoUrl: r.videoUrl,
        thumbnailUrl: '',
        views: r.views,
        date: new Date().toISOString().split('T')[0],
        duration: r.duration,
        featured: false
      };
    });

    return [...mockVideos, ...mockReels];
  };

  // Load from Firestore using real-time onSnapshot listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      // Mock mode: load statically
      const docs = buildMockDocuments();
      setItems(docs.map((d, i) => ({ ...d, id: `mock-${i}` })) as VideoDocument[]);
      setLoading(false);
      return;
    }

    // Real Mode: Subscribe to Firestore collection.
    // Always mirror the live MongoDB collection. The database is seeded once on
    // the server via `npm run seed`; the admin panel must never seed or
    // substitute placeholder rows. The old auto-seed created undeletable rows
    // and malformed video URLs, so it has been removed.
    const unsub = onSnapshot(collection(db, 'videos'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoDocument));
      setItems(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore videos loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleAddOpen = () => {
    setEditingId(null);
    setType('youtube');
    setTitleEn('');
    setTitleMr('');
    setDescriptionEn('');
    setDescriptionMr('');
    setVideoUrl('');
    setViews('10K');
    setDate(new Date().toISOString().split('T')[0]);
    setDuration('5:00');
    setFeatured(false);
    setUploadedName('');
    setIsModalOpen(true);
    setActiveTab('english');
  };

  const handleEditOpen = (item: VideoDocument) => {
    setEditingId(item.id);
    setType(item.type);
    setTitleEn(item.titleEn);
    setTitleMr(item.titleMr || '');
    setDescriptionEn(item.descriptionEn);
    setDescriptionMr(item.descriptionMr || '');
    setVideoUrl(item.videoUrl);
    setViews(item.views);
    setDate(item.date);
    setDuration(item.duration);
    setFeatured(item.featured);
    setUploadedName('');
    setIsModalOpen(true);
    setActiveTab('english');
  };

  // Upload a reel video file straight to Cloudinary (via the backend /api/upload
  // route, surfaced through the Firebase-storage-compatible shim). The returned
  // secure Cloudinary URL is stored as the reel's videoUrl, so reels are served
  // from Cloudinary instead of the local /reels/ folder.
  const handleReelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      error('Please select a video file (mp4, mov, webm).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      error('Video is too large. The maximum size is 50 MB.');
      return;
    }
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const storageRef = ref(storage, `reels/${Date.now()}-${safeName}`);
      const uploaded = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploaded.ref);
      setVideoUrl(url);
      setUploadedName(file.name);
      if (type !== 'instagram') setType('instagram');
      success('Reel uploaded to Cloudinary! The link was filled in below.');
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      error(`Upload failed: ${err.message || err}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !videoUrl) {
      error('Please enter title and video URL.');
      return;
    }

    setFormLoading(true);
    let ytId = '';
    let thumb = '';

    if (type === 'youtube') {
      ytId = extractYoutubeId(videoUrl);
      if (!ytId) {
        error('Invalid YouTube URL. Please make sure the link is correct.');
        setFormLoading(false);
        return;
      }
      thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    } else {
      // Instagram reel: if the clip is hosted on Cloudinary, derive a poster
      // frame so the public site shows a thumbnail; otherwise fall back to the
      // inline <video> preview (no static stock image).
      if (/res\.cloudinary\.com|\/video\/upload\//.test(videoUrl)) {
        const poster = videoUrl.replace(/\.(mp4|mov|webm|m4v|avi|mkv)(\?.*)?$/i, '.jpg');
        thumb = poster !== videoUrl ? poster : '';
      } else {
        thumb = '';
      }
    }

    const docData = {
      type,
      titleEn,
      titleMr: titleMr || titleEn,
      descriptionEn,
      descriptionMr: descriptionMr || descriptionEn,
      videoUrl,
      youtubeId: ytId || undefined,
      thumbnailUrl: thumb,
      views,
      date,
      duration,
      featured,
      updatedAt: new Date().toISOString()
    };

    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        if (editingId) {
          setItems(prev => prev.map(p => p.id === editingId ? { ...p, ...docData } : p));
          success('Video details saved successfully! (Mock Mode)');
        } else {
          const newId = 'mock-' + Math.random().toString(36).substring(2, 9);
          setItems(prev => [{ id: newId, ...docData }, ...prev]);
          success('Video content added successfully! (Mock Mode)');
        }
      } else {
        if (editingId) {
          await setDoc(doc(db, 'videos', editingId), docData, { merge: true });
          // onSnapshot will automatically update the list
          success('Video saved! Changes will reflect live on the website.');
        } else {
          await addDoc(collection(db, 'videos'), docData);
          // onSnapshot will automatically update the list
          success('Video added! It will appear live on the website.');
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Firestore save error:", err);
      error(`Failed to save video details: ${err.message || err}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this video?')) return;
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    try {
      if (isMock) {
        setItems(prev => prev.filter(p => p.id !== id));
        success('Video deleted from mock view.');
      } else {
        await deleteDoc(doc(db, 'videos', id));
        // onSnapshot will automatically remove the item from the list
        success('Video deleted! It will be removed from the website live.');
      }
    } catch (err: any) {
      console.error("Firestore delete error:", err);
      error(`Failed to delete video: ${err.message || err}`);
    }
  };

  const filteredItems = items.filter((v) => {
    const matchesSearch = v.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.titleMr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || v.type === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Video className="w-8 h-8 text-orange-500" /> Videos & Reels
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage YouTube video links and Instagram reels showcased on the videos section.</p>
        </div>
        <button
          onClick={handleAddOpen}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-slate-950 font-bold text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/10 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Video / Reel
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-950/20 border border-slate-850 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search videos by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-orange-500/40 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-650"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-850 text-slate-350 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer focus:border-orange-500/40"
          >
            <option value="All">All Types</option>
            <option value="YouTube">YouTube</option>
            <option value="Instagram">Instagram</option>
          </select>
        </div>
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <AdminGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group">
              <div className="relative h-44 overflow-hidden bg-slate-950 border-b border-slate-850">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <video
                    src={item.videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    preload="metadata"
                    muted
                  />
                )}
                
                {/* Overlay Play Indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-orange-500/25 active:scale-90 transition-all">
                    ▶
                  </div>
                </div>

                <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold bg-slate-950 border border-slate-850 rounded-md flex items-center gap-1">
                  {item.type === 'youtube' ? (
                    <><Youtube className="w-3 h-3 text-red-500" /> YouTube</>
                  ) : (
                    <><Instagram className="w-3 h-3 text-pink-500" /> Instagram</>
                  )}
                </span>

                <span className="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-slate-950/80 text-white rounded-full">
                  ⏱ {item.duration}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {item.titleEn}
                  </h3>
                  <span className="text-[10px] text-slate-500 mt-0.5 block truncate">{item.titleMr}</span>
                  <p className="text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed">
                    {item.descriptionEn}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 mt-5 pt-4">
                  <span className="text-xs text-slate-500">👀 {item.views} views</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditOpen(item)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                      title="Edit Info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                      title="Delete Video"
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
              No videos/reels found matching type.
            </div>
          )}
        </div>
      )}

      {/* Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" /> {editingId ? 'Edit Video Link' : 'Add Video Link'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Video Platform Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setType('youtube')}
                    className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      type === 'youtube'
                        ? 'bg-red-950/50 border-red-500/50 text-red-400 shadow-md'
                        : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Youtube className="w-4 h-4" /> YouTube Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('instagram')}
                    className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      type === 'instagram'
                        ? 'bg-pink-950/50 border-pink-500/50 text-pink-400 shadow-md'
                        : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Instagram className="w-4 h-4" /> Instagram Reel
                  </button>
                </div>
              </div>

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
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Video Title</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. Malkapur City Tour Guide 2026"
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      rows={2}
                      placeholder="Describe what's in the video clip..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Video Title (Marathi)</label>
                    <input
                      type="text"
                      value={titleMr}
                      onChange={(e) => setTitleMr(e.target.value)}
                      placeholder="शीर्षक (मराठी)..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (Marathi)</label>
                    <textarea
                      value={descriptionMr}
                      onChange={(e) => setDescriptionMr(e.target.value)}
                      rows={2}
                      placeholder="वर्णन (मराठी)..."
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
                    />
                  </div>
                </div>
              )}

              {type === 'instagram' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Reel Video to Cloudinary</label>
                  <label className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-all ${uploading ? 'border-orange-500/50 bg-orange-950/10' : 'border-slate-800 hover:border-orange-500/40 bg-slate-950/40'}`}>
                    <UploadCloud className={`w-7 h-7 ${uploading ? 'text-orange-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className="text-sm font-semibold text-white">
                      {uploading ? 'Uploading to Cloudinary...' : 'Click to upload a reel video'}
                    </span>
                    <span className="text-[10px] text-slate-500">MP4 / MOV / WebM · up to 50 MB</span>
                    {uploadedName && !uploading && (
                      <span className="text-[11px] text-emerald-400 font-medium">✓ {uploadedName}</span>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleReelUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-2">The file is stored in Cloudinary and its URL is filled in below automatically. You can also paste a hosted video or Instagram URL manually.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{type === 'instagram' ? 'Reel Video URL (auto-filled after upload)' : 'Video Link URL'}</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={type === 'youtube' ? "https://www.youtube.com/watch?v=..." : "https://www.instagram.com/reel/..."}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Video Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 12:34 or 0:58"
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Views Display Count</label>
                  <input
                    type="text"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    placeholder="e.g. 125K"
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Publish Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                    required
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
                  <span className="text-sm font-semibold text-white">Featured Video</span>
                  <p className="text-[10px] text-slate-500">Mark as trending or spotlight item</p>
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
                disabled={formLoading || uploading}
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
