import express from "express";
import { auth } from "../middleware/auth.js";
import { chatWithAI, chatWithAIImage } from "../controllers/aiChat.js";
import { upload } from "../config/multer.js";

const aiChatRouter = express.Router();

// 🧠 Text-only chat
aiChatRouter.post("/text", auth, chatWithAI);

// 🖼️ Image-only chat (needs upload middleware)
aiChatRouter.post("/image", auth, upload.single("image"), chatWithAIImage);

export default aiChatRouter;
