import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws');

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [clientId] = useState(() => `User-${Math.floor(Math.random() * 1000)}`);
    const wsRef = useRef(null);

    // Fetch initial history
    useEffect(() => {
        fetch(`${API_URL}/api/history?limit=50`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(err => console.error("Failed to load history:", err));
    }, []);

    // Connect WebSocket
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/ws/${clientId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'system') {
                // Handle system messages if needed
                console.log("System:", message.text);
            } else {
                setMessages(prev => [...prev, message]);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected');
            setIsConnected(false);
        };

        return () => {
            ws.close();
        };
    }, [clientId]);

    const sendMessage = useCallback((text) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(text);
        }
    }, []);

    const loadMoreMessages = useCallback(async () => {
        if (messages.length === 0) return;
        const oldestId = messages[0].id;
        try {
            const res = await fetch(`${API_URL}/api/history?limit=20&before_id=${oldestId}`);
            const data = await res.json();
            if (data.length > 0) {
                setMessages(prev => [...data, ...prev]);
                return true; // Loaded more
            }
        } catch (err) {
            console.error("Failed to load more:", err);
        }
        return false;
    }, [messages]);

    return {
        messages,
        isConnected,
        clientId,
        sendMessage,
        loadMoreMessages
    };
}
