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
  FaEnvelope,
} from "react-icons/fa";
import "./App.css";

const API_URL = "https://pdf-converter-va03.onrender.com/convert";

/* =====================================================
   🔵 GOOGLE ADSENSE COMPONENT
===================================================== */
function GoogleAd() {
  const { pathname } = useLocation();

  // reload ads when the user navigates
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense ad failed to load:", err);
    }
  }, [pathname]);

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      {/* Replace 'YOUR-ADSENSE-CLIENT-ID' with your actual AdSense ID */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-YOUR-ADSENSE-CLIENT-ID"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

/* =====================================================
   🔵 HOMEPAGE
===================================================== */
function Home() {
  return (
    <motion.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="home-hero">
        <h1>Welcome to PDF Converter</h1>
        <p>Convert, merge, and transform files instantly — right from your browser.</p>
        <Link to="/convert">
          <button className="primary-btn">Start Converting</button>
        </Link>
      </div>

      <GoogleAd />

      <div className="home-features">
        <motion.div whileHover={{ scale: 1.05 }} className="feature-card">
          <FaFilePdf size={40} color="#e74c3c" />
          <h3>Convert to PDF</h3>
          <p>Transform Word, PowerPoint, and Excel files to PDF in seconds.</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="feature-card">
          <FaGoogleDrive size={40} color="#34a853" />
          <h3>Cloud Uploads</h3>
          <p>Upload from Google Drive, Dropbox, or any file URL instantly.</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="feature-card">
          <FaFileImage size={40} color="#9b59b6" />
          <h3>Image Conversion</h3>
          <p>Convert images to PDF or extract pages as PNG/JPG.</p>
        </motion.div>
      </div>

      <GoogleAd />
    </motion.div>
  );
}

/* =====================================================
   🔵 CONVERTER PAGE
===================================================== */
function Converter() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [working, setWorking] = useState(false);
  const [history, setHistory] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [targetFormat, setTargetFormat] = useState("pdf");
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = (e) => setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDragEnter = () => setDragActive(true);
  const handleDragLeave = () => setDragActive(false);

  const getIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return <FaFilePdf color="#E74C3C" size={26} />;
      case "doc":
      case "docx": return <FaFileWord color="#3498DB" size={26} />;
      case "jpg":
      case "jpeg":
      case "png": return <FaFileImage color="#9B59B6" size={26} />;
      case "ppt":
      case "pptx": return <FaFilePowerpoint color="#E67E22" size={26} />;
      case "xls":
      case "xlsx": return <FaFileExcel color="#27AE60" size={26} />;
      default: return <FaFileAlt color="#555" size={26} />;
    }
  };

  const handleConvert = async () => {
    if (!files.length) return alert("Please upload at least one file.");
    setWorking(true);
    setProgress(10);
    const newHistory = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.append("file", file);
      form.append("target", targetFormat);

      try {
        const res = await fetch(API_URL, { method: "POST", body: form });
        const data = await res.json();

        if (data.download) {
          const link = document.createElement("a");
          link.href = data.download;
          link.download = `converted-${file.name.split(".")[0]}.${targetFormat}`;
          link.click();
          newHistory.push({ name: file.name, url: data.download });
        }
        setProgress(20 + ((i + 1) / files.length) * 70);
      } catch {
        alert("Conversion failed for " + file.name);
      }
    }

    setProgress(100);
    setWorking(false);
    setHistory((prev) => [...newHistory, ...prev]);
  };

  const handleUrlUpload = async () => {
    if (!fileUrl.trim()) return alert("Enter a valid file URL");
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const filename = fileUrl.split("/").pop().split("?")[0];
      setFiles((prev) => [...prev, new File([blob], filename)]);
      setFileUrl("");
    } catch {
      alert("Failed to fetch file from URL");
    }
  };

  const handleDropbox = () => {
    if (!window.Dropbox) return alert("Dropbox SDK not loaded!");
    window.Dropbox.choose({
      success: async (files) => {
        for (const f of files) {
          const res = await fetch(f.link);
          const blob = await res.blob();
          setFiles((prev) => [...prev, new File([blob], f.name)]);
        }
      },
      linkType: "direct",
      multiselect: true,
      extensions: ["pdf", "docx", "png", "jpg", "pptx", "xlsx"],
    });
  };

  return (
    <motion.div
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="converter-card">
        <h1 className="title">PDF Converter</h1>
        <p className="subtitle">
          Convert between PDF, Word, Excel, PowerPoint, and Images easily.
        </p>

        <div className="format-selector">
          <label>Convert to:</label>
          <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}>
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

        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input type="file" multiple id="fileInput" className="file-input" onChange={handleFileChange} />
          <label htmlFor="fileInput" className="upload-label">
            {dragActive ? "Drop your files!" : "Drag & Drop or browse"}
          </label>
        </div>

        <div className="external-options">
          <button className="drive-btn">
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

        {files.length > 0 && (
          <div className="file-preview">
            {files.map((f, i) => (
              <div key={i} className="file-item">
                {getIcon(f.name)} <span>{f.name}</span>
              </div>
            ))}
          </div>
        )}

        <button className="convert-btn" disabled={working} onClick={handleConvert}>
          {working ? "Converting…" : `Convert to ${targetFormat.toUpperCase()}`}
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
                {getIcon(h.name)} {h.name} →{" "}
                <a href={h.url} download>
                  Download
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

/* =====================================================
   🔵 PRIVACY, TERMS, CONTACT PAGES
===================================================== */
function Privacy() {
  return (
    <motion.div className="policy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Privacy Policy</h1>
      <p>
        We respect your privacy. Uploaded files are processed temporarily for conversion and deleted automatically
        after completion. We do not store, share, or view any user content.
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
      <p>
        By using PDF Converter, you agree to use it only for lawful purposes. We do not guarantee perfect conversion
        results for all formats.
      </p>
      <p>We may update these terms at any time to improve performance or comply with standards.</p>
      <GoogleAd />
    </motion.div>
  );
}

/* =====================================================
   🔵 CONTACT PAGE (NEW)
===================================================== */
function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        setTimeout(() => setSuccess(false), 3000); // hide message after 3s
      } else {
        alert("Something went wrong. Try again later.");
      }
    } catch (error) {
      alert("Error sending message.");
    }

    setSending(false);
  };

  return (
    <motion.div
      className="contact"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h1>Contact Us</h1>
      <p>We’d love to hear from you. Fill out the form below and we’ll respond soon.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Your message"
          rows="4"
          required
          value={formData.message}
          onChange={handleChange}
        ></textarea>
        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send Message"}
        </button>
      </form>

      {success && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="success-popup"
        >
          ✅ Message sent successfully!
        </motion.div>
      )}
    </motion.div>
  );
}

/* =====================================================
   🔵 MAIN APP ROUTER
===================================================== */
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
