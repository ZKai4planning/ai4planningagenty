"use client"

import { Paperclip, Search, Send } from "lucide-react"

const conversations = [
  {
    id: "agent-x",
    name: "Agent X",
    role: "Strategist",
    lastMessage: "Please confirm the missing CIL form details.",
    time: "09:42",
    unread: 2,
  },
]

const messages = [
  {
    id: "1",
    sender: "Agent X",
    timestamp: "09:18",
    content:
      "We need confirmation on the site boundary plan and the draft CIL form.",
    tone: "incoming",
  },
  {
    id: "2",
    sender: "Agent Y",
    timestamp: "09:21",
    content:
      "Acknowledged. I will validate the boundary plan and send the CIL form after auto-fill completes.",
    tone: "outgoing",
  },
  {
    id: "3",
    sender: "Agent X",
    timestamp: "09:33",
    content:
      "Once the CIL form is generated, attach it and submit for review.",
    tone: "incoming",
  },
  {
    id: "4",
    sender: "Agent Y",
    timestamp: "09:40",
    content:
      "Acknowledged. I will attach the generated CIL form shortly.",
    tone: "outgoing",
  },
]

export default function WorkspaceChatPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Chat
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Coordinate with Agent X in real time.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
              <Search className="h-4 w-4" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
                placeholder="Search conversations"
                type="text"
              />
            </div>

            <div className="mt-4 space-y-3">
              {conversations.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-start gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                  type="button"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {item.role}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                      {item.lastMessage}
                    </p>
                  </div>
                  {item.unread > 0 && (
                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                      {item.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Agent X Discussion
                </h2>
                <p className="text-xs text-slate-500">
                  Active thread · Project Z7@qL2
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Live
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.tone === "outgoing"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      message.tone === "outgoing"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {message.sender}
                    </p>
                    <p className="mt-2">{message.content}</p>
                    <p
                      className={`mt-3 text-[10px] ${
                        message.tone === "outgoing"
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <button
                  className="text-slate-500 hover:text-slate-700"
                  type="button"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                  placeholder="Type your message..."
                  type="text"
                />
                <button
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  type="button"
                >
                  Send
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
