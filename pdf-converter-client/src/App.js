// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileAlt,
  FaDropbox,
  FaGoogleDrive,
  FaLink,
} from "react-icons/fa";
import "./App.css";

/**
 * IMPORTANT:
 * - Your index.html must still include the Google & Dropbox scripts:
 *   <script src="https://accounts.google.com/gsi/client" async defer></script>
 *   <script src="https://apis.google.com/js/api.js"></script>
 *   <script src="https://apis.google.com/js/picker.js"></script>
 *   <script id="dropboxjs" src="https://www.dropbox.com/static/api/2/dropins.js" data-app-key="YOUR_DROPBOX_KEY"></script>
 *
 * - Backend API:
 *   Make sure API_URL points to your server that returns the converted file as binary (application/pdf).
 */
const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:5000/convert";


/* -------------------- Google Ad Component (safe) -------------------- */
function GoogleAd() {
  // useLocation so ad reloads on route change
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      if (window && window.adsbygoogle) {
        // load ad (no-op if script not present)
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // do not crash the app for ad errors
      console.warn("AdSense load ignored:", err);
    }
  }, [pathname]);

  return (
    <div style={{ textAlign: "center", margin: "18px 0" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8117507566921502" /* update with your id */
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

/* -------------------- Home -------------------- */
function Home() {
  return (
    <motion.div className="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <div className="home-hero">
        <h1>Welcome to PDF Converter</h1>
        <p>Convert, merge, and transform files instantly — right from your browser.</p>
        <Link to="/convert">
          <button className="primary-btn">Start Converting</button>
        </Link>
      </div>

      <GoogleAd />

      <div className="home-features">
        <motion.div whileHover={{ scale: 1.04 }} className="feature-card">
          <FaFilePdf size={40} color="#e74c3c" />
          <h3>Convert to PDF</h3>
          <p>Transform Word, PowerPoint, and Excel files to PDF quickly.</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} className="feature-card">
          <FaGoogleDrive size={40} color="#34a853" />
          <h3>Cloud Uploads</h3>
          <p>Upload from Google Drive, Dropbox, or paste a file URL.</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} className="feature-card">
          <FaFileImage size={40} color="#9b59b6" />
          <h3>Image Conversion</h3>
          <p>Convert images to PDF or extract pages as images.</p>
        </motion.div>
      </div>

      <GoogleAd />
    </motion.div>
  );
}

/* -------------------- Converter Component -------------------- */
function Converter() {
  const [files, setFiles] = useState([]); // File objects
  const [progress, setProgress] = useState(0); // overall UI progress indicator (0-100)
  const [working, setWorking] = useState(false);
  const [history, setHistory] = useState([]); // {name, url}
  const [dragActive, setDragActive] = useState(false);
  const [targetFormat, setTargetFormat] = useState("pdf");
  const [fileUrl, setFileUrl] = useState("");

  // file input change
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) setFiles((prev) => [...prev, ...selected]);
  };

  // drag & drop events
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);
  const handleDragEnter = () => setDragActive(true);

  // Icon helper
  const getIcon = (filename) => {
    const ext = (filename || "").split(".").pop().toLowerCase();
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

  // ---------- CORE: handleConvert (fixed) ----------
  const handleConvert = async () => {
    if (!files.length) {
      alert("Please upload at least one file.");
      return;
    }

    setWorking(true);
    setProgress(5);
    const newHistory = [];

    // convert files one by one (simple sequential approach)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.append("file", file);
      form.append("target", targetFormat);

      try {
        // send to backend
        const res = await fetch(API_URL, {
          method: "POST",
          body: form,
        });

        // if backend returns an error as JSON (e.g., { error: "..." })
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          // parse and show error
          const json = await res.json().catch(() => ({}));
          const errMsg = json.error || json.message || "Conversion failed (server).";
          console.warn("Server JSON error for file", file.name, json);
          alert(`Failed converting ${file.name}: ${errMsg}`);
          // continue to next file rather than aborting all
          setProgress(Math.min(100, 5 + Math.round(((i + 1) / files.length) * 90)));
          continue;
        }

        if (!res.ok) {
          alert(`Failed converting ${file.name} (status ${res.status}).`);
          setProgress(Math.min(100, 5 + Math.round(((i + 1) / files.length) * 90)));
          continue;
        }

        // Otherwise, treat as binary (the converted file)
        const arrayBuffer = await res.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: res.headers.get("content-type") || "application/octet-stream" });

        // create a downloadable URL
        const downloadUrl = URL.createObjectURL(blob);
        const downloadName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);

        // trigger download in browser
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        // add to history and schedule object URL revoke after 1 minute
        newHistory.push({ name: downloadName, url: downloadUrl });
        setTimeout(() => {
          try {
            URL.revokeObjectURL(downloadUrl);
          } catch (e) {
            /* ignore */
          }
        }, 60 * 1000);

        // update progress
        setProgress(Math.min(100, 5 + Math.round(((i + 1) / files.length) * 90)));
      } catch (err) {
        console.error("Client conversion error for file", file.name, err);
        alert("Conversion failed for " + file.name);
        // continue to next file
        setProgress(Math.min(100, 5 + Math.round(((i + 1) / files.length) * 90)));
      }
    }

    // done
    setHistory((prev) => [...newHistory, ...prev]);
    setProgress(100);
    setWorking(false);

    // small delay then reset progress bar for UX
    setTimeout(() => setProgress(0), 700);
  };

  // ---------- URL upload ----------
  const handleUrlUpload = async () => {
    if (!fileUrl.trim()) {
      alert("Enter a valid file URL");
      return;
    }
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) {
        alert("Failed to fetch URL");
        return;
      }
      const blob = await res.blob();
      const filename = (fileUrl.split("/").pop() || "file").split("?")[0];
      setFiles((prev) => [...prev, new File([blob], filename)]);
      setFileUrl("");
    } catch (err) {
      console.error("URL upload error:", err);
      alert("Failed to fetch file from URL");
    }
  };

  // ---------- Dropbox chooser ----------
  const handleDropbox = () => {
    if (!window.Dropbox) {
      alert("Dropbox SDK not loaded. Make sure the dropbox script is in index.html and data-app-key is correct.");
      return;
    }

    try {
      window.Dropbox.choose({
        success: async (filesReturned) => {
          // filesReturned is an array of metadata; we fetch the direct link then convert into File
          for (const f of filesReturned) {
            try {
              const res = await fetch(f.link);
              const blob = await res.blob();
              const newFile = new File([blob], f.name);
              setFiles((prev) => [...prev, newFile]);
            } catch (err) {
              console.warn("Failed to fetch dropbox file:", f, err);
            }
          }
        },
        linkType: "direct",
        multiselect: true,
        extensions: ["pdf", "docx", "png", "jpg", "pptx", "xlsx"],
      });
    } catch (err) {
      console.error("Dropbox chooser error:", err);
      alert("Dropbox chooser failed");
    }
  };

  // ---------- Google Drive picker (guarded) ----------
  // NOTE: Google Picker is tricky — scripts must be loaded in index.html and
  // OAuth/credentials configured in Google Cloud Console. This function attempts
  // to use the picker but will show clear alerts if prerequisites are missing.
  const handleGoogleDrive = async () => {
    try {
      if (!window.gapi || !window.google || !window.google.picker) {
        alert("Google APIs (gapi/picker) not loaded yet. Make sure index.html includes the required Google scripts and try again.");
        return;
      }

      // IMPORTANT: You must set your client ID & API key as environment or constants
      const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || ""; // set in your .env
      const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || ""; // set in your .env
      if (!API_KEY || !CLIENT_ID) {
        alert("Google API credentials not configured (REACT_APP_GOOGLE_API_KEY / REACT_APP_GOOGLE_CLIENT_ID).");
        return;
      }

      // Initialize clientless picker flow:
      // Use Google Identity Services to get an access token, then open picker.
      // (This flow requires the scripts in index.html: gsi/client + apis + picker)
      const scope = "https://www.googleapis.com/auth/drive.readonly";

      // init token client from new Google Identity Services
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope,
        callback: (tokenResp) => {
          if (!tokenResp || !tokenResp.access_token) {
            alert("Failed to get Google Drive access token.");
            return;
          }

          // build picker
          const view = new window.google.picker.DocsView().setIncludeFolders(true).setSelectFolderEnabled(false);
          const picker = new window.google.picker.PickerBuilder()
            .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
            .addView(view)
            .setOAuthToken(tokenResp.access_token)
            .setDeveloperKey(API_KEY)
            .setCallback(async (data) => {
              if (data.action === window.google.picker.Action.PICKED) {
                // one or multiple docs selected
                for (const doc of data.docs) {
                  try {
                    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, {
                      headers: { Authorization: `Bearer ${tokenResp.access_token}` },
                    });
                    const fileBlob = await fileRes.blob();
                    const newFile = new File([fileBlob], doc.name);
                    setFiles((prev) => [...prev, newFile]);
                  } catch (err) {
                    console.error("Error fetching Drive file:", err);
                    alert("Failed to fetch file from Drive.");
                  }
                }
              }
            })
            .build();
          picker.setVisible(true);
        },
      });

      // Request token -> opens consent dialog
      tokenClient.requestAccessToken();
    } catch (err) {
      console.error("Google Drive picker error:", err);
      alert("Google Drive picker failed. Check console for details.");
    }
  };

  return (
    <motion.div
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="converter-card">
        <h1 className="title">PDF Converter</h1>
        <p className="subtitle">Convert between PDF, Word, Excel, PowerPoint, and Images easily.</p>
        <p className="note">Supported: DOC, DOCX, TXT, RTF, ODT, PDF, PNG, JPG, JPEG, PPT, XLSX</p>

        {/* Format selector */}
        <div className="format-selector">
          <label htmlFor="format">Convert to:</label>
          <select id="format" value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}>
            <option value="pdf">PDF (.pdf)</option>
            <option value="docx">Word (.docx)</option>
            <option value="odt">OpenDocument (.odt)</option>
            <option value="txt">Text (.txt)</option>
            <option value="pptx">PowerPoint (.pptx)</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="png">Image (.png)</option>
            <option value="jpg">Image (.jpg)</option>
          </select>
        </div>

        {/* Upload box */}
        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input type="file" multiple id="fileInput" className="file-input" onChange={handleFileChange} />
          <label htmlFor="fileInput" className="upload-label">
            {dragActive ? "Drop your files here!" : "Drag & Drop files here or "}
            {!dragActive && <span className="browse">browse</span>}
          </label>
        </div>

        {/* External upload options */}
        <div className="external-options">
          <button className="drive-btn" onClick={handleGoogleDrive}>
            <FaGoogleDrive /> Google Drive
          </button>
          <button className="dropbox-btn" onClick={handleDropbox}>
            <FaDropbox /> Dropbox
          </button>

          <div className="url-upload">
            <input
              type="text"
              placeholder="Paste file URL here..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <button onClick={handleUrlUpload}>
              <FaLink /> Upload
            </button>
          </div>
        </div>

        {/* File preview */}
        {files.length > 0 && (
          <div className="file-preview">
            {files.map((f, i) => (
              <div key={i} className="file-item">
                {getIcon(f.name)} <span className="file-name">{f.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Convert button */}
        <button className="convert-btn" disabled={working} onClick={handleConvert}>
          {working ? "Converting…" : `Convert to ${targetFormat.toUpperCase()}`}
        </button>

        {/* Progress bar */}
        {working && (
          <div className="progress-bar-wrap" aria-hidden={!working}>
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="history">
            <h3>Converted Files</h3>
            {history.map((h, i) => (
              <div key={i} className="history-item">
                {getIcon(h.name)} {h.name} →{" "}
                <a href={h.url} onClick={(e) => e.preventDefault()} /* links are object URLs */>
                  Download (automatically started)
                </a>
              </div>
            ))}
          </div>
        )}

        <GoogleAd />
      </div>
    </motion.div>
  );
}

/* -------------------- Privacy, Terms, Contact -------------------- */
function Privacy() {
  return (
    <motion.div className="policy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Privacy Policy</h1>
      <p>
        Uploaded files are processed temporarily for conversion and deleted automatically after completion. We do not
        store, share, or view user files.
      </p>
      <p>Third-party integrations (Google Drive, Dropbox) are handled through their official APIs.</p>
      <GoogleAd />
    </motion.div>
  );
}

function Terms() {
  return (
    <motion.div className="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Terms of Service</h1>
      <p>By using PDF Converter you agree to use it only for lawful purposes. Conversions are best-effort; results may vary.</p>
      <p>We may update these terms to improve performance or comply with law.</p>
      <GoogleAd />
    </motion.div>
  );
}

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await fetch("https://formspree.io/f/your-form-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Something went wrong. Try again later.");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      alert("Error sending message.");
    }
    setSending(false);
  };

  return (
    <motion.div className="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <h1>Contact Us</h1>
      <p>We’d love to hear from you. Fill out the form below and we’ll respond soon.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Your name" required value={formData.name} onChange={handleChange} />
        <input type="email" name="email" placeholder="Your email" required value={formData.email} onChange={handleChange} />
        <textarea name="message" placeholder="Your message" rows="4" required value={formData.message} onChange={handleChange} />
        <button type="submit" disabled={sending}>{sending ? "Sending..." : "Send Message"}</button>
      </form>

      {success && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="success-popup">
          ✅ Message sent successfully!
        </motion.div>
      )}
    </motion.div>
  );
}

/* -------------------- App Router -------------------- */
function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/convert">Converter</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/convert" element={<Converter />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <footer className="footer">
        <p>© {new Date().getFullYear()} PDF Converter. All rights reserved.</p>
      </footer>
    </Router>
  );
}

export default App;
