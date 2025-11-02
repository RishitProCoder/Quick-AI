import fs from "fs";
import OpenAI from "openai";
import { uploadToCloudinary } from "../config/cloudinary.js";
import imagekit from "../config/imagekit.js";

const AI = new OpenAI({
  apiKey: process.env.CHATBOX_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

/* 🧠 1️⃣ TEXT-ONLY CHAT CONTROLLER (Cloudinary not used) */
export const chatWithAI = async (req, res) => {
  try {
    console.log("🔥 [Text Chat] Incoming AI Request");
    console.log("Body:", req.body);

    const message = req.body?.message?.trim();
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // Build input
    const input = [
      {
        role: "user",
        content: [{ type: "text", text: message }],
      },
    ];

    console.log("🧾 AI Input:", JSON.stringify(input, null, 2));

    const completion = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: input,
    });

    console.log("✅ AI Raw Response:", completion);

    const aiMessage = completion?.choices?.[0]?.message;
    const aiReply =
      Array.isArray(aiMessage?.content)
        ? aiMessage.content.map((i) => (i.type === "text" ? i.text : "")).join("\n").trim()
        : aiMessage?.content || "⚠️ No reply text found";

    console.log("💬 AI Reply:", aiReply);

    res.json({ success: true, reply: aiReply });
  } catch (error) {
    console.error("💥 AI Chat Error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Error processing AI chat." });
  }
};

/* 🖼️ 2️⃣ IMAGE-ONLY CHAT CONTROLLER (Uses ImageKit) */
export const chatWithAIImage = async (req, res) => {
  try {
    console.log("🔥 [Image Chat] Incoming AI Request");
    console.log("File:", req.file);

    const image = req.file;
    if (!image) {
      return res.status(400).json({ success: false, message: "Image file is required." });
    }

    let input = [{ role: "user", content: [] }];

    console.log("🖼️ Uploading image to ImageKit...");

    let uploadedUrl = null;
    try {
      const uploadResponse = await imagekit.upload({
        file: fs.readFileSync(image.path),
        fileName: image.originalname,
      });
      uploadedUrl = uploadResponse?.url;
      console.log("✅ Image uploaded:", uploadedUrl);
    } catch (err) {
      console.error("💥 ImageKit upload error:", err);
    }

    try {
      fs.unlinkSync(image.path);
    } catch (e) {
      console.warn("⚠️ Cleanup failed:", e);
    }

    if (!uploadedUrl) {
      return res.status(500).json({ success: false, message: "Image upload failed." });
    }

    input[0].content.push({ type: "image_url", image_url: uploadedUrl });

    console.log("🧾 AI Input:", JSON.stringify(input, null, 2));

    const completion = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: input,
    });

    console.log("✅ AI Raw Response:", completion);

    const aiMessage = completion?.choices?.[0]?.message;
    const aiReply =
      Array.isArray(aiMessage?.content)
        ? aiMessage.content.map((i) => (i.type === "text" ? i.text : "")).join("\n").trim()
        : aiMessage?.content || "⚠️ No reply text found";

    console.log("💬 AI Reply:", aiReply);

    res.json({ success: true, reply: aiReply, imageUrl: uploadedUrl });
  } catch (error) {
    console.error("💥 AI Image Chat Error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Error processing AI image chat." });
  }
};
