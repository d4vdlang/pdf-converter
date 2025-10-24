import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY;

app.use(cors());
app.use(fileUpload());
app.use(express.json());

app.post("/convert", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadedFile = req.files.file;
    const targetFormat = req.body.target || "pdf";

    console.log(`🔄 Converting: ${uploadedFile.name} → ${targetFormat.toUpperCase()}`);

    // Step 1: Create a job
    const jobResponse = await axios.post(
      "https://api.cloudconvert.com/v2/jobs",
      {
        tasks: {
          "import-my-file": { operation: "import/upload" },
          "convert-my-file": {
            operation: "convert",
            input: ["import-my-file"],
            output_format: targetFormat,
          },
          "export-my-file": {
            operation: "export/url",
            input: ["convert-my-file"],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CLOUDCONVERT_API_KEY}`,
        },
      }
    );

    const jobData = jobResponse.data.data;
    const uploadTask = jobData.tasks.find((t) => t.name === "import-my-file");
    const uploadUrl = uploadTask.result.form.url;
    const uploadParams = uploadTask.result.form.parameters;

    // Step 2: Upload the actual file
    const form = new FormData();
    for (const [key, value] of Object.entries(uploadParams)) {
      form.append(key, value);
    }
    form.append("file", uploadedFile.data, uploadedFile.name);

    await axios.post(uploadUrl, form, { headers: form.getHeaders() });

    // Step 3: Wait for completion
    const jobId = jobData.id;
    let finishedJob = null;
    let attempts = 0;

    while (!finishedJob && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const check = await axios.get(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${CLOUDCONVERT_API_KEY}` },
      });

      if (check.data.data.status === "finished") {
        finishedJob = check.data.data;
      }
      attempts++;
    }

    if (!finishedJob) {
      return res.status(500).json({ error: "Conversion timed out." });
    }

    // Step 4: Get the download link
    const exportTask = finishedJob.tasks.find((t) => t.name === "export-my-file");
    const fileUrl = exportTask.result.files[0].url;

    console.log("✅ Conversion complete:", fileUrl);
    res.json({
      message: "✅ Conversion successful!",
      download: fileUrl,
    });
  } catch (err) {
    console.error("❌ Conversion error:", err.response?.data || err.message);
    if (err.response) console.log(JSON.stringify(err.response.data, null, 2));
    res.status(500).json({ error: "Conversion failed." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


