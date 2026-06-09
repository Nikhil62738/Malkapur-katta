import { AdminPanelSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  Settings, Loader, Save, Sparkles, Facebook, Instagram, Youtube, X
} from 'lucide-react';


export default function SettingsManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [siteName, setSiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');

  // Uploading state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Load general settings from Firestore using real-time listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      setSiteName('Malkapur Katta Official');
      setLogoUrl('/logo.jpeg');
      setFaviconUrl('/favicon.ico');
      setFacebook('https://facebook.com/malkapurkatta');
      setInstagram('https://instagram.com/malkapurkatta');
      setYoutube('https://youtube.com/malkapurkatta');
      setLoading(false);
      return;
    }

    // Load ONCE instead of subscribing so a ~12s polling refresh never wipes
    // the admin's in-progress edits before they hit Save.
    let active = true;
    (async () => {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (!active) return;
      if (snap.exists()) {
        const data = snap.data();
        setSiteName(data.siteName || '');
        setLogoUrl(data.logoUrl || '');
        setFaviconUrl(data.faviconUrl || '');
        setFacebook(data.facebook || '');
        setInstagram(data.instagram || '');
        setYoutube(data.youtube || '');
      } else {
        setSiteName('Malkapur Katta Official');
        setLogoUrl('/logo.jpeg');
        setFaviconUrl('/favicon.ico');
        setFacebook('https://facebook.com/malkapurkatta');
        setInstagram('https://instagram.com/malkapurkatta');
        setYoutube('https://youtube.com/malkapurkatta');
      }
      setLoading(false);
    })().catch((err) => {
      console.error("General settings loading error:", err);
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const storageRef = ref(storage, `settings/logo_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
      success('Website logo uploaded successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to upload logo to Firebase Storage.');
      setLogoUrl(URL.createObjectURL(file));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const storageRef = ref(storage, `settings/favicon_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFaviconUrl(url);
      success('Website favicon uploaded successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to upload favicon to Firebase Storage.');
      setFaviconUrl(URL.createObjectURL(file));
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await setDoc(doc(db, 'settings', 'general'), {
        siteName,
        logoUrl,
        faviconUrl,
        facebook,
        instagram,
        youtube,
        updatedAt: new Date().toISOString()
      });
      success('General website settings updated successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to update general settings.');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return <AdminPanelSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-orange-500" /> Site Settings
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure global website metadata, logos, branding assets and social links.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding assets card */}
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" /> Site Branding & Identity
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Website Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Logo upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Website Logo</label>
              <div className="flex gap-4 items-center">
                {logoUrl ? (
                  <div className="relative w-20 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shrink-0">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-950/80 text-rose-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-800 hover:border-orange-500/40 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/20 shrink-0">
                    {uploadingLogo ? <Loader className="w-4 h-4 text-orange-500 animate-spin" /> : '🖼'}
                    <span className="text-[9px] text-slate-500 mt-1">Upload</span>
                    <input type="file" onChange={handleUploadLogo} className="hidden" accept="image/*" />
                  </label>
                )}
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Or logo image link URL..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                />
              </div>
            </div>

            {/* Favicon upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Website Favicon</label>
              <div className="flex gap-4 items-center">
                {faviconUrl ? (
                  <div className="relative w-20 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shrink-0">
                    <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setFaviconUrl('')}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-950/80 text-rose-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-800 hover:border-orange-500/40 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/20 shrink-0">
                    {uploadingFavicon ? <Loader className="w-4 h-4 text-orange-500 animate-spin" /> : '🌐'}
                    <span className="text-[9px] text-slate-500 mt-1">Upload</span>
                    <input type="file" onChange={handleUploadFavicon} className="hidden" accept="image/*" />
                  </label>
                )}
                <input
                  type="url"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="Or favicon image link URL..."
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Global Social Links */}
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🔗 Global Brand Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Facebook Link</label>
              <div className="relative">
                <Facebook className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Instagram Link</label>
              <div className="relative">
                <Instagram className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">YouTube Link</label>
              <div className="relative">
                <Youtube className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-500/10"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>


    </div>
  );
}

