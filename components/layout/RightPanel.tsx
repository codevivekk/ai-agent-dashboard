"use client";

import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useUIStore } from "@/stores/ui-store";
import { useActiveEvents } from "@/stores/event-store";

export interface RightPanelProps {
  streamUrl: string | null;
  isInitializing: boolean;
  refreshDesktop: () => void;
}

const VncViewer = memo(function VncViewer({
  streamUrl,
  isInitializing,
  refreshDesktop,
}: {
  streamUrl: string | null;
  isInitializing: boolean;
  refreshDesktop: () => void;
}) {
  return (
    <>
      {streamUrl ? (
        <>
          <iframe
            src={streamUrl}
            className="w-full h-full"
            style={{
              transformOrigin: "center",
              width: "100%",
              height: "100%",
            }}
            allow="autoplay"
          />
          <Button
            onClick={refreshDesktop}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded text-sm z-10"
            disabled={isInitializing}
          >
            {isInitializing ? "Creating desktop..." : "New desktop"}
          </Button>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-white bg-black w-full">
          {isInitializing ? "Initializing desktop..." : "Loading stream..."}
        </div>
      )}
    </>
  );
});

export function RightPanel({
  streamUrl,
  isInitializing,
  refreshDesktop,
}: RightPanelProps) {
  const selectedEventId = useUIStore((s) => s.selectedEventId);
  const events = useActiveEvents();
  const selectedEvent = events.find((e) => e.id === selectedEventId);
  return (
    <ResizablePanel
      defaultSize={70}
      minSize={40}
      className="bg-black relative items-center justify-center flex flex-col"
    >
      <ResizablePanelGroup direction="vertical" className="h-full w-full">
        <ResizablePanel
          defaultSize={70}
          minSize={20}
          className="relative items-center justify-center flex flex-col w-full h-full"
        >
          <VncViewer
            streamUrl={streamUrl}
            isInitializing={isInitializing}
            refreshDesktop={refreshDesktop}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={30}
          minSize={10}
          className="bg-zinc-950 border-t border-zinc-800 text-white p-4 overflow-y-auto w-full"
        >
          {selectedEvent ? (
            <div className="flex flex-col h-full items-start justify-start w-full">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                Event Selection
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
                  {selectedEvent.type}
                </span>
              </h3>
              
              <div className="w-full">
                {selectedEvent.type === "screenshot" ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-zinc-400">Captured Screenshot Output:</p>
                    {selectedEvent.status === "pending" ? (
                      <div className="w-full aspect-[1024/768] rounded-sm bg-zinc-800 animate-pulse"></div>
                    ) : selectedEvent.payload.base64 ? (
                      <div className="p-2 bg-black rounded-md w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/png;base64,${selectedEvent.payload.base64}`}
                          alt="Screenshot"
                          className="w-full aspect-[1024/768] rounded-sm object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">Failed to render screenshot</p>
                    )}
                  </div>
                ) : selectedEvent.type === "typing" ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-zinc-400">Text Content:</p>
                    <div className="p-3 bg-zinc-900 rounded border border-zinc-800 break-words whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {selectedEvent.payload.text}
                    </div>
                  </div>
                ) : selectedEvent.type === "key_press" ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-zinc-400">Key Pressed:</p>
                    <div className="p-3 bg-zinc-900 rounded border border-zinc-800 font-mono text-sm">
                      <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 font-semibold">{selectedEvent.payload.key}</kbd>
                    </div>
                  </div>
                ) : selectedEvent.type === "bash" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-zinc-400">Executing Command:</p>
                      <div className="p-3 bg-zinc-900 rounded border border-zinc-800 font-mono text-xs overflow-x-auto text-yellow-400">
                        {selectedEvent.payload.command}
                      </div>
                    </div>
                    {selectedEvent.status === "success" && selectedEvent.payload.stdout && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-zinc-400">Standard Output (stdout):</p>
                        <div className="p-3 bg-black rounded border border-zinc-800 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                          {selectedEvent.payload.stdout}
                        </div>
                      </div>
                    )}
                    {selectedEvent.status === "success" && selectedEvent.payload.stderr && (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-red-400">Standard Error (stderr):</p>
                        <div className="p-3 bg-red-950/20 text-red-200 rounded border border-red-900/50 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                          {selectedEvent.payload.stderr}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center opacity-50 py-10">
                    <p className="text-sm">No specialized viewer available for <code>{selectedEvent.type}</code>.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center opacity-50">
              <h3 className="text-lg font-medium mb-2">Tool Details</h3>
              <p className="text-sm">Select an event from the chat to view details...</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
}
