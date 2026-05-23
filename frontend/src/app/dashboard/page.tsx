"use client";

import {
  ChevronDown,
  CircleDashed,
  Menu,
  MessageCircle,
  Mic,
  Pencil,
  Plus,
  Search,
  SlidersVertical,
  Image as ImageIcon,
  Globe2,
  AudioLines,
} from "lucide-react";

import { PrivateRoute } from "@/components/private-route";

const railItems = [
  { label: "New chat", icon: Pencil },
  { label: "Search", icon: Search },
  { label: "Messages", icon: MessageCircle },
];

const actionItems = [
  { label: "Create an image", icon: ImageIcon },
  { label: "Write or edit", icon: Pencil },
  { label: "Look something up", icon: Globe2 },
];

function DashboardMark() {
  return (
    <a
      href="/dashboard"
      aria-label="DSIQ dashboard"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#dcdcdc] text-[8px] font-semibold leading-none text-[#111111]"
    >
      D
    </a>
  );
}

function Composer() {
  return (
    <form className="w-full rounded-[24px] border border-[#dedede] bg-white px-4 py-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.08)]">
      <div className="flex h-8 items-center gap-3">
        <button
          type="button"
          aria-label="Add attachment"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#202020] transition hover:bg-[#f5f5f5]"
        >
          <Plus className="h-5 w-5" />
        </button>
        <input
          type="text"
          placeholder="Ask anything"
          className="h-8 min-w-0 flex-1 bg-transparent text-[12px] text-[#202020] outline-none placeholder:text-[#8b8b8b]"
        />
        <button
          type="button"
          className="hidden h-8 items-center gap-1 rounded-full px-2 text-[12px] text-[#7b7b7b] transition hover:bg-[#f5f5f5] sm:inline-flex"
        >
          Instant
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Microphone"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#202020] transition hover:bg-[#f5f5f5]"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="submit"
          aria-label="Start recording"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-[#1f1f1f]"
        >
          <AudioLines className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function QuickActions() {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
      {actionItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            type="button"
            key={item.label}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 text-[12px] text-[#3f3f3f] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:bg-[#f8f8f8]"
          >
            <Icon className="h-4 w-4 text-[#5e5e5e]" aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="flex w-[48px] flex-col items-center justify-between border-r border-[#eeeeee] bg-white py-4">
      <div className="flex flex-col items-center gap-6 text-[#111111]">
        <DashboardMark />
        {railItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              className="inline-flex h-5 w-5 items-center justify-center rounded-md transition hover:bg-[#f4f4f4]"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5f5f5f] text-[7px] font-semibold leading-none text-white shadow-inner">
        SMAJ
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[#f5f5f5] p-0.5 text-[#111111]">
        <div className="hidden min-h-[calc(100vh-4px)] overflow-hidden rounded-[9px] border border-[#d8d8d8] bg-white md:flex">
          <Sidebar />

          <main className="relative flex flex-1 items-center justify-center px-8">
            <button
              type="button"
              aria-label="Activity"
              className="absolute right-8 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition hover:bg-[#f5f5f5]"
            >
              <CircleDashed className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <div className="w-full max-w-[694px] -translate-y-2">
              <h1 className="mb-11 text-center text-[22px] font-normal leading-tight text-[#111111]">
                What&apos;s on your mind today?
              </h1>
              <Composer />
              <QuickActions />
            </div>
          </main>
        </div>

        <div className="flex min-h-screen flex-col bg-white md:hidden">
          <header className="flex items-center justify-between px-4 pt-6 text-[#1f1f1f]">
            <button type="button" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <DashboardMark />
            <button type="button" aria-label="Controls">
              <SlidersVertical className="h-4 w-4" />
            </button>
          </header>

          <main className="flex flex-1 flex-col justify-center px-4 pb-16">
            <h1 className="mb-8 text-center text-[22px] font-normal leading-tight text-[#111111]">
              What&apos;s on your mind today?
            </h1>
            <Composer />
            <QuickActions />
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}
