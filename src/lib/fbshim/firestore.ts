// Drop-in replacement for the subset of `firebase/firestore` this app uses.
// Translates Firestore SDK calls into REST requests against the Express +
// MongoDB backend (server/). Real-time `onSnapshot` listeners are emulated
// with lightweight polling.
import { apiGet, apiPost, apiPut, apiDelete } from "./client"

export interface Firestore {
	__type: "firestore"
}

export function getFirestore(_app?: unknown): Firestore {
	return { __type: "firestore" }
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

export interface CollectionReference {
	__type: "collection"
	path: string
}

export interface DocumentReference {
	__type: "doc"
	path: string
	id: string
}

function uuid(): string {
	try {
		if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
			return (crypto as { randomUUID: () => string }).randomUUID()
		}
	} catch {
		/* ignore */
	}
	return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function collection(
	_db: unknown,
	path: string,
	...rest: string[]
): CollectionReference {
	const full = [path, ...rest].join("/")
	return { __type: "collection", path: full }
}

// Supports doc(db, col, id) | doc(collectionRef) | doc(collectionRef, id)
export function doc(
	a: unknown,
	b?: string,
	c?: string,
): DocumentReference {
	if (a && (a as { __type?: string }).__type === "collection") {
		const ref = a as CollectionReference
		return { __type: "doc", path: ref.path, id: b || uuid() }
	}
	const col = String(b)
	return { __type: "doc", path: col, id: c || uuid() }
}

// ---------------------------------------------------------------------------
// Field value sentinels (resolved server-side by utils/merge.js)
// ---------------------------------------------------------------------------

export function increment(n: number) {
	return { __sentinel: "increment", value: n }
}
export function arrayUnion(...elements: unknown[]) {
	return { __sentinel: "arrayUnion", elements }
}
export function arrayRemove(...elements: unknown[]) {
	return { __sentinel: "arrayRemove", elements }
}
export function serverTimestamp() {
	return { __sentinel: "serverTimestamp" }
}

// ---------------------------------------------------------------------------
// Snapshots
// ---------------------------------------------------------------------------

export interface DocumentSnapshot {
	id: string
	exists: () => boolean
	// Returns `any` to mirror Firestore's DocumentData (field values are `any`).
	data: () => any
}

function makeDocSnap(
	id: string,
	row: Record<string, unknown> | null,
): DocumentSnapshot {
	let data: Record<string, unknown> | undefined
	if (row) {
		const { id: _omit, ...rest } = row as Record<string, unknown>
		void _omit
		data = rest
	}
	return {
		id,
		exists: () => row != null,
		data: () => data,
	}
}

export interface QueryDocumentSnapshot {
	id: string
	exists: () => boolean
	// Returns `any` to mirror Firestore's DocumentData (field values are `any`).
	data: () => any
}

export interface QuerySnapshot {
	docs: QueryDocumentSnapshot[]
	size: number
	empty: boolean
	forEach: (cb: (d: QueryDocumentSnapshot) => void) => void
}

function makeQuerySnap(rows: Array<Record<string, unknown>>): QuerySnapshot {
	const docs = rows.map((r) => {
		const { id, ...rest } = r as Record<string, unknown>
		return {
			id: String(id),
			exists: () => true,
			data: () => rest,
		}
	})
	return {
		docs,
		size: docs.length,
		empty: docs.length === 0,
		forEach: (cb) => docs.forEach(cb),
	}
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

type WhereConstraint = {
	kind: "where"
	field: string
	op: string
	value: unknown
}
type OrderByConstraint = { kind: "orderBy"; field: string; dir: "asc" | "desc" }
export type QueryConstraint = WhereConstraint | OrderByConstraint

export interface Query {
	__type: "query"
	path: string
	constraints: QueryConstraint[]
}

export function where(field: string, op: string, value: unknown): QueryConstraint {
	return { kind: "where", field, op, value }
}

export function orderBy(
	field: string,
	dir: "asc" | "desc" = "asc",
): QueryConstraint {
	return { kind: "orderBy", field, dir }
}

export function query(
	ref: CollectionReference | Query,
	...constraints: QueryConstraint[]
): Query {
	const isQuery = (ref as { __type: string }).__type === "query"
	const path = isQuery ? (ref as Query).path : (ref as CollectionReference).path
	const base = isQuery ? (ref as Query).constraints : []
	return { __type: "query", path, constraints: [...base, ...constraints] }
}

function compare(a: unknown, op: string, b: unknown): boolean {
	const x = a as never
	const y = b as never
	switch (op) {
		case "==":
			return a === b
		case "!=":
			return a !== b
		case ">":
			return x > y
		case ">=":
			return x >= y
		case "<":
			return x < y
		case "<=":
			return x <= y
		case "in":
			return Array.isArray(b) && (b as unknown[]).includes(a)
		case "array-contains":
			return Array.isArray(a) && (a as unknown[]).includes(b)
		default:
			return false
	}
}

function applyConstraints(
	rows: Array<Record<string, unknown>>,
	constraints: QueryConstraint[],
): Array<Record<string, unknown>> {
	let out = rows.slice()
	for (const c of constraints) {
		if (c.kind === "where") {
			out = out.filter((row) => compare(row[c.field], c.op, c.value))
		}
	}
	const ob = constraints.find((c) => c.kind === "orderBy") as
		| OrderByConstraint
		| undefined
	if (ob) {
		out.sort((a, b) => {
			const av = a[ob.field] as never
			const bv = b[ob.field] as never
			if (av === bv) return 0
			if (av == null) return 1
			if (bv == null) return -1
			const r = av < bv ? -1 : 1
			return ob.dir === "desc" ? -r : r
		})
	}
	return out
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getDoc(ref: DocumentReference): Promise<DocumentSnapshot> {
	const res = await apiGet(
		`/db/${encodeURIComponent(ref.path)}/${encodeURIComponent(ref.id)}`,
	)
	const row = res && res.doc ? (res.doc as Record<string, unknown>) : null
	return makeDocSnap(ref.id, row)
}

// Lightweight cache so repeat visits render instantly while data revalidates
// in the background. Keyed by collection path; persisted for the tab session.
const memCache = new Map<string, Array<Record<string, unknown>>>()

function readListCache(
	path: string,
): Array<Record<string, unknown>> | undefined {
	if (memCache.has(path)) return memCache.get(path)
	try {
		const raw = sessionStorage.getItem(`mk-fscache:${path}`)
		if (raw) {
			const rows = JSON.parse(raw) as Array<Record<string, unknown>>
			memCache.set(path, rows)
			return rows
		}
	} catch {
		/* ignore */
	}
	return undefined
}

function writeListCache(
	path: string,
	rows: Array<Record<string, unknown>>,
): void {
	memCache.set(path, rows)
	try {
		sessionStorage.setItem(`mk-fscache:${path}`, JSON.stringify(rows))
	} catch {
		/* ignore */
	}
}

export async function getDocs(
	ref: CollectionReference | Query,
): Promise<QuerySnapshot> {
	const isQuery = (ref as { __type: string }).__type === "query"
	const path = isQuery ? (ref as Query).path : (ref as CollectionReference).path
	const constraints = isQuery ? (ref as Query).constraints : []
	const res = await apiGet(`/db/${encodeURIComponent(path)}`)
	const rows = (res && res.docs ? res.docs : []) as Array<
		Record<string, unknown>
	>
	writeListCache(path, rows)
	return makeQuerySnap(applyConstraints(rows, constraints))
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function setDoc(
	ref: DocumentReference,
	data: unknown,
	options?: { merge?: boolean },
): Promise<void> {
	if (options && options.merge) {
		await apiPut(
			`/db/${encodeURIComponent(ref.path)}/${encodeURIComponent(ref.id)}?merge=true`,
			{ data },
		)
	} else {
		// Upsert by id. Works for anonymous-writable collections (users,
		// contactMessages) and for admins on everything else.
		await apiPost(`/db/${encodeURIComponent(ref.path)}`, { id: ref.id, data })
	}
}

export async function updateDoc(
	ref: DocumentReference,
	data: unknown,
): Promise<void> {
	await apiPut(
		`/db/${encodeURIComponent(ref.path)}/${encodeURIComponent(ref.id)}?merge=true`,
		{ data },
	)
}

export async function addDoc(
	ref: CollectionReference,
	data: unknown,
): Promise<DocumentReference> {
	const res = await apiPost(`/db/${encodeURIComponent(ref.path)}`, { data })
	const id = res && res.id ? String(res.id) : uuid()
	return { __type: "doc", path: ref.path, id }
}

export async function deleteDoc(ref: DocumentReference): Promise<void> {
	await apiDelete(
		`/db/${encodeURIComponent(ref.path)}/${encodeURIComponent(ref.id)}`,
	)
}

// ---------------------------------------------------------------------------
// Realtime (emulated via polling)
// ---------------------------------------------------------------------------

const POLL_MS = 12000

export function onSnapshot(
	ref: DocumentReference,
	next: (snap: DocumentSnapshot) => void,
	error?: (err: unknown) => void,
): () => void
export function onSnapshot(
	ref: CollectionReference | Query,
	next: (snap: QuerySnapshot) => void,
	error?: (err: unknown) => void,
): () => void
export function onSnapshot(
	ref: DocumentReference | CollectionReference | Query,
	next: (snap: any) => void,
	error?: (err: unknown) => void,
): () => void {
	let stopped = false
	const isDoc = (ref as { __type: string }).__type === "doc"

	const tick = async () => {
		try {
			if (isDoc) {
				const snap = await getDoc(ref as DocumentReference)
				if (!stopped) next(snap)
			} else {
				const snap = await getDocs(ref as CollectionReference | Query)
				if (!stopped) next(snap)
			}
		} catch (e) {
			if (!stopped && error) error(e)
		}
	}

	// Paint cached data immediately so the UI doesn't wait on the network;
	// the first tick() then refreshes with live data.
	if (!isDoc) {
		const q = ref as CollectionReference | Query
		const path = q.path
		const constraints =
			(q as { __type: string }).__type === "query"
				? (q as Query).constraints
				: []
		const cached = readListCache(path)
		if (cached) {
			try {
				next(makeQuerySnap(applyConstraints(cached, constraints)))
			} catch {
				/* ignore */
			}
		}
	}

	void tick()
	const timer = setInterval(tick, POLL_MS)
	return () => {
		stopped = true
		clearInterval(timer)
	}
}

// ---------------------------------------------------------------------------
// Batched writes
// ---------------------------------------------------------------------------

type BatchOp =
	| { type: "set"; ref: DocumentReference; data: unknown; merge?: boolean }
	| { type: "update"; ref: DocumentReference; data: unknown }
	| { type: "delete"; ref: DocumentReference }

export interface WriteBatch {
	set: (
		ref: DocumentReference,
		data: unknown,
		options?: { merge?: boolean },
	) => WriteBatch
	update: (ref: DocumentReference, data: unknown) => WriteBatch
	delete: (ref: DocumentReference) => WriteBatch
	commit: () => Promise<void>
}

export function writeBatch(_db?: unknown): WriteBatch {
	const ops: BatchOp[] = []
	const batch: WriteBatch = {
		set(ref, data, options) {
			ops.push({ type: "set", ref, data, merge: options?.merge })
			return batch
		},
		update(ref, data) {
			ops.push({ type: "update", ref, data })
			return batch
		},
		delete(ref) {
			ops.push({ type: "delete", ref })
			return batch
		},
		async commit() {
			for (const op of ops) {
				if (op.type === "set") {
					await setDoc(op.ref, op.data, op.merge ? { merge: true } : undefined)
				} else if (op.type === "update") {
					await updateDoc(op.ref, op.data)
				} else {
					await deleteDoc(op.ref)
				}
			}
		},
	}
	return batch
}

export default { getFirestore }
