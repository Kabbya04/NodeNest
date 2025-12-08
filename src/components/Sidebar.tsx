import React, { useState } from 'react';
import { Plus, MessageSquare, Clock, Trash2, Moon, Sun, User, Settings, LogOut } from 'lucide-react';
import { useConversationStore } from '../store/conversationStore';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface SidebarProps {
    onToggleTheme: () => void;
    isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onToggleTheme, isDark }) => {
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        createRootConversation
    } = useConversationStore();

    const { user, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const conversationList = Object.values(conversations)
        .filter(c => !c.parentId) // Only show root conversations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <aside className="w-64 border-r border-border bg-muted/30 flex flex-col h-full">
            {/* Logo Area */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">NN</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Node Nest
                        </h1>
                    </div>
                </div>

                {/* New Chat Button */}
                <button
                    onClick={createRootConversation}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    New Chat
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground px-2 mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    RECENT CHATS
                </div>

                {conversationList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    conversationList.map((convo) => (
                        <button
                            key={convo.id}
                            onClick={() => setActiveConversation(convo.id)}
                            className={cn(
                                "w-full text-left px-3 py-3 rounded-lg transition-all group relative",
                                activeConversationId === convo.id
                                    ? "bg-background shadow-sm border border-border"
                                    : "hover:bg-background/50"
                            )}
                        >
                            <div className="flex items-start gap-2">
                                <MessageSquare className={cn(
                                    "w-4 h-4 mt-0.5 shrink-0",
                                    activeConversationId === convo.id ? "text-indigo-600" : "text-muted-foreground"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-medium truncate",
                                        activeConversationId === convo.id ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {convo.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {convo.messages.length} messages
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Add delete functionality
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                                >
                                    <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                                </button>
                            </div>

                            {/* Sub-conversation indicator */}
                            {convo.childrenIds.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                    {convo.childrenIds.length} branch{convo.childrenIds.length > 1 ? 'es' : ''}
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>

            {/* Bottom Section */}
            <div className="p-3 border-t border-border space-y-2">
                {/* Theme Toggle */}
                <button
                    onClick={onToggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>

                {/* User Profile */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background/50 transition-colors"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium truncate flex-1 text-left">
                                {user.email?.split('@')[0]}
                            </span>
                        </button>

                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute bottom-full left-0 w-full mb-2 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                                    <div className="px-4 py-2 border-b border-border">
                                        <p className="text-xs font-medium truncate">{user.email}</p>
                                    </div>
                                    <button className="w-full px-4 py-2 text-left text-xs hover:bg-secondary flex items-center gap-2">
                                        <Settings className="w-3 h-3" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full px-4 py-2 text-left text-xs hover:bg-secondary flex items-center gap-2 text-red-600 dark:text-red-400"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};
