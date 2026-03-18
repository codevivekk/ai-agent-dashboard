import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Message } from "@ai-sdk/react";
import { type AIEvent } from "@/types/event";

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  events: AIEvent[];
  sandboxId?: string;
  createdAt: number;
  updatedAt: number;
}

interface SessionStore {
  sessions: Session[];
  activeSessionId: string | null;
  createSession: () => string;
  setActiveSessionId: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  addEvent: (event: AIEvent) => void;
  updateEvent: (id: string, updates: Partial<AIEvent>) => void;
  clearEvents: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      createSession: () => {
        const newSession: Session = {
          id: Math.random().toString(36).substring(2, 9),
          title: "New Chat",
          messages: [],
          events: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: newSession.id,
        }));
        return newSession.id;
      },
      setActiveSessionId: (id) => set({ activeSessionId: id }),
      deleteSession: (id) =>
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          let newActiveId = state.activeSessionId;
          if (newActiveId === id) {
            newActiveId = newSessions.length > 0 ? newSessions[0].id : null;
          }
          return { sessions: newSessions, activeSessionId: newActiveId };
        }),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
          ),
        })),
      addEvent: (event) =>
        set((state) => {
          if (!state.activeSessionId) return state;
          return {
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? { ...s, events: [...s.events, event], updatedAt: Date.now() }
                : s
            ),
          };
        }),
      updateEvent: (id, updates) =>
        set((state) => {
          if (!state.activeSessionId) return state;
          return {
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                    ...s,
                    events: s.events.map((e) =>
                      e.id === id ? ({ ...e, ...updates } as AIEvent) : e
                    ),
                    updatedAt: Date.now(),
                  }
                : s
            ),
          };
        }),
      clearEvents: () =>
        set((state) => {
          if (!state.activeSessionId) return state;
          return {
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? { ...s, events: [], updatedAt: Date.now() }
                : s
            ),
          };
        }),
    }),
    {
      name: "chat-sessions",
    }
  )
);
