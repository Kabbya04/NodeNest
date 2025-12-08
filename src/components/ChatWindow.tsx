import React, { useEffect, useRef } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { Bot, Sparkles, ArrowLeft } from 'lucide-react';

export const ChatWindow: React.FC = () => {
    const {
        activeConversationId,
        conversations,
        addMessage,
        updateMessageContent,
        createSubConversation,
        updateConversationTitle,
        getConversationPath,
        setActiveConversation,
        getConversationContext
    } = useConversationStore();

    const activeConversation = conversations[activeConversationId];
    const scrollRef = useRef<HTMLDivElement>(null);
    const { sendMessage, isLoading } = useChat();

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeConversation?.messages]);

    // Global auto-focus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                // Ignore if modifying keys are pressed, but allow shift for typing
                // Actually e.key.length === 1 usually covers explicit characters.
                // We want to avoid capturing shortcuts.
                const activeElement = document.activeElement;
                if (activeElement?.tagName !== 'TEXTAREA' && activeElement?.tagName !== 'INPUT') {
                    document.querySelector('textarea')?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onSend = async (content: string, targetConversationId?: string) => {
        const conversationId = targetConversationId || activeConversationId;
        const currentConversation = useConversationStore.getState().conversations[conversationId];

        if (!currentConversation) return;

        // Auto-title if first message
        if (currentConversation.messages.length === 0) {
            updateConversationTitle(conversationId, content.trim().substring(0, 40) + (content.length > 40 ? '...' : ''));
        }

        // 1. Add User Message
        addMessage(conversationId, { role: 'user', content });

        // 2. Prepare context for API using the full tree history
        // We get context AFTER adding user message, so it includes it.
        const contextMessages = getConversationContext(conversationId);

        // 3. Add Empty Assistant Message for streaming
        addMessage(conversationId, { role: 'assistant', content: '' });

        try {
            let messageIdToUpdate: string | null = null;

            await sendMessage(contextMessages, (chunk) => {
                if (!messageIdToUpdate) {
                    const convo = useConversationStore.getState().conversations[conversationId];
                    const msgs = convo.messages;
                    if (msgs.length > 0) {
                        const lastMsg = msgs[msgs.length - 1];
                        if (lastMsg.role === 'assistant') {
                            messageIdToUpdate = lastMsg.id;
                        }
                    }
                }

                if (messageIdToUpdate) {
                    const convo = useConversationStore.getState().conversations[conversationId];
                    const msg = convo.messages.find(m => m.id === messageIdToUpdate);
                    const currentContent = msg?.content || '';
                    updateMessageContent(conversationId, messageIdToUpdate, currentContent + chunk);
                }
            });

        } catch (error) {
            console.error('Error getting AI response:', error);
            const convo = useConversationStore.getState().conversations[conversationId];
            const msgs = convo.messages;
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.role === 'assistant') {
                updateMessageContent(conversationId, lastMsg.id, 'Sorry, I encountered an error. Please make sure the backend server is running on port 3000 with a valid GROQ_API_KEY.');
            }
        }
    };

    const handleSelection = (text: string, messageId: string) => {
        const newConvoId = createSubConversation(activeConversationId, messageId, text);
        // Delay slightly to ensure store update propagates if needed, though usually creating sub convo is sync
        setTimeout(() => {
            onSend(`More information on "${text}"`, newConvoId);
        }, 100);
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                {/* Welcome Screen */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Node Nest</h2>
                <p className="text-center max-w-md">
                    Start a new conversation or select one from the sidebar to begin exploring branching conversations
                </p>
            </div>
        );
    }

    const conversationPath = getConversationPath(activeConversationId);
    const isSubConversation = activeConversation.parentId !== undefined;
    const isChatEmpty = activeConversation.messages.length === 0;

    return (
        <div className="flex-1 flex flex-col bg-background h-full relative">
            {/* Breadcrumb / Context Header */}
            {isSubConversation && (
                <div className="px-4 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-border shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => {
                                const parentId = activeConversation.parentId;
                                if (parentId) setActiveConversation(parentId);
                            }}
                            className="p-1 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {conversationPath.map((convo, i) => (
                                <React.Fragment key={convo.id}>
                                    <button
                                        onClick={() => setActiveConversation(convo.id)}
                                        className="px-2 py-1 rounded hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground"
                                    >
                                        {convo.title}
                                    </button>
                                    {i < conversationPath.length - 1 && (
                                        <span className="text-muted-foreground">/</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full" ref={scrollRef}>
                {!isChatEmpty && (
                    <div className="max-w-4xl mx-auto px-4 py-4 pb-4">
                        {activeConversation.messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                onSelection={handleSelection}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div
                className={isChatEmpty
                    ? "absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none"
                    : "border-t border-border bg-background sticky bottom-0 z-10"
                }
            >
                <div className={isChatEmpty ? "w-full max-w-2xl text-center space-y-8 pointer-events-auto" : "max-w-4xl mx-auto px-4 py-0 w-full"}>
                    {isChatEmpty && (
                        <div className="pointer-events-auto">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 mx-auto shadow-lg">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                            <p className="text-muted-foreground mb-8">Ask me anything about code, design, or life.</p>
                        </div>
                    )}

                    <div className="w-full pointer-events-auto pt-0 pb-4">
                        <ChatInput onSend={(c) => onSend(c)} disabled={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    );
};
