import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import path from "path"
import adminEventRoutes from "./routes/adminRoutes/eventRoutes.js"
import adminInstitutionEngagementRoutes from "./routes/adminRoutes/institutionEngagementRoutes.js"
import adminInstitutionRoutes from "./routes/adminRoutes/institutionRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import emailRoutes from "./routes/emailRoutes.js"
import institutionEngagement from "./routes/institutionEngagementRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"
import institutionRoutes from "./routes/institutionRoutes.js"
import connectDB from "./config/db.js"

dotenv.config()

// connect to Mongo DB
connectDB()

const PORT = process.env.PORT || 8000
const app = express()

app.use(cors({origin: "*",}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());


// Admin Routes
app.use("/admin/event", adminEventRoutes)
app.use("/admin/institution-engagements", adminInstitutionEngagementRoutes)
app.use("/admin/institutions", adminInstitutionRoutes)

// User Routes
app.use("/api/users", userRoutes)
app.use("/api/email", emailRoutes)
app.use("/api/event", eventRoutes)
app.use("/api/institutions", institutionRoutes)
app.use("/api/institution-engagements", institutionEngagement)

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Serve uploaded files
const __dirname = path.resolve()
app.use("/uploads", express.static(path.join(__dirname, "/uploads")))

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log("App listening on port " + PORT)
})
