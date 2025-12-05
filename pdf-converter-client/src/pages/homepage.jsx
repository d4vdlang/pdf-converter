import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaFilePdf, FaFileWord, FaFileImage } from "react-icons/fa";
import "../App.css";

function HomePage() {
  return (
    <div className="home">
      <Helmet>
        <title>PDFConvert4Me — Free PDF Converter (PDF to Word, Excel, JPG)</title>
        <meta
          name="description"
          content="Convert PDF to Word, Excel, PowerPoint, JPG, PNG and more for free. Fast, secure, no signup required using PDFConvert4Me."
        />
        <link rel="canonical" href="https://pdfconvert4me.com/" />

        <meta property="og:title" content="PDFConvert4Me — Free PDF Converter" />
        <meta
          property="og:description"
          content="Fast and secure PDF conversions. Convert PDF to Word, Excel, JPG and more in seconds — no account needed."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pdfconvert4me.com/" />
        <meta
          property="og:image"
          content="https://pdfconvert4me.com/images/og-image.jpg"
        />
      </Helmet>

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

      {/* ✅ SEO text section MUST be inside the main div */}
      <section style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "15px" }}>
          Free Online PDF Converter – Convert PDF to Word, Excel & More
        </h1>

        <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "12px" }}>
          PDFConvert4Me is a fast, secure, and easy-to-use online tool that helps you
          convert your documents in seconds. Convert PDF to Word, Word to PDF, PDF to
          Excel, and other formats using a clean and simple interface — no sign-up
          required.
        </p>

        <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "12px" }}>
          All tools are available on one page, so you don’t waste time navigating
          through multiple menus. Just upload your file, choose your conversion type,
          and download your document instantly.
        </p>

        <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
          Whether you're a student, worker, business owner, or casual user, 
          <strong>PDFConvert4Me</strong> helps you quickly convert PDFs without
          hassle. 100% free, fast, and mobile-friendly.
        </p>
      </section>
    </div>
  );
}

export default HomePage;
