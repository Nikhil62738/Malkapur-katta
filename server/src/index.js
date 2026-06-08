import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import { connectDB } from "./config/db.js"
import { authOptional } from "./middleware/auth.js"
import authRoutes from "./routes/auth.js"
import dbRoutes from "./routes/db.js"
import uploadRoutes from "./routes/upload.js"

const app = express()

app.use(express.json({ limit: "10mb" }))

const origins = (process.env.CORS_ORIGIN || "*")
	.split(",")
	.map((s) => s.trim())
	.filter(Boolean)
app.use(
	cors({
		origin: origins.includes("*") ? true : origins,
		credentials: false,
	}),
)
app.use(morgan("dev"))
app.use(authOptional)

app.get("/", (_req, res) =>
	res.json({ name: "Malkapur Katta API", status: "ok" }),
)
app.get("/api/health", (_req, res) => res.json({ ok: true }))
app.use("/api/auth", authRoutes)
app.use("/api/db", dbRoutes)
app.use("/api/upload", uploadRoutes)

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error(err)
	res.status(err.status || 500).json({ error: err.message || "Server error" })
})

const PORT = process.env.PORT || 5000
const URI =
	process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/malkapur_katta"

connectDB(URI)
	.then(() => {
		app.listen(PORT, () =>
			console.log(`\uD83D\uDE80 API running on http://localhost:${PORT}`),
		)
	})
	.catch((e) => {
		console.error("MongoDB connection failed:", e)
		process.exit(1)
	})
