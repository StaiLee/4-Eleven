// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PathSelector from "./components/PathSelector";
import LogViewer from "./components/LogViewer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PathSelector />} />
        <Route path="/logs" element={<LogViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
