import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(true); // Always "connected" in REST
    const [clientId] = useState(() => `User-${Math.floor(Math.random() * 1000)}`);

    // Fetch messages function
    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/history?limit=10`);
            if (res.ok) {
                const data = await res.json();
                setMessages(prevMessages => {
                    // If no previous messages, just set the new data
                    if (prevMessages.length === 0) return data;

                    // Create a Set of existing message IDs for fast lookup
                    const existingIds = new Set(prevMessages.map(msg => msg.id));

                    // Find messages we don't have yet
                    const newMessages = data.filter(msg => !existingIds.has(msg.id));

                    // If there are new messages, append them
                    if (newMessages.length > 0) {
                        return [...prevMessages, ...newMessages];
                    }

                    // No new messages, keep existing
                    return prevMessages;
                });
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            setIsConnected(false);
        }
    }, []);

    // Initial fetch and Polling
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const sendMessage = useCallback(async (text) => {
        try {
            const res = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    sender: clientId
                }),
            });

            if (res.ok) {
                const newMessage = await res.json();
                // Optimistically add the message to UI
                setMessages(prev => [...prev, newMessage]);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    }, [clientId]);

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
