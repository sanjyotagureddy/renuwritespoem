"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import BadgeCelebration from "./badge-celebration";
import { Badge } from "@/lib/domain/badges";

export default function AchievementTracker() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (status !== "authenticated" || pathname === "/account") return;

    const fetchBadges = async () => {
      try {
        const res = await fetch("/api/account/badges");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setBadges(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch badges:", err);
      }
    };

    // Initial check on page load / pathname change
    fetchBadges();

    // Listen for custom achievement check events
    const handleCheck = () => {
      fetchBadges();
    };

    window.addEventListener("achievement-check", handleCheck);
    return () => {
      window.removeEventListener("achievement-check", handleCheck);
    };
  }, [status, pathname]);

  if (status !== "authenticated" || pathname === "/account" || badges.length === 0) {
    return null;
  }

  return <BadgeCelebration badges={badges} />;
}
