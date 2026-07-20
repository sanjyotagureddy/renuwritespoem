export type ThemeOption = {
  id: "classic" | "minimal" | "floral";
  name: string;
  desc: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  cardTitle: string;
  cardAccent: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
};

export const THEMES: ThemeOption[] = [
  {
    id: "classic",
    name: "Classic Sanctuary",
    desc: "Warm golden-ivory parchment with gold filigree borders",
    cardBg: "bg-[#FDFBF7]",
    cardBorder: "border-[#D4AF37]",
    cardText: "text-[#2A2A2A]",
    cardTitle: "text-[#1A1A1A]",
    cardAccent: "text-[#B8860B]",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-400",
  },
  {
    id: "minimal",
    name: "Minimalist Solitude",
    desc: "Stark off-white background with refined slate borders",
    cardBg: "bg-[#FAFAFA]",
    cardBorder: "border-[#5A626A]",
    cardText: "text-[#2B2D30]",
    cardTitle: "text-[#0F1115]",
    cardAccent: "text-[#4A5568]",
    badgeBg: "bg-white/10",
    badgeBorder: "border-white/20",
    badgeText: "text-white/80",
  },
  {
    id: "floral",
    name: "Romantic Rose",
    desc: "Soft blush rose background with deep burgundy wine trim",
    cardBg: "bg-[#FDE8EC]",
    cardBorder: "border-[#8B263E]",
    cardText: "text-[#3D1A24]",
    cardTitle: "text-[#4A0E1C]",
    cardAccent: "text-[#8B263E]",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-400",
  },
];
