import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function MessageInput({ onSend, disabled }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const plainText = text.replace(/<[^>]*>/g, '').trim();
        if (plainText || text.includes('<img')) {
            onSend(text);
            setText('');
        }
    };

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'code-block'],
            ['clean']
        ]
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const plainText = text.replace(/<[^>]*>/g, '').trim();
            if (plainText || text.includes('<img')) {
                onSend(text);
                setText('');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2 items-end">
                <div 
                    className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500"
                    onKeyDown={handleKeyDown}
                >
                    <ReactQuill 
                        theme="snow" 
                        value={text} 
                        onChange={setText} 
                        modules={modules}
                        placeholder="Type a message..."
                        className="border-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!text.replace(/<[^>]*>/g, '').trim() && !text.includes('<img')}
                    className="px-6 py-3 mb-1 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </div>
        </form>
    );
}
