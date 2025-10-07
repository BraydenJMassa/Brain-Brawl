import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import https from "https";
import path from "path";
import dotenv from "dotenv";
import { sql } from "./database/dbConfig";
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Basic routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Brain Brawl");
});

app.get("/users", async (req, res) => {
  try {
    const [result] = await sql`SELECT * FROM users`;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Set up SSL certificate
const privateKey = fs.readFileSync(
  path.resolve(__dirname, "../server.key"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.resolve(__dirname, "../server.cert"),
  "utf8"
);
const credentials = {
  key: privateKey,
  cert: certificate,
};

// Initialize server
const httpsServer = https.createServer(credentials, app);

// Start server
const PORT = process.env.EXPRESS_PORT || 4001;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
