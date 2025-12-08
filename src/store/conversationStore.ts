import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ConversationState {
    conversations: Record<string, Conversation>;
    activeConversationId: string;
    rootConversationId: string;

    // Actions
    createRootConversation: () => void;
    createSubConversation: (parentId: string, parentMessageId: string, selectedContext: string) => string;
    setActiveConversation: (id: string) => void;
    addMessage: (conversationId: string, message: Omit<Message, 'id' | 'createdAt'>) => void;
    updateMessageContent: (conversationId: string, messageId: string, content: string) => void;
    updateConversationTitle: (conversationId: string, title: string) => void;
    getConversationPath: (conversationId: string) => Conversation[];
    getRootId: (conversationId: string) => string;
    getConversationContext: (conversationId: string) => Message[];
}

export const useConversationStore = create<ConversationState>((set, get) => ({
    conversations: {},
    activeConversationId: '',
    rootConversationId: '',

    createRootConversation: () => {
        const id = uuidv4();
        const newConversation: Conversation = {
            id,
            title: 'New Conversation',
            messages: [],
            childrenIds: [],
            createdAt: new Date(),
        };

        set((state) => ({
            conversations: { ...state.conversations, [id]: newConversation },
            activeConversationId: id,
            rootConversationId: id,
        }));
    },

    createSubConversation: (parentId, parentMessageId, selectedContext) => {
        const id = uuidv4();
        const newConversation: Conversation = {
            id,
            title: `Sub: ${selectedContext.substring(0, 20)}...`,
            messages: [],
            parentId,
            parentMessageId,
            childrenIds: [],
            createdAt: new Date(),
        };

        set((state) => {
            const parent = state.conversations[parentId];
            return {
                conversations: {
                    ...state.conversations,
                    [parentId]: {
                        ...parent,
                        childrenIds: [...parent.childrenIds, id],
                    },
                    [id]: newConversation,
                },
                activeConversationId: id,
            };
        });

        return id;
    },

    setActiveConversation: (id) => {
        set({ activeConversationId: id });
    },

    addMessage: (conversationId, message) => {
        set((state) => {
            const conversation = state.conversations[conversationId];
            if (!conversation) return state;

            const newMessage: Message = {
                id: uuidv4(),
                createdAt: new Date(),
                ...message,
            };

            return {
                conversations: {
                    ...state.conversations,
                    [conversationId]: {
                        ...conversation,
                        messages: [...conversation.messages, newMessage],
                    },
                },
            };
        });
    },

    updateMessageContent: (conversationId, messageId, content) => {
        set((state) => {
            const conversation = state.conversations[conversationId];
            if (!conversation) return state;

            const updatedMessages = conversation.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content } : msg
            );

            return {
                conversations: {
                    ...state.conversations,
                    [conversationId]: {
                        ...conversation,
                        messages: updatedMessages,
                    },
                },
            };
        });
    },

    updateConversationTitle: (conversationId, title) => {
        set((state) => {
            const conversation = state.conversations[conversationId];
            if (!conversation) return state;

            return {
                conversations: {
                    ...state.conversations,
                    [conversationId]: {
                        ...conversation,
                        title,
                    },
                },
            };
        });
    },

    getConversationPath: (conversationId) => {
        const { conversations } = get();
        const path: Conversation[] = [];
        let currentId: string | undefined = conversationId;

        while (currentId) {
            const convo: Conversation | undefined = conversations[currentId];
            if (convo) {
                path.unshift(convo);
                currentId = convo.parentId;
            } else {
                break;
            }
        }
        return path;
    },

    getRootId: (conversationId) => {
        const { conversations } = get();
        if (!conversations[conversationId]) return conversationId;
        let currentId = conversationId;
        let depth = 0;
        while (conversations[currentId]?.parentId && depth < 100) {
            currentId = conversations[currentId]!.parentId!;
            depth++;
        }
        return currentId;
    },

    getConversationContext: (conversationId) => {
        const { conversations } = get();
        const targetConvo = conversations[conversationId];
        if (!targetConvo) return [];

        let contextMessages: Message[] = [];

        // 1. Ancestor Traversal (Build linear history)
        const path: Conversation[] = [];
        let currentId: string | undefined = conversationId;

        while (currentId) {
            const c = conversations[currentId];
            if (c) {
                path.unshift(c);
                currentId = c.parentId;
            } else {
                break;
            }
        }

        // Build context from path
        for (let i = 0; i < path.length; i++) {
            const convo = path[i];
            let msgs = convo.messages;

            // If there is a next conversation in the path (meaning 'convo' is an ancestor)
            if (i < path.length - 1) {
                const nextConvo = path[i + 1];
                if (nextConvo.parentMessageId) {
                    const cutOffIndex = msgs.findIndex(m => m.id === nextConvo.parentMessageId);
                    if (cutOffIndex !== -1) {
                        // Includes the message branched from
                        msgs = msgs.slice(0, cutOffIndex + 1);
                    }
                }
            }
            contextMessages = [...contextMessages, ...msgs];
        }

        // 2. Root Logic: Include descendants context if target is Root
        if (!targetConvo.parentId) {
            const getDescendantContext = (parentId: string): string[] => {
                const parent = conversations[parentId];
                let fragments: string[] = [];

                if (parent.childrenIds) {
                    for (const childId of parent.childrenIds) {
                        const child = conversations[childId];
                        if (child) {
                            if (child.messages.length > 0) {
                                // Format conversation as text
                                const convoText = child.messages
                                    .map(m => `${m.role}: ${m.content}`)
                                    .join('\n');
                                fragments.push(`--- Sub-conversation: ${child.title} ---\n${convoText}`);
                            }
                            fragments = [...fragments, ...getDescendantContext(child.id)];
                        }
                    }
                }
                return fragments;
            };

            const descendantTexts = getDescendantContext(targetConvo.id);
            if (descendantTexts.length > 0) {
                // Add as a 'system' message (or user message if system not supported by UI/API directly in this flow?)
                // Assuming 'system' role is handled or we can fake it. 
                // Let's add it as a System message at the end? Or beginning?
                // Usually context is best at the end or beginning. 
                // Let's put it as a "System Note" at the end of the context so the LLM considers it.
                contextMessages.push({
                    id: 'system-context-descendants',
                    role: 'system' as any, // Cast if 'system' not in Message role union (likely 'user'|'assistant')
                    content: "The following corresponds to sub-conversations that branched off from this main conversation. Use this context if relevant:\n\n" + descendantTexts.join('\n\n'),
                    createdAt: new Date()
                });
            }
        }

        return contextMessages;
    }
}));
