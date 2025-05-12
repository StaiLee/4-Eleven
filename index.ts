// backend/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { initWatcher } from "./watcher";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" } 
});

initWatcher(io);

app.get("/", (_req, res) => {
  res.send("File monitoring backend is running.");
});

server.listen(3001, () => {
  console.log("✅ Serveur backend lancé sur http://localhost:3001");
});
