import { useEffect, useState, useRef, useCallback } from 'react';
import { apiUrl } from '../../lib/api';
import { Send, MessageSquarePlus, Megaphone, ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Contact { id: string; name: string; email: string; role: string; }
interface Conversation { other_user_id: string; other_user_name: string; other_user_role: string; last_message_at: string; unread_count: number; last_message: string; }
interface Message { id: string; sender_id: string; recipient_id: string; subject?: string; body: string; read: number; created_at: string; sender_name: string; }

function roleBadge(role: string) {
  if (role === 'superadmin' || role === 'admin') return <span className="ml-1 px-1.5 py-0.5 bg-peach-100 text-peach-700 rounded text-[10px] font-bold uppercase">Admin</span>;
  return <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Intern</span>;
}

export default function AdminMessages() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [compose, setCompose] = useState(false);
  const [broadcast, setBroadcast] = useState(false);
  const [newMsg, setNewMsg] = useState({ recipient_id: '', subject: '', body: '' });
  const [broadcastMsg, setBroadcastMsg] = useState({ subject: '', body: '' });
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');
  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(() => {
    fetch(apiUrl('/api/messages/conversations'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setConversations(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetch(apiUrl('/api/me'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setCurrentUserId(data.user.id); });
    fetch(apiUrl('/api/messages/contacts'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setContacts(Array.isArray(data) ? data : []));
    loadConversations();
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!activeUserId) return;
    fetch(apiUrl(`/api/messages/thread/${activeUserId}`), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setThread(Array.isArray(data) ? data : []);
        // Mark unread messages as read
        data.filter((m: Message) => m.recipient_id === currentUserId && !m.read)
          .forEach((m: Message) => fetch(apiUrl(`/api/messages/${m.id}/read`), { method: 'PATCH', credentials: 'include' }));
      });
  }, [activeUserId, currentUserId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const sendReply = async () => {
    if (!replyBody.trim() || !activeUserId) return;
    setSending(true);
    await fetch(apiUrl('/api/messages/send'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: activeUserId, body: replyBody }),
    });
    setReplyBody('');
    setSending(false);
    // Reload thread
    const data = await fetch(apiUrl(`/api/messages/thread/${activeUserId}`), { credentials: 'include' }).then(r => r.json());
    setThread(Array.isArray(data) ? data : []);
    loadConversations();
  };

  const sendNewMessage = async () => {
    if (!newMsg.recipient_id || !newMsg.body.trim()) return;
    setSending(true);
    await fetch(apiUrl('/api/messages/send'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    });
    setNewMsg({ recipient_id: '', subject: '', body: '' });
    setCompose(false);
    setSending(false);
    setActiveUserId(newMsg.recipient_id);
    loadConversations();
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.body.trim()) return;
    setBroadcastSending(true);
    const res = await fetch(apiUrl('/api/messages/broadcast'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcastMsg),
    });
    const data = await res.json();
    setBroadcastResult(data.message || 'Sent');
    setBroadcastSending(false);
    setBroadcastMsg({ subject: '', body: '' });
    setTimeout(() => { setBroadcastResult(''); setBroadcast(false); }, 2000);
    loadConversations();
  };

  const activeContact = contacts.find(c => c.id === activeUserId) || conversations.find(c => c.other_user_id === activeUserId);
  const activeContactName = activeContact ? ('name' in activeContact ? activeContact.name : (activeContact as Conversation).other_user_name) : '';
  const activeContactRole = activeContact ? ('role' in activeContact ? activeContact.role : (activeContact as Conversation).other_user_role) : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Internal messaging with interns and team</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setBroadcast(true); setCompose(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Megaphone size={16} />Broadcast
          </button>
          <button onClick={() => { setCompose(true); setBroadcast(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors">
            <MessageSquarePlus size={16} />New Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left: Conversations */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No conversations yet</div>
            ) : conversations.map(conv => (
              <button
                key={conv.other_user_id}
                onClick={() => { setActiveUserId(conv.other_user_id); setCompose(false); setBroadcast(false); }}
                className={cn("w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors", activeUserId === conv.other_user_id && "bg-peach-50 border-peach-100")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {conv.other_user_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-semibold text-slate-900 truncate", conv.unread_count > 0 && "font-bold")}>
                        {conv.other_user_name}
                        {roleBadge(conv.other_user_role)}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="ml-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{conv.unread_count}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Thread or Compose */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          {compose ? (
            <div className="flex-1 flex flex-col p-6 gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">New Message</h3>
                <button onClick={() => setCompose(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
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
                <textarea value={newMsg.body} onChange={e => setNewMsg(p => ({ ...p, body: e.target.value }))} rows={6} placeholder="Write your message..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" />
              </div>
              <button onClick={sendNewMessage} disabled={!newMsg.recipient_id || !newMsg.body.trim() || sending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors disabled:opacity-50 self-end">
                <Send size={16} />{sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          ) : broadcast ? (
            <div className="flex-1 flex flex-col p-6 gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Broadcast to All Interns</h3>
                <button onClick={() => setBroadcast(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                This message will be sent to all active interns.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject (optional)</label>
                <input value={broadcastMsg.subject} onChange={e => setBroadcastMsg(p => ({ ...p, subject: e.target.value }))} placeholder="Subject..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                <textarea value={broadcastMsg.body} onChange={e => setBroadcastMsg(p => ({ ...p, body: e.target.value }))} rows={6} placeholder="Write your broadcast message..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none" />
              </div>
              {broadcastResult && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{broadcastResult}</div>}
              <button onClick={sendBroadcast} disabled={!broadcastMsg.body.trim() || broadcastSending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 self-end">
                <Megaphone size={16} />{broadcastSending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          ) : activeUserId ? (
            <>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                  {activeContactName?.[0] || '?'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{activeContactName}</p>
                  <p className="text-xs text-slate-400 capitalize">{activeContactRole}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {thread.map(msg => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%] px-4 py-3 rounded-2xl text-sm", isMine ? "bg-peach-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm")}>
                        {msg.subject && <p className={cn("text-xs font-bold mb-1", isMine ? "text-peach-100" : "text-slate-500")}>{msg.subject}</p>}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={cn("text-[10px] mt-1.5", isMine ? "text-peach-200" : "text-slate-400")}>
                          {msg.sender_name} · {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex gap-2">
                <textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  rows={2}
                  placeholder="Write a reply... (Enter to send)"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 resize-none"
                />
                <button onClick={sendReply} disabled={!replyBody.trim() || sending} className="px-4 py-2 rounded-xl bg-peach-500 text-white hover:bg-peach-600 transition-colors disabled:opacity-50 self-end">
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquarePlus size={40} className="mx-auto mb-3 text-slate-200" />
                <p className="font-bold text-slate-400">Select a conversation</p>
                <p className="text-sm text-slate-300 mt-1">or start a new message</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
