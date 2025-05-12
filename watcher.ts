import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";

type FileMeta = {
  permissions: string;
};

const watchedFiles: Record<string, FileMeta> = {};

function getFileMeta(filePath: string): FileMeta {
  const stats = fs.statSync(filePath);
  return {
    permissions: (stats.mode & 0o777).toString(8), 
  };
}

export function initWatcher(io: Server) {
  const watchPath = "/home/ton_user/test"; 

  const watcher = chokidar.watch(watchPath, {
    persistent: true,
    ignoreInitial: false,
    depth: 5,
    awaitWriteFinish: true
  });

  watcher
    .on("add", filePath => {
      const meta = getFileMeta(filePath);
      watchedFiles[filePath] = meta;
      io.emit("log", { type: "add", path: filePath, permissions: meta.permissions });
    })
    .on("change", filePath => {
      const old = watchedFiles[filePath];
      const meta = getFileMeta(filePath);
      watchedFiles[filePath] = meta;

      if (old && old.permissions !== meta.permissions) {
        io.emit("log", {
          type: "permission-change",
          path: filePath,
          oldPerm: old.permissions,
          newPerm: meta.permissions
        });
      } else {
        io.emit("log", { type: "change", path: filePath });
      }
    })
    .on("unlink", filePath => {
      delete watchedFiles[filePath];
      io.emit("log", { type: "unlink", path: filePath });
    });

  console.log("🔍 Surveillance en cours sur :", watchPath);
}
