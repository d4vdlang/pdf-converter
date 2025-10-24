import React, { useState } from "react";
import {
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileAlt,
} from "react-icons/fa";
import "./App.css";

const API_URL = "https://pdf-converter-va03.onrender.com/convert";


function App() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [working, setWorking] = useState(false);
  const [history, setHistory] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Handle file input or drop
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const getIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <FaFilePdf color="#E74C3C" size={26} />;
      case "doc":
      case "docx":
        return <FaFileWord color="#3498DB" size={26} />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FaFileImage color="#9B59B6" size={26} />;
      case "ppt":
      case "pptx":
        return <FaFilePowerpoint color="#E67E22" size={26} />;
      case "xls":
      case "xlsx":
        return <FaFileExcel color="#27AE60" size={26} />;
      default:
        return <FaFileAlt color="#555" size={26} />;
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      alert("Please upload at least one file.");
      return;
    }

    setWorking(true);
    setProgress(10);
    const newHistory = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.append("file", file);
      form.append("target", "pdf");

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        if (!res.ok) throw new Error("Conversion failed");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        newHistory.push({ name: file.name, url });

        setProgress(20 + ((i + 1) / files.length) * 70);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    setProgress(100);
    setWorking(false);
    setHistory((prev) => [...newHistory, ...prev]);
  };

  return (
    <div className="app-container">
      <div className="converter-card">
        <h1 className="title">PDF Converter</h1>
        <p className="subtitle">
          Convert Word, Excel, PowerPoint, or Images into PDF instantly.
        </p>
        <p className="note">
          Supported: DOC, DOCX, TXT, RTF, ODT, PDF, PNG, JPG, JPEG, PPT, XLSX
        </p>

        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            id="fileInput"
            className="file-input"
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="upload-label">
            <span className="upload-text">
              {dragActive
                ? "Drop your files here!"
                : "Drag & Drop files here or "}
              {!dragActive && <span className="browse">browse</span>}
            </span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="file-preview">
            {files.map((f, i) => (
              <div key={i} className="file-item">
                {getIcon(f.name)}
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        )}

        <button className="convert-btn" disabled={working} onClick={handleConvert}>
          {working ? "Converting…" : "Convert to PDF"}
        </button>

        {working && (
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {history.length > 0 && (
          <div className="history">
            <h3>Converted Files</h3>
            {history.map((h, i) => (
              <div key={i} className="history-item">
                <FaFilePdf color="#E74C3C" /> {h.name} →{" "}
                <a href={h.url} download>
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
