import React, { useEffect, useState } from 'react';
import { useConversationStore } from './store/conversationStore';
import { ChatWindow } from './components/ChatWindow';
import { ConversationTabs } from './components/ConversationTabs';
import { ConversationGraph } from './components/ConversationGraph';
import { ModelSelector } from './components/ModelSelector';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { useAuth } from './hooks/useAuth';
import { MessageSquare, GitGraph } from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { createRootConversation, conversations } = useConversationStore();
  const [viewMode, setViewMode] = useState<'chat' | 'graph'>('chat');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user is authenticated or in guest mode
    if (user || isAuthenticated) {
      // Initialize with a root conversation if none exists
      if (Object.keys(conversations).length === 0) {
        createRootConversation();
      }
    }
  }, [user, isAuthenticated, createRootConversation, conversations]);

  useEffect(() => {
    // Apply theme
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar onToggleTheme={() => setIsDark(!isDark)} isDark={isDark} />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* View Toggle & Tabs */}
          <div className="border-b border-border bg-background">
            <div className="flex items-center justify-between px-4 py-2">
              {/* Tabs for sub-conversations */}
              <div className="flex-1 min-w-0">
                <ConversationTabs />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 ml-4 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setViewMode('chat')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    viewMode === 'chat'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    viewMode === 'graph'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <GitGraph className="w-4 h-4" />
                  Graph
                </button>
                <ModelSelector />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0">
            {viewMode === 'chat' ? <ChatWindow /> : <ConversationGraph />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
