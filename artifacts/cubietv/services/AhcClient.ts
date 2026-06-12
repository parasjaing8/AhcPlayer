import type { Source } from "@/hooks/useSources";

export interface FileEntry {
  name: string;
  path: string;
  type: "dir" | "file";
  ext?: string;
  size?: number;
}

const VIDEO_EXTS = ["mkv", "mp4", "avi", "mov", "wmv", "ts", "m2ts", "iso"];

export function isVideoFile(entry: FileEntry) {
  return entry.type === "file" && VIDEO_EXTS.includes((entry.ext ?? "").toLowerCase());
}

export function smbUrl(source: Source, filePath: string) {
  const auth = source.username ? `${source.username}:${source.password ?? ""}@` : "";
  return `smb://${auth}${source.address}/${source.shareName}/${filePath}`;
}

// --- Mock data for development ---
const MOCK: Record<string, FileEntry[]> = {
  "": [
    { name: "Movies", path: "Movies", type: "dir" },
    { name: "TV Shows", path: "TV Shows", type: "dir" },
    { name: "Music", path: "Music", type: "dir" },
    { name: "Other", path: "Other", type: "dir" },
  ],
  Movies: [
    { name: "Stellar Drift (2023)", path: "Movies/Stellar Drift (2023)", type: "dir" },
    { name: "Neon Wolves (2023)", path: "Movies/Neon Wolves (2023)", type: "dir" },
    { name: "Irongate (2023)", path: "Movies/Irongate (2023)", type: "dir" },
    { name: "Moonbreak (2024)", path: "Movies/Moonbreak (2024)", type: "dir" },
  ],
  "Movies/Stellar Drift (2023)": [
    { name: "Stellar.Drift.2023.BluRay.mkv", path: "Movies/Stellar Drift (2023)/Stellar.Drift.2023.BluRay.mkv", type: "file", ext: "mkv", size: 8_500_000_000 },
    { name: "Stellar.Drift.2023.subs.zip", path: "Movies/Stellar Drift (2023)/Stellar.Drift.2023.subs.zip", type: "file", ext: "zip", size: 120_000 },
  ],
  "Movies/Neon Wolves (2023)": [
    { name: "Neon.Wolves.2023.1080p.mp4", path: "Movies/Neon Wolves (2023)/Neon.Wolves.2023.1080p.mp4", type: "file", ext: "mp4", size: 6_200_000_000 },
  ],
  "TV Shows": [
    { name: "Blackwood", path: "TV Shows/Blackwood", type: "dir" },
    { name: "Vanguard Protocol", path: "TV Shows/Vanguard Protocol", type: "dir" },
  ],
  "TV Shows/Blackwood": [
    { name: "Season 1", path: "TV Shows/Blackwood/Season 1", type: "dir" },
  ],
  "TV Shows/Blackwood/Season 1": [
    { name: "Blackwood.S01E01.mkv", path: "TV Shows/Blackwood/Season 1/Blackwood.S01E01.mkv", type: "file", ext: "mkv", size: 1_400_000_000 },
    { name: "Blackwood.S01E02.mkv", path: "TV Shows/Blackwood/Season 1/Blackwood.S01E02.mkv", type: "file", ext: "mkv", size: 1_380_000_000 },
  ],
};

function parseExt(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : undefined;
}

export async function browseSource(source: Source, path: string): Promise<FileEntry[]> {
  // TODO: replace mock with real AiHomeCloud API
  // GET https://${source.address}:8443/api/files/browse
  //   ?share=${encodeURIComponent(source.shareName)}
  //   &path=${encodeURIComponent(path)}
  // Headers: { Authorization: `Bearer ${token}` }

  if (source.address !== "mock") {
    try {
      const res = await fetch(
        `https://${source.address}:8443/api/files/browse?share=${encodeURIComponent(source.shareName)}&path=${encodeURIComponent(path)}`,
        { headers: { "Accept": "application/json" } }
      );
      if (res.ok) {
        const data = await res.json() as { entries: FileEntry[] };
        return data.entries.map((e) => ({ ...e, ext: e.ext ?? parseExt(e.name) }));
      }
    } catch {
      // fall through to mock
    }
  }

  return (MOCK[path] ?? []).map((e) => ({ ...e, ext: e.ext ?? parseExt(e.name) }));
}

export function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}
