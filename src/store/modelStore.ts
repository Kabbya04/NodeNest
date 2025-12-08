import { create } from 'zustand';

interface ModelState {
    selectedModel: string;
    availableModels: string[];
    setModel: (model: string) => void;
}

export const useModelStore = create<ModelState>((set) => ({
    selectedModel: 'openai/gpt-oss-120b',
    availableModels: [
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
    ],
    setModel: (model) => set({ selectedModel: model }),
}));
