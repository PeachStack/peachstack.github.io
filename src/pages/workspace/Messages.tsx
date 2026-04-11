import { useEffect, useState, useRef, useCallback } from 'react';
import { apiUrl } from '../../lib/api';
import { Send, MessageSquarePlus, X, ChevronDown, ArrowLeft, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface Contact { id: string; name: string; email: string; role: string; }
interface Conversation { other_user_id: string; other_user_name: string; other_user_role: string; last_message_at: string; unread_count: number; last_message: string; }
interface Message { id: string; sender_id: string; recipient_id: string; subject?: string; body: string; read: number; created_at: string; sender_name: string; }
interface Group { id: string; name: string; description?: string; role_filter?: string; member_count: number; last_message?: string; last_message_at?: string; unread_count: number; }
interface GroupMessage { id: string; group_id: string; sender_id: string; sender_name: string; body: string; created_at: string; }

type ActiveThread = { type: 'dm'; userId: string } | { type: 'group'; groupId: string } | null;

export default function WorkspaceMessages() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeThread, setActiveThread] = useState<ActiveThread>(null);
  const [dmThread, setDmThread] = useState<Message[]>([]);
  const [groupThread, setGroupThread] = useState<GroupMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [compose, setCompose] = useState(false);
  const [newMsg, setNewMsg] = useState({ recipient_id: '', subject: '', body: '' });
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(() => {
    fetch(apiUrl('/api/messages/conversations'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setConversations(Array.isArray(data) ? data : []));
  }, []);

  const loadGroups = useCallback(() => {
    fetch(apiUrl('/api/messages/groups'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setGroups(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetch(apiUrl('/api/me'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setCurrentUserId(data.user.id); });
    fetch(apiUrl('/api/messages/contacts'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setContacts(Array.isArray(data) ? data : []));
    loadConversations();
    loadGroups();
    const interval = setInterval(() => { loadConversations(); loadGroups(); }, 30000);
    return () => clearInterval(interval);
  }, [loadConversations, loadGroups]);

  // Load DM thread
  useEffect(() => {
    if (activeThread?.type !== 'dm') return;
    fetch(apiUrl(`/api/messages/thread/${activeThread.userId}`), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setDmThread(Array.isArray(data) ? data : []);
        data.filter((m: Message) => m.recipient_id === currentUserId && !m.read)
          .forEach((m: Message) => fetch(apiUrl(`/api/messages/${m.id}/read`), { method: 'PATCH', credentials: 'include' }));
      });
  }, [activeThread, currentUserId]);

  // Load group thread
  useEffect(() => {
    if (activeThread?.type !== 'group') return;
    fetch(apiUrl(`/api/messages/groups/${activeThread.groupId}`), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setGroupThread(Array.isArray(data) ? data : []);
        fetch(apiUrl(`/api/messages/groups/${activeThread.groupId}/read`), { method: 'PATCH', credentials: 'include' });
        loadGroups();
      });
  }, [activeThread, loadGroups]);

  useEffect(() => { threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [dmThread, groupThread]);

  const openDm = (userId: string) => { setActiveThread({ type: 'dm', userId }); setCompose(false); setMobileView('thread'); };
  const openGroup = (groupId: string) => { setActiveThread({ type: 'group', groupId }); setCompose(false); setMobileView('thread'); };

  const sendReply = async () => {
    if (!replyBody.trim() || !activeThread) return;
    setSending(true);
    if (activeThread.type === 'dm') {
      await fetch(apiUrl('/api/messages/send'), {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: activeThread.userId, body: replyBody }),
      });
      setReplyBody(''); setSending(false);
      const data = await fetch(apiUrl(`/api/messages/thread/${activeThread.userId}`), { credentials: 'include' }).then(r => r.json());
      setDmThread(Array.isArray(data) ? data : []);
      loadConversations();
    } else {
      await fetch(apiUrl(`/api/messages/groups/${activeThread.groupId}/send`), {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyBody }),
      });
      setReplyBody(''); setSending(false);
      const data = await fetch(apiUrl(`/api/messages/groups/${activeThread.groupId}`), { credentials: 'include' }).then(r => r.json());
      setGroupThread(Array.isArray(data) ? data : []);
      loadGroups();
    }
  };

  const sendNewMessage = async () => {
    if (!newMsg.recipient_id || !newMsg.body.trim()) return;
    setSending(true);
    await fetch(apiUrl('/api/messages/send'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    });
    const recipId = newMsg.recipient_id;
    setNewMsg({ recipient_id: '', subject: '', body: '' });
    setCompose(false); setSending(false);
    openDm(recipId); loadConversations();
  };

  const activeContact = activeThread?.type === 'dm'
    ? (contacts.find(c => c.id === activeThread.userId) || conversations.find(c => c.other_user_id === activeThread.userId))
    : null;
  const activeContactName = activeContact ? ('name' in activeContact ? activeContact.name : (activeContact as Conversation).other_user_name) : '';
  const activeContactRole = activeContact ? ('role' in activeContact ? activeContact.role : (activeContact as Conversation).other_user_role) : '';
  const activeGroup = activeThread?.type === 'group' ? groups.find(g => g.id === activeThread.groupId) : null;

  const showLeft = mobileView === 'list' || (!activeThread && !compose);
  const showRight = mobileView === 'thread' || activeThread || compose;

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/workspace" className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-slate-700 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Messages</h1>
              <p className="text-slate-500 text-sm">Internal messaging</p>
            </div>
          </div>
          <button onClick={() => { setCompose(true); setActiveThread(null); setMobileView('thread'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors">
            <MessageSquarePlus size={16} />New
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[520px]">
          {/* Left: Conversations + Groups */}
          <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden", !showLeft && "hidden lg:flex")}>
            <div className="flex-1 overflow-y-auto">
              {/* Direct Messages */}
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 sticky top-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct Messages</p>
              </div>
              {conversations.length === 0 ? (
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-400">No conversations yet</p>
                  <button onClick={() => { setCompose(true); setMobileView('thread'); }} className="mt-1 text-xs font-bold text-peach-500 hover:underline">Start a conversation</button>
                </div>
              ) : conversations.map(conv => (
                <button
                  key={conv.other_user_id}
                  onClick={() => openDm(conv.other_user_id)}
                  className={cn("w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors", activeThread?.type === 'dm' && activeThread.userId === conv.other_user_id && "bg-peach-50 border-peach-100")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">{conv.other_user_name?.[0] || '?'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn("text-sm font-semibold text-slate-900 truncate", conv.unread_count > 0 && "font-bold")}>{conv.other_user_name}</span>
                        {conv.unread_count > 0 && <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{conv.unread_count}</span>}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                  </div>
                </button>
              ))}

              {/* Group Chats */}
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 sticky top-0 mt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Group Chats</p>
              </div>
              {groups.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-400">No group chats yet</div>
              ) : groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => openGroup(group.id)}
                  className={cn("w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors", activeThread?.type === 'group' && activeThread.groupId === group.id && "bg-peach-50 border-peach-100")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-600 flex items-center justify-center shrink-0"><Users size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn("text-sm font-semibold text-slate-900 truncate", group.unread_count > 0 && "font-bold")}>{group.name}</span>
                        {group.unread_count > 0 && <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{group.unread_count}</span>}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{group.last_message || `${group.member_count} members`}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Thread or Compose */}
          <div className={cn("lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden", !showRight && "hidden lg:flex")}>
            {compose ? (
              <div className="flex-1 flex flex-col p-6 gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setCompose(false); setMobileView('list'); }} className="p-1 text-slate-400 hover:text-slate-700 lg:hidden"><ArrowLeft size={18} /></button>
                  <h3 className="font-bold text-slate-900 flex-1">New Message</h3>
                  <button onClick={() => { setCompose(false); setMobileView('list'); }} className="p-1 text-slate-400 hover:text-slate-700 hidden lg:block"><X size={18} /></button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">To</label>
                  <div className="relative">
                    <select value={newMsg.recipient_id} onChange={e => setNewMsg(p => ({ ...p, recipient_id: e.target.value }))} className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white">
                      <option value="">Select recipient...</option>
                      {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject (optional)</label>
                  <input value={newMsg.subject} onChange={e => setNewMsg(p => ({ ...p, subject: e.target.value }))} placeholder="Subject..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                  <textarea value={newMsg.body} onChange={e => setNewMsg(p => ({ ...p, body: e.target.value }))} rows={6} placeholder="Write your message..." className="w-full h-full min-h-[150px] px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" />
                </div>
                <button onClick={sendNewMessage} disabled={!newMsg.recipient_id || !newMsg.body.trim() || sending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors disabled:opacity-50 self-end">
                  <Send size={16} />{sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            ) : activeThread?.type === 'dm' ? (
              <>
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <button onClick={() => { setActiveThread(null); setMobileView('list'); }} className="p-1 text-slate-400 hover:text-slate-700 lg:hidden"><ArrowLeft size={18} /></button>
                  <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">{activeContactName?.[0] || '?'}</div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{activeContactName}</p>
                    <p className="text-xs text-slate-400 capitalize">{activeContactRole}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {dmThread.map(msg => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[75%] px-4 py-3 rounded-2xl text-sm", isMine ? "bg-peach-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm")}>
                          {msg.subject && <p className={cn("text-xs font-bold mb-1", isMine ? "text-peach-100" : "text-slate-500")}>{msg.subject}</p>}
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          <p className={cn("text-[10px] mt-1.5", isMine ? "text-peach-200" : "text-slate-400")}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(msg.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex gap-2">
                  <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }} rows={2} placeholder="Write a reply... (Enter to send)" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" />
                  <button onClick={sendReply} disabled={!replyBody.trim() || sending} className="px-4 py-2 rounded-xl bg-peach-500 text-white hover:bg-peach-600 transition-colors disabled:opacity-50 self-end"><Send size={18} /></button>
                </div>
              </>
            ) : activeThread?.type === 'group' ? (
              <>
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <button onClick={() => { setActiveThread(null); setMobileView('list'); }} className="p-1 text-slate-400 hover:text-slate-700 lg:hidden"><ArrowLeft size={18} /></button>
                  <div className="h-9 w-9 rounded-full bg-peach-100 text-peach-600 flex items-center justify-center"><Users size={16} /></div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{activeGroup?.name}</p>
                    <p className="text-xs text-slate-400">{activeGroup?.member_count} members</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {groupThread.map(msg => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[75%] px-4 py-3 rounded-2xl text-sm", isMine ? "bg-peach-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm")}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          <p className={cn("text-[10px] mt-1.5", isMine ? "text-peach-200" : "text-slate-400")}>{msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(msg.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex gap-2">
                  <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }} rows={2} placeholder="Write a message... (Enter to send)" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" />
                  <button onClick={sendReply} disabled={!replyBody.trim() || sending} className="px-4 py-2 rounded-xl bg-peach-500 text-white hover:bg-peach-600 transition-colors disabled:opacity-50 self-end"><Send size={18} /></button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquarePlus size={40} className="mx-auto mb-3 text-slate-200" />
                  <p className="font-bold text-slate-400">Select a conversation or group</p>
                  <p className="text-sm text-slate-300 mt-1">or start a new message</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
