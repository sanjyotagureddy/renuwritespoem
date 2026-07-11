"use client";

import { SessionProvider } from "next-auth/react";
import AttributionTracker from "./attribution-tracker";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AttributionTracker />
      {children}
    </SessionProvider>
  );
}
