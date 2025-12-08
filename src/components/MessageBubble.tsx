import React, { useState } from 'react';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { MessageSquarePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
    message: Message;
    onSelection: (text: string, messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSelection }) => {
    const isUser = message.role === 'user';
    const [showSelectionMenu, setShowSelectionMenu] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState('');

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isUser) return; // Only allow selecting AI responses

        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelectedText(selection.toString());
            setSelectionPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 40, // Position above the selection
            });
            setShowSelectionMenu(true);
        } else {
            setShowSelectionMenu(false);
        }
    };

    const handleCreateSubConversation = () => {
        onSelection(selectedText, message.id);
        setShowSelectionMenu(false);
        window.getSelection()?.removeAllRanges();
    };

    return (
        <div className={cn("flex w-full mb-6 relative group", isUser ? "justify-end" : "justify-start")}>
            <div className={cn(
                "max-w-[85%] rounded-3xl px-6 py-4 relative",
                isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary/50 hover:bg-secondary/70 transition-colors text-foreground rounded-bl-sm"
            )}>
                <div
                    className={cn(
                        "prose dark:prose-invert max-w-none text-sm leading-relaxed",
                        isUser ? "prose-p:text-primary-foreground" : ""
                    )}
                    onMouseUp={handleMouseUp}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                return match ? (
                                    <div className="rounded-md bg-gray-950 p-4 my-4 overflow-x-auto text-white border border-gray-800">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </div>
                                ) : (
                                    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs" {...props}>
                                        {children}
                                    </code>
                                )
                            },
                            pre({ children }) {
                                return <>{children}</>
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Selection Menu */}
                {showSelectionMenu && !isUser && (
                    <div
                        className="fixed z-50 bg-popover text-popover-foreground shadow-xl rounded-lg border px-3 py-2 cursor-pointer hover:bg-accent transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-200"
                        style={{
                            left: selectionPosition.x,
                            top: selectionPosition.y,
                            transform: 'translateX(-50%)'
                        }}
                        onClick={handleCreateSubConversation}
                    >
                        <MessageSquarePlus className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium">Ask AI</span>
                    </div>
                )}
            </div>
        </div>
    );
};
