"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Bug, CheckCircle, CircleSlash, StopCircle, Loader2 } from "lucide-react";
import { useActiveEvents, useEventCountByType } from "@/stores/event-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const events = useActiveEvents();
  const typeCounts = useEventCountByType();
  const selectedEventId = useUIStore((s) => s.selectedEventId);
  const setSelectedEventId = useUIStore((s) => s.setSelectedEventId);

  const totalEvents = events.length;

  return (
    <div className="flex flex-col border-t border-zinc-200 bg-zinc-50 dark:bg-zinc-950/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5" />
          <span>Debug Events ({totalEvents})</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 p-4 border-t border-zinc-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <span className="font-mono text-zinc-600 dark:text-zinc-400">{type}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-500">Event Log</span>
            <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded p-2 bg-white dark:bg-zinc-900">
              {events.length === 0 ? (
                <span className="text-xs text-zinc-400 italic">No events yet</span>
              ) : (
                events.map((e) => {
                  const isSelected = selectedEventId === e.id;
                  
                  return (
                    <div 
                      key={e.id} 
                      onClick={() => setSelectedEventId(e.id)}
                      className={cn(
                        "flex items-center gap-2 text-xs font-mono p-1 px-2 rounded cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white font-medium" 
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300"
                      )}
                    >
                      <span className={cn(
                        isSelected ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-500"
                      )}>[{e.type}]</span>
                      {e.status === "pending" ? (
                        <Loader2 className="animate-spin h-3 w-3 text-zinc-500" />
                      ) : e.status === "error" ? (
                        <StopCircle className="h-3 w-3 text-red-500" />
                      ) : e.status === "aborted" ? (
                        <CircleSlash className="h-3 w-3 text-amber-600" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      )}
                      {e.duration !== undefined && (
                        <span className="text-zinc-400 dark:text-zinc-500 ml-auto mr-1">
                          ({(e.duration / 1000).toFixed(1)}s)
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-500">Raw State (JSON)</span>
            <div className="relative">
              <pre className="p-3 text-[10px] sm:text-xs font-mono bg-zinc-900 text-zinc-300 rounded overflow-auto max-h-[200px] border border-zinc-800">
                {JSON.stringify(events, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
