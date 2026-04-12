import { useEffect, useState, useRef, useCallback } from 'react';
import { apiUrl } from '../../lib/api';
import { Send, MessageSquarePlus, Megaphone, ChevronDown, X, Plus, Users, Trash2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Contact { id: string; name: string; email: string; role: string; }
interface Conversation { other_user_id: string; other_user_name: string; other_user_role: string; last_message_at: string; unread_count: number; last_message: string; }
interface Message { id: string; sender_id: string; recipient_id: string; subject?: string; body: string; read: number; created_at: string; sender_name: string; }
interface Group { id: string; name: string; description?: string; role_filter?: string; member_count: number; last_message?: string; last_message_at?: string; unread_count: number; }
interface GroupMessage { id: string; group_id: string; sender_id: string; sender_name: string; body: string; created_at: string; }
interface GroupMember { id: string; name: string; email: string; role: string; }
interface MonitorConversation { user1_id: string; user2_id: string; user1_name: string; user2_name: string; user1_role: string; user2_role: string; last_message_at: string; message_count: number; }

type ActiveThread = { type: 'dm'; userId: string } | { type: 'group'; groupId: string } | null;

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Interns' },
  { value: 'Sales & Business Development', label: 'Sales & Business Development' },
  { value: 'Consulting, Business Track', label: 'Consulting, Business Track' },
  { value: 'Consulting, Tech Track', label: 'Consulting, Tech Track' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Marketing', label: 'Marketing' },
];

export default function AdminMessages() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeThread, setActiveThread] = useState<ActiveThread>(null);
  const [dmThread, setDmThread] = useState<Message[]>([]);
  const [groupThread, setGroupThread] = useState<GroupMessage[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [compose, setCompose] = useState(false);
  const [broadcast, setBroadcast] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [monitorMode, setMonitorMode] = useState(false);
  const [monitorConversations, setMonitorConversations] = useState<MonitorConversation[]>([]);
  const [monitorThread, setMonitorThread] = useState<Message[]>([]);
  const [monitorActive, setMonitorActive] = useState<MonitorConversation | null>(null);
  const [newMsg, setNewMsg] = useState({ recipient_id: '', subject: '', body: '' });
  const [broadcastMsg, setBroadcastMsg] = useState({ subject: '', body: '' });
  const [newGroup, setNewGroup] = useState({ name: '', description: '', role_filter: '' });
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [groupCreating, setGroupCreating] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');
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
    setShowMembers(false);
    fetch(apiUrl(`/api/messages/groups/${activeThread.groupId}`), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setGroupThread(Array.isArray(data) ? data : []);
        fetch(apiUrl(`/api/messages/groups/${activeThread.groupId}/read`), { method: 'PATCH', credentials: 'include' });
        loadGroups();
      });
    fetch(apiUrl(`/api/admin/messages/groups/${activeThread.groupId}/members`), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setGroupMembers(Array.isArray(data) ? data : []));
  }, [activeThread, loadGroups]);

  // Load monitor conversations
  useEffect(() => {
    if (!monitorMode) return;
    fetch(apiUrl('/api/admin/messages/all-conversations'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMonitorConversations(Array.isArray(data) ? data : []));
  }, [monitorMode]);

  // Load monitor thread
  useEffect(() => {
    if (!monitorActive) return;
    fetch(apiUrl(`/api/admin/messages/thread/${monitorActive.user1_id}/${monitorActive.user2_id}`), { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMonitorThread(Array.isArray(data) ? data : []));
  }, [monitorActive]);

  useEffect(() => { threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [dmThread, groupThread, monitorThread]);

  const openDm = (userId: string) => { setActiveThread({ type: 'dm', userId }); setCompose(false); setBroadcast(false); setShowNewGroup(false); setMonitorMode(false); };
  const openGroup = (groupId: string) => { setActiveThread({ type: 'group', groupId }); setCompose(false); setBroadcast(false); setShowNewGroup(false); setMonitorMode(false); setShowMembers(false); };

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

  const createGroup = async () => {
    if (!newGroup.name.trim()) return;
    setGroupCreating(true);
    await fetch(apiUrl('/api/admin/messages/groups'), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup),
    });
    setNewGroup({ name: '', description: '', role_filter: '' });
    setShowNewGroup(false); setGroupCreating(false);
    loadGroups();
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    await fetch(apiUrl(`/api/admin/messages/groups/${groupId}`), { method: 'DELETE', credentials: 'include' });
    if (activeThread?.type === 'group' && activeThread.groupId === groupId) setActiveThread(null);
    loadGroups();
  };

  const activeContact = activeThread?.type === 'dm'
    ? (contacts.find(c => c.id === activeThread.userId) || conversations.find(c => c.other_user_id === activeThread.userId))
    : null;
  const activeContactName = activeContact ? ('name' in activeContact ? activeContact.name : (activeContact as Conversation).other_user_name) : '';
  const activeContactRole = activeContact ? ('role' in activeContact ? activeContact.role : (activeContact as Conversation).other_user_role) : '';
  const activeGroup = activeThread?.type === 'group' ? groups.find(g => g.id === activeThread.groupId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Internal messaging with interns and team</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={() => { setMonitorMode(v => !v); setActiveThread(null); setCompose(false); setBroadcast(false); setShowNewGroup(false); setMonitorActive(null); }} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-colors", monitorMode ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
            <Eye size={16} />Monitor DMs
          </button>
          <button onClick={() => { setShowNewGroup(true); setCompose(false); setBroadcast(false); setActiveThread(null); setMonitorMode(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Users size={16} />New Group
          </button>
          <button onClick={() => { setBroadcast(true); setCompose(false); setShowNewGroup(false); setMonitorMode(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Megaphone size={16} />Broadcast
          </button>
          <button onClick={() => { setCompose(true); setBroadcast(false); setShowNewGroup(false); setMonitorMode(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors">
            <MessageSquarePlus size={16} />New Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left: Conversations + Groups (or Monitor list) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {monitorMode ? (
              <>
                <div className="px-4 py-2.5 border-b border-slate-100 bg-amber-50 sticky top-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">📋 All Conversations</p>
                </div>
                {monitorConversations.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400">No conversations on platform yet</div>
                ) : monitorConversations.map(conv => (
                  <button
                    key={`${conv.user1_id}-${conv.user2_id}`}
                    onClick={() => setMonitorActive(conv)}
                    className={cn("w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors", monitorActive?.user1_id === conv.user1_id && monitorActive?.user2_id === conv.user2_id && "bg-amber-50 border-amber-100")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1 shrink-0">
                        <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">{conv.user1_name?.[0] || '?'}</div>
                        <div className="h-7 w-7 rounded-full bg-peach-100 text-peach-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">{conv.user2_name?.[0] || '?'}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{conv.user1_name} ↔ {conv.user2_name}</p>
                        <p className="text-[10px] text-slate-400">{conv.message_count} messages</p>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <>
                {/* Direct Messages */}
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 sticky top-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct Messages</p>
                </div>
                {conversations.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400">No conversations yet</div>
                ) : conversations.map(conv => (
                  <button
                    key={conv.other_user_id}
                    onClick={() => openDm(conv.other_user_id)}
                    className={cn("w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors", activeThread?.type === 'dm' && activeThread.userId === conv.other_user_id && "bg-peach-50 border-peach-100")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">{conv.other_user_name?.[0] || '?'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm font-semibold text-slate-900 truncate", conv.unread_count > 0 && "font-bold")}>{conv.other_user_name}</span>
                          {conv.unread_count > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{conv.unread_count}</span>}
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
                  <div className="px-4 py-3 text-xs text-slate-400">No groups yet. Create one above.</div>
                ) : groups.map(group => (
                  <div key={group.id} className={cn("w-full text-left border-b border-slate-50 hover:bg-slate-50 transition-colors group/item", activeThread?.type === 'group' && activeThread.groupId === group.id && "bg-peach-50 border-peach-100")}>
                <button onClick={() => openGroup(group.id)} className="w-full text-left px-4 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-600 flex items-center justify-center font-bold text-sm shrink-0"><Users size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-semibold text-slate-900 truncate", group.unread_count > 0 && "font-bold")}>{group.name}</span>
                      {group.unread_count > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{group.unread_count}</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{group.last_message || `${group.member_count} members`}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteGroup(group.id); }} className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all shrink-0">
                    <Trash2 size={12} />
                  </button>
                </button>
              </div>
            ))}
              </>
            )}
          </div>
        </div>

        {/* Center: Thread or Compose */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          {monitorMode ? (
            monitorActive ? (
              <>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-amber-50/60">
                  <button onClick={() => setMonitorActive(null)} className="p-1 text-slate-400 hover:text-slate-700"><X size={16} /></button>
                  <div className="flex -space-x-1">
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm ring-2 ring-white">{monitorActive.user1_name[0]}</div>
                    <div className="h-8 w-8 rounded-full bg-peach-100 text-peach-600 flex items-center justify-center font-bold text-sm ring-2 ring-white">{monitorActive.user2_name[0]}</div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{monitorActive.user1_name} ↔ {monitorActive.user2_name}</p>
                    <p className="text-xs text-amber-600 font-medium">👁 Read-only monitor view</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {monitorThread.map(msg => (
                    <div key={msg.id} className={cn("flex gap-2", msg.sender_id === monitorActive.user1_id ? "justify-start" : "justify-end")}>
                      <div className={cn("max-w-[70%] px-4 py-3 rounded-2xl text-sm", msg.sender_id === monitorActive.user1_id ? "bg-slate-100 text-slate-900 rounded-bl-sm" : "bg-peach-50 text-slate-900 rounded-br-sm border border-peach-100")}>
                        {msg.subject && <p className="text-xs font-bold text-slate-500 mb-1">{msg.subject}</p>}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className="text-[10px] mt-1.5 text-slate-400">{msg.sender_name} · {new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={threadEndRef} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Eye size={40} className="mx-auto mb-3 text-amber-200" />
                  <p className="font-bold text-slate-400">Select a conversation to monitor</p>
                  <p className="text-sm text-slate-300 mt-1">View messages between any two users</p>
                </div>
              </div>
            )
          ) : showNewGroup ? (
            <div className="flex-1 flex flex-col p-6 gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Create Group Chat</h3>
                <button onClick={() => setShowNewGroup(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Group Name *</label>
                <input value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Marketing Team" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
                <input value={newGroup.description} onChange={e => setNewGroup(p => ({ ...p, description: e.target.value }))} placeholder="What is this group for?" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Auto-add interns by role</label>
                <p className="text-xs text-slate-400 mb-2">All admins are always added. Choose a role to auto-populate with matching interns.</p>
                <div className="relative">
                  <select value={newGroup.role_filter} onChange={e => setNewGroup(p => ({ ...p, role_filter: e.target.value }))} className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white">
                    <option value="">Admins only (add interns manually)</option>
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <button onClick={createGroup} disabled={!newGroup.name.trim() || groupCreating} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-peach-500 text-sm font-bold text-white hover:bg-peach-600 transition-colors disabled:opacity-50 self-start mt-2">
                <Plus size={16} />{groupCreating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          ) : compose ? (
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
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">This message will be sent to all active interns.</div>
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
          ) : activeThread?.type === 'dm' ? (
            <>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">{activeContactName?.[0] || '?'}</div>
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
                      <div className={cn("max-w-[70%] px-4 py-3 rounded-2xl text-sm", isMine ? "bg-peach-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm")}>
                        {msg.subject && <p className={cn("text-xs font-bold mb-1", isMine ? "text-peach-100" : "text-slate-500")}>{msg.subject}</p>}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={cn("text-[10px] mt-1.5", isMine ? "text-peach-200" : "text-slate-400")}>{msg.sender_name} · {new Date(msg.created_at).toLocaleString()}</p>
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
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-peach-100 text-peach-600 flex items-center justify-center"><Users size={16} /></div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{activeGroup?.name}</p>
                  <p className="text-xs text-slate-400">{activeGroup?.member_count} members{activeGroup?.role_filter ? ` · ${activeGroup.role_filter === 'all' ? 'All Interns' : activeGroup.role_filter}` : ''}</p>
                </div>
                <button
                  onClick={() => setShowMembers(v => !v)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", showMembers ? "bg-peach-100 text-peach-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                >
                  <Users size={13} />{showMembers ? 'Hide' : 'Members'}
                </button>
              </div>
              {showMembers && (
                <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/60">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Group Members ({groupMembers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {groupMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                        <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">{m.name[0]}</div>
                        <span className="text-xs font-medium text-slate-700">{m.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {groupThread.map(msg => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%] px-4 py-3 rounded-2xl text-sm", isMine ? "bg-peach-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm")}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={cn("text-[10px] mt-1.5", isMine ? "text-peach-200" : "text-slate-400")}>{msg.sender_name} · {new Date(msg.created_at).toLocaleString()}</p>
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
  );
}
