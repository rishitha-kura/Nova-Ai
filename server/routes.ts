import { Router } from 'express';
import { generateContent } from './gemini';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage for chats
// Map of chatId -> Array of messages { role, content, id, timestamp }
const chats: Record<string, { id: string, role: string, content: string, timestamp: number }[]> = {};

router.post('/chat', async (req, res) => {
  try {
    const { message, chatId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const currentChatId = chatId || uuidv4();
    
    if (!chats[currentChatId]) {
      chats[currentChatId] = [];
    }

    const userMessage = {
      id: uuidv4(),
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

    const responseText = await generateContent(message, historyForGemini);

    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now()
    };

    chats[currentChatId].push(aiMessage);

    res.json({
      chatId: currentChatId,
      message: aiMessage
    });
  } catch (error: any) {
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

export default router;
