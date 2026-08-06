import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Phone, Mail, Send, User } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import MapView from '../components/MapView.jsx'
import {
  getRequestDetail,
  getMessages,
  sendMessage,
} from '../api/requests.js'
import { useAuth } from '../context/AuthContext.jsx'

const steps = ['Pending', 'Accepted', 'In Transit', 'Completed']

const normalizeMessages = (data) => {
  if (Array.isArray(data)) return data
  return data?.messages || []
}

const formatTime = (value) => {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString()
}

export default function RequestDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [request, setRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const chatEndRef = useRef(null)

  const fetchMessages = useCallback(() => {
    if (!id) return
    getMessages(id)
      .then((data) => setMessages(normalizeMessages(data)))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    if (!id) return
    let active = true
    getRequestDetail(id)
      .then((data) => {
        if (active) setRequest(data)
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || err.message || 'Failed to load request.')
        }
      })

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [id, fetchMessages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const statusIndex = useMemo(
    () => Math.max(0, steps.indexOf(request?.status)),
    [request],
  )

  const material = request?.material || {}
  const seller = request?.seller || {}

  const contact = seller

  const handleSend = async () => {
    const content = messageInput.trim()
    if (!content || !id || sending) return
    setSending(true)
    try {
      await sendMessage(id, { content })
      setMessageInput('')
      fetchMessages()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-ink">Request Detail</h1>
          {request?.status && (
            <Badge variant="neutral">{request.status}</Badge>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <Card className="mt-6">
          <ol className="flex items-center justify-between gap-2">
            {steps.map((step, i) => {
              const isCompleted = i < statusIndex
              const isCurrent = i === statusIndex
              const isDone = isCompleted || isCurrent
              const circleClass = isDone
                ? 'bg-primary text-white'
                : 'border border-stone-300 text-ink-faint'
              return (
                <li key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${circleClass}`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isCurrent
                          ? 'font-bold text-primary'
                          : isCompleted
                          ? 'text-ink'
                          : 'text-ink-faint'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <span
                      className={`mx-2 h-px flex-1 ${
                        isCompleted ? 'bg-primary' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <h2 className="font-heading font-semibold text-ink">Material summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Name</span>
                  <span className="font-medium text-ink">
                    {material.material_name || material.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Category</span>
                  <Badge variant="neutral">{material.category || 'Other'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Quantity</span>
                  <span className="font-medium text-ink">
                    {material.quantity ?? '—'} {material.unit || ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Price</span>
                  <span className="font-medium text-accent">
                    ₹{material.price ?? '—'} / {material.unit || 'unit'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-heading font-semibold text-ink">Contact</h2>
              <div className="mt-4 space-y-3 text-sm">
                <p className="font-medium text-ink">
                  {contact.company_name || seller.seller_name || 'Company'}
                </p>
                <div className="flex items-center gap-3 text-ink-muted">
                  <User className="h-4 w-4 text-ink-faint" />
                  <span>{contact.contact_name || contact.name || 'Contact person'}</span>
                </div>
                <div className="flex items-center gap-3 text-ink-muted">
                  <Mail className="h-4 w-4 text-ink-faint" />
                  <span>{contact.email || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-ink-muted">
                  <Phone className="h-4 w-4 text-ink-faint" />
                  <span>{contact.phone || '—'}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:h-[340px]">
            <Card className="h-full">
              <h2 className="font-heading font-semibold text-ink">Delivery route</h2>
              <div className="mt-4 h-64 overflow-hidden rounded-lg">
                <MapView
                  sellerLocation={request?.seller_address || seller.location || seller.city}
                  buyerLocation={request?.buyer_address || request?.buyer?.location}
                  distanceKm={request?.distance_km}
                  durationMin={request?.duration_min}
                />
              </div>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-ink">Messages</h2>
            <span className="text-xs text-ink-faint">{messages.length} messages</span>
          </div>

          <div className="mt-4 flex h-80 flex-col overflow-hidden rounded-lg border border-stone-200">
            <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-4">
              {messages.length === 0 ? (
                <p className="pt-10 text-center text-sm text-ink-faint">
                  No messages yet. Say hello to start the conversation.
                </p>
              ) : (
                messages.map((msg, i) => {
                  const isMine =
                    msg.sent === true ||
                    (user && msg.sender_id != null && msg.sender_id === user.id)
                  return (
                    <div
                      key={msg.id ?? `msg-${i}`}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          isMine ? 'bg-primary-50 text-ink' : 'bg-stone-100 text-ink'
                        }`}
                      >
                        <p className="flex items-center gap-2 text-xs font-medium text-primary">
                          <User className="h-3 w-3" />
                          {msg.sender_name || (isMine ? 'You' : 'Them')}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words">{msg.content}</p>
                        {formatTime(msg.created_at) && (
                          <p className="mt-1 text-right text-[10px] text-ink-faint">
                            {formatTime(msg.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-stone-200 p-3">
              <Input
                placeholder="Type a message…"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={!messageInput.trim() || sending}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}