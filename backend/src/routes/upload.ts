import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { config } from "../config.js";
import { v4 as uuid } from "uuid";

await fs.mkdir(config.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || path.extname(file.mimetype) || "";
    cb(null, `${uuid()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});
