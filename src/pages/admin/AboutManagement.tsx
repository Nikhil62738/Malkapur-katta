import { AdminPanelSkeleton } from '../../components/admin/AdminSkeleton';
import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../utils/firebase';
import { useToast } from '../../components/ui/Toast';
import { 
  Users, Trash2, Plus, X, Loader, FileText, Target 
} from 'lucide-react';

interface TeamMember {
  id: string;
  nameEn: string;
  nameMr: string;
  roleEn: string;
  roleMr: string;
  image: string;
}

export default function AboutManagement() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // General fields
  const [aboutEn, setAboutEn] = useState('');
  const [aboutMr, setAboutMr] = useState('');
  const [missionEn, setMissionEn] = useState('');
  const [missionMr, setMissionMr] = useState('');
  const [team, setTeam] = useState<TeamMember[]>([]);

  // Team Member Form states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [uploadingMemberImage, setUploadingMemberImage] = useState(false);

  // Member Fields
  const [memberNameEn, setMemberNameEn] = useState('');
  const [memberNameMr, setMemberNameMr] = useState('');
  const [memberRoleEn, setMemberRoleEn] = useState('');
  const [memberRoleMr, setMemberRoleMr] = useState('');
  const [memberImage, setMemberImage] = useState('');

  // Load about config from Firestore using real-time listener
  useEffect(() => {
    const isMock = false /* Firebase removed: always use the live MongoDB backend */;

    if (isMock) {
      setAboutEn('Malkapur Katta is Buldhana district\'s leading digital hub connecting locals globally.');
      setAboutMr('मलकापूर कट्टा हे बुलढाणा जिल्ह्यातील आघाडीचे डिजिटल केंद्र आहे जे स्थानिकांना जागतिक स्तरावर जोडते.');
      setMissionEn('To empower the community by delivering reliable local news, highlighting heritage, and supporting local commerce.');
      setMissionMr('विश्वासार्ह स्थानिक बातम्या देऊन, वारसा हायलाइट करून आणि स्थानिक व्यापाराला पाठिंबा देऊन समुदायाला सक्षम करणे.');
      setTeam([
        { id: '1', nameEn: 'Nikhil Chopade', nameMr: 'निखिल चोपडे', roleEn: 'Founder & Editor', roleMr: 'संस्थापक आणि संपादक', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
      ]);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'about', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAboutEn(data.aboutEn || '');
        setAboutMr(data.aboutMr || '');
        setMissionEn(data.missionEn || '');
        setMissionMr(data.missionMr || '');
        setTeam(data.team || []);
      } else {
        setAboutEn('Malkapur Katta is Buldhana district\'s leading digital hub connecting locals globally.');
        setAboutMr('मलकापूर कट्टा हे बुलढाणा जिल्ह्यातील आघाडीचे डिजिटल केंद्र आहे जे स्थानिकांना जागतिक स्तरावर जोडते.');
        setMissionEn('To empower the community by delivering reliable local news, highlighting heritage, and supporting local commerce.');
        setMissionMr('विश्वासार्ह स्थानिक बातम्या देऊन, वारसा हायलाइट करून आणि स्थानिक व्यापाराला पाठिंबा देऊन समुदायाला सक्षम करणे.');
        setTeam([
          { id: '1', nameEn: 'Nikhil Chopade', nameMr: 'निखिल चोपडे', roleEn: 'Founder & Editor', roleMr: 'संस्थापक आणि संपादक', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
        ]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore about page loading error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'about', 'main'), {
        aboutEn,
        aboutMr,
        missionEn,
        missionMr,
        team,
        updatedAt: new Date().toISOString()
      });
      success('About page content saved!');
    } catch (err) {
      console.error(err);
      error('Failed to save about details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMemberPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMemberImage(true);
    try {
      const storageRef = ref(storage, `team/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setMemberImage(url);
      success('Member photo uploaded!');
    } catch (err) {
      console.error(err);
      error('Failed to upload image. Fallback placeholder applied.');
      setMemberImage(URL.createObjectURL(file));
    } finally {
      setUploadingMemberImage(false);
    }
  };

  const handleOpenAddMember = () => {
    setEditingMemberId(null);
    setMemberNameEn('');
    setMemberNameMr('');
    setMemberRoleEn('');
    setMemberRoleMr('');
    setMemberImage('');
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (m: TeamMember) => {
    setEditingMemberId(m.id);
    setMemberNameEn(m.nameEn);
    setMemberNameMr(m.nameMr || '');
    setMemberRoleEn(m.roleEn);
    setMemberRoleMr(m.roleMr || '');
    setMemberImage(m.image);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNameEn || !memberRoleEn || !memberImage) {
      error('Member name, role and photo are required.');
      return;
    }

    const memberData: TeamMember = {
      id: editingMemberId || Math.random().toString(36).substring(2, 9),
      nameEn: memberNameEn,
      nameMr: memberNameMr || memberNameEn,
      roleEn: memberRoleEn,
      roleMr: memberRoleMr || memberRoleEn,
      image: memberImage
    };

    if (editingMemberId) {
      setTeam(prev => prev.map(m => m.id === editingMemberId ? memberData : m));
    } else {
      setTeam(prev => [...prev, memberData]);
    }
    setIsMemberModalOpen(false);
    success('Team member list updated. Make sure to click "Save About Page Content" to write to server.');
  };

  const handleDeleteMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    success('Member removed from team list (save required).');
  };

  if (loading) {
    return <AdminPanelSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">About Page Management</h2>
          <p className="text-slate-400 text-sm mt-1">Manage description, mission statement, and team profile items.</p>
        </div>
        <button
          onClick={handleSaveAbout}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 shadow-md"
        >
          {saving && <Loader className="w-4 h-4 animate-spin text-slate-950" />}
          {saving ? 'Saving...' : 'Save Page Content'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* About details card */}
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" /> About Description
          </h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About us text (English)</label>
            <textarea
              value={aboutEn}
              onChange={(e) => setAboutEn(e.target.value)}
              rows={4}
              placeholder="Who we are, what we do..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About us text (Marathi)</label>
            <textarea
              value={aboutMr}
              onChange={(e) => setAboutMr(e.target.value)}
              rows={4}
              placeholder="माहिती (मराठीत)..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
            />
          </div>
        </section>

        {/* Mission statement card */}
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" /> Mission Statement
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Our Mission (English)</label>
            <textarea
              value={missionEn}
              onChange={(e) => setMissionEn(e.target.value)}
              rows={4}
              placeholder="What is our ultimate goal/mission..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Our Mission (Marathi)</label>
            <textarea
              value={missionMr}
              onChange={(e) => setMissionMr(e.target.value)}
              rows={4}
              placeholder="ध्येय (मराठीत)..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm outline-none text-white resize-none"
            />
          </div>
        </section>
      </div>

      {/* Team Member Management Card */}
      <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" /> Core Team Members
          </h3>
          <button
            onClick={handleOpenAddMember}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((member) => (
            <div key={member.id} className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col items-center text-center relative group">
              <img
                src={member.image}
                alt={member.nameEn}
                className="w-16 h-16 rounded-full object-cover border border-slate-800 bg-slate-950 mb-3"
              />
              <h4 className="font-bold text-sm text-white">{member.nameEn}</h4>
              <p className="text-xs text-slate-450 mt-1 leading-tight">{member.roleEn}</p>
              <p className="text-[10px] text-slate-600 mt-2">{member.nameMr} • {member.roleMr}</p>

              {/* Action Overlays */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEditMember(member)}
                  className="p-1 rounded bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white"
                  title="Edit member details"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-1 rounded bg-slate-950/80 border border-slate-800 text-rose-455 hover:text-rose-400"
                  title="Remove member"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {team.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-xl">
              No team members configured.
            </div>
          )}
        </div>
      </section>

      {/* Team Member Edit Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">
                {editingMemberId ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Member Name (English)</label>
                <input
                  type="text"
                  value={memberNameEn}
                  onChange={(e) => setMemberNameEn(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2 text-sm outline-none text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Member Name (Marathi)</label>
                <input
                  type="text"
                  value={memberNameMr}
                  onChange={(e) => setMemberNameMr(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2 text-sm outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role / Designation (English)</label>
                <input
                  type="text"
                  value={memberRoleEn}
                  onChange={(e) => setMemberRoleEn(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2 text-sm outline-none text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role / Designation (Marathi)</label>
                <input
                  type="text"
                  value={memberRoleMr}
                  onChange={(e) => setMemberRoleMr(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2 text-sm outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Photo</label>
                <div className="flex gap-4 items-center">
                  {memberImage ? (
                    <img src={memberImage} className="w-12 h-12 rounded-full object-cover border border-slate-800" />
                  ) : (
                    <label className="w-12 h-12 rounded-full border-2 border-dashed border-slate-800 hover:border-orange-500/40 flex items-center justify-center cursor-pointer transition-colors bg-slate-950/20">
                      {uploadingMemberImage ? '...' : '📸'}
                      <input type="file" onChange={handleUploadMemberPhoto} className="hidden" />
                    </label>
                  )}
                  <input
                    type="url"
                    value={memberImage}
                    onChange={(e) => setMemberImage(e.target.value)}
                    placeholder="Photo URL link..."
                    className="flex-1 bg-slate-950/40 border border-slate-800 focus:border-orange-500/50 rounded-xl px-4 py-2 text-sm outline-none text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-slate-950 hover:bg-orange-400"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
