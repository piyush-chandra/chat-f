import React, { useEffect, useRef } from 'react';

export function MessageList({ messages, clientId, onLoadMore }) {
    const listRef = useRef(null);
    const topSentinelRef = useRef(null);
    const prevHeightRef = useRef(0);

    // Auto-scroll to bottom on new message if already near bottom
    useEffect(() => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            if (isNearBottom) {
                listRef.current.scrollTop = scrollHeight;
            }
        }
    }, [messages]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                // Save current scroll height to maintain position
                if (listRef.current) {
                    prevHeightRef.current = listRef.current.scrollHeight;
                }

                const loaded = await onLoadMore();

                // Restore scroll position
                if (loaded && listRef.current) {
                    // The new content pushes everything down. 
                    // We want to stay at the same "visual" message.
                    // New scrollHeight - Old scrollHeight = amount added to top.
                    // We should add that to scrollTop.
                    requestAnimationFrame(() => {
                        if (listRef.current) {
                            const newHeight = listRef.current.scrollHeight;
                            const diff = newHeight - prevHeightRef.current;
                            listRef.current.scrollTop += diff;
                        }
                    });
                }
            }
        }, { threshold: 0.5 });

        if (topSentinelRef.current) {
            observer.observe(topSentinelRef.current);
        }

        return () => observer.disconnect();
    }, [onLoadMore]);

    return (
        <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
        >
            <div ref={topSentinelRef} className="h-4 w-full" />
            {messages.map((msg) => {
                const isMe = msg.sender === clientId;
                return (
                    <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${isMe
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'
                                }`}
                        >
                            <div className="text-xs opacity-75 mb-1">{msg.sender}</div>
                            <div>{msg.text}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
