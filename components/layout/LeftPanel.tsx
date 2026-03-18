"use client";

import { PreviewMessage } from "@/components/message";
import { Input } from "@/components/input";
import { DeployButton, ProjectInfo } from "@/components/project-info";
import { AISDKLogo } from "@/components/icons";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { ResizablePanel } from "@/components/ui/resizable";
import { type Message } from "@ai-sdk/react";
import { DebugPanel } from "@/features/events/components/DebugPanel";

export interface ChatProps {
  messages: Message[];
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  isLoading: boolean;
  append: (message: { role: "user" | "assistant"; content: string }) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement | null>;
  isInitializing: boolean;
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  status,
  stop,
  isLoading,
  append,
  containerRef,
  endRef,
  isInitializing,
}: ChatProps) {
  return (
    <>
      <div className="bg-white py-4 px-4 flex justify-between items-center">
        <AISDKLogo />
        <DeployButton />
      </div>

      <div
        className="flex-1 space-y-6 py-4 overflow-y-auto px-4"
        ref={containerRef}
      >
        {messages.length === 0 ? <ProjectInfo /> : null}
        {messages.map((message: Message) => (
          <PreviewMessage
            message={message}
            key={message.id}
            isLoading={isLoading}
          />
        ))}
        <div ref={endRef} className="pb-2" />
      </div>

      {messages.length === 0 && (
        <PromptSuggestions
          disabled={isInitializing}
          submitPrompt={(prompt: string) =>
            append({ role: "user", content: prompt })
          }
        />
      )}
      <div className="mt-auto shrink-0 w-full">
        <DebugPanel />
      </div>
      <div className="bg-white shrink-0">
        <form onSubmit={handleSubmit} className="p-4">
          <Input
            handleInputChange={handleInputChange}
            input={input}
            isInitializing={isInitializing}
            isLoading={isLoading}
            status={status}
            stop={stop}
          />
        </form>
      </div>
    </>
  );
}

export function LeftPanel({ chatProps }: { chatProps: ChatProps }) {
  return (
    <ResizablePanel
      defaultSize={30}
      minSize={25}
      className="flex flex-col border-r border-zinc-200 bg-white"
    >
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <ChatInterface {...chatProps} />
      </div>
    </ResizablePanel>
  );
}
