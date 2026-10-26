// Vahlay Sales Agent Peer-to-Peer Chat - Executive Light Theme
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lead } from '../types';
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Plus,
  Send,
  Users,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  Heart,
  Laugh,
  X,
  Building2,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  UserCheck,
  Clock,
  Pin
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  leadTag?: {
    name: string;
    phone: string;
  };
  timestamp: string;
  reactions?: Record<string, number>;
  isMe?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatarText: string;
  avatarColor?: string;
  avatarUrl?: string;
  isGroup?: boolean;
  status: 'online' | 'away' | 'offline';
  timestamp: string;
  lastMessage: string;
  unread?: boolean;
  isFavorite?: boolean;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-divya',
    name: 'I.T. Sales Divya Vahlay',
    avatarText: 'IV',
    avatarColor: 'bg-amber-100 text-amber-800 border-amber-200/80',
    status: 'away',
    timestamp: '18:27',
    lastMessage: 'Shree karni event 90244 9...',
    isFavorite: false
  },
  {
    id: 'conv-piyush',
    name: 'Piyush Gond (You)',
    avatarText: 'PG',
    avatarColor: 'bg-cyan-100 text-cyan-800 border-cyan-200/80',
    status: 'online',
    timestamp: '03:20',
    lastMessage: 'You: Sent a file',
    isFavorite: true
  },
  {
    id: 'conv-girish',
    name: 'GIRISH - VAHLA...',
    avatarText: 'GV',
    avatarColor: 'bg-blue-100 text-blue-800 border-blue-200/80',
    status: 'offline',
    timestamp: '18:19',
    lastMessage: 'You: gd mrng sir',
    isFavorite: false
  },
  {
    id: 'conv-vahlay-sales',
    name: 'VahLay - Sales',
    avatarText: 'VS',
    avatarColor: 'bg-indigo-100 text-indigo-800 border-indigo-200/80',
    isGroup: true,
    status: 'online',
    timestamp: '18:09',
    lastMessage: 'GIRISH - VAHLAy -:...',
    isFavorite: false
  },
  {
    id: 'conv-domestic-sales',
    name: 'Domestic sales',
    avatarText: 'DS',
    avatarColor: 'bg-teal-100 text-teal-800 border-teal-200/80',
    isGroup: true,
    status: 'online',
    timestamp: '16:51',
    lastMessage: 'You: Team, Take a break at...',
    isFavorite: false
  },
  {
    id: 'conv-darshit',
    name: 'Digital_Darshit...',
    avatarText: 'DV',
    avatarColor: 'bg-emerald-100 text-emerald-800 border-emerald-200/80',
    status: 'online',
    timestamp: '16:51',
    lastMessage: 'BREAK?',
    unread: true,
    isFavorite: false
  },
  {
    id: 'conv-seo',
    name: 'SEO Work Updat...',
    avatarText: 'SW',
    avatarColor: 'bg-purple-100 text-purple-800 border-purple-200/80',
    isGroup: true,
    status: 'offline',
    timestamp: '16:40',
    lastMessage: 'Client monthly audit file attached',
    isFavorite: false
  }
];

const INITIAL_MESSAGES_MAP: Record<string, ChatMessage[]> = {
  'conv-divya': [
    {
      id: 'm-div-1',
      senderId: 'divya',
      senderName: 'I.T. Sales Divya Vahlay',
      content: 'cx ko Hi msg ping kar do',
      leadTag: {
        name: 'IMPRESSION The unisex salon',
        phone: '094282 46100'
      },
      timestamp: '18:15',
      reactions: { '👍': 1 },
      isMe: false
    },
    {
      id: 'm-div-2',
      senderId: 'divya',
      senderName: 'I.T. Sales Divya Vahlay',
      content: 'cx ko Hi msg ping kar do',
      leadTag: {
        name: 'Shree karni event',
        phone: '90244 95917'
      },
      timestamp: '18:27',
      reactions: { '👍': 1 },
      isMe: false
    }
  ],
  'conv-domestic-sales': [
    {
      id: 'm-ds-1',
      senderId: 'piyush',
      senderName: 'Piyush Gond',
      content: 'Floor update: We have 40 fresh clinic leads imported into inbound queue.',
      timestamp: '14:20',
      isMe: false
    },
    {
      id: 'm-ds-2',
      senderId: 'me',
      senderName: 'You',
      content: 'Team, Take a break at 5 PM. Good work today on closed proposals!',
      timestamp: '16:51',
      reactions: { '👍': 3 },
      isMe: true
    }
  ],
  'conv-vahlay-sales': [
    {
      id: 'm-vs-1',
      senderId: 'girish',
      senderName: 'Girish Vahlay',
      content: 'Please ensure all clients receive formal quotation with +18% GST terms.',
      timestamp: '18:09',
      isMe: false
    }
  ],
  'conv-girish': [
    {
      id: 'm-g-1',
      senderId: 'me',
      senderName: 'You',
      content: 'gd mrng sir',
      timestamp: '18:19',
      isMe: true
    }
  ],
  'conv-darshit': [
    {
      id: 'm-d-1',
      senderId: 'darshit',
      senderName: 'Digital_Darshit',
      content: 'BREAK?',
      timestamp: '16:51',
      isMe: false
    }
  ]
};

export const AgentChat: React.FC<{ currentPath?: string }> = ({ currentPath = window.location.pathname }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(DEFAULT_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    const requestedConvId = new URLSearchParams(window.location.search).get('convId');
    return requestedConvId && DEFAULT_CONVERSATIONS.some((conversation) => conversation.id === requestedConvId)
      ? requestedConvId
      : 'conv-divya';
  });
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES_MAP);
  const [inputText, setInputText] = useState('');
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [chatsOpen, setChatsOpen] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // CRM Leads state for quick Tag Lead selector
  const [crmLeads, setCrmLeads] = useState<Lead[]>([]);
  const [showAttachLead, setShowAttachLead] = useState(false);
  const [leadClientName, setLeadClientName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const requestedConvId = new URLSearchParams(currentPath.split('?')[1] || '').get('convId');
    if (requestedConvId && DEFAULT_CONVERSATIONS.some((conversation) => conversation.id === requestedConvId)) {
      setActiveConvId(requestedConvId);
    }
  }, [currentPath]);

  // Load CRM leads for autocompletion
  useEffect(() => {
    api.getLeads().then((res) => {
      const list = Array.isArray(res) ? res : res?.leads;
      if (list && list.length > 0) {
        setCrmLeads(list.slice(0, 30));
      }
    }).catch((e) => console.warn('Could not prefetch leads for chat:', e));
  }, []);

  // Load from localStorage & subscribe to Firestore
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vahlay_teams_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setMessagesMap((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached teams chat:', e);
    }

    // Subscribe to Firestore for real-time peer messaging
    try {
      const q = query(
        collection(db, 'agent_teams_messages'),
        orderBy('createdAt', 'asc'),
        limit(200)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            setMessagesMap((prev) => {
              const updated = { ...prev };
              snapshot.docs.forEach((docSnap) => {
                const d = docSnap.data();
                const convId = d.convId || 'conv-divya';
                if (!updated[convId]) updated[convId] = [];
                const exists = updated[convId].some((m) => m.id === docSnap.id);
                if (!exists) {
                  updated[convId].push({
                    id: docSnap.id,
                    senderId: d.senderId,
                    senderName: d.senderName,
                    content: d.content,
                    leadTag: d.leadTag,
                    timestamp: d.timestamp,
                    reactions: d.reactions || {},
                    isMe: d.senderId === currentUser?.id
                  });
                }
              });
              localStorage.setItem('vahlay_teams_messages', JSON.stringify(updated));
              return updated;
            });
          }
        },
        (err) => {
          console.warn('Teams firestore subscription fallback:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  }, [currentUser]);

  // Scroll to bottom on conversation change or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, messagesMap]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeMessages = messagesMap[activeConvId] || [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text && !leadClientName) return;

    const currentTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'You',
      content: text,
      leadTag:
        leadClientName && leadPhone
          ? {
              name: leadClientName.trim(),
              phone: leadPhone.trim()
            }
          : undefined,
      timestamp: currentTime,
      reactions: {},
      isMe: true
    };

    const nextMessages = {
      ...messagesMap,
      [activeConvId]: [...(messagesMap[activeConvId] || []), newMsg]
    };
    setMessagesMap(nextMessages);
    localStorage.setItem('vahlay_teams_messages', JSON.stringify(nextMessages));

    // Update conversation snippet in left list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: text || `${leadClientName} ${leadPhone}`,
              timestamp: currentTime
            }
          : c
      )
    );

    setInputText('');
    setLeadClientName('');
    setLeadPhone('');
    setShowAttachLead(false);
    setShowEmojiPicker(false);

    // Sync to Firestore
    try {
      await addDoc(collection(db, 'agent_teams_messages'), {
        convId: activeConvId,
        senderId: currentUser?.id || 'me',
        senderName: currentUser?.name || 'Sales Agent',
        content: newMsg.content,
        leadTag: newMsg.leadTag || null,
        timestamp: currentTime,
        reactions: {},
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Cloud write skipped:', err);
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessagesMap((prev) => {
      const convList = prev[activeConvId] || [];
      const updatedList = convList.map((m) => {
        if (m.id === msgId) {
          const currentReactions = { ...(m.reactions || {}) };
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          return { ...m, reactions: currentReactions };
        }
        return m;
      });
      const updatedMap = { ...prev, [activeConvId]: updatedList };
      localStorage.setItem('vahlay_teams_messages', JSON.stringify(updatedMap));
      return updatedMap;
    });
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPhone(text);
      setTimeout(() => setCopiedPhone(null), 2500);
    }
  };

  const getCleanWhatsAppUrl = (phone: string, clientName?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const greeting = clientName ? `Namaste ${clientName} ji, greetings from Vahlay Digital!` : 'Namaste, greetings from Vahlay Digital!';
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(greeting)}`;
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const favorites = filteredConversations.filter((c) => c.isFavorite);
  const generalChats = filteredConversations.filter((c) => !c.isFavorite);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white text-slate-800 font-sans antialiased animate-in fade-in duration-150">
      {/* ========================================================================= */}
      {/* ── LEFT PANEL: Chat List (Clean Light Theme) ─────────────────────────── */}
      {/* ========================================================================= */}
      <div
        className={`${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-84 shrink-0 bg-white border-r border-slate-200/90 flex-col select-none h-full min-h-0 shadow-[1px_0_8px_rgba(0,0,0,0.02)]`}
      >
        {/* Header & Search Bar for Agents */}
        <div className="p-3.5 border-b border-slate-100 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Agent Team Chat</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-[#008F9B] border border-cyan-200/60">
              Live Network
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agents or groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-900 placeholder-slate-400 pl-8 pr-7 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 space-y-3">
          {/* Favourites Section */}
          {favorites.length > 0 && (
            <div>
              <button
                onClick={() => setFavoritesOpen(!favoritesOpen)}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider transition cursor-pointer"
              >
                {favoritesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span>Favourites</span>
                <span className="text-[10px] text-slate-400 ml-auto font-mono">({favorites.length})</span>
              </button>

              {favoritesOpen && (
                <div className="mt-1 space-y-1">
                  {favorites.map((conv) => renderConvItem(conv))}
                </div>
              )}
            </div>
          )}

          {/* Chats Section */}
          <div>
            <button
              onClick={() => setChatsOpen(!chatsOpen)}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider transition cursor-pointer"
            >
              {chatsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Direct & Channels</span>
              <span className="text-[10px] text-slate-400 ml-auto font-mono">({generalChats.length})</span>
            </button>

            {chatsOpen && (
              <div className="mt-1 space-y-1">
                {generalChats.map((conv) => renderConvItem(conv))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ── RIGHT PANEL: Conversation View (Clean Light Theme) ─────────────────── */}
      {/* ========================================================================= */}
      <div
        className={`${
          mobileShowChat ? 'flex' : 'hidden md:flex'
        } flex-1 bg-[#F8FAFC] flex-col min-w-0 h-full min-h-0`}
      >
        {/* ── Active Conversation Top Bar ── */}
        <div className="h-16 px-4 sm:px-6 border-b border-slate-200/90 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={() => setMobileShowChat(false)}
              className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Back to chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Contact Avatar */}
            <div className="relative shrink-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center font-bold text-xs shadow-2xs ${
                  activeConv.avatarColor || 'bg-cyan-50 border-cyan-200 text-cyan-800'
                }`}
              >
                {activeConv.isGroup ? <Users className="w-4 h-4 text-indigo-600" /> : activeConv.avatarText}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  activeConv.status === 'online'
                    ? 'bg-emerald-500'
                    : activeConv.status === 'away'
                      ? 'bg-amber-400'
                      : 'bg-slate-300'
                }`}
              />
            </div>

            {/* Contact Name & Status */}
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-900 truncate flex items-center gap-2">
                <span>{activeConv.name}</span>
                {activeConv.isGroup && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Group Channel
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeConv.status === 'online'
                      ? 'bg-emerald-500'
                      : activeConv.status === 'away'
                        ? 'bg-amber-400'
                        : 'bg-slate-300'
                  }`}
                />
                <span>
                  {activeConv.status === 'online'
                    ? 'Active now • Inside Sales'
                    : activeConv.status === 'away'
                      ? 'Away from desk'
                      : 'Offline'}
                </span>
              </p>
            </div>
          </div>

          {/* Right Header Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAttachLead(!showAttachLead)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-[#008F9B] text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Lead</span>
            </button>
          </div>
        </div>

        {/* ── Messages Feed (Light & Crisp) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC]">
          {/* Date / Last Read separator */}
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <div className="relative px-3.5 py-1 bg-white border border-slate-200/90 rounded-full text-[11px] font-semibold text-slate-500 shadow-2xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4]" />
              <span className="text-slate-700 font-bold">Last read</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Today 18:27</span>
            </div>
          </div>

          {activeMessages.map((msg) => {
            const isMe = msg.isMe;

            return (
              <div
                key={msg.id}
                className={`group relative flex items-start gap-3 ${
                  isMe ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border ${
                    isMe
                      ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {isMe ? 'You' : msg.senderName.slice(0, 2).toUpperCase()}
                </div>

                {/* Message Content Container */}
                <div className="max-w-[85%] sm:max-w-md md:max-w-xl space-y-1.5">
                  {/* Clean Light Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 space-y-2.5 transition-all relative ${
                      isMe
                        ? 'bg-gradient-to-br from-[#00BCD4] to-[#0097A7] text-white rounded-tr-xs shadow-sm'
                        : 'bg-white border border-slate-200/90 rounded-tl-xs text-slate-800 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {!isMe && (
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#008F9B] border-b border-slate-100 pb-1.5 mb-1">
                        <span>{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Attached Lead / Client Card Box (Exact Match to user requirement, light theme) */}
                    {msg.leadTag && (
                      <div
                        className={`rounded-xl p-3 border transition-all ${
                          isMe
                            ? 'bg-white/15 backdrop-blur-xs border-white/30 text-white'
                            : 'bg-gradient-to-r from-cyan-50/90 via-teal-50/60 to-slate-50 border-cyan-200/80 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 className={`w-3.5 h-3.5 ${isMe ? 'text-white' : 'text-[#00BCD4]'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                              Lead Tagged
                            </span>
                          </div>

                          {/* Fast Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(msg.leadTag!.phone)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition active:scale-95 cursor-pointer ${
                                isMe
                                  ? 'bg-white/20 hover:bg-white/30 text-white'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
                              }`}
                              title="Copy phone"
                            >
                              {copiedPhone === msg.leadTag.phone ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            <a
                              href={getCleanWhatsAppUrl(msg.leadTag.phone, msg.leadTag.name)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                              title="Direct WhatsApp message to client"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp CX</span>
                            </a>
                          </div>
                        </div>

                        {/* Client details row */}
                        <div className="flex items-center flex-wrap gap-2 text-xs">
                          <span className={`font-bold tracking-tight ${isMe ? 'text-white' : 'text-slate-900'}`}>
                            {msg.leadTag.name}
                          </span>
                          <span className={`${isMe ? 'text-white/60' : 'text-slate-300'}`}>|</span>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                              isMe
                                ? 'bg-black/20 text-cyan-100'
                                : 'bg-white text-[#008F9B] border border-cyan-200/80 shadow-2xs'
                            }`}
                          >
                            📞 {msg.leadTag.phone}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message Text */}
                    {msg.content && (
                      <div
                        className={`text-xs leading-relaxed ${
                          isMe ? 'text-white font-normal' : 'text-slate-800 font-normal'
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}

                    {/* Reactions Pill Row */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      {msg.reactions &&
                        Object.entries(msg.reactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition active:scale-95 ${
                              isMe
                                ? 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 shadow-2xs'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-bold opacity-80">{count}</span>
                          </button>
                        ))}

                      <button
                        onClick={() => handleAddReaction(msg.id, '👍')}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] cursor-pointer transition active:scale-95 ${
                          isMe
                            ? 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                        title="Add reaction"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Timestamp for own messages */}
                  {isMe && (
                    <div className="text-[10px] text-slate-400 font-mono text-right pr-1">
                      {msg.timestamp} • Sent
                    </div>
                  )}
                </div>

                {/* Hover Emoji Reaction Bar */}
                <div
                  className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3.5 ${
                    isMe ? 'left-10' : 'right-10'
                  } bg-white border border-slate-200 rounded-full px-2 py-1 flex items-center gap-1.5 shadow-lg z-10 animate-in fade-in`}
                >
                  <button
                    onClick={() => handleAddReaction(msg.id, '👍')}
                    className="hover:scale-125 transition text-xs cursor-pointer p-0.5"
                    title="Thumbs Up"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleAddReaction(msg.id, '❤️')}
                    className="hover:scale-125 transition text-xs cursor-pointer p-0.5"
                    title="Heart"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => handleAddReaction(msg.id, '😆')}
                    className="hover:scale-125 transition text-xs cursor-pointer p-0.5"
                    title="Laugh"
                  >
                    😆
                  </button>
                  <button
                    onClick={() => handleAddReaction(msg.id, '😮')}
                    className="hover:scale-125 transition text-xs cursor-pointer p-0.5"
                    title="Surprised"
                  >
                    😮
                  </button>
                  <button
                    onClick={() => handleAddReaction(msg.id, '🔥')}
                    className="hover:scale-125 transition text-xs cursor-pointer p-0.5"
                    title="Fire"
                  >
                    🔥
                  </button>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Lead Attachment Drawer / Modal (Light Theme with CRM quick select) ── */}
        {showAttachLead && (
          <div className="p-3.5 bg-gradient-to-r from-cyan-50/90 via-blue-50/60 to-white border-t border-cyan-200/80 animate-in fade-in shrink-0 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#008F9B] font-bold">
                <Building2 className="w-4 h-4 text-[#00BCD4]" />
                <span>Tag a Client Lead into Message:</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachLead(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Business / Client Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shree karni event"
                  value={leadClientName}
                  onChange={(e) => setLeadClientName(e.target.value)}
                  list="crm-leads-suggestions"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/10 shadow-2xs"
                />
                <datalist id="crm-leads-suggestions">
                  {crmLeads.map((l) => (
                    <option key={l.id} value={l.businessName}>
                      {l.phone} - {l.contactPerson}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Client Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 90244 95917"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/10 shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Pick Pills from CRM Leads */}
            {crmLeads.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Pick:</span>
                {crmLeads.slice(0, 4).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setLeadClientName(l.businessName);
                      setLeadPhone(l.phone);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-[11px] font-semibold text-slate-700 hover:text-cyan-800 transition whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    <span>{l.businessName}</span>
                    <span className="font-mono text-[10px] text-slate-400">({l.phone.slice(-5)})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOTTOM INPUT BOX (Clean Modern Light Theme) ── */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 shrink-0 shadow-[0_-2px_15px_rgba(0,0,0,0.02)]">
          <form
            onSubmit={handleSendMessage}
            className="rounded-2xl bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white border border-slate-200/90 focus-within:border-[#00BCD4] focus-within:ring-2 focus-within:ring-[#00BCD4]/10 p-3 transition-all shadow-2xs"
          >
            {/* Tagged Lead Chip if selected */}
            {leadClientName && (
              <div className="mb-2.5 flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                <div className="flex items-center gap-2 truncate mr-2">
                  <Building2 className="w-3.5 h-3.5 text-[#00BCD4] shrink-0" />
                  <span className="text-slate-900 font-bold truncate">{leadClientName}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[#008F9B] font-mono font-bold">{leadPhone || 'No Phone'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLeadClientName('');
                    setLeadPhone('');
                  }}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer shrink-0"
                  title="Remove lead tag"
                >
                  ✕
                </button>
              </div>
            )}

            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage(e);
                }
              }}
              placeholder="Type a message to peer agents... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none leading-relaxed"
            />

            {/* Quick Emoji Picker Strip (Optional toggle) */}
            {showEmojiPicker && (
              <div className="py-1.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-base">
                {['👍', '❤️', '🔥', '👏', '😂', '🎉', '🤝', '🚀', '💯'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                    }}
                    className="hover:scale-125 transition cursor-pointer p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-slate-500">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowAttachLead(!showAttachLead)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100/90 border border-cyan-200 text-[#008F9B] text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
                  title="Tag client lead into message"
                >
                  <Plus className="w-3.5 h-3.5 text-[#00BCD4]" />
                  <span>Tag Lead</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg cursor-pointer transition"
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setInputText((prev) => prev + (prev ? ' ' : '') + 'cx ko Hi msg ping kar do')}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-600 transition cursor-pointer"
                  title="Quick reply template"
                >
                  <span>Quick: "cx ko Hi msg..."</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() && !leadClientName}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer ${
                  inputText.trim() || leadClientName
                    ? 'bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white hover:from-[#00acc1] hover:to-[#00838f]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Helper render conversation item in left panel
  function renderConvItem(conv: Conversation) {
    const isSelected = conv.id === activeConvId;

    return (
      <div
        key={conv.id}
        onClick={() => {
          setActiveConvId(conv.id);
          setMobileShowChat(true);
        }}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-cyan-50/90 via-blue-50/40 to-white text-slate-900 border border-cyan-200/90 shadow-2xs ring-1 ring-cyan-500/10'
            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
        }`}
      >
        {/* Active Pill Indicator on left border */}
        {isSelected && (
          <span className="w-1 h-7 rounded-full bg-[#00BCD4] absolute -left-1" />
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shadow-2xs ${
              conv.avatarColor || 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {conv.isGroup ? <Users className="w-4 h-4 text-indigo-600" /> : conv.avatarText}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
              conv.status === 'online'
                ? 'bg-emerald-500'
                : conv.status === 'away'
                  ? 'bg-amber-400'
                  : 'bg-slate-300'
            }`}
          />
        </div>

        {/* Name & snippet */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs truncate ${isSelected ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
              {conv.name}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
              {conv.timestamp}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
        </div>

        {/* Unread badge */}
        {conv.unread && (
          <span className="w-2 h-2 rounded-full bg-[#00BCD4] shrink-0 ml-1" />
        )}
      </div>
    );
  }
};
