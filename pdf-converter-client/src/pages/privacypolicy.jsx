import { Helmet } from "react-helmet";
import React from "react";
import "../App.css";

function PrivacyPolicy() {
  return (
   <Helmet>
  <title>Privacy Policy — PDFConvert4me</title>
  <meta name="description" content="Read how PDFConvert4me processes files securely and protects your privacy." />
   </Helmet>

    <div className="policy">
      <h1>Privacy Policy</h1>
      <p>
        Your privacy is important to us. This website does not store your
        uploaded files. All files are processed securely and automatically
        deleted from our servers after conversion.
      </p>

      <p>
        We use limited analytics and cookies to improve performance and user
        experience. No personal information is shared with third parties.
      </p>

      <p>
        If you use external sources like Google Drive or Dropbox, we only
        request temporary access to read the selected file for conversion. We do
        not save or share this data.
      </p>

      <p>
        For questions about privacy or data handling, contact us at
        <b> support@example.com</b>.
      </p>
    </div>
  );
}

export default PrivacyPolicy;
