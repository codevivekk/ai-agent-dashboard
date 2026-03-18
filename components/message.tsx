"use client";

import type { Message } from "ai";
import { AnimatePresence, motion } from "motion/react";
import React, { memo, useEffect } from "react";
import equal from "fast-deep-equal";
import { useSessionStore } from "@/stores/session-store";
import { type AIEvent } from "@/types/event";
import { ToolCardWrapper } from "@/features/events/components/ToolCard";
import { Streamdown } from "streamdown";
import { ABORTED, cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ToolCallTracker({ part }: { part: any }) {
  const addEvent = useSessionStore((s) => s.addEvent);
  const updateEvent = useSessionStore((s) => s.updateEvent);

  useEffect(() => {
    const { toolName, toolCallId, state, args, result } = part.toolInvocation;
    const sessionState = useSessionStore.getState();
    const activeSession = sessionState.sessions.find(s => s.id === sessionState.activeSessionId);
    if (!activeSession) return;
    const existing = activeSession.events.find((e) => e.id === toolCallId);

    if (state === "call" && !existing) {
      let type: AIEvent["type"] | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let payload: any = {};

      if (toolName === "computer") {
        if (args.action === "type") {
          type = "typing";
          payload = { text: args.text || "" };
        } else if (args.action === "key") {
          type = "key_press";
          payload = { key: args.text || "" };
        } else if (args.action === "screenshot") {
          type = "screenshot";
          payload = {};
        } else if (args.action === "wait") {
          type = "wait";
          payload = { durationMs: (args.duration || 0) * 1000 };
        } else if (args.action === "scroll") {
          type = "scroll";
          payload = { direction: args.scroll_direction, amount: args.scroll_amount };
        } else {
          type = "mouse";
          payload = { action: args.action, coordinate: args.coordinate };
        }
      } else if (toolName === "bash") {
        type = "bash";
        payload = { command: args.command || "" };
      }

      if (type) {
        addEvent({
          id: toolCallId,
          timestamp: Date.now(),
          status: "pending",
          type,
          payload,
        } as AIEvent);
      }
    } else if (state === "result" && existing && existing.status === "pending") {
      const duration = Date.now() - existing.timestamp;
      let status: "success" | "error" | "aborted" = "success";

      if (result === ABORTED) {
        status = "aborted";
      } else if (result && typeof result === "object" && result.error) {
        status = "error";
      }

      const updates: Partial<AIEvent> = {
        status,
        duration,
      };

      if (existing.type === "screenshot" && result?.type === "image" && result?.data) {
        updates.payload = { ...existing.payload, base64: result.data };
      } else if (existing.type === "bash" && result) {
        updates.payload = {
          ...existing.payload,
          stdout: result?.stdout,
          stderr: result?.stderr,
        };
      }

      updateEvent(toolCallId, updates);
    }
  }, [part, addEvent, updateEvent]);

  return null;
}

const PurePreviewMessage = ({
  message,
}: {
  message: Message;
  isLoading: boolean;
}) => {
  return (
    <AnimatePresence key={message.id}>
      <motion.div
        className="w-full mx-auto px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={`message-${message.id}`}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            "group-data-[role=user]/message:w-fit",
          )}
        >
          {/* {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )} */}

          <div className="flex flex-col w-full">
            {message.parts?.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className="flex flex-row gap-2 items-start w-full pb-4"
                    >
                      <div
                        className={cn("flex flex-col gap-4", {
                          "bg-secondary text-secondary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        <Streamdown>{part.text}</Streamdown>
                      </div>
                    </motion.div>
                  );
                case "tool-invocation": {
                  return (
                    <React.Fragment key={`message-${message.id}-part-${i}`}>
                      <ToolCallTracker part={part} />
                      <ToolCardWrapper toolCallId={part.toolInvocation.toolCallId} />
                    </React.Fragment>
                  );
                }

                default:
                  return null;
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.message.annotations !== nextProps.message.annotations)
      return false;
    // if (prevProps.message.content !== nextProps.message.content) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  },
);
