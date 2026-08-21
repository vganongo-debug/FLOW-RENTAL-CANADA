import { describe, expect, it, beforeEach } from 'vitest'
import { messages, documents } from './api'

beforeEach(() => { window.localStorage.clear() })

describe('messages.listConversations · scoping', () => {
  it('SuperAdmin sees every conversation', async () => {
    const cs = await messages.listConversations({ participantId: 'u-1' })
    expect(cs.length).toBeGreaterThanOrEqual(8)
  })

  it('Hotel Manager (Jean-Paul) only sees their own threads', async () => {
    const cs = await messages.listConversations({ participantId: 'u-4' })
    expect(cs.every((c) => c.participantIds.includes('u-4'))).toBe(true)
    // u-4 is in c-1 (Sarah room upgrade) and c-6 (internal staffing)
    expect(cs.map((c) => c.id).sort()).toEqual(['c-1', 'c-6'])
  })

  it('Partner (Mercantile) only sees their own threads', async () => {
    const cs = await messages.listConversations({ participantId: 'fp-mercantile' })
    expect(cs.every((c) => c.participantIds.includes('fp-mercantile'))).toBe(true)
    expect(cs.map((c) => c.id)).toEqual(['c-2'])
  })

  it('Guest (Sarah Bennett) only sees their own threads', async () => {
    const cs = await messages.listConversations({ participantId: 'm-1' })
    expect(cs.every((c) => c.participantIds.includes('m-1'))).toBe(true)
    expect(cs.map((c) => c.id).sort()).toEqual(['c-1', 'c-8'])
  })

  it('search filters by title or preview', async () => {
    const cs = await messages.listConversations({ participantId: 'u-1', q: 'mercantile' })
    expect(cs.every((c) =>
      c.title.toLowerCase().includes('mercantile') ||
      c.lastMessagePreview.toLowerCase().includes('mercantile')
    )).toBe(true)
  })

  it('context-type filter works', async () => {
    const cs = await messages.listConversations({ participantId: 'u-1', contextType: 'partner' })
    expect(cs.every((c) => c.context?.type === 'partner')).toBe(true)
  })

  it('pinned threads come first', async () => {
    const cs = await messages.listConversations({ participantId: 'u-1' })
    expect(cs[0].pinned).toBe(true)
  })
})

describe('messages.send', () => {
  it('appends a message and updates the conversation preview + unread', async () => {
    const conv = await messages.getConversation('c-3')
    const msg = await messages.send({
      conversationId: 'c-3',
      fromId: 'u-8',
      body: 'Confirming receipt — investigating now.',
    })
    expect(msg.fromId).toBe('u-8')
    expect(msg.body).toMatch(/Confirming receipt/)

    const fresh = await messages.getConversation('c-3')
    expect(fresh?.lastMessagePreview).toMatch(/Confirming receipt/)
    expect(fresh?.unread['m-4']).toBeGreaterThan(conv?.unread['m-4'] ?? 0)
    expect(fresh?.unread['u-8']).toBe(0) // sender never has unread for their own message
  })

  it('rejects messages from non-participants', async () => {
    await expect(
      messages.send({ conversationId: 'c-3', fromId: 'm-1', body: 'hi' })
    ).rejects.toThrow(/not a participant/)
  })

  it('rejects empty messages with no attachments', async () => {
    await expect(
      messages.send({ conversationId: 'c-3', fromId: 'u-8', body: '   ' })
    ).rejects.toThrow(/body or .* attachment/)
  })

  it('accepts attachment-only messages', async () => {
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' })
    const att = await documents.upload(file, 'u-8')
    const msg = await messages.send({
      conversationId: 'c-3',
      fromId: 'u-8',
      body: '',
      attachments: [att],
    })
    expect(msg.attachments?.length).toBe(1)
  })
})

describe('messages.markRead', () => {
  it('zeroes out unread for the participant', async () => {
    const before = await messages.getConversation('c-3')
    expect(before?.unread['u-8']).toBeGreaterThan(0)
    await messages.markRead('c-3', 'u-8')
    const after = await messages.getConversation('c-3')
    expect(after?.unread['u-8']).toBe(0)
  })

  it('stamps readBy on every existing message in the thread', async () => {
    await messages.markRead('c-3', 'u-8')
    const msgs = await messages.listMessages('c-3')
    expect(msgs.every((m) => m.readBy.includes('u-8'))).toBe(true)
  })
})

describe('messages.unreadCount', () => {
  it('totals unread across all visible conversations', async () => {
    const total = await messages.unreadCount('u-8')
    // u-8 (Naledi) has 2 unread in c-3 + 0 in c-5
    expect(total).toBeGreaterThanOrEqual(2)
  })
})

describe('messages.createConversation', () => {
  it('creates a thread and optionally posts the opening message', async () => {
    const conv = await messages.createConversation({
      title: 'New thread test',
      participantIds: ['u-1', 'm-1'],
      context: { type: 'general' },
      body: 'Opening message',
      fromId: 'u-1',
    })
    expect(conv.id).toMatch(/^c-/)
    const msgs = await messages.listMessages(conv.id)
    expect(msgs.length).toBe(1)
    expect(msgs[0].body).toBe('Opening message')
    expect(msgs[0].fromId).toBe('u-1')
  })
})

describe('documents.upload + listForParticipant', () => {
  it('upload returns metadata', async () => {
    const file = new File(['x'.repeat(2048)], 'invoice.pdf', { type: 'application/pdf' })
    const a = await documents.upload(file, 'u-1')
    expect(a.id).toMatch(/^att-/)
    expect(a.filename).toBe('invoice.pdf')
    expect(a.mime).toBe('application/pdf')
    expect(a.sizeBytes).toBe(2048)
    expect(a.uploadedBy).toBe('u-1')
  })

  it('listForParticipant surfaces attachments across visible threads', async () => {
    const docs = await documents.listForParticipant('u-3')
    // u-3 (Aisha) sees c-2 (Mercantile reconciliation PDF) and c-7 (service report)
    expect(docs.length).toBeGreaterThanOrEqual(2)
    expect(docs.every((d) => d.conversationTitle.length > 0)).toBe(true)
  })
})
