import chokidar from "chokidar";
import fs from "fs";
import { Server } from "socket.io";

type FileMeta = {
  permissions: string;
};

const watchedFiles: Record<string, FileMeta> = {};

// Lecture des métadonnées avec gestion d’erreur
function getFileMeta(filePath: string): FileMeta {
  try {
    const stats = fs.statSync(filePath);
    return {
      permissions: (stats.mode & 0o777).toString(8),
    };
  } catch (err) {
    console.error("❌ Erreur getFileMeta:", filePath, err);
    return { permissions: "000" };
  }
}

export function initWatcher(io: Server) {
  // ✅ SURVEILLANCE D'UN DOSSIER, PAS D'UN FICHIER
  const watchPath = "/home/waterjuice/Desktop";

  const watcher = chokidar.watch(watchPath, {
    persistent: true,
    ignoreInitial: false,
    depth: 5,
    awaitWriteFinish: true,
  });

  console.log("🔍 Surveillance en cours sur :", watchPath);

  watcher
    .on("add", (filePath) => {
      const meta = getFileMeta(filePath);
      watchedFiles[filePath] = meta;

      console.log("📄 Fichier ajouté :", filePath, "→ Permissions :", meta.permissions);

      io.emit("log", {
        type: "add",
        path: filePath,
        permissions: meta.permissions,
      });
    })

    .on("change", (filePath) => {
      const old = watchedFiles[filePath];
      const meta = getFileMeta(filePath);
      watchedFiles[filePath] = meta;

      if (old && old.permissions !== meta.permissions) {
        console.log("🛡️ Permissions changées :", filePath, old.permissions, "→", meta.permissions);
        io.emit("log", {
          type: "permission-change",
          path: filePath,
          oldPerm: old.permissions,
          newPerm: meta.permissions,
        });
      } else {
        console.log("✏️ Fichier modifié :", filePath);
        io.emit("log", {
          type: "change",
          path: filePath,
        });
      }
    })

    .on("unlink", (filePath) => {
      delete watchedFiles[filePath];
      console.log("🗑️ Fichier supprimé :", filePath);
      io.emit("log", {
        type: "unlink",
        path: filePath,
      });
    })

    .on("error", (error) => {
      console.error("🚨 Erreur de Chokidar :", error);
    });
}
