// src/components/ChatBot.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { quickgpt_assets } from '../assets/quickgpt_assets.js';
import Message from './Message';
import axios from 'axios';
import { serverURL } from '../App.jsx';
import { LuImage } from 'react-icons/lu';

const ChatBot = () => {
  const { selectedChat, theme } = useAppContext();
  const containerRef = useRef(null);
  const imageInput = useRef(null);

  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('text');
  const [isPublished, setIsPublished] = useState(false);

  const [frontendImage, setFrontendImage] = useState(null); // preview
  const [backendImage, setBackendImage] = useState(null);   // file to upload

  // Load chat
  useEffect(() => {
    if (selectedChat) setMessages(selectedChat.messages || []);
  }, [selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  // Handle image selection
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
    setMode('image');
  };

  // Send message to AI
  const sendMessageToAI = async () => {
  try {
    let response;

    if (backendImage) {
      const formData = new FormData();
      formData.append("image", backendImage);
      if (prompt) formData.append("message", prompt);
      response = await axios.post(`${serverURL}/api/chat/image`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      response = await axios.post(
        `${serverURL}/api/chat/text`,
        { message: prompt },
        { withCredentials: true }
      );
    }

    return response.data.reply;
  } catch (err) {
    console.error("Axios error:", err.response?.data || err.message);
    return null;
  }
};

  // Submit form
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!prompt && !backendImage) return;

    const timestamp = new Date().toISOString();
    const userMessage = {
      sender: 'user',
      text: prompt || '',
      content: backendImage ? URL.createObjectURL(backendImage) : prompt,
      isImage: !!backendImage,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const aiReply = await sendMessageToAI();
      if (aiReply) {
        const botMessage = {
          sender: 'bot',
          text: aiReply,
          content: aiReply,
          isImage: false,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setPrompt('');
      setBackendImage(null);
      setFrontendImage(null);
      setMode('text');
    }
  };

  return (
    <div className="flex flex-col justify-between h-[calc(100vh-80px)] p-5 md:p-10">
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
          <img
            src={theme === 'dark' ? quickgpt_assets.logo_full : quickgpt_assets.logo_full_dark}
            alt=""
            className="w-40 sm:w-60 md:w-80"
          />
          <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400">
            Ask me anything
          </p>
        </div>
      )}

      {/* Chat messages */}
      <div ref={containerRef} className="flex-1 flex flex-col overflow-y-auto mb-5">
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} isLast={idx === messages.length - 1} />
        ))}
        {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {/* Image publish */}
      {mode === 'image' && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto">
          <p className="text-xs">Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Input form */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-4xl p-3 flex gap-4 items-center mx-auto relative"
      >
        {/* Image preview */}
        {frontendImage && (
          <div className="w-[100px] h-[100px] rounded-2xl absolute top-[-120px] right-[20px] overflow-hidden border border-white z-50">
            <img src={frontendImage} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Mode selector */}
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-3 pr-2 outline-none"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>

        {/* Text input */}
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Type your prompt here..."
          className="flex-1 w-full text-sm outline-none"
          disabled={loading}
          required={!frontendImage}
        />

        {/* Hidden file input */}
        <input type="file" accept="image/*" hidden ref={imageInput} onChange={handleImage} />

        {/* Image button */}
        <div onClick={() => imageInput.current.click()}>
          <LuImage className="w-[28px] h-[28px] text-white cursor-pointer" />
        </div>

        {/* Send button */}
        {(prompt || frontendImage) && (
          <button type="submit" disabled={loading}>
            <img
              src={loading ? quickgpt_assets.stop_icon : quickgpt_assets.send_icon}
              className="w-8 cursor-pointer"
              alt="send"
            />
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatBot;
