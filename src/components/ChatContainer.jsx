import React from 'react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatContainer() {
    const { messages, isConnected, clientId, sendMessage, loadMoreMessages } = useChat();

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                <h1 className="text-xl font-bold text-gray-800">Group Chat</h1>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-500">{isConnected ? 'Online' : 'Offline'}</span>
                    <span className="text-xs text-gray-400 ml-2">ID: {clientId}</span>
                </div>
            </header>

            <MessageList
                messages={messages}
                clientId={clientId}
                onLoadMore={loadMoreMessages}
            />

            <MessageInput onSend={sendMessage} disabled={!isConnected} />
        </div>
    );
}
