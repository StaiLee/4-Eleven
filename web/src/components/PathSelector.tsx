// src/components/PathSelector.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PathSelector() {
  const [path, setPath] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/start-watcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: path.trim() }),
      });

      if (res.ok) {
        navigate(`/logs?path=${encodeURIComponent(path.trim())}`);
      } else {
        alert("Erreur lors du lancement de la surveillance");
      }
    } catch (err) {
      alert("Erreur réseau ou backend injoignable");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1 className="title">🗂️ Choisir un dossier à surveiller</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/chemin/absolu/vers/dossier"
          required
          className="input"
        />
        <button type="submit" className="button">
          🚀 Démarrer la surveillance
        </button>
      </form>
    </div>
  );
}
