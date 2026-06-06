"use client";

import { FileText, ImageIcon, Maximize2, Mic, Minimize2, Plus, Send } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
}

export function ChatComposer({
  isListening = false,
  isSending,
  onSubmit,
  onVoiceInput,
  placeholder,
  value,
  onChange,
}: {
  isListening?: boolean;
  isSending: boolean;
  onSubmit: (value: string) => void;
  onVoiceInput?: () => void;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const expandedInputRef = useRef<HTMLTextAreaElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    resizeTextarea(inputRef.current);
    resizeTextarea(expandedInputRef.current);
  }, [isExpanded, value]);

  function submitValue(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (isSending || !value.trim()) {
      return;
    }

    onSubmit(value);
    setIsExpanded(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    submitValue();
  }

  function appendAttachmentNames(files: FileList | null) {
    if (!files?.length || isSending) {
      return;
    }

    const names = Array.from(files)
      .map((file) => file.name)
      .join(", ");

    onChange(value.trim() ? `${value.trim()} Attached: ${names}` : `Attached: ${names}`);
    setIsUploadPanelOpen(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <>
      <form
        onSubmit={submitValue}
        className="w-full rounded-[28px] bg-white px-4 py-3 text-left shadow-[0_2px_10px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] sm:px-5 sm:py-4"
      >
        <div className="flex w-full items-end gap-2 sm:gap-3">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsUploadPanelOpen((current) => !current)}
              aria-label="Add attachment"
              aria-expanded={isUploadPanelOpen}
              disabled={isSending}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#303134] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
            {isUploadPanelOpen ? (
              <div className="absolute bottom-12 left-0 z-30 w-56 rounded-2xl border border-[color:var(--color-line)] bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                  Upload photos
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Upload files
                </button>
              </div>
            ) : null}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => appendAttachmentNames(event.target.files)}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => appendAttachmentNames(event.target.files)}
            />
          </div>

          <textarea
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder={placeholder}
            rows={1}
            className="max-h-[180px] min-h-10 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm leading-6 text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-70"
            style={{ width: "100%" }}
          />

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            disabled={isSending}
            aria-label="Expand composer"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#303134] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>

          {onVoiceInput ? (
            <button
              type="button"
              onClick={onVoiceInput}
              disabled={isSending}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full px-3 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isListening
                  ? "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]"
                  : "text-[#303134] hover:bg-[color:var(--color-surface-strong)]"
              }`}
            >
              {isListening ? (
                <span className="flex h-5 items-center gap-0.5" aria-hidden="true">
                  <span className="recording-wave" />
                  <span className="recording-wave [animation-delay:110ms]" />
                  <span className="recording-wave [animation-delay:220ms]" />
                  <span className="recording-wave [animation-delay:330ms]" />
                </span>
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : null}

          <button
            type="submit"
            aria-label="Send"
            disabled={isSending || !value.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] !text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:!text-gray-400"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      {isExpanded ? (
        <div className="fixed inset-0 z-[65] flex h-[100dvh] flex-col bg-white px-4 py-4 text-[color:var(--color-text)] sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 border-b border-[color:var(--color-line)] pb-4">
            <p className="text-sm font-semibold">Write your prompt</p>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white transition hover:bg-[color:var(--color-surface-strong)]"
              aria-label="Collapse composer"
            >
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-4 py-4">
            <textarea
              ref={expandedInputRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder={placeholder}
              autoFocus
              className="min-h-0 flex-1 resize-none rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-background)] p-4 text-base leading-7 outline-none transition focus:border-[#111111] disabled:cursor-not-allowed disabled:opacity-70"
            />
            <div className="flex items-center justify-between gap-3 pb-[env(safe-area-inset-bottom)]">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-5 text-sm font-semibold transition hover:bg-[color:var(--color-surface-strong)]"
              >
                Collapse
              </button>
              <button
                type="button"
                onClick={() => submitValue()}
                disabled={isSending || !value.trim()}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
