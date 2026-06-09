import { AdminPanelSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { Image as ImageIcon, Trash2, Plus, Sparkles, Loader } from 'lucide-react';

export default function HomeManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [newHeadline, setNewHeadline] = useState('');
  const [headlinesMr, setHeadlinesMr] = useState<string[]>([]);
  const [newHeadlineMr, setNewHeadlineMr] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load home settings from Firestore document 'settings/home' using real-time listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      setHeroImages([
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80'
      ]);
      setHeadlines([
        'Ganesh Utsav 2026 preparations begin across Malkapur — community committees meet today',
        'New cotton market rates announced — farmers celebrate record prices this season',
        'Malkapur Municipal Council approves smart city lighting project for main roads'
      ]);
      setLoading(false);
      return;
    }

    // Load ONCE instead of subscribing. This is an edit form: a live polling
    // listener (~12s) would overwrite the admin's in-progress edits, which is
    // why typed headlines "disappeared after 10-12 seconds". After Save, local
    // state is the source of truth and is persisted to the backend.
    let active = true;
    (async () => {
      const snap = await getDoc(doc(db, 'settings', 'home'));
      if (!active) return;
      if (snap.exists()) {
        const data = snap.data();
        setHeroImages(data.heroImages || []);
        setHeadlines(data.headlines || []);
        setHeadlinesMr(data.headlinesMr || []);
      } else {
        setHeroImages([
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80'
        ]);
        setHeadlines([
          'Ganesh Utsav 2026 preparations begin across Malkapur — community committees meet today',
          'New cotton market rates announced — farmers celebrate record prices this season',
          'Malkapur Municipal Council approves smart city lighting project for main roads'
        ]);
      }
      setLoading(false);
    })().catch((err) => {
      console.error("Home settings loading error:", err);
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  // Save all home settings to Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'home'), {
        heroImages,
        headlines,
        headlinesMr,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      success('Home settings updated successfully!');
    } catch (err: any) {
      console.error(err);
      error('Failed to update home settings.');
    } finally {
      setSaving(false);
    }
  };

  // Upload hero banner image
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setHeroImages((prev) => [...prev, downloadUrl]);
      success('Hero image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      error('Image upload failed. Falling back to local URL logic.');
      // Local fallback for simulation
      const fallbackUrl = URL.createObjectURL(file);
      setHeroImages((prev) => [...prev, fallbackUrl]);
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove hero image
  const removeHeroImage = (index: number) => {
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
    success('Hero image removed from list (save to commit changes).');
  };

  // Add headline ticker string
  const addHeadline = () => {
    if (!newHeadline.trim()) return;
    setHeadlines((prev) => [...prev, newHeadline.trim()]);
    setNewHeadline('');
  };

  // Remove headline ticker string
  const removeHeadline = (index: number) => {
    setHeadlines((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Marathi headline ticker string
  const addHeadlineMr = () => {
    if (!newHeadlineMr.trim()) return;
    setHeadlinesMr((prev) => [...prev, newHeadlineMr.trim()]);
    setNewHeadlineMr('');
  };

  // Remove Marathi headline ticker string
  const removeHeadlineMr = (index: number) => {
    setHeadlinesMr((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <AdminPanelSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Home Page Management</h2>
          <p className="text-slate-400 text-sm mt-1">Configure layout, hero banners, headlines and trending reels.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
        >
          {saving && <Loader className="w-4 h-4 animate-spin text-slate-950" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Hero Banner Images Management */}
      <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-400" /> Hero Banner Slider Images
        </h3>
        <p className="text-slate-400 text-xs mb-6">These images rotate on the homepage. Use landscape images for best view.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {heroImages.map((img, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-800 bg-slate-900 shadow-md">
              <img src={img} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeHeroImage(index)}
                  className="p-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Banner Image Button */}
          <label className="border-2 border-dashed border-slate-800 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center aspect-video cursor-pointer hover:bg-slate-900/30 transition-all group">
            {uploadingImage ? (
              <Loader className="w-6 h-6 text-orange-500 animate-spin mb-2" />
            ) : (
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-orange-400 transition-colors mb-2" />
            )}
            <span className="text-xs font-semibold text-slate-400 group-hover:text-orange-400">
              {uploadingImage ? 'Uploading Image...' : 'Upload Landscape Image'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHeroImageUpload}
              disabled={uploadingImage}
            />
          </label>
        </div>
      </section>

      {/* Homepage Headline Ticker */}
      <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-400" /> Scrolling News Ticker Headlines (English)
        </h3>
        <p className="text-slate-400 text-xs mb-6">Shown on the ticker when the site is viewed in English. Type a headline, click Add, then Save Changes.</p>

        <div className="flex gap-2.5 mb-6">
          <input
            type="text"
            value={newHeadline}
            onChange={(e) => setNewHeadline(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHeadline()}
            placeholder="Type breaking headline here..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-3 text-sm outline-none text-white placeholder:text-slate-600"
          />
          <button
            onClick={addHeadline}
            className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-semibold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-2">
          {headlines.map((headline, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm font-medium hover:border-slate-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>{headline}</span>
              </div>
              <button
                type="button"
                onClick={() => removeHeadline(index)}
                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {headlines.length === 0 && (
            <div className="text-center py-6 text-slate-650 text-sm italic">
              No English ticker headlines added. Add one above!
            </div>
          )}
        </div>
      </section>

      {/* Homepage Headline Ticker (Marathi) */}
      <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-400" /> Scrolling News Ticker Headlines (मराठी)
        </h3>
        <p className="text-slate-400 text-xs mb-6">Shown on the ticker when the site is viewed in Marathi. Type a headline, click Add, then Save Changes.</p>

        <div className="flex gap-2.5 mb-6">
          <input
            type="text"
            value={newHeadlineMr}
            onChange={(e) => setNewHeadlineMr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHeadlineMr()}
            placeholder="मथळा येथे टाइप करा..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-3 text-sm outline-none text-white placeholder:text-slate-600"
          />
          <button
            onClick={addHeadlineMr}
            className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-semibold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-2">
          {headlinesMr.map((headline, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm font-medium hover:border-slate-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>{headline}</span>
              </div>
              <button
                type="button"
                onClick={() => removeHeadlineMr(index)}
                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {headlinesMr.length === 0 && (
            <div className="text-center py-6 text-slate-650 text-sm italic">
              No Marathi ticker headlines added. Add one above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
