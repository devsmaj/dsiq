"use client";

import { Circle, Menu, Mic, Plus, Search } from "lucide-react";

import { PrivateRoute } from "@/components/private-route";

function Composer() {
  return (
    <div className="w-full rounded-[22px] border border-[#d9d9d9] bg-[#f4f4f4] px-4 py-3 shadow-[0_8px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <Plus className="h-5 w-5 text-[#1f1f1f]" />
        <input
          type="text"
          placeholder="Ask anything"
          className="h-8 flex-1 bg-transparent text-[16px] text-[#252525] outline-none placeholder:text-[#9a9a9a]"
        />
        <button className="hidden text-sm text-[#737373] sm:inline-flex">Instant</button>
        <Mic className="h-4 w-4 text-[#1f1f1f]" />
        <button
          aria-label="Start recording"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#090909]"
        >
          <Circle className="h-4 w-4 fill-white text-white" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[#efefef]">
        <div className="hidden min-h-screen md:flex">
          <aside className="flex w-[68px] flex-col items-center justify-between border-r border-[#dfdfdf] bg-[#ececec] py-5">
            <div className="flex flex-col items-center gap-6">
              <div className="h-7 w-7 rounded-full border border-[#111]" />
              <button aria-label="Edit" className="text-[#141414]">✎</button>
              <Search className="h-5 w-5 text-[#141414]" />
              <div className="h-5 w-5 rounded-full border border-[#141414]" />
            </div>
            <div className="h-8 w-8 rounded-full bg-[#8a8a8a]" />
          </aside>

          <main className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-[760px]">
              <h1 className="mb-10 text-center text-[40px] font-normal text-[#1f1f1f]">How can I help, CEO?</h1>
              <Composer />
            </div>
          </main>
        </div>

        <div className="flex min-h-screen flex-col md:hidden">
          <header className="flex items-center justify-between px-4 pt-6">
            <Menu className="h-5 w-5 text-[#2c2c2c]" />
            <div className="h-5 w-5 rounded-full border border-[#2c2c2c]" />
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
