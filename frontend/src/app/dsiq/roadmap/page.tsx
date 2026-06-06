"use client";

import Link from "next/link";
import { Bot, Check, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

import { DsiqAppSidebar } from "@/components/dsiq-app-sidebar";
import { PrivateRoute } from "@/components/private-route";
import { listRoadmaps, type Roadmap } from "@/lib/roadmap-store";
import { useUserProfile } from "@/lib/use-user-profile";

export default function DsiqRoadmapPage() {
  const { user } = useUserProfile();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmaps() {
      if (!user) {
        setRoadmaps([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setRoadmaps(await listRoadmaps(user.uid));
      setIsLoading(false);
    }

    void loadRoadmaps();
  }, [user]);

  const activeRoadmap = roadmaps[0];

  return (
    <PrivateRoute>
      <DsiqAppSidebar activeHref="/dsiq/roadmap">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 py-20 sm:px-8 lg:py-10">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-line)] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                Learning Roadmap
              </p>
              <h1 className="mt-2 text-2xl font-semibold">Your learning path</h1>
            </div>
            <Link
              href="/dsiq/mentor"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Bot className="h-4 w-4" aria-hidden="true" />
              Create roadmap with AI Teacher
            </Link>
          </header>

          {isLoading ? (
            <p className="rounded-2xl bg-white px-5 py-4 text-sm text-[color:var(--color-muted)]">
              Loading roadmap...
            </p>
          ) : activeRoadmap ? (
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <article className="rounded-2xl border border-[color:var(--color-line)] bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {activeRoadmap.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--color-muted)]">
                      Goal: {activeRoadmap.goal}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {activeRoadmap.steps.map((step) => (
                    <div
                      key={step.id}
                      className="rounded-2xl border border-[color:var(--color-line)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-strong)] text-xs font-semibold">
                          {step.orderNumber}
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold">{step.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[color:var(--color-muted)]">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <aside className="rounded-2xl border border-[color:var(--color-line)] bg-white p-5">
                <p className="text-sm font-semibold">Progress</p>
                <p className="mt-2 text-3xl font-semibold">
                  {
                    activeRoadmap.steps.filter((step) => step.completed).length
                  }
                  /{activeRoadmap.steps.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
                  Next lesson:{" "}
                  {activeRoadmap.steps.find((step) => !step.completed)?.title ||
                    "Review your completed roadmap"}
                </p>
                <div className="mt-5 rounded-2xl bg-[color:var(--color-surface-strong)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Daily mission
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
                    Finish one focused lesson and ask your AI Teacher for a short
                    quiz before moving on.
                  </p>
                </div>
              </aside>
            </section>
          ) : (
            <section className="rounded-2xl border border-[color:var(--color-line)] bg-white px-5 py-12 text-center">
              <GraduationCap
                className="mx-auto h-10 w-10 text-[color:var(--color-muted)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold">No roadmap yet.</h2>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                Ask your AI Teacher to create one.
              </p>
              <Link
                href="/dsiq/mentor"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black"
              >
                <Bot className="h-4 w-4" aria-hidden="true" />
                Create roadmap with AI Teacher
              </Link>
            </section>
          )}
        </div>
      </DsiqAppSidebar>
    </PrivateRoute>
  );
}
