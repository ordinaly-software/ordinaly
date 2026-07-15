export interface YoutubeData {
  id: string;
  isShort: boolean;
}

export function extractYoutubeData(url?: string | null): YoutubeData | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (host === "youtu.be") {
      if (!parts[0]) return null;
      return { id: parts[0], isShort: false };
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return { id: v, isShort: false };
      if (parts[0] === "embed" && parts[1]) return { id: parts[1], isShort: false };
      if (parts[0] === "shorts" && parts[1]) return { id: parts[1], isShort: true };
      if (parts[0] === "live" && parts[1]) return { id: parts[1], isShort: false };
    }
  } catch {
    return null;
  }
  return null;
}

export function getYoutubeWatchUrl(data: YoutubeData): string {
  return data.isShort
    ? `https://www.youtube.com/shorts/${data.id}`
    : `https://www.youtube.com/watch?v=${data.id}`;
}

export function getYoutubeEmbedUrl(data: YoutubeData): string {
  return `https://www.youtube-nocookie.com/embed/${data.id}`;
}

export function getYoutubeThumbnail(data: YoutubeData): string {
  return `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg`;
}
