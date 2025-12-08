import React from 'react';
import { useConversationStore } from '../store/conversationStore';
import { cn } from '../lib/utils';
import { GitBranch } from 'lucide-react';

export const ConversationTabs: React.FC = () => {
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        getRootId
    } = useConversationStore();

    const activeRootId = getRootId(activeConversationId);

    // Filter to only show conversations in the current tree (sharing the same root)
    const conversationList = Object.values(conversations)
        .filter(c => getRootId(c.id) === activeRootId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return (
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-secondary/50 border-b no-scrollbar">
            {conversationList.map((convo) => (
                <button
                    key={convo.id}
                    onClick={() => setActiveConversation(convo.id)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden group",
                        "max-w-[150px] hover:max-w-[400px]",
                        activeConversationId === convo.id
                            ? "bg-background shadow-sm text-foreground"
                            : "hover:bg-background/50 text-muted-foreground"
                    )}
                >
                    <GitBranch className="w-3 h-3 shrink-0" />
                    <span className="truncate group-hover:text-clip">{convo.title}</span>
                </button>
            ))}
        </div>
    );
};
