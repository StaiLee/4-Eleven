import chokidar, { FSWatcher } from "chokidar";
import fs from "fs";
import { Server } from "socket.io";

type FileMeta = {
  permissions: string;
};

type LogEvent =
  | { type: "add" | "change" | "unlink"; path: string }
  | { type: "permission-change"; path: string; oldPerm: string; newPerm: string }
  | { type: "error"; path: string };

let watcher: FSWatcher | null = null;
const watchedFiles: Record<string, FileMeta> = {};

function getFileMeta(filePath: string): FileMeta {
  try {
    const stats = fs.statSync(filePath);
    return {
      permissions: (stats.mode & 0o777).toString(8),
    };
  } catch (err) {
    console.error("❌ Erreur lors de la lecture des permissions :", err);
    return { permissions: "000" };
  }
}

export function initWatcher(io: Server, watchPath: string): void {
  if (watcher) {
    watcher.close();
  }

  console.log("📂 Dossier surveillé :", watchPath);

  watcher = chokidar.watch(watchPath, {
    persistent: true,
    ignoreInitial: false,
    depth: 5,
    awaitWriteFinish: true,
  });

  watcher
    .on("add", (filePath: string) => {
      const meta = getFileMeta(filePath);
      watchedFiles[filePath] = meta;

      const log: LogEvent = { type: "add", path: filePath };
      io.emit("log", log);
    })

    .on("change", (filePath: string) => {
      const oldMeta = watchedFiles[filePath];
      const newMeta = getFileMeta(filePath);
      watchedFiles[filePath] = newMeta;

      if (oldMeta && oldMeta.permissions !== newMeta.permissions) {
        const log: LogEvent = {
          type: "permission-change",
          path: filePath,
          oldPerm: oldMeta.permissions,
          newPerm: newMeta.permissions,
        };
        io.emit("log", log);
      } else {
        const log: LogEvent = { type: "change", path: filePath };
        io.emit("log", log);
      }
    })

    .on("unlink", (filePath: string) => {
      delete watchedFiles[filePath];
      const log: LogEvent = { type: "unlink", path: filePath };
      io.emit("log", log);
    })

    .on("error", (err: unknown) => {
      const error = err as Error;
      const log: LogEvent = { type: "error", path: error.message };
      io.emit("log", log);
    });
}
