export type EventStatus = "pending" | "success" | "error" | "aborted";

export interface BaseEvent {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  status: EventStatus;
  duration?: number; // Duration of the event in milliseconds
}

export interface TypingPayload {
  text: string;
}

export interface KeyPressPayload {
  key: string;
  modifiers?: string[]; // e.g., ["shift", "ctrl", "alt", "meta"]
}

export interface ScreenshotPayload {
  format?: "png" | "jpeg" | "webp";
  url?: string; // URL if the screenshot is uploaded
  base64?: string; // Base64 representation if kept inline
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WaitPayload {
  durationMs: number;
}

export interface BashPayload {
  command: string;
  cwd?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}

export interface MousePayload {
  action: string;
  coordinate?: [number, number];
}

export interface ScrollPayload {
  direction?: string;
  amount?: number;
}

export interface TypingEvent extends BaseEvent {
  type: "typing";
  payload: TypingPayload;
}

export interface KeyPressEvent extends BaseEvent {
  type: "key_press";
  payload: KeyPressPayload;
}

export interface ScreenshotEvent extends BaseEvent {
  type: "screenshot";
  payload: ScreenshotPayload;
}

export interface WaitEvent extends BaseEvent {
  type: "wait";
  payload: WaitPayload;
}

export interface BashEvent extends BaseEvent {
  type: "bash";
  payload: BashPayload;
}

export interface MouseEvent extends BaseEvent {
  type: "mouse";
  payload: MousePayload;
}

export interface ScrollEvent extends BaseEvent {
  type: "scroll";
  payload: ScrollPayload;
}

export type AIEvent =
  | TypingEvent
  | KeyPressEvent
  | ScreenshotEvent
  | WaitEvent
  | BashEvent
  | MouseEvent
  | ScrollEvent;
