// backend/index.ts
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { initWatcher } from "./watcher"; // ton watcher.ts

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // autorise tout le monde (tu peux restreindre après à 5173)
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Route GET simple
app.get("/", (_req, res) => {
  res.send("✅ Serveur opérationnel");
});

// Route POST pour lancer la surveillance
app.post("/start-watcher", (req, res) => {
  const { path } = req.body;

  if (!path) {
    res.status(400).json({ error: "Le chemin est requis." });
    return;
  }

  try {
    initWatcher(io, path);
    console.log("🟢 Surveillance démarrée sur :", path);
    res.status(200).json({ message: "Surveillance démarrée." });
  } catch (error) {
    console.error("❌ Erreur dans initWatcher:", error);
    res.status(500).json({ error: "Erreur lors de l'initialisation." });
  }
});

// Connexion socket.io
io.on("connection", socket => {
  console.log("🔌 Client WebSocket connecté !");
});

server.listen(3001, () => {
  console.log("🚀 Serveur backend démarré sur http://localhost:3001");
});
