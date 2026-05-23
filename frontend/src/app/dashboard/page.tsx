"use client";

import {
  Circle,
  Compass,
  Menu,
  MessageCircle,
  Mic,
  Pencil,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import { PrivateRoute } from "@/components/private-route";

function Composer() {
  return (
    <div className="w-full rounded-[26px] border border-[#d5d5d5] bg-[#f1f1f1] px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3">
        <button aria-label="Add" className="inline-flex text-[#1f1f1f]">
          <Plus className="h-5 w-5" />
        </button>

        <input
          type="text"
          placeholder="Ask anything"
          className="h-8 flex-1 bg-transparent text-[16px] text-[#1f1f1f] outline-none placeholder:text-[#9a9a9a]"
        />

        <button className="hidden items-center gap-1 text-sm text-[#737373] sm:inline-flex">
          Instant
        </button>

        <button aria-label="Microphone" className="inline-flex text-[#1f1f1f]">
          <Mic className="h-4 w-4" />
        </button>

        <button
          aria-label="Start recording"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0b0b0b]"
        >
          <Circle className="h-4 w-4 fill-white text-white" />
        </button>
      </div>
    </div>
  );
}

function LeftRail() {
  return (
    <aside className="flex w-[52px] flex-col items-center justify-between border-r border-[#dddddd] bg-[#ececec] py-4">
      <div className="flex flex-col items-center gap-5 text-[#1d1d1d]">
        <Sparkles className="h-4 w-4" />
        <Pencil className="h-4 w-4" />
        <Search className="h-4 w-4" />
        <MessageCircle className="h-4 w-4" />
      </div>
      <div className="h-6 w-6 rounded-full bg-[#7f7f7f]" />
    </aside>
  );
}

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[#ececec]">
        <div className="hidden min-h-screen md:flex">
          <LeftRail />

          <main className="relative flex flex-1 items-center justify-center px-8">
            <button aria-label="Compass" className="absolute right-8 top-8 text-[#1f1f1f]">
              <Compass className="h-4 w-4" />
            </button>

            <div className="w-full max-w-[700px]">
              <h1 className="mb-12 text-center text-[38px] font-normal text-[#1f1f1f]">How can I help, CEO?</h1>
              <Composer />
            </div>
          </main>
        </div>

        <div className="flex min-h-screen flex-col md:hidden">
          <header className="flex items-center justify-between px-4 pt-6 text-[#1f1f1f]">
            <Menu className="h-5 w-5" />
            <Compass className="h-4 w-4" />
          </header>

          <div className="flex-1" />

          <div className="px-3 pb-3">
            <Composer />
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
