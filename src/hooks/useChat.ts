import { useState, useCallback } from 'react';
import { useModelStore } from '../store/modelStore';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
}

export const useChat = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { selectedModel } = useModelStore();

    const sendMessage = useCallback(async (messages: Message[], onChunk?: (chunk: string) => void) => {
        setIsLoading(true);
        try {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            if (!apiKey) {
                throw new Error('VITE_GROQ_API_KEY is not set');
            }

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    model: selectedModel,
                    stream: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || 'Failed to get response from Groq');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const content = data.choices[0]?.delta?.content || '';
                                if (content && onChunk) {
                                    onChunk(content);
                                }
                            } catch (e) {
                                console.warn('Error parsing SSE message:', e);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [selectedModel]);

    return { sendMessage, isLoading };
};
