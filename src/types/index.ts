export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
    parentId?: string;
    selectedContext?: string;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    parentId?: string;
    parentMessageId?: string;
    childrenIds: string[];
    createdAt: Date;
}

export interface ConversationNode {
    id: string;
    type: 'conversation';
    data: { label: string; conversationId: string };
    position: { x: number; y: number };
}

export interface ConversationEdge {
    id: string;
    source: string;
    target: string;
}
