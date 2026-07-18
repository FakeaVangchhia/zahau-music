import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface VideoDetails {
  type: "youtube" | "vimeo" | "direct" | "unknown";
  embedUrl: string | null;
  originalUrl: string | null;
}

export function getVideoDetails(url: string | null | undefined): VideoDetails {
  if (!url) {
    return { type: "unknown", embedUrl: null, originalUrl: null };
  }

  const trimmed = url.trim();

  // YouTube match
  // Matches: youtube.com, youtu.be, youtube-nocookie.com (any subdomain like www or music etc)
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const ytMatch = trimmed.match(ytRegExp);
  if (
    (trimmed.includes("youtube.com") ||
      trimmed.includes("youtu.be") ||
      trimmed.includes("youtube-nocookie.com")) &&
    ytMatch &&
    ytMatch[2].length === 11
  ) {
    const videoId = ytMatch[2];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      originalUrl: trimmed,
    };
  }

  // Vimeo match
  // Matches: vimeo.com/123456789, player.vimeo.com/video/123456789, and with hash vimeo.com/123456789/abcdef123
  const vimeoRegExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)(?:\/([a-zA-Z0-9]+))?/;
  const vimeoMatch = trimmed.match(vimeoRegExp);
  if ((trimmed.includes("vimeo.com") || trimmed.includes("player.vimeo.com")) && vimeoMatch) {
    const videoId = vimeoMatch[1];
    const hash = vimeoMatch[2];
    const embedUrl = hash
      ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
      : `https://player.vimeo.com/video/${videoId}`;
    return {
      type: "vimeo",
      embedUrl,
      originalUrl: trimmed,
    };
  }

  // Otherwise, assume direct video file (or external direct URL)
  return {
    type: "direct",
    embedUrl: null,
    originalUrl: trimmed,
  };
}
