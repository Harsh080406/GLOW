import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Disk Storage with randomized safe filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `challan-${uniqueSuffix}${ext}`);
  },
});

// 2. Strict MIME Type Whitelist
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed."), false);
  }
};

export const uploadChallanMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Strict 5 MB size limit
});

// 3. Security & Anti-Malware Content Scanner Middleware
export const scanUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;

  try {
    // Read first 2KB for magic bytes and heuristic signatures
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(2048);
    const bytesRead = fs.readSync(fd, buffer, 0, 2048, 0);
    fs.closeSync(fd);

    const slice = buffer.subarray(0, bytesRead);

    // ── Check Magic Bytes ──
    const isPdf = slice.subarray(0, 5).toString("latin1") === "%PDF-";
    const isJpeg = slice[0] === 0xff && slice[1] === 0xd8 && slice[2] === 0xff;
    const isPng =
      slice[0] === 0x89 &&
      slice[1] === 0x50 &&
      slice[2] === 0x4e &&
      slice[3] === 0x47 &&
      slice[4] === 0x0d &&
      slice[5] === 0x0a;
    const isWebp =
      slice.subarray(0, 4).toString("latin1") === "RIFF" &&
      slice.subarray(8, 12).toString("latin1") === "WEBP";

    if (!isPdf && !isJpeg && !isPng && !isWebp) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        error: {
          code: "SECURITY_SCAN_FAILED",
          message: "File failed signature inspection. Magic bytes do not match declared extension.",
        },
      });
    }

    // ── Malware / Exploit Heuristic Inspection ──
    const contentAscii = slice.toString("ascii").toLowerCase();

    // Check for Windows PE or Linux ELF executables
    const isExecutable =
      slice.subarray(0, 2).toString("ascii") === "MZ" ||
      (slice[0] === 0x7f && slice.subarray(1, 4).toString("ascii") === "ELF");

    // Check for web-shell / script injection signatures
    const suspiciousPatterns = [
      "<script",
      "javascript:",
      "<?php",
      "eval(",
      "base64_decode(",
      "system(",
      "shell_exec(",
      "passthru(",
      "/bin/sh",
      "/bin/bash",
      "cmd.exe",
    ];

    const hasExploit = suspiciousPatterns.some((pattern) => contentAscii.includes(pattern));

    if (isExecutable || hasExploit) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        error: {
          code: "MALWARE_DETECTED",
          message: "File security scan rejected this upload. Potential executable or script payload detected.",
        },
      });
    }

    // Scan passed successfully
    next();
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(500).json({
      error: {
        code: "SCAN_ERROR",
        message: "Failed to complete security scan on uploaded file.",
      },
    });
  }
};
