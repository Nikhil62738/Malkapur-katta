// Deep-merge incoming data into an existing document, resolving Firestore-style
// field sentinels (increment / arrayUnion / arrayRemove / serverTimestamp)
// produced by the frontend adapter.

function deepEqual(a, b) {
	return JSON.stringify(a) === JSON.stringify(b)
}

function resolveSentinel(current, sentinel) {
	switch (sentinel.__sentinel) {
		case "increment":
			return (typeof current === "number" ? current : 0) + (sentinel.value || 0)
		case "arrayUnion": {
			const base = Array.isArray(current) ? current.slice() : []
			for (const el of sentinel.elements || []) {
				if (!base.some((x) => deepEqual(x, el))) base.push(el)
			}
			return base
		}
		case "arrayRemove": {
			const base = Array.isArray(current) ? current.slice() : []
			return base.filter(
				(x) => !(sentinel.elements || []).some((el) => deepEqual(x, el)),
			)
		}
		case "serverTimestamp":
			return new Date().toISOString()
		default:
			return current
	}
}

function isPlainObject(v) {
	return v && typeof v === "object" && !Array.isArray(v)
}

export function deepMerge(current, incoming) {
	if (incoming === null) return null
	if (Array.isArray(incoming)) return incoming
	if (!isPlainObject(incoming)) return incoming
	if (incoming.__sentinel) return resolveSentinel(current, incoming)

	const out = isPlainObject(current) ? { ...current } : {}
	for (const key of Object.keys(incoming)) {
		const iv = incoming[key]
		if (isPlainObject(iv) && iv.__sentinel) {
			out[key] = resolveSentinel(out[key], iv)
		} else if (isPlainObject(iv)) {
			out[key] = deepMerge(out[key], iv)
		} else {
			out[key] = iv
		}
	}
	return out
}
