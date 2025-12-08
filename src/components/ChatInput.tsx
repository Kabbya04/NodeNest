import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSend(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-2 p-3 rounded-2xl border-2 border-border bg-background focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                <div className="absolute left-4 top-4">
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything... (Shift+Enter for new line)"
                    className="flex-1 min-h-[24px] max-h-[200px] pl-10 pr-4 py-2 bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                    rows={1}
                    disabled={disabled}
                />

                <button
                    type="submit"
                    disabled={!input.trim() || disabled}
                    className="shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
                Node Nest can make mistakes. Consider checking important information.
            </p>
        </form>
    );
};
