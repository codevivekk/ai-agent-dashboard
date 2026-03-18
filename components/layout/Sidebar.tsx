import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { useSessionStore } from "@/stores/session-store";
import { cn } from "@/lib/utils";
import { ResizablePanel } from "@/components/ui/resizable";

export function Sidebar({
  className,
}: {
  className?: string;
}) {
  const { sessions, activeSessionId, createSession, setActiveSessionId, deleteSession } = useSessionStore();

  return (
    <div className={cn("flex flex-col h-full bg-zinc-50 border-r border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800", className)}>
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Button onClick={() => createSession()} className="w-full gap-2 text-sm h-10 shadow-sm" variant="default">
          <Plus size={16} /> New Session
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActiveSessionId(session.id)}
            className={cn(
              "flex items-center justify-between p-2 rounded-md cursor-pointer group text-sm transition-colors",
              activeSessionId === session.id
                ? "bg-zinc-200/60 dark:bg-zinc-800/60 text-black dark:text-white font-medium shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <MessageSquare size={14} className="shrink-0 flex-none opacity-50" />
              <span className="truncate">
                {session.messages.length > 0 && session.messages[0].content
                  ? session.messages[0].content.slice(0, 40)
                  : session.title}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 -m-1.5 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all text-zinc-400"
              aria-label="Delete Session"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center p-4 mt-10 opacity-40 text-sm gap-2 text-center">
            <MessageSquare size={24} />
            <p>No chat sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SidebarPanel() {
  return (
    <ResizablePanel
      defaultSize={20}
      minSize={15}
      maxSize={30}
      className="hidden md:block bg-zinc-50 dark:bg-zinc-950"
    >
      <Sidebar />
    </ResizablePanel>
  );
}
