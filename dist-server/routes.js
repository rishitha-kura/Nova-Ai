"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gemini_1 = require("./gemini");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// In-memory storage for chats
// Map of chatId -> Array of messages { role, content, id, timestamp }
const chats = {};
router.post('/chat', async (req, res) => {
    try {
        const { message, chatId } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        const currentChatId = chatId || (0, uuid_1.v4)();
        if (!chats[currentChatId]) {
            chats[currentChatId] = [];
        }
        const userMessage = {
            id: (0, uuid_1.v4)(),
            role: 'user',
            content: message,
            timestamp: Date.now()
        };
        // Save user message
        const historyForGemini = chats[currentChatId].map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        chats[currentChatId].push(userMessage);
        const responseText = await (0, gemini_1.generateContent)(message, historyForGemini);
        const aiMessage = {
            id: (0, uuid_1.v4)(),
            role: 'assistant',
            content: responseText,
            timestamp: Date.now()
        };
        chats[currentChatId].push(aiMessage);
        res.json({
            chatId: currentChatId,
            message: aiMessage
        });
    }
    catch (error) {
        // Only return the friendly error message
        const fallbackMessage = "I'm temporarily unable to reach the AI service. Please try again in a moment.";
        res.status(503).json({ error: fallbackMessage });
    }
});
router.get('/history', (req, res) => {
    // Return all chats
    res.json({ chats });
});
router.delete('/history', (req, res) => {
    const { chatId } = req.query;
    if (chatId && typeof chatId === 'string') {
        delete chats[chatId];
        return res.json({ success: true, chatId });
    }
    // Delete all
    for (const key in Object.keys(chats)) {
        delete chats[key];
    }
    res.json({ success: true });
});
exports.default = router;
