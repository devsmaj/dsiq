"use client";

import { Circle, Menu, Mic, Plus, Search, Image, PenTool, Globe, Zap } from "lucide-react";
import { useState } from "react";

import { PrivateRoute } from "@/components/private-route";

function Composer() {
  const [isRecording, setIsRecording] = useState(false);

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
        <button
          aria-label="Microphone"
          className="text-[#1f1f1f] hover:opacity-70 transition-opacity"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          aria-label="Start recording"
          onClick={() => setIsRecording(!isRecording)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            isRecording ? "bg-red-600" : "bg-[#090909]"
          }`}
        >
          <Zap className={`h-4 w-4 ${isRecording ? "text-red-300" : "fill-white text-white"}`} />
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-[#efefef]">
        {/* Desktop View */}
        <div className="hidden min-h-screen md:flex">
          <aside className="flex w-[68px] flex-col items-center justify-between border-r border-[#dfdfdf] bg-[#ececec] py-5">
            <div className="flex flex-col items-center gap-6">
              {/* Logo */}
              <button
                aria-label="Logo"
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#111] hover:bg-[#f0f0f0] transition-colors"
              >
                <span className="text-xs font-bold text-[#111]">D</span>
              </button>
              
              {/* Edit */}
              <button
                aria-label="Edit"
                className="text-[#141414] hover:opacity-70 transition-opacity"
              >
                <PenTool className="h-5 w-5" />
              </button>
              
              {/* Search */}
              <button
                aria-label="Search"
                className="text-[#141414] hover:opacity-70 transition-opacity"
              >
                <Search className="h-5 w-5" />
              </button>
              
              {/* Profile */}
              <button
                aria-label="Profile"
                className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-colors"
              />
            </div>
            
            {/* User Avatar */}
            <button
              aria-label="User menu"
              className="h-8 w-8 rounded-full bg-[#8a8a8a] hover:bg-[#7a7a7a] transition-colors"
            />
          </aside>

          <main className="flex flex-1 items-center justify-center px-6 py-8">
            <div className="w-full max-w-[760px] space-y-8">
              <div className="flex items-center justify-between">
                <div />
                <button
                  aria-label="Notifications"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d9d9d9] bg-white hover:bg-[#f9f9f9] transition-colors"
                >
                  <Zap className="h-4 w-4 text-[#666]" />
                </button>
              </div>

              <h1 className="text-center text-[40px] font-normal text-[#1f1f1f] leading-tight">
                Ready when you are.
              </h1>
              
              <Composer />
              
              <div className="flex gap-3 justify-center flex-wrap pt-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#d9d9d9] bg-white text-[#1f1f1f] hover:bg-[#f9f9f9] transition-colors text-sm">
                  <Image className="h-4 w-4" />
                  Create an image
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#d9d9d9] bg-white text-[#1f1f1f] hover:bg-[#f9f9f9] transition-colors text-sm">
                  <PenTool className="h-4 w-4" />
                  Write or edit
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#d9d9d9] bg-white text-[#1f1f1f] hover:bg-[#f9f9f9] transition-colors text-sm">
                  <Globe className="h-4 w-4" />
                  Look something up
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile View */}
        <div className="flex min-h-screen flex-col md:hidden">
          <header className="flex items-center justify-between px-4 pt-6 pb-4">
            <button
              aria-label="Menu"
              className="text-[#2c2c2c] hover:opacity-70 transition-opacity"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              aria-label="Notifications"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d9d9d9] bg-white"
            >
              <Zap className="h-4 w-4 text-[#666]" />
            </button>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <h1 className="mb-8 text-[28px] font-normal text-[#1f1f1f] leading-tight">
              Ready when you are.
            </h1>
          </div>

          <div className="space-y-4 px-3 pb-6">
            <div className="grid grid-cols-3 gap-2">
              <button
                className="flex flex-col items-center gap-2 rounded-lg bg-white p-3 hover:bg-[#f9f9f9] transition-colors border border-[#e5e5e5]"
                aria-label="Create an image"
              >
                <Image className="h-5 w-5 text-[#666]" />
                <span className="text-xs text-[#666] text-center">Create an image</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 rounded-lg bg-white p-3 hover:bg-[#f9f9f9] transition-colors border border-[#e5e5e5]"
                aria-label="Write or edit"
              >
                <PenTool className="h-5 w-5 text-[#666]" />
                <span className="text-xs text-[#666] text-center">Write or edit</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 rounded-lg bg-white p-3 hover:bg-[#f9f9f9] transition-colors border border-[#e5e5e5]"
                aria-label="Look something up"
              >
                <Globe className="h-5 w-5 text-[#666]" />
                <span className="text-xs text-[#666] text-center">Look something up</span>
              </button>
            </div>

            <Composer />
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
