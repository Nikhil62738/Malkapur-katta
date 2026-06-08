import { useEffect, useState, type FormEvent } from 'react';
import {
  UserPlus,
  Trash2,
  Save,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  type AdminAccount
} from '../../utils/api';
import { PERMISSION_DEFS } from '../../constants/permissions';

function PermissionGrid({
  selected,
  onToggle,
  idPrefix
}: {
  selected: string[];
  onToggle: (key: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {PERMISSION_DEFS.map((perm) => {
        const checked = selected.includes(perm.key);
        return (
          <label
            key={perm.key}
            htmlFor={`${idPrefix}-${perm.key}`}
            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
              checked
                ? 'border-orange-500/60 bg-orange-500/10'
                : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
            }`}
          >
            <input
              id={`${idPrefix}-${perm.key}`}
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(perm.key)}
              className="mt-0.5 w-4 h-4 accent-orange-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-100">{perm.label}</span>
              <span className="block text-xs text-slate-500">{perm.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function AdminRow({
  admin,
  onChanged,
  currentUid
}: {
  admin: AdminAccount;
  onChanged: () => void;
  currentUid?: string;
}) {
  const isSuper = admin.role === 'superadmin';
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(admin.name);
  const [perms, setPerms] = useState<string[]>(admin.permissions);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const togglePerm = (key: string) =>
    setPerms((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await updateAdmin(admin.id, {
        name,
        permissions: perms,
        password: password || undefined
      });
      setPassword('');
      setOpen(false);
      onChanged();
    } catch (e: any) {
      setErr(e.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete sub-admin "${admin.email}"? This cannot be undone.`)) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteAdmin(admin.id);
      onChanged();
    } catch (e: any) {
      setErr(e.message || 'Delete failed');
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          onClick={() => !isSuper && setOpen((o) => !o)}
          className="flex items-center gap-3 text-left flex-1 min-w-0"
          disabled={isSuper}
        >
          <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${isSuper ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
            {isSuper ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white truncate">
              {admin.name || admin.email}
              {currentUid === admin.id && <span className="ml-2 text-[10px] text-orange-400">(you)</span>}
            </span>
            <span className="block text-xs text-slate-500 truncate">{admin.email}</span>
          </span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${isSuper ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            {isSuper ? 'Super Admin' : `${admin.permissions.length} section${admin.permissions.length === 1 ? '' : 's'}`}
          </span>
          {!isSuper && (
            <>
              <button
                onClick={() => setOpen((o) => !o)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Edit"
              >
                {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {currentUid !== admin.id && (
                <button
                  onClick={remove}
                  disabled={busy}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {open && !isSuper && (
        <div className="border-t border-slate-800 p-4 space-y-4 bg-slate-950/40">
          {err && (
            <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {err}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Reset password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Section permissions</label>
            <PermissionGrid selected={perms} onToggle={togglePerm} idPrefix={`edit-${admin.id}`} />
          </div>
          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubAdminsManagement() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // create form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [perms, setPerms] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [currentUid, setCurrentUid] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdmins();
      setAdmins(res.admins);
    } catch (e: any) {
      setError(e.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    try {
      const raw = localStorage.getItem('mk-admin-token');
      if (raw) {
        const payload = JSON.parse(atob(raw.split('.')[1]));
        setCurrentUid(payload.uid);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const togglePerm = (key: string) =>
    setPerms((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      await createAdmin({ email, name, password, permissions: perms });
      setEmail('');
      setName('');
      setPassword('');
      setPerms([]);
      setNotice('Sub-admin created successfully.');
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to create sub-admin');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-orange-400" /> Sub-Admins
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create additional admins and grant them access to specific sections only.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {notice && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notice}
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-orange-400" /> Add new sub-admin
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Section permissions</label>
          <PermissionGrid selected={perms} onToggle={togglePerm} idPrefix="new" />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create sub-admin
          </button>
        </div>
      </form>

      {/* Existing admins */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">Existing admins</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading admins...
          </div>
        ) : admins.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No admins found.</p>
        ) : (
          admins.map((a) => (
            <AdminRow key={a.id} admin={a} onChanged={load} currentUid={currentUid} />
          ))
        )}
      </div>
    </div>
  );
}
