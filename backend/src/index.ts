import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import { sendError } from "./utils/apiResponse";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Fallback Route
app.use((req, res) => {
  sendError(res, "Endpoint not found", 404);
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  sendError(res, "Internal server error occurred", 500, err.message || err);
});

app.listen(PORT, () => {
  console.log(`TransitOps backend listening on port ${PORT}`);
});
