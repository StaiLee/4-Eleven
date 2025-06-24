// src/components/LogViewer.tsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Log = {
  type: string;
  path: string;
  oldPerm?: string;
  newPerm?: string;
};

const socket = io("http://localhost:3001");

export default function LogViewer() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connecté au backend Socket.IO !");
    });

    socket.on("log", (log: Log) => {
      console.log("📦 Nouveau log reçu :", log);
      setLogs((prev) => [log, ...prev]);
    });

    return () => {
      socket.off("log");
    };
  }, []);

  const getColorClass = (type: string) => {
    switch (type) {
      case "add":
        return "log-add";
      case "change":
        return "log-change";
      case "unlink":
        return "log-unlink";
      case "permission-change":
        return "log-perm";
      default:
        return "log-default";
    }
  };

  return (
    <div className="container">
      <h1 className="title">📜 Journaux de surveillance</h1>
      <ul className="log-list">
        {logs.map((log, idx) => (
          <li key={idx} className={`log-item ${getColorClass(log.type)}`}>
            <strong>{log.type.toUpperCase()}</strong> — <code>{log.path}</code>
            {log.type === "permission-change" && (
              <p className="log-details">
                Permissions : {log.oldPerm} ➜ {log.newPerm}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
