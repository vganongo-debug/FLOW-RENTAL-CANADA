import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Send, Paperclip, Pin, MessageSquare, FileText, Download, Filter, X, AlertCircle, ChevronLeft, Image as ImageIcon, FileSpreadsheet, File } from 'lucide-react'
import { cn, formatDate } from '../lib/utils'
import { FlowKPICard } from '../components/flow/FlowKPICard'
import { FlowStatusBadge } from '../components/flow/FlowStatusBadge'
import { FlowRef, FlowLinkify } from '../components/flow/FlowRef'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../lib/useApi'
import { messages as msgApi, documents } from '../lib/api'
import type { Attachment, Conversation, ConversationContext, Message, Participant } from '../lib/types'

const CONTEXT_LABEL: Record<NonNullable<ConversationContext['type']>, string> = {
  booking: 'Booking',
  rental:  'Rental',
  partner: 'Partner',
  property:'Property',
  rewards: 'Rewards',
  general: 'Internal',
}

const CONTEXT_TONE: Record<NonNullable<ConversationContext['type']>, string> = {
  booking: 'bg-teal-light text-teal-dark',
  rental:  'bg-copper-light text-copper-dark',
  partner: 'bg-coal text-ivory',
  property:'bg-teal text-white',
  rewards: 'bg-copper text-white',
  general: 'bg-g20/60 text-g80',
}

export default function Messages() {
  const { user } = useAuth()
  const myId = user?.id ?? 'u-1'

  const { data: convs, loading: cLoading, refetch: refetchConvs } = useApi(
    () => msgApi.listConversations({ participantId: myId }),
    [myId]
  )
  const { data: participants } = useApi(() => msgApi.listParticipants(), [])

  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedIdState] = useState<string | null>(searchParams.get('c'))
  const [q, setQ] = useState('')
  const [contextFilter, setContextFilter] = useState<'all' | ConversationContext['type']>('all')
  const [showFiles, setShowFiles] = useState(false)

  const setSelectedId = (id: string | null) => {
    setSelectedIdState(id)
    if (id) {
      searchParams.set('c', id)
    } else {
      searchParams.delete('c')
    }
    setSearchParams(searchParams, { replace: true })
  }

  // Honour ?c=<id> on first load · then fall back to the first thread.
  useEffect(() => {
    const fromUrl = searchParams.get('c')
    if (fromUrl && convs?.find((c) => c.id === fromUrl)) {
      setSelectedIdState(fromUrl)
      return
    }
    if (!selectedId && convs && convs.length > 0) setSelectedIdState(convs[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convs])

  const filtered = useMemo(() => {
    if (!convs) return []
    return convs.filter((c) => {
      if (contextFilter !== 'all' && c.context?.type !== contextFilter) return false
      if (q.trim()) {
        const n = q.toLowerCase()
        if (!c.title.toLowerCase().includes(n) && !c.lastMessagePreview.toLowerCase().includes(n)) return false
      }
      return true
    })
  }, [convs, q, contextFilter])

  const selected = convs?.find((c) => c.id === selectedId) ?? null
  const totalUnread = useMemo(
    () => (convs ?? []).reduce((s, c) => s + (c.unread[myId] ?? 0), 0),
    [convs, myId]
  )

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps text-g40">Messages</div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">Inbox</h1>
          <p className="text-sm text-g40 dark:text-g60 mt-1">
            Direct messages between staff, partners, and clients · share documents inline.
          </p>
        </div>
        <button
          onClick={() => setShowFiles((s) => !s)}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-2 rounded-input text-sm border',
            showFiles ? 'border-teal bg-teal-light text-teal-dark' : 'border-g20 text-ink dark:text-ivory hover:border-teal'
          )}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          {showFiles ? 'Hide files library' : 'Files library'}
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FlowKPICard label="Conversations" value={String(convs?.length ?? 0)} accent="teal" icon={<MessageSquare className="h-4 w-4" />} />
        <FlowKPICard label="Unread" value={String(totalUnread)} accent={totalUnread > 0 ? 'copper' : 'teal'} hint={totalUnread > 0 ? 'Action needed' : 'All caught up'} />
        <FlowKPICard label="Pinned" value={String((convs ?? []).filter((c) => c.pinned).length)} accent="teal" />
        <FlowKPICard label="With attachments" value={String((convs ?? []).filter((c) => c.lastMessagePreview.toLowerCase().includes('pdf') || c.lastMessagePreview.toLowerCase().includes('attached')).length)} accent="copper" />
      </div>

      {showFiles ? (
        <FilesLibrary participantId={myId} />
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-4 min-h-[640px]">
          {/* Thread list */}
          <aside className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-3 border-b border-g20/60 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-g40" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search conversations"
                  className="w-full pl-8 pr-2 py-1.5 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
                  aria-label="Search conversations"
                />
              </div>
              <div className="flex gap-1 items-center">
                <Filter className="h-3.5 w-3.5 text-g40 shrink-0" aria-hidden="true" />
                <select
                  value={contextFilter}
                  onChange={(e) => setContextFilter(e.target.value as 'all' | ConversationContext['type'])}
                  className="flex-1 px-2 py-1 text-xs bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory"
                >
                  <option value="all">All contexts</option>
                  {(Object.keys(CONTEXT_LABEL) as ConversationContext['type'][]).map((k) => (
                    <option key={k} value={k}>{CONTEXT_LABEL[k]}</option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="overflow-y-auto flow-scroll divide-y divide-g20/40 flex-1">
              {cLoading && <li className="p-6 text-center text-sm text-g40">Loading…</li>}
              {!cLoading && filtered.length === 0 && (
                <li className="p-6 text-center text-sm text-g40 italic">No conversations match.</li>
              )}
              {filtered.map((c) => (
                <ThreadRow
                  key={c.id}
                  conv={c}
                  myId={myId}
                  selected={c.id === selectedId}
                  participants={participants ?? []}
                  onClick={() => setSelectedId(c.id)}
                />
              ))}
            </ul>
          </aside>

          {/* Active thread */}
          <main className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden flex flex-col max-h-[80vh]">
            {selected ? (
              <ThreadView
                conversation={selected}
                myId={myId}
                participants={participants ?? []}
                onSent={() => refetchConvs()}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <MessageSquare className="h-12 w-12 text-teal opacity-50 mb-3" aria-hidden="true" />
                <h3 className="font-display text-lg text-ink dark:text-ivory">Select a conversation</h3>
                <p className="text-sm text-g40 mt-1 max-w-sm">
                  Pick a thread from the left to read and reply. Use the Files library button above to browse documents shared across all your conversations.
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Thread list row                                                    */
/* ------------------------------------------------------------------ */

function ThreadRow({ conv, myId, selected, participants, onClick }: {
  conv: Conversation
  myId: string
  selected: boolean
  participants: Participant[]
  onClick: () => void
}) {
  const others = conv.participantIds.filter((id) => id !== myId)
  const otherPeople = others.map((id) => participants.find((p) => p.id === id)).filter(Boolean) as Participant[]
  const lead = otherPeople[0]
  const unread = conv.unread[myId] ?? 0
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left p-3 flex items-start gap-3 transition',
          selected ? 'bg-teal-light dark:bg-teal-dark/30' : 'hover:bg-ivory dark:hover:bg-panel'
        )}
      >
        <Avatar participant={lead} size="md" extraCount={otherPeople.length > 1 ? otherPeople.length - 1 : 0} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {conv.pinned && <Pin className="h-3 w-3 text-copper shrink-0" aria-label="Pinned" />}
            <span className="font-medium text-ink dark:text-ivory truncate text-sm">{conv.title}</span>
          </div>
          <div className="text-xs text-g40 truncate mt-0.5">{conv.lastMessagePreview}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            {conv.context?.type && (
              <span className={cn('text-[9px] label-caps px-1.5 py-0.5 rounded-badge', CONTEXT_TONE[conv.context.type])}>
                {CONTEXT_LABEL[conv.context.type]}
              </span>
            )}
            {conv.context && 'ref' in conv.context && (
              <span onClick={(e) => e.stopPropagation()} className="inline-block">
                <FlowRef id={conv.context.ref} variant="inline" className="text-[10px]" />
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <span className="text-[10px] text-g40">{relativeTime(conv.lastMessageAt)}</span>
          {unread > 0 && (
            <span className="bg-copper text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
      </button>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Active thread view                                                 */
/* ------------------------------------------------------------------ */

function ThreadView({ conversation, myId, participants, onSent, onBack }: {
  conversation: Conversation
  myId: string
  participants: Participant[]
  onSent: () => void
  onBack: () => void
}) {
  const { data: msgs, loading, refetch } = useApi(() => msgApi.listMessages(conversation.id), [conversation.id])
  const [composer, setComposer] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [msgs?.length])

  // Mark thread read when opening
  useEffect(() => {
    if ((conversation.unread[myId] ?? 0) > 0) {
      msgApi.markRead(conversation.id, myId).then(() => onSent())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id])

  const others = conversation.participantIds.filter((id) => id !== myId)
  const otherPeople = others.map((id) => participants.find((p) => p.id === id)).filter(Boolean) as Participant[]

  const onAttach = async (files: FileList | null) => {
    if (!files) return
    setError(null)
    const next: Attachment[] = []
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is over 10 MB — please choose a smaller file.`)
        continue
      }
      const a = await documents.upload(file, myId)
      next.push(a)
    }
    setPendingAttachments((p) => [...p, ...next])
  }

  const send = async () => {
    if (!composer.trim() && pendingAttachments.length === 0) return
    setSending(true)
    setError(null)
    try {
      await msgApi.send({
        conversationId: conversation.id,
        fromId: myId,
        body: composer,
        attachments: pendingAttachments.length ? pendingAttachments : undefined,
      })
      setComposer('')
      setPendingAttachments([])
      refetch()
      onSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <header className="px-4 py-3 border-b border-g20/60 flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back to inbox"
          className="lg:hidden p-1 rounded-input hover:bg-ivory dark:hover:bg-panel text-ink dark:text-ivory"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex -space-x-2">
          {otherPeople.slice(0, 3).map((p) => <Avatar key={p.id} participant={p} size="sm" />)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg text-ink dark:text-ivory truncate">{conversation.title}</h2>
          <div className="text-xs text-g40 truncate flex items-center gap-1">
            <span>{otherPeople.map((p) => p.name).join(', ')}</span>
            {conversation.context && 'ref' in conversation.context && (
              <>
                <span className="text-g40">·</span>
                <FlowRef id={conversation.context.ref} variant="inline" />
              </>
            )}
          </div>
        </div>
        {conversation.context?.type && (
          <FlowStatusBadge tone="info">
            {CONTEXT_LABEL[conversation.context.type]}
          </FlowStatusBadge>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flow-scroll p-4 space-y-3 bg-ivory/40 dark:bg-coal/40">
        {loading && <div className="text-center text-sm text-g40">Loading messages…</div>}
        {(msgs ?? []).map((m, i, all) => {
          const prev = all[i - 1]
          const showDateSep = !prev || new Date(prev.sentAt).toDateString() !== new Date(m.sentAt).toDateString()
          return (
            <div key={m.id}>
              {showDateSep && (
                <div className="text-center my-3">
                  <span className="text-[10px] label-caps text-g40 bg-white dark:bg-panel-mid px-3 py-0.5 rounded-badge border border-g20/40">
                    {formatDate(m.sentAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={m}
                isMine={m.fromId === myId}
                sender={participants.find((p) => p.id === m.fromId)}
              />
            </div>
          )
        })}
      </div>

      <div className="border-t border-g20/60 p-3 bg-white dark:bg-panel-mid">
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {pendingAttachments.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-input border border-g20/60 bg-ivory dark:bg-panel text-xs">
                <FileIcon mime={a.mime} className="h-3 w-3" />
                <span className="text-ink dark:text-ivory">{a.filename}</span>
                <span className="text-g40">· {humanSize(a.sizeBytes)}</span>
                <button
                  onClick={() => setPendingAttachments((p) => p.filter((x) => x.id !== a.id))}
                  aria-label={`Remove ${a.filename}`}
                  className="text-g40 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {error && (
          <div role="alert" className="mb-2 text-xs text-red-700 dark:text-red-300 inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" /> {error}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Attach files"
            className="p-2 rounded-input border border-g20 text-g40 hover:text-teal hover:border-teal"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onAttach(e.target.files)}
          />
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value.slice(0, 4000))}
            onKeyDown={onKeyDown}
            placeholder="Type a message · ⌘/Ctrl + Enter to send"
            rows={1}
            maxLength={4000}
            className="flex-1 px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory resize-none min-h-[40px] max-h-[120px]"
          />
          <button
            onClick={send}
            disabled={sending || (!composer.trim() && pendingAttachments.length === 0)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span>
          </button>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Message bubble                                                     */
/* ------------------------------------------------------------------ */

function MessageBubble({ message, isMine, sender }: {
  message: Message
  isMine: boolean
  sender: Participant | undefined
}) {
  const time = new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <div className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {!isMine && <Avatar participant={sender} size="sm" />}
      <div className={cn('max-w-[78%] sm:max-w-[68%] space-y-1')}>
        {!isMine && (
          <div className="text-[11px] text-g40 ml-1">
            {sender?.name ?? 'Unknown'}
            {sender?.kind === 'partner' && <span className="ml-1 text-copper">· Partner</span>}
            {sender?.kind === 'guest' && <span className="ml-1 text-teal">· Guest</span>}
          </div>
        )}
        <div className={cn(
          'rounded-card px-3 py-2 text-sm',
          isMine
            ? 'bg-teal text-white rounded-br-sm'
            : 'bg-white dark:bg-panel-mid border border-g20/60 text-ink dark:text-ivory rounded-bl-sm'
        )}>
          <p className="whitespace-pre-wrap">
            <FlowLinkify text={message.body} variant={isMine ? 'plain' : 'inline'} />
          </p>
          {message.attachments && message.attachments.length > 0 && (
            <ul className={cn('mt-2 space-y-1', isMine && 'border-t border-white/20 pt-2')}>
              {message.attachments.map((a) => (
                <li key={a.id}>
                  <button className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-1 rounded-input text-xs w-full text-left',
                    isMine ? 'bg-teal-dark hover:bg-coal' : 'bg-ivory dark:bg-panel hover:bg-teal-light dark:hover:bg-teal-dark/30'
                  )}>
                    <FileIcon mime={a.mime} className="h-3 w-3 shrink-0" />
                    <span className="truncate flex-1">{a.filename}</span>
                    <span className={cn('text-[10px]', isMine ? 'text-ivory/80' : 'text-g40')}>{humanSize(a.sizeBytes)}</span>
                    <Download className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={cn('text-[10px] text-g40', isMine ? 'text-right mr-1' : 'ml-1')}>
          {time}
          {isMine && (message.readBy.length > 1 ? ' · Read' : ' · Sent')}
        </div>
      </div>
      {isMine && <Avatar participant={sender} size="sm" />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Files library                                                      */
/* ------------------------------------------------------------------ */

function FilesLibrary({ participantId }: { participantId: string }) {
  const { data, loading } = useApi(() => documents.listForParticipant(participantId), [participantId])
  if (loading) return <div className="p-10 text-center text-g40">Loading library…</div>
  return (
    <section className="rounded-card border border-g20/60 bg-white dark:bg-panel-mid overflow-hidden">
      <header className="px-5 py-3 border-b border-g20/60">
        <h2 className="font-display text-lg text-ink dark:text-ivory">Files shared with you</h2>
        <p className="text-xs text-g40">Every attachment across every conversation you have access to.</p>
      </header>
      {(data ?? []).length === 0 ? (
        <div className="p-10 text-center">
          <FileText className="h-10 w-10 text-teal mx-auto mb-2 opacity-50" aria-hidden="true" />
          <p className="text-sm text-g40">No files yet · attach something to a message to start the library.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal text-white">
              {['File','From conversation','Size','Uploaded','Action'].map((h, i) => (
                <th key={h} className={cn('label-caps font-semibold px-3 py-2', i === 2 ? 'text-right' : 'text-left')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((d, i) => (
              <tr key={d.id} className={cn('border-b border-g20/40 last:border-0', i % 2 === 0 ? 'bg-white dark:bg-panel-mid' : 'bg-ivory dark:bg-panel')}>
                <td className="px-3 py-2 flex items-center gap-2">
                  <FileIcon mime={d.mime} className="h-3.5 w-3.5 text-teal shrink-0" />
                  <span className="text-ink dark:text-ivory">{d.filename}</span>
                </td>
                <td className="px-3 py-2 text-ink dark:text-ivory">{d.conversationTitle}</td>
                <td className="px-3 py-2 text-right text-g40 font-mono text-xs">{humanSize(d.sizeBytes)}</td>
                <td className="px-3 py-2 text-g40 text-xs">{new Date(d.uploadedAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-input border border-g20 text-xs text-ink dark:text-ivory hover:border-teal">
                    <Download className="h-3 w-3" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function Avatar({ participant, size = 'md', extraCount = 0 }: {
  participant?: Participant
  size?: 'sm' | 'md'
  extraCount?: number
}) {
  const cls = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-10 w-10 text-xs'
  const bg =
    participant?.kind === 'partner' ? 'bg-copper' :
    participant?.kind === 'guest'   ? 'bg-teal-mid' :
    participant?.kind === 'system'  ? 'bg-g60' :
                                      'bg-teal'
  return (
    <div className="relative shrink-0">
      <span className={cn('rounded-full text-white flex items-center justify-center font-semibold ring-2 ring-white dark:ring-panel-mid', cls, bg)}>
        {participant?.initials ?? '?'}
      </span>
      {extraCount > 0 && (
        <span className={cn(
          'absolute -bottom-1 -right-1 rounded-full bg-coal text-ivory text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-panel-mid',
          size === 'sm' ? 'h-4 min-w-[16px] px-0.5' : 'h-5 min-w-[20px] px-1'
        )}>
          +{extraCount}
        </span>
      )}
    </div>
  )
}

function FileIcon({ mime, className }: { mime: string; className?: string }) {
  if (mime.startsWith('image/')) return <ImageIcon className={className} aria-hidden="true" />
  if (mime.includes('spreadsheet') || mime.includes('csv')) return <FileSpreadsheet className={className} aria-hidden="true" />
  if (mime === 'application/pdf') return <FileText className={className} aria-hidden="true" />
  return <File className={className} aria-hidden="true" />
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function relativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const min = Math.round(diffMs / 60_000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m`
  const h = Math.round(min / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d`
  return formatDate(iso)
}
