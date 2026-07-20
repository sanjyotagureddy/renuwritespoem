"use client";

import { SessionProvider } from "next-auth/react";
import AttributionTracker from "./attribution-tracker";
import AchievementTracker from "@/components/account/achievement-tracker";
import CookieConsentBanner from "@/components/ui/cookie-consent";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AttributionTracker />
      <AchievementTracker />
      <CookieConsentBanner />
      {children}
    </SessionProvider>
  );
}
