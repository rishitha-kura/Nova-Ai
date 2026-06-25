export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  apiKeyConfigured: boolean;
  aiConnected: boolean;
}

export interface ApiEndpointDoc {
  method: "GET" | "POST";
  path: string;
  description: string;
  payload?: string;
  response: string;
}
