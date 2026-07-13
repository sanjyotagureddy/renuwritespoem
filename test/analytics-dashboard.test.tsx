import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AnalyticsTabs from "../src/components/admin/analytics-tabs";

describe("AnalyticsTabs Component", () => {
  const mockAttributionData = [
    { source: "instagram", clicks: 120, signups: 35 },
    { source: "whatsapp", clicks: 80, signups: 12 },
  ];

  const mockTopSharedPoems = [
    {
      title: "Nature Whispers",
      slug: "nature-whispers",
      views: 450,
      _count: { invites: 15 },
    },
  ];

  const mockSalesData = {
    totalRevenue: 2450.5,
    totalCopiesSold: 48,
    activeOrdersCount: 3,
    bookSalesList: [
      { id: "book-1", title: "Whispering Winds Anthology", copiesSold: 30 },
      { id: "book-2", title: "Silent Solitude", copiesSold: 18 },
    ],
    recentOrders: [
      {
        id: "order-1",
        orderNumber: "ORD-9921",
        name: "Jane Smith",
        email: "janesmith@example.com",
        copies: 2,
        totalAmount: 290.0,
        status: "PENDING",
        createdAt: "2026-07-13T10:00:00Z",
        bookTitle: "Whispering Winds Anthology",
      },
    ],
  };

  const mockEngagementData = {
    topAudio: [
      {
        id: "audio-1",
        title: "Voice of Silence Recitation",
        slug: "voice-of-silence-recitation",
        views: 890,
        likesCount: 32,
        commentsCount: 14,
      },
    ],
    topPoems: [
      {
        id: "poem-1",
        title: "The Quiet Desk",
        slug: "the-quiet-desk",
        views: 1200,
        likesCount: 55,
        commentsCount: 22,
      },
    ],
  };

  const mockCampaignData = {
    totalCampaignsSent: 4,
    averageOpenRate: 62.5,
    averageClickRate: 15.0,
    campaignHistory: [
      {
        id: "camp-1",
        subject: "Midsummer Poetry Release",
        sentAt: "2026-07-10T12:00:00Z",
        sentCount: 100,
        openedCount: 65,
        clickedCount: 20,
        openRate: 65.0,
        clickRate: 20.0,
      },
    ],
  };

  const mockActivityFeed = [
    {
      id: "act-1",
      type: "subscriber",
      text: "Alice subscribed to the newsletter",
      timestamp: "2026-07-13T15:30:00Z",
    },
    {
      id: "act-2",
      type: "like",
      text: "Bob liked \"Nature Whispers\"",
      timestamp: "2026-07-13T16:00:00Z",
    },
  ];

  it("should render and switch tabs successfully displaying correct analytics metrics", () => {
    cleanup();

    render(
      <AnalyticsTabs
        attributionData={mockAttributionData}
        invitesSentThisWeek={50}
        invitesAcceptedThisWeek={20}
        subscribersThisWeek={10}
        topSharedPoems={mockTopSharedPoems}
        salesData={mockSalesData}
        engagementData={mockEngagementData}
        campaignData={mockCampaignData}
        activityFeed={mockActivityFeed}
      />
    );

    // --- Tab 1: Audience & Growth (Default Active) ---
    expect(screen.getByText("Invites Sent (7d)")).toBeDefined();
    expect(screen.getAllByText("50").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/40\.0%/i).length).toBeGreaterThan(0); // conversion rate calculation: 20/50 = 40%
    expect(screen.getAllByText("10").length).toBeGreaterThan(0); // new subscribers
    expect(screen.getByText("Nature Whispers")).toBeDefined(); // Top shared poem title

    // --- Switch to Tab 2: Sales & Orders ---
    const salesTab = screen.getByRole("button", { name: /Sales & Orders/i });
    fireEvent.click(salesTab);

    // Verify sales metrics
    expect(screen.getByText("Total Sales Revenue")).toBeDefined();
    expect(screen.getByText("Copies Sold")).toBeDefined();
    expect(screen.getByText("48")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined(); // active order queue count
    expect(screen.getAllByText("Whispering Winds Anthology").length).toBeGreaterThan(0); // bestseller list & order details
    expect(screen.getByText("ORD-9921")).toBeDefined(); // order number
    expect(screen.getByText(/Jane Smith/i)).toBeDefined(); // customer name

    // --- Switch to Tab 3: Newsletter Campaigns ---
    const campaignsTab = screen.getByRole("button", { name: /Newsletter Campaigns/i });
    fireEvent.click(campaignsTab);

    // Verify campaign metrics
    expect(screen.getByText("Sent Campaigns")).toBeDefined();
    expect(screen.getByText("62.5%")).toBeDefined(); // average open rate
    expect(screen.getByText("15.0%")).toBeDefined(); // average CTR
    expect(screen.getByText("Midsummer Poetry Release")).toBeDefined(); // campaign subject

    // --- Switch to Tab 4: Activity & Engagement ---
    const engagementTab = screen.getByRole("button", { name: /Activity & Engagement/i });
    fireEvent.click(engagementTab);

    // Verify engagement & live feed logs
    expect(screen.getByText("Top Spoken Recordings")).toBeDefined();
    expect(screen.getByText("Voice of Silence Recitation")).toBeDefined();
    expect(screen.getByText("Top Poems Engagement")).toBeDefined();
    expect(screen.getByText("The Quiet Desk")).toBeDefined();
    expect(screen.getByText("Alice subscribed to the newsletter")).toBeDefined(); // activity feed item 1
    expect(screen.getByText("Bob liked \"Nature Whispers\"")).toBeDefined(); // activity feed item 2
  });
});
