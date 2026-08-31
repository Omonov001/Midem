"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserHeartbeat() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const sendHeartbeat = async () => {
      try {
        fetch(`/api/users/${user.id}/heartbeat`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: user.id,
          }),
        });
      } catch (error) {
        console.error("Heartbeat xatosi:", error);
      }
    };

    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 60_000);

    return () => clearInterval(interval);
  }, [user, isLoaded]);

  return null;
}
