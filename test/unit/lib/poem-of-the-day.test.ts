import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB storage
const mockPoems = [
  { id: "poem-a", title: "Poem A", slug: "poem-a", published: true },
  { id: "poem-b", title: "Poem B", slug: "poem-b", published: true },
  { id: "poem-c", title: "Poem C", slug: "poem-c", published: true },
];

let findManyMock = vi.fn().mockResolvedValue(mockPoems);
let findUniqueMock = vi.fn().mockImplementation(({ where }) => {
  const p = mockPoems.find((x) => x.id === where.id);
  if (!p) return null;
  return {
    ...p,
    genre: { name: "Spirituality", slug: "spirituality" },
    _count: { likes: 5, comments: 2 },
  };
});

vi.mock("../../../src/lib/db", () => {
  return {
    getPrisma: () => ({
      poem: {
        findMany: findManyMock,
        findUnique: findUniqueMock,
      },
    }),
  };
});

import { getPoemOfTheDay } from "../../../src/lib/domain/poems-data";

describe("getPoemOfTheDay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManyMock.mockResolvedValue(mockPoems);
  });

  it("should return null if there are no published poems", async () => {
    findManyMock.mockResolvedValue([]);
    const result = await getPoemOfTheDay("2026-07-20");
    expect(result).toBeNull();
    expect(findManyMock).toHaveBeenCalledWith({
      where: { published: true },
      select: { id: true },
    });
  });

  it("should return a poem deterministically based on dateSeed", async () => {
    const result1 = await getPoemOfTheDay("2026-07-20");
    const result2 = await getPoemOfTheDay("2026-07-20");
    
    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    expect(result1?.id).toBe(result2?.id);
    expect(findUniqueMock).toHaveBeenCalled();
  });

  it("should potentially return different poems for different dateSeeds", async () => {
    const resultA = await getPoemOfTheDay("2026-07-20");
    const resultB = await getPoemOfTheDay("2026-07-22");

    expect(resultA).not.toBeNull();
    expect(resultB).not.toBeNull();
    expect(findUniqueMock).toHaveBeenCalledTimes(2);
  });

  it("should fallback to today's date if no seed is specified", async () => {
    const result = await getPoemOfTheDay();
    expect(result).not.toBeNull();
    expect(result?.title).toBeDefined();
    expect(findManyMock).toHaveBeenCalled();
    expect(findUniqueMock).toHaveBeenCalled();
  });
});
