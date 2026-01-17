import axios from 'axios';
import type { SendMessageRequest, SendMessageResponse, Conversation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const chatApi = {
    sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
        const response = await api.post('/api/chat/messages', data);
        return response.data;
    },

    getConversation: async (conversationId: string): Promise<Conversation> => {
        const response = await api.get(`/api/conversations/${conversationId}`);
        return response.data;
    },

    checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
        const response = await api.get('/api/health');
        return response.data;
    },
};
