import { useShallow } from "zustand/react/shallow";
import { type AIEvent } from "@/types/event";
import { useSessionStore } from "./session-store";

export type AgentStatus = "idle" | "thinking" | "executing";

// Helper hook to retrieve events for the currently active session natively
export const useActiveEvents = (): AIEvent[] => {
  return useSessionStore((s) => {
    if (!s.activeSessionId) return [];
    const active = s.sessions.find((session) => session.id === s.activeSessionId);
    return active?.events || [];
  });
};

// Derived state hooks designed to prevent unnecessary re-renders
export const useEventCountByType = () => {
  return useSessionStore(
    useShallow((state) => {
      const counts: Record<string, number> = {};
      const active = state.sessions.find(s => s.id === state.activeSessionId);
      const events = active?.events || [];

      for (const event of events) {
        counts[event.type] = (counts[event.type] || 0) + 1;
      }

      return counts;
    })
  );
};

export const useAgentStatus = (): AgentStatus => {
  return useSessionStore((state) => {
    const active = state.sessions.find(s => s.id === state.activeSessionId);
    const events = active?.events || [];
    
    if (events.length === 0) return "idle";

    // Detect execution state by inspecting pending status
    const pendingEvents = events.filter((e) => e.status === "pending");
    
    if (pendingEvents.length > 0) {
      // Simple heuristic: If it is purely 'waiting' to execute a tool layout process or AI generation step, it's thinking.
      // Otherwise, if interacting actively with Bash, Typing, Key Presses, it's executing.
      const isOnlyWaiting = pendingEvents.every((e) => e.type === "wait");
      return isOnlyWaiting ? "thinking" : "executing";
    }

    return "idle";
  });
};
