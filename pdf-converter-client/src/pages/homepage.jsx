import React from "react";
import { Link } from "react-router-dom";
import { FaFilePdf, FaFileWord, FaFileImage } from "react-icons/fa";
import "../App.css";

function HomePage() {
  return (
    <div className="home">
      <div className="home-hero">
        <h1>All-in-One File Converter</h1>
        <p>
          Convert PDFs, Word, Excel, PowerPoint, and Images in just one click.
          Simple, fast, and secure — no installation required.
        </p>
        <Link to="/convert">
          <button className="primary-btn">Start Converting</button>
        </Link>
      </div>

      <div className="home-features">
        <div className="feature-card">
          <FaFilePdf size={40} color="#E74C3C" />
          <h3>Convert to PDF</h3>
          <p>
            Turn your Word, PowerPoint, or Images into high-quality PDFs with a
            single click.
          </p>
        </div>

        <div className="feature-card">
          <FaFileWord size={40} color="#3498DB" />
          <h3>Convert to Word</h3>
          <p>
            Edit your PDFs easily by converting them back into editable Word
            documents.
          </p>
        </div>

        <div className="feature-card">
          <FaFileImage size={40} color="#9B59B6" />
          <h3>Image Conversions</h3>
          <p>
            Instantly convert between JPG, PNG, and PDF — no quality loss,
            perfect for sharing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
