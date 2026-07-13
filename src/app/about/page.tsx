import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, BlogIcon } from "@/components/icons";
import { getOrCreateAuthorProfile } from "@/app/admin/author-actions";

export const metadata: Metadata = {
  title: "About Renu | Poet, Author & Dreamer",
  description:
    "Discover the creative drive behind Renu's poetry. Explore her writing journey, core inspiration, behind-the-scenes writing desk, publications, and awards gallery.",
  alternates: {
    canonical: "/about",
  },
  keywords: [
    "About Renu",
    "Poet Biography",
    "Renu Author",
    "Writing Journey",
    "Renu writes poem",
    "Poetry Awards",
    "Publications & Interviews",
    "Creative Desk",
  ],
  openGraph: {
    title: "About Renu | Poet, Author & Dreamer",
    description:
      "Explore Renu's poetry drive, writing journey, core inspiration, writing desk, publications, and awards gallery.",
    type: "profile",
    username: "renuwrites_poem",
    gender: "female",
    images: [
      {
        url: "/author.jpg",
        width: 1200,
        height: 1200,
        alt: "Renu - Poet & Author",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Renu | Poet, Author & Dreamer",
    description:
      "Explore Renu's poetry drive, writing journey, core inspiration, writing desk, publications, and awards gallery.",
    images: ["/author.jpg"],
  },
};

function getAwardIcon(award: string) {
  const lower = award.toLowerCase();
  if (
    lower.includes("1st") ||
    lower.includes("first") ||
    lower.includes("winner") ||
    lower.includes("champion")
  ) {
    return "🥇";
  }
  if (
    lower.includes("2nd") ||
    lower.includes("second") ||
    lower.includes("runner")
  ) {
    return "🥈";
  }
  if (lower.includes("3rd") || lower.includes("third")) {
    return "🥉";
  }
  return "🏆";
}

function getPublicationIcon(pub: string) {
  const lower = pub.toLowerCase();
  if (lower.includes("book") || lower.includes("novel")) {
    return "📚";
  }
  if (
    lower.includes("newspaper") ||
    lower.includes("news") ||
    lower.includes("journal") ||
    lower.includes("column")
  ) {
    return "📰";
  }
  return "📖";
}

function getInterviewIcon(intv: string) {
  const lower = intv.toLowerCase();
  if (
    lower.includes("video") ||
    lower.includes("youtube") ||
    lower.includes("watch") ||
    lower.includes("tv")
  ) {
    return "🎥";
  }
  if (
    lower.includes("podcast") ||
    lower.includes("audio") ||
    lower.includes("listen") ||
    lower.includes("radio")
  ) {
    return "🎙️";
  }
  return "💬";
}

function parseMarkdownLink(text: string) {
  const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;
  const rawUrlRegex = /(https?:\/\/[^\s]+)/;

  let label = "";
  let url = "";
  let descText = "";

  const mdMatch = text.match(mdRegex);
  if (mdMatch) {
    label = mdMatch[1];
    url = mdMatch[2];
    descText = text.replace(mdRegex, "").trim();
  } else {
    const rawMatch = text.match(rawUrlRegex);
    if (rawMatch) {
      url = rawMatch[1];
      descText = text.replace(rawUrlRegex, "").trim();

      // Dynamically extract domain name as a fallback label
      try {
        const domain = new URL(url).hostname.replace("www.", "");
        if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
          label = "YouTube";
        } else if (domain.includes("spotify.com")) {
          label = "Spotify";
        } else if (domain.includes("timesofindia")) {
          label = "Times of India";
        } else if (domain.includes("blogspot.com")) {
          label = "Blogspot";
        } else if (domain.includes("instagram.com")) {
          label = "Instagram";
        } else if (domain.includes("facebook.com")) {
          label = "Facebook";
        } else {
          const parts = domain.split(".");
          if (parts.length >= 2) {
            label =
              parts[parts.length - 2].charAt(0).toUpperCase() +
              parts[parts.length - 2].slice(1);
          } else {
            label = "Link";
          }
        }
      } catch {
        label = "Link";
      }
    }
  }

  if (url) {
    const lowerText = text.toLowerCase();
    const lowerUrl = url.toLowerCase();
    let actionVerb = "Click to View";
    if (
      lowerText.includes("video") ||
      lowerText.includes("youtube") ||
      lowerText.includes("watch") ||
      lowerUrl.includes("youtube") ||
      lowerUrl.includes("youtu.be")
    ) {
      actionVerb = "Click to Watch";
    } else if (
      lowerText.includes("podcast") ||
      lowerText.includes("audio") ||
      lowerText.includes("listen") ||
      lowerUrl.includes("spotify") ||
      lowerUrl.includes("soundcloud")
    ) {
      actionVerb = "Click to Listen";
    } else if (
      lowerText.includes("read") ||
      lowerText.includes("article") ||
      lowerText.includes("newspaper") ||
      lowerText.includes("blog") ||
      lowerUrl.includes("blogspot")
    ) {
      actionVerb = "Click to Read";
    }

    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {descText && (
          <span className="text-white/80 font-semibold text-xs leading-normal">
            {descText}
          </span>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-400 hover:text-amber-300 font-bold transition-all w-fit group/link mt-1"
        >
          <span>{actionVerb} ({label})</span>
          <span className="transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-200">
            ↗
          </span>
        </a>
      </div>
    );
  }

  return <span className="text-xs text-white/80 leading-relaxed font-semibold">{text}</span>;
}

export default async function AboutPage() {
  const profile = await getOrCreateAuthorProfile();

  // Helper to split text blocks by double newlines for rendering clean paragraphs
  const renderParagraphs = (text: string | null) => {
    if (!text) return null;
    return text
      .split("\n\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p, idx) => (
        <p key={idx} className="text-white/70 leading-relaxed font-[family-name:var(--font-inter)] text-base">
          {p}
        </p>
      ));
  };

  return (
    <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute -top-24 left-1/4 w-[40rem] h-[40rem] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-20 border-b border-white/5 pb-12">
        <div className="shrink-0">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden ring-4 ring-amber-500/20 shadow-2xl relative">
            <Image
              src="/author.jpg"
              alt="Renu - Poet &amp; Author"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="text-center md:text-left space-y-3">
          <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
            The Voice Behind The Verses
          </span>
          <h1 className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-playfair)] text-white">
            About Renu
          </h1>
          <p className="text-lg text-white/50 font-[family-name:var(--font-inter)] italic">
            Poet &middot; Author &middot; Dreamer
          </p>
        </div>
      </div>

      <div className="space-y-16">
        {/* Why I Write */}
        {profile.whyIWrite && (
          <section className="relative rounded-3xl border border-amber-500/10 bg-amber-500/[0.02] p-8 md:p-12">
            <div className="absolute top-6 left-6 text-amber-500/10 text-7xl font-serif leading-none pointer-events-none select-none">
              “
            </div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold mb-4">
              Why I Write
            </h2>
            <p className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl leading-relaxed italic text-white/90 relative z-10">
              {profile.whyIWrite}
            </p>
          </section>
        )}

        {/* Journey & Inspiration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {profile.writingJourney && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">
                My Writing Journey
              </h2>
              <div className="space-y-4">{renderParagraphs(profile.writingJourney)}</div>
            </section>
          )}

          {profile.inspiration && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">
                My Inspiration
              </h2>
              <div className="space-y-4">{renderParagraphs(profile.inspiration)}</div>
            </section>
          )}
        </div>



        {/* Behind the Scenes & Writing Desk split */}
        {(profile.behindTheScenes || profile.writingDesk) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-8 border-t border-white/5">
            {profile.behindTheScenes && (
              <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">
                  Behind the Scenes
                </h2>
                <div className="space-y-4">{renderParagraphs(profile.behindTheScenes)}</div>
              </section>
            )}

            {profile.writingDesk && (
              <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">
                  The Writing Desk
                </h2>
                <div className="space-y-4">{renderParagraphs(profile.writingDesk)}</div>
              </section>
            )}
          </div>
        )}

        {/* Awards, Publications & Interviews */}
        {(profile.awards || profile.publications || profile.interviews) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
            {profile.awards && (
              <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-amber-400/80 font-bold mb-1">
                  Awards
                </h2>
                <div className="flex flex-col gap-2.5">
                  {profile.awards
                    .split("\n")
                    .map((a) => a.trim())
                    .filter((a) => a.length > 0)
                    .map((award, idx) => {
                      const icon = getAwardIcon(award);
                      return (
                        <div
                          key={idx}
                          className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent px-4.5 py-3.5 shadow-md hover:border-amber-400/30 hover:from-white/[0.05] hover:to-amber-500/[0.02] hover:-translate-y-0.5 hover:shadow-amber-500/[0.02] transition-all duration-300 ease-out overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner group-hover:bg-amber-400/10 group-hover:border-amber-400/20 transition-all shrink-0">
                            {icon}
                          </div>
                          <div className="text-xs text-white/80 leading-relaxed font-semibold flex-1 pt-1">
                            {parseMarkdownLink(award)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {profile.publications && (
              <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-amber-400/80 font-bold mb-1">
                  Publications
                </h2>
                <div className="flex flex-col gap-2.5">
                  {profile.publications
                    .split("\n")
                    .map((p) => p.trim())
                    .filter((p) => p.length > 0)
                    .map((pub, idx) => {
                      const icon = getPublicationIcon(pub);
                      return (
                        <div
                          key={idx}
                          className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent px-4.5 py-3.5 shadow-md hover:border-amber-400/30 hover:from-white/[0.05] hover:to-amber-500/[0.02] hover:-translate-y-0.5 hover:shadow-amber-500/[0.02] transition-all duration-300 ease-out overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner group-hover:bg-amber-400/10 group-hover:border-amber-400/20 transition-all shrink-0">
                            {icon}
                          </div>
                          <div className="text-xs text-white/80 leading-relaxed font-semibold flex-1 pt-1">
                            {parseMarkdownLink(pub)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {profile.interviews && (
              <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-amber-400/80 font-bold mb-1">
                  Interviews
                </h2>
                <div className="flex flex-col gap-2.5">
                  {profile.interviews
                    .split("\n")
                    .map((i) => i.trim())
                    .filter((i) => i.length > 0)
                    .map((intv, idx) => {
                      const icon = getInterviewIcon(intv);
                      return (
                        <div
                          key={idx}
                          className="group relative flex items-start gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent px-4.5 py-3.5 shadow-md hover:border-amber-400/30 hover:from-white/[0.05] hover:to-amber-500/[0.02] hover:-translate-y-0.5 hover:shadow-amber-500/[0.02] transition-all duration-300 ease-out overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner group-hover:bg-amber-400/10 group-hover:border-amber-400/20 transition-all shrink-0">
                            {icon}
                          </div>
                          <div className="text-xs text-white/80 leading-relaxed font-semibold flex-1 pt-1">
                            {parseMarkdownLink(intv)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Visual Sanctuary Gallery CTA */}
        {profile.gallery.length > 0 && (
          <section className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 overflow-hidden group">
            {/* Ambient subtle warm glow on hover */}
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/[0.01] group-hover:bg-amber-500/[0.03] rounded-full blur-[80px] pointer-events-none transition-all duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-3">
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">
                  Visual Sanctuary
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-playfair)] text-white">
                  Explore the Photo Gallery
                </h3>
                <p className="text-sm text-white/50 leading-relaxed font-[family-name:var(--font-inter)] max-w-xl">
                  Step inside captured moments of Renu&apos;s writing desk, physical books collection, work setups, and creative highlights.
                </p>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/10 active:scale-95 w-fit shrink-0 self-start md:self-center font-[family-name:var(--font-inter)]"
              >
                <span>View Photo Gallery</span>
                <span className="text-[10px]">&rarr;</span>
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Connect Section */}
      <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-white">
            Let&apos;s Connect
          </h2>
          <p className="text-white/50 text-sm font-[family-name:var(--font-inter)] mt-1">
            Follow Renu&apos;s journey and stay updated with the latest poems and releases.
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/renuwrites_poem/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent hover:text-white transition-all text-xs uppercase tracking-wider font-semibold font-[family-name:var(--font-inter)]"
          >
            <InstagramIcon className="w-4 h-4" />
            Instagram
          </a>
          <a
            href="https://pillayrenu.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-[#f57d00] hover:border-transparent hover:text-white transition-all text-xs uppercase tracking-wider font-semibold font-[family-name:var(--font-inter)]"
          >
            <BlogIcon className="w-4 h-4" />
            Blog
          </a>
        </div>
      </div>
    </div>
  );
}
