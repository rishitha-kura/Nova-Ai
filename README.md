# AI Integration Backend - Gemini Developer Console

An advanced, full-stack, production-grade developer playground and API server integrating Google's modern Gemini AI models. Built with **TypeScript**, **React**, **Node.js**, **Express**, and the modern official **@google/genai SDK**.

**Project Details:**
* **Project Name:** AI Integration Backend
* **Target Environment:** Render & Cloud Run compatible

---

## 🎨 Architecture & Visual Theme

The application uses an immersive **Swiss-Modern Dark Theme** configured using custom Google Web Fonts (pairing **Inter** for high-legibility UI headings with **JetBrains Mono** for low-level server logs and documentation blocks).

### Design Features:
* **Interactive Dev Console Workspace:** Two-column workspace designed specifically for software engineers testing AI pipelines.
* **Live Server Health & Configuration Indicators:** Constant polling mechanism validating the connection status with the backend Express server, as well as checking if your API key is correctly configured.
* **Custom Code Block Parser:** Parsed AI responses cleanly segment code and present interactive "Copy Code" elements.
* **Pre-baked Suggestion Prompt Templates:** Rapidly invoke standard full-stack prompts like logging middlewares, CORS settings, or TypeScript interfaces.

---

## ⚙️ REST API Reference Documentation

The server exposes direct, predictable JSON endpoints running alongside the Vite asset compiler on the unified port `3000`.

### 1. GET `/api/health`
Checks backend online availability and checks if the environment secrets have successfully loaded the API key.
* **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-06-24T02:48:19.000Z",
    "apiKeyConfigured": true
  }
  ```

### 2. GET `/api/chat`
Retrieves the exact active chat history currently residing in-memory inside the Express runtime.
* **Response `200 OK`**:
  ```json
  {
    "history": [
      {
        "id": "welcome-msg",
        "role": "model",
        "content": "Hello! I am your AI assistant...",
        "timestamp": "2026-06-24T02:48:19.000Z"
      }
    ]
  }
  ```

### 3. POST `/api/chat`
Sends a user query along with preceding dialog entries to the Gemini API to formulate a conversational, context-aware reply using the modern `gemini-3.5-flash` model.
* **Request Payload**:
  ```json
  {
    "prompt": "How do I secure an Express server?"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "userMessage": {
      "id": "user-1719223000",
      "role": "user",
      "content": "How do I secure an Express server?",
      "timestamp": "2026-06-24T02:49:00.000Z"
    },
    "modelMessage": {
      "id": "model-1719223005",
      "role": "model",
      "content": "To secure Express, install helmet, enable CORS, use rate limits...",
      "timestamp": "2026-06-24T02:49:05.000Z"
    },
    "history": [...]
  }
  ```

### 4. POST `/api/chat/clear`
Clears the backend in-memory array to free memory and resets the console state to the initial greetings message.
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "history": [...]
  }
  ```

---

## 🚀 Installation & Local Development

This project is fully automated and manages development or production environments based on standard system rules.

### Prerequisites
1. Ensure **Node.js** (v18 or higher) is installed.
2. Obtain a Google Gemini API key from the developer console.

### Setup Instructions
1. Clone or extract the project.
2. Configure your environment variables inside `.env` (or copy from `.env.example`):
   ```env
   GEMINI_API_KEY="AIzaSyYourActualKeyHere..."
   ```

### Installation
Install all base system and package dependencies:
```bash
npm install
```

### Dev Mode (Full-stack)
Run both the Express server API endpoints and the Vite Client bundling system simultaneously on [http://localhost:3000](http://localhost:3000):
```bash
npm run dev
```

---

## 📦 Production Build & Deployment

The system is configured for direct compatibility with Render, Cloud Run, and other automated Git-based deployment servers.

### 1. Build Phase
Compiles the frontend SPA assets into the standard `/dist` folder, and bundles the Node.js TypeScript server into a high-performance, single-file CommonJS file `/dist/server.cjs` using `esbuild` for ultra-fast startup and cold start optimization:
```bash
npm run build
```

### 2. Run Production Server
Launches the self-contained backend on the host, automatically serving the compiled frontend SPA statically on port `3000`:
```bash
npm start
```

---

## 🛠️ Tech Stack & Key Libraries Used

* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React (Icons), Motion (Animations)
* **Backend:** Node.js, Express, TSX, esbuild
* **AI Processing:** `@google/genai` (SDK utilizing `gemini-3.5-flash` for high-speed reasoning)
