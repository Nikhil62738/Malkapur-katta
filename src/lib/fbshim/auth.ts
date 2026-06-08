// Drop-in replacement for `firebase/auth`.
// Backed by the Express JWT auth endpoints. Anonymous users are minted locally
// (no server token) to mirror Firebase anonymous auth used by the public site.
import { apiGet, apiPost, getToken, setToken } from "./client"

export interface User {
	uid: string
	email: string | null
	isAnonymous: boolean
	displayName?: string | null
	name?: string | null
	role?: string
	permissions?: string[]
}

type Listener = (user: User | null) => void

interface AuthState {
	currentUser: User | null
	listeners: Set<Listener>
	initialized: boolean
}

export interface Auth {
	__state: AuthState
	get currentUser(): User | null
}

const ANON_KEY = "mk-anon-uid"

function makeAnonUser(): User {
	let uid = ""
	try {
		uid = localStorage.getItem(ANON_KEY) || ""
	} catch {
		/* ignore */
	}
	if (!uid) {
		uid = "anon_" + Math.random().toString(36).slice(2, 12)
		try {
			localStorage.setItem(ANON_KEY, uid)
		} catch {
			/* ignore */
		}
	}
	return { uid, email: null, isAnonymous: true }
}

function emit(state: AuthState) {
	state.listeners.forEach((cb) => {
		try {
			cb(state.currentUser)
		} catch {
			/* ignore listener errors */
		}
	})
}

let singleton: Auth | null = null

export function getAuth(_app?: unknown): Auth {
	if (singleton) return singleton
	const state: AuthState = {
		currentUser: null,
		listeners: new Set(),
		initialized: false,
	}
	singleton = {
		__state: state,
		get currentUser() {
			return state.currentUser
		},
	}

	// Restore an existing admin session from a stored JWT.
	const token = getToken()
	if (token) {
		apiGet("/auth/me")
			.then((data: any) => {
				state.currentUser = {
					uid: data.uid,
					email: data.email,
					isAnonymous: false,
					name: data.name,
					role: data.role,
					permissions: Array.isArray(data.permissions) ? data.permissions : [],
				}
				state.initialized = true
				emit(state)
			})
			.catch(() => {
				setToken(null)
				state.currentUser = null
				state.initialized = true
				emit(state)
			})
	} else {
		state.initialized = true
	}

	return singleton
}

export function onAuthStateChanged(auth: Auth, cb: Listener): () => void {
	const state = auth.__state
	state.listeners.add(cb)
	// Emit current state asynchronously, mirroring Firebase behavior.
	Promise.resolve().then(() => {
		try {
			cb(state.currentUser)
		} catch {
			/* ignore */
		}
	})
	return () => {
		state.listeners.delete(cb)
	}
}

export async function signInWithEmailAndPassword(
	auth: Auth,
	email: string,
	password: string,
): Promise<{ user: User }> {
	const state = auth.__state
	try {
		const data = await apiPost("/auth/login", { email, password })
		setToken(data.token)
		state.currentUser = {
			uid: data.user.uid,
			email: data.user.email,
			isAnonymous: false,
			name: data.user.name,
			role: data.user.role,
			permissions: Array.isArray(data.user.permissions)
				? data.user.permissions
				: [],
		}
		emit(state)
		return { user: state.currentUser }
	} catch (e: any) {
		if (e && e.status === 401 && !e.code) e.code = "auth/wrong-password"
		throw e
	}
}

export async function signOut(auth: Auth): Promise<void> {
	const state = auth.__state
	setToken(null)
	state.currentUser = null
	emit(state)
}

export async function sendPasswordResetEmail(
	_auth: Auth,
	email: string,
): Promise<void> {
	await apiPost("/auth/forgot-password", { email })
}

export async function signInAnonymously(auth: Auth): Promise<{ user: User }> {
	const state = auth.__state
	state.currentUser = makeAnonUser()
	emit(state)
	return { user: state.currentUser }
}

export default { getAuth }
