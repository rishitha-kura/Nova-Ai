# Nova AI

Internship ID: CTTS122

Deployment: Render

Nova AI is a production-quality full-stack AI assistant inspired by leading platforms. It features a premium, responsive UI with glassmorphism, smooth animations, and robust functionality including chat history, markdown support, and syntax highlighting.

## Features
- AI Chat using Google Gemini Flash model
- Responsive design with glassmorphism & dark theme
- Syntax highlighting for code snippets
- Markdown rendering support
- Conversation history
- Typing animations and auto-scroll

## Environment Variables
To run this application, you must configure the following environment variables:
```
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
PORT=3000
```

## Setup & Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory and add your `GEMINI_API_KEY`.
3. Start the development server (runs both Vite and Express):
   ```bash
   npm run dev
   ```

## Production Build & Deployment (Render)
This project is configured as a unified deployment for Render.

Build command:
```bash
npm install && npm run build
```

Start command:
```bash
npm start
```
