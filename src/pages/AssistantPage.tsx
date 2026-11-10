import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Plus, 
  User
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const AssistantPage: React.FC = () => {
  const { 
    conversations, 
    projects, 
    sendAssistantMessage, 
    createConversation 
  } = useWorkspace();

  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProjectContext, setSelectedProjectContext] = useState<string>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    if (activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    setInputText('');
    setIsTyping(true);

    try {
      await sendAssistantMessage(activeConversation.id, text);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = () => {
    const newId = createConversation('Project Inquiry');
    setActiveConversationId(newId);
  };

  const suggestedQuestions = [
    'What is the current status of the Acme project?',
    'What tasks are blocked?',
    'What did Marcus decide about the architecture?',
    'Summarise yesterday\'s meeting',
    'What has Devon completed?',
    'Which pull requests are waiting for approval?',
    'What should our AI team work on next?'
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* =========================================================================
          LEFT PANEL: CONVERSATION HISTORY
         ========================================================================= */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0 hidden md:flex">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-xs text-charcoal-900">Conversations</span>
          </div>
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConversation?.id;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-purple-50 text-charcoal-900 font-medium border border-purple-200/60'
                    : 'text-charcoal-600 hover:bg-slate-50 hover:text-charcoal-900'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold truncate text-charcoal-900">
                    {conv.title}
                  </span>
                  <span className="text-[10px] text-charcoal-400 shrink-0 font-mono">
                    {conv.updatedAt}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-500 truncate mt-1">
                  {conv.lastMessage}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 text-[11px] text-charcoal-500 bg-slate-50/50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Deterministic Context Engine (Ready for Claude 3.5 Sonnet / OpenAI API)</span>
        </div>
      </div>

      {/* =========================================================================
          MAIN CHAT AREA
         ========================================================================= */}
      <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
        {/* Top Context Bar */}
        <div className="h-12 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-purple-50 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-charcoal-900">
                {activeConversation?.title || 'AI Assistant'}
              </h2>
              <span className="text-[10px] text-charcoal-500 block">
                Live context on tasks, agents, code diffs & meetings
              </span>
            </div>
          </div>

          {/* Project Context Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-charcoal-500 text-[11px] hidden sm:inline">Project Scope:</span>
            <select
              value={selectedProjectContext}
              onChange={(e) => setSelectedProjectContext(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-charcoal-800 text-xs font-medium focus:outline-none focus:border-primary shadow-xs"
            >
              <option value="all">All Projects & Workspaces</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
          {activeConversation?.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-charcoal-800 text-white'
                      : 'bg-primary text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-charcoal-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-charcoal-900 shadow-card rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1 mb-1">
                    <span className="font-semibold text-[11px] opacity-80">
                      {isUser ? 'Sarah Chen (You)' : 'FORGE AI Assistant'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Render content */}
                  <div className="prose prose-xs max-w-none whitespace-pre-line font-sans">
                    {msg.text}
                  </div>

                  {/* Suggested follow ups */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 mt-2 space-y-1.5">
                      <span className="text-[10px] font-semibold text-charcoal-400 block uppercase">
                        Suggested Follow-ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(suggestion)}
                            className="text-[11px] text-primary hover:text-primary-hover bg-purple-50 hover:bg-purple-100/70 border border-purple-200/80 px-2.5 py-1 rounded-lg transition-colors text-left"
                          >
                            {suggestion} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-charcoal-500 shadow-card flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>FORGE AI is analyzing workspace context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips Bar */}
        <div className="px-4 py-2 bg-white border-t border-slate-200/60 overflow-x-auto no-scrollbar flex items-center gap-2 max-w-4xl w-full mx-auto">
          <span className="text-[11px] font-semibold text-charcoal-400 shrink-0">Try asking:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] text-charcoal-700 hover:text-primary bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-full px-3 py-1 whitespace-nowrap transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 max-w-4xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs"
          >
            <input
              type="text"
              placeholder="Ask anything about your projects, blockers, architecture, or team activity..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-transparent text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-[10px] text-charcoal-400 text-center mt-2">
            Contextual mock intelligence engine. Connect real Claude 3.5 or OpenAI API key in Settings when ready.
          </div>
        </div>
      </div>
    </div>
  );
};
