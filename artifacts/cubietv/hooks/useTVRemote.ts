import { useEffect } from "react";
import { BackHandler } from "react-native";

type TVRemoteEvent = "select" | "playPause" | "left" | "right" | "up" | "down" | "back";

// On Android TV / Fire TV, D-pad routing happens through the React Native focus system.
// This hook only handles the hardware back button — D-pad OK/select goes to the
// focused Pressable via onPress automatically.
export function useTVRemote(
  handler: (event: TVRemoteEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handler("back");
      return true; // prevent default back navigation
    });

    return () => sub.remove();
  }, [handler, enabled]);
}
