"use client";

import { SessionProvider } from "next-auth/react";
import AttributionTracker from "./attribution-tracker";
import AchievementTracker from "@/components/account/achievement-tracker";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AttributionTracker />
      <AchievementTracker />
      {children}
    </SessionProvider>
  );
}
