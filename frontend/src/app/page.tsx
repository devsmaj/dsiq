import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  Mic,
  Pencil,
  Plus,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
  description:
    "DSIQ helps you stop guessing your next move with AI guidance for skills, opportunities, and action.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DSIQ | Your AI coach for skills, opportunities, and action",
    description:
      "DSIQ helps you stop guessing your next move with AI guidance for skills, opportunities, and action.",
    url: "https://dsiq.app/",
  },
};

const navItems = [
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const promptModes = ["Write", "Plan", "Research", "Learn"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#edf2f8] p-0.5 text-[#202124]">
      <div className="flex min-h-[calc(100vh-4px)] overflow-hidden rounded-[9px] border border-[#d5dbe4] bg-[#edf2f8]">
        <aside className="hidden w-[72px] flex-col items-center justify-between bg-[#e6ecf5] py-7 md:flex">
          <div className="flex flex-col items-center gap-12 text-[#2b2f33]">
            <button type="button" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" aria-label="New prompt" className="text-[#8b929b]">
              <Pencil className="h-5 w-5" />
            </button>
          </div>

          <button type="button" aria-label="Settings" className="text-[#2b2f33]">
            <Settings className="h-5 w-5" />
          </button>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Open menu" className="md:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="text-xl font-medium tracking-tight">
                DSIQ
              </Link>
            </div>

            <nav className="hidden items-center gap-5 text-[13px] font-medium text-[#202124] lg:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-[#0b57d0]">
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#0b57d0] px-6 text-sm font-medium text-white transition hover:bg-[#0849b3]"
              >
                Login
              </Link>
            </nav>

            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#0b57d0] px-5 text-sm font-medium text-white transition hover:bg-[#0849b3] lg:hidden"
            >
              Login
            </Link>
          </header>

          <div className="flex flex-1 flex-col items-center px-5 pb-3 pt-[72px] sm:px-8 lg:pt-[82px]">
            <div className="w-full max-w-[760px]">
              <h1 className="text-[42px] font-normal leading-[1.18] text-[#202124] sm:text-[46px]">
                Meet DSIQ, your personal
                <br className="hidden sm:block" /> AI assistant
              </h1>

              <form className="mt-7 rounded-[30px] bg-white px-6 py-5 shadow-[0_2px_10px_rgba(60,64,67,0.16),0_1px_3px_rgba(60,64,67,0.12)]">
                <input
                  type="text"
                  placeholder="Ask DSIQ"
                  className="h-9 w-full bg-transparent text-sm text-[#202124] outline-none placeholder:text-[#4b5158]"
                />

                <div className="mt-5 flex items-center gap-5">
                  <button type="button" aria-label="Add" className="text-[#303134]">
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-[#202124]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Tools
                  </button>
                  <div className="flex-1" />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-[#202124]"
                  >
                    Flash
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Microphone" className="text-[#303134]">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {promptModes.map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-white px-5 text-base text-[#2c3035] transition hover:bg-[#f7f9fc]"
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-auto text-center text-[11px] leading-5 text-[#4b5158]">
              <Link href="/terms" className="underline">
                DSIQ Terms
              </Link>{" "}
              and the{" "}
              <Link href="/privacy" className="underline">
                DSIQ Privacy Policy
              </Link>{" "}
              apply. DSIQ is AI and can make mistakes.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
