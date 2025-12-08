import React from 'react';
import { useModelStore } from '../store/modelStore';
import { Cpu, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const ModelSelector: React.FC = () => {
    const { selectedModel, availableModels, setModel } = useModelStore();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 hover:bg-secondary"
                title="Select Model"
            >
                <Cpu className="w-4 h-4" />
                <span className="hidden sm:inline">Model</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-border bg-muted/50">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                Select AI Model
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Choose the model for your conversation
                            </p>
                        </div>
                        <div className="p-2 max-h-80 overflow-y-auto">
                            {availableModels.map((model) => (
                                <button
                                    key={model}
                                    onClick={() => {
                                        setModel(model);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm flex items-center justify-between group",
                                        selectedModel === model
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                                            : "hover:bg-secondary"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{model}</p>
                                        <p className={cn(
                                            "text-xs mt-0.5",
                                            selectedModel === model ? "text-white/80" : "text-muted-foreground"
                                        )}>
                                            {model.includes('120b') ? 'Most Powerful' :
                                                model.includes('70b') ? 'Balanced' :
                                                    model.includes('20b') ? 'Fast' : 'Quick Responses'}
                                        </p>
                                    </div>
                                    {selectedModel === model && (
                                        <Check className="w-5 h-5 shrink-0 ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="p-3 border-t border-border bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                                💡 Larger models provide better quality but may be slower
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
