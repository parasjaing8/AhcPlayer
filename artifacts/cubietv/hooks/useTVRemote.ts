import { useEffect } from "react";
import { HWKeyEvent, TVEventHandler } from "react-native";

type TVRemoteEvent = "select" | "playPause" | "left" | "right" | "up" | "down" | "back";

const KEY_MAP: Record<string, TVRemoteEvent> = {
  select: "select",
  playPause: "playPause",
  longSelect: "playPause",
  left: "left",
  right: "right",
  up: "up",
  down: "down",
  back: "back",
};

// Handles Fire TV / Android TV remote D-pad and media key events.
// Only active when `enabled` is true — disable when a modal/overlay captures input.
export function useTVRemote(
  handler: (event: TVRemoteEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const tvEventHandler = new TVEventHandler();
    tvEventHandler.enable(null, (_cmp: unknown, evt: HWKeyEvent) => {
      const mapped = KEY_MAP[evt.eventType];
      if (mapped) handler(mapped);
    });

    return () => {
      tvEventHandler.disable();
    };
  }, [handler, enabled]);
}
