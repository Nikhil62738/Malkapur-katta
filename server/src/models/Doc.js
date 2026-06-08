import mongoose from "mongoose"

// Generic, schema-less model factory. Each Firestore-style collection maps to a
// MongoDB collection with string `_id` values (so fixed ids like `home`,
// `general`, `main`, and client-generated ids all work). `strict: false` lets
// us store arbitrary document shapes, mirroring Firestore.
const cache = new Map()

export function getModel(name) {
	if (cache.has(name)) return cache.get(name)
	if (mongoose.models[name]) {
		cache.set(name, mongoose.models[name])
		return mongoose.models[name]
	}
	const schema = new mongoose.Schema(
		{ _id: { type: String } },
		{
			strict: false,
			minimize: false,
			versionKey: false,
			timestamps: true,
			collection: name,
		},
	)
	const model = mongoose.model(name, schema)
	cache.set(name, model)
	return model
}
