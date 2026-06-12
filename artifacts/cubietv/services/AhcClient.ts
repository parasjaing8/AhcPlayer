import type { Source } from "@/hooks/useSources";

export interface FileEntry {
  name: string;
  path: string;
  type: "dir" | "file";
  ext?: string;
  size?: number;
}

const VIDEO_EXTS = new Set(["mkv","mp4","avi","mov","wmv","ts","m2ts","iso","flv","webm","mpg","mpeg","m4v","3gp","ogv","vob","divx","xvid","rm","rmvb","asf","f4v","hevc","h264"]);
const AUDIO_EXTS = new Set(["mp3","flac","aac","ogg","m4a","wav","wma","opus","ape"]);

export function isVideoFile(e: FileEntry) {
  return e.type === "file" && VIDEO_EXTS.has((e.ext ?? "").toLowerCase());
}
export function isAudioFile(e: FileEntry) {
  return e.type === "file" && AUDIO_EXTS.has((e.ext ?? "").toLowerCase());
}
export function isMediaFile(e: FileEntry) {
  return isVideoFile(e) || isAudioFile(e);
}

export function buildPlayUrl(source: Source, filePath: string): string {
  switch (source.type) {
    case "smb": {
      const auth = source.username ? `${encodeURIComponent(source.username)}:${encodeURIComponent(source.password ?? "")}@` : "";
      return `smb://${auth}${source.address}/${source.shareName}/${filePath}`;
    }
    case "ftp": {
      const auth = source.username ? `${encodeURIComponent(source.username)}:${encodeURIComponent(source.password ?? "")}@` : "";
      return `ftp://${auth}${source.address}/${source.shareName ? source.shareName + "/" : ""}${filePath}`;
    }
    case "http":
      return `${source.address.replace(/\/$/, "")}/${filePath}`;
    case "internal":
      return filePath; // already a file:// or content:// URI
    default:
      return filePath;
  }
}

// Keep smbUrl for backwards compat
export function smbUrl(source: Source, filePath: string) {
  return buildPlayUrl(source, filePath);
}

function parseExt(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : undefined;
}

// --- HTTP directory listing (Nginx autoindex / Python http.server) ---
async function browseHttp(source: Source, path: string): Promise<FileEntry[]> {
  const base = source.address.replace(/\/$/, "");
  const url = path ? `${base}/${path}/` : `${base}/`;
  const res = await fetch(url, { headers: { Accept: "text/html" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  // Parse Nginx/Apache/Python autoindex links
  const entries: FileEntry[] = [];
  const re = /href="([^"?#]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = decodeURIComponent(m[1]);
    if (href.startsWith("..") || href.startsWith("/") || href.startsWith("http")) continue;
    const isDir = href.endsWith("/");
    const name = isDir ? href.slice(0, -1) : href;
    const entryPath = path ? `${path}/${name}` : name;
    const ext = parseExt(name);
    entries.push({ name, path: entryPath, type: isDir ? "dir" : "file", ext });
  }
  return entries;
}

// --- FTP listing via fetch (VLC handles ftp:// directly so browsing is optional) ---
async function browseFtp(_source: Source, _path: string): Promise<FileEntry[]> {
  // FTP browsing in a native app requires a native FTP library.
  // For now return empty — user plays files via direct FTP URL entry.
  return [];
}

// --- Mock data for SMB when no real server ---
const MOCK: Record<string, FileEntry[]> = {
  "": [
    { name: "Movies", path: "Movies", type: "dir" },
    { name: "TV Shows", path: "TV Shows", type: "dir" },
    { name: "Music", path: "Music", type: "dir" },
  ],
  Movies: [
    { name: "Stellar Drift (2023)", path: "Movies/Stellar Drift (2023)", type: "dir" },
    { name: "Neon Wolves (2023)", path: "Movies/Neon Wolves (2023)", type: "dir" },
  ],
  "Movies/Stellar Drift (2023)": [
    { name: "Stellar.Drift.2023.BluRay.mkv", path: "Movies/Stellar Drift (2023)/Stellar.Drift.2023.BluRay.mkv", type: "file", ext: "mkv", size: 8_500_000_000 },
  ],
  "Movies/Neon Wolves (2023)": [
    { name: "Neon.Wolves.2023.1080p.mp4", path: "Movies/Neon Wolves (2023)/Neon.Wolves.2023.1080p.mp4", type: "file", ext: "mp4", size: 6_200_000_000 },
  ],
  "TV Shows": [
    { name: "Blackwood", path: "TV Shows/Blackwood", type: "dir" },
  ],
  "TV Shows/Blackwood": [
    { name: "Season 1", path: "TV Shows/Blackwood/Season 1", type: "dir" },
  ],
  "TV Shows/Blackwood/Season 1": [
    { name: "Blackwood.S01E01.mkv", path: "TV Shows/Blackwood/Season 1/Blackwood.S01E01.mkv", type: "file", ext: "mkv", size: 1_400_000_000 },
    { name: "Blackwood.S01E02.mkv", path: "TV Shows/Blackwood/Season 1/Blackwood.S01E02.mkv", type: "file", ext: "mkv", size: 1_380_000_000 },
  ],
};

export async function browseSource(source: Source, path: string): Promise<FileEntry[]> {
  if (source.type === "http") return browseHttp(source, path);
  if (source.type === "ftp") return browseFtp(source, path);
  if (source.type === "internal") return []; // handled by expo-media-library in PersonalScreen

  // SMB / DLNA — try AhcCloud API, fall back to mock
  if (source.address !== "mock") {
    try {
      const res = await fetch(
        `https://${source.address}:8443/api/files/browse?share=${encodeURIComponent(source.shareName)}&path=${encodeURIComponent(path)}`,
        { headers: { Accept: "application/json" } }
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
