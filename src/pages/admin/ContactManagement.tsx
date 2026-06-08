import { AdminPanelSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { Phone, Mail, MapPin, Globe, Save, Sparkles, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export default function ContactManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [addressMr, setAddressMr] = useState('');
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState('');
  
  // Social Links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');

  // Load contact settings from Firestore using real-time listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      setPhone('+91 7262 123456');
      setEmail('contact@malkapurkatta.com');
      setAddressEn('Malkapur, Buldhana District, Maharashtra, India - 443101');
      setAddressMr('मलकापूर, बुलढाणा जिल्हा, महाराष्ट्र, भारत - ४४३१०१');
      setMapsEmbedUrl('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119058.123456789!2d76.2!3d20.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1234567890%3A0xabcdef1234567890!2sMalkapur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890');
      setFacebook('https://facebook.com/malkapurkatta');
      setInstagram('https://instagram.com/malkapurkatta');
      setYoutube('https://youtube.com/malkapurkatta');
      setTwitter('https://twitter.com/malkapurkatta');
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setAddressEn(data.addressEn || '');
        setAddressMr(data.addressMr || '');
        setMapsEmbedUrl(data.mapsEmbedUrl || '');
        setFacebook(data.facebook || '');
        setInstagram(data.instagram || '');
        setYoutube(data.youtube || '');
        setTwitter(data.twitter || '');
      } else {
        setPhone('+91 7262 123456');
        setEmail('contact@malkapurkatta.com');
        setAddressEn('Malkapur, Buldhana District, Maharashtra, India - 443101');
        setAddressMr('मलकापूर, बुलढाणा जिल्हा, महाराष्ट्र, भारत - ४४३१०१');
        setMapsEmbedUrl('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119058.123456789!2d76.2!3d20.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1234567890%3A0xabcdef1234567890!2sMalkapur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890');
        setFacebook('https://facebook.com/malkapurkatta');
        setInstagram('https://instagram.com/malkapurkatta');
        setYoutube('https://youtube.com/malkapurkatta');
        setTwitter('https://twitter.com/malkapurkatta');
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore contact settings loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await setDoc(doc(db, 'settings', 'contact'), {
        phone,
        email,
        addressEn,
        addressMr,
        mapsEmbedUrl,
        facebook,
        instagram,
        youtube,
        twitter,
        updatedAt: new Date().toISOString()
      });
      success('Contact settings updated successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to update contact settings.');
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
            <Globe className="w-8 h-8 text-orange-500" /> Contact Page Settings
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage office details, map embed URLs, and social profiles shown on the contact page.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Contact Info */}
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" /> General Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Office Address (English)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white resize-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Office Address (Marathi)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                value={addressMr}
                onChange={(e) => setAddressMr(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white resize-none"
              />
            </div>
          </div>
        </section>

        {/* Google Maps Embed Url */}
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            🗺 Google Maps Placement
          </h3>
          <p className="text-slate-400 text-xs">Input the standard Google Map Embed source URL (only copy the link inside the src="" property of the iframe).</p>
          
          <div>
            <input
              type="text"
              value={mapsEmbedUrl}
              onChange={(e) => setMapsEmbedUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>

          {mapsEmbedUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-800 h-44 bg-slate-950">
              <iframe
                title="Malkapur Katta Map"
                src={mapsEmbedUrl}
                className="w-full h-full border-0 grayscale opacity-80"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </section>

        {/* Social Media links */}
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            🔗 Social Channel Handlers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Facebook Page Link</label>
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">YouTube Channel Link</label>
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

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Twitter Link</label>
              <div className="relative">
                <Twitter className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-white"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-500/10"
          >
            <Save className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
