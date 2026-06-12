export type MediaType = "MOVIE" | "SHOW" | "EPISODE";

export interface MediaItem {
  id: string;
  title: string;
  year: number;
  genre: string;
  synopsis: string;
  runtime: string;
  posterColor: string;
  backdropColor: string;
  type: MediaType;
  progressPct?: number;
  rating: string;
  episodeInfo?: string;
  videoUrl?: string;
  posterUrl?: string;
}

// TMDB poster CDN base — w342 size
const P = "https://image.tmdb.org/t/p/w342";

export const FAKE_MEDIA: MediaItem[] = [
  {
    id: "1",
    title: "Stellar Drift",
    year: 2023,
    genre: "Sci-Fi · Adventure",
    synopsis:
      "A lone astronaut discovers a signal from the edge of the known universe, setting off a journey that will challenge everything humanity believes about time and space.",
    runtime: "2h 08m",
    posterColor: "#1a237e",
    backdropColor: "#0d1b6e",
    type: "MOVIE",
    rating: "PG-13",
    videoUrl: "http://192.168.0.98:8080/The_Shadow%27s_Edge_2025_1080p_WEBRip_H265_10Bit_HQ_DDP_5_1_6C.mkv",
    posterUrl: `${P}/gEU2QniE6E77NI6lCU6MxlNBvIe.jpg`, // Interstellar
  },
  {
    id: "2",
    title: "The Last Meridian",
    year: 2022,
    genre: "Thriller · Drama",
    synopsis:
      "A cartographer uncovers a conspiracy hidden in century-old maps that threatens to rewrite modern borders and ignite a global crisis.",
    runtime: "1h 54m",
    posterColor: "#4a148c",
    backdropColor: "#38006b",
    type: "MOVIE",
    rating: "R",
    posterUrl: `${P}/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg`, // The Imitation Game
  },
  {
    id: "3",
    title: "Irongate",
    year: 2023,
    genre: "Crime · Drama",
    synopsis:
      "Two detectives in a decaying port city investigate a series of murders linked to an underground arms network with ties to city hall.",
    runtime: "1h 42m",
    posterColor: "#b71c1c",
    backdropColor: "#7f0000",
    type: "MOVIE",
    rating: "R",
    posterUrl: `${P}/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg`, // Zodiac
  },
  {
    id: "4",
    title: "Neon Wolves",
    year: 2023,
    genre: "Action · Cyberpunk",
    synopsis:
      "A mercenary crew navigates a neon-drenched megacity to extract a whistleblower before the corporation erases them both.",
    runtime: "1h 58m",
    posterColor: "#006064",
    backdropColor: "#004d40",
    type: "MOVIE",
    rating: "R",
    posterUrl: `${P}/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg`, // Blade Runner 2049
  },
  {
    id: "5",
    title: "Quiet Tides",
    year: 2021,
    genre: "Drama · Romance",
    synopsis:
      "A marine biologist returns to her coastal hometown after fifteen years and confronts the life she left behind.",
    runtime: "1h 36m",
    posterColor: "#01579b",
    backdropColor: "#003c71",
    type: "MOVIE",
    rating: "PG",
    posterUrl: `${P}/lyuH56T4C9q1QhNk3kCmCHBwU4K.jpg`, // Marriage Story
  },
  {
    id: "6",
    title: "Riftwalkers",
    year: 2024,
    genre: "Fantasy · Action",
    synopsis:
      "When a tear in reality opens above the city, a group of strangers discover they are the only ones who can see what is crossing through.",
    runtime: "2h 14m",
    posterColor: "#1b5e20",
    backdropColor: "#003300",
    type: "MOVIE",
    rating: "PG-13",
    posterUrl: `${P}/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg`, // Doctor Strange
  },
  {
    id: "7",
    title: "Cold Harbor",
    year: 2022,
    genre: "Thriller · Spy",
    synopsis:
      "A retired intelligence officer is pulled back in when her former handler is assassinated in a neutral country with no witnesses.",
    runtime: "2h 02m",
    posterColor: "#37474f",
    backdropColor: "#263238",
    type: "MOVIE",
    rating: "R",
    posterUrl: `${P}/aTU9lxBl7PpGKFe7qMNcHIfEbNF.jpg`, // Tinker Tailor Soldier Spy
  },
  {
    id: "8",
    title: "Deep Signal",
    year: 2023,
    genre: "Sci-Fi · Horror",
    synopsis:
      "The crew of an oceanic research station intercepts a transmission from the seafloor that was never meant to surface.",
    runtime: "1h 48m",
    posterColor: "#0d47a1",
    backdropColor: "#002171",
    type: "MOVIE",
    rating: "R",
    posterUrl: `${P}/eDtsTxALld2gPw9RCe22VJfPSBx.jpg`, // Life (2017)
  },
  {
    id: "9",
    title: "Blackwood",
    year: 2021,
    genre: "Drama · Mystery",
    synopsis:
      "A small timber town fractures when a missing teenager is found alive six years later, with no memory of where she has been.",
    runtime: "Season 1",
    posterColor: "#3e2723",
    backdropColor: "#1b0000",
    type: "SHOW",
    rating: "TV-MA",
    episodeInfo: "Season 1 · 8 Episodes",
    posterUrl: `${P}/49WJfeN0moxb9IPfGn8AIqMGskD.jpg`, // Twin Peaks
  },
  {
    id: "10",
    title: "Vanguard Protocol",
    year: 2022,
    genre: "Action · Sci-Fi",
    synopsis:
      "An elite special forces unit operates in a near-future world where their orders come from an AI that knows outcomes before they happen.",
    runtime: "Season 2",
    posterColor: "#212121",
    backdropColor: "#000000",
    type: "SHOW",
    rating: "TV-14",
    episodeInfo: "Season 2 · 10 Episodes",
    posterUrl: `${P}/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg`, // The Boys
  },
  {
    id: "11",
    title: "The Cartels of Mira",
    year: 2023,
    genre: "Crime · Drama",
    synopsis:
      "A journalist embedded with a border enforcement unit discovers the corruption runs deeper than any single cartel.",
    runtime: "Season 1",
    posterColor: "#bf360c",
    backdropColor: "#870000",
    type: "SHOW",
    rating: "TV-MA",
    episodeInfo: "Season 1 · 6 Episodes",
    posterUrl: `${P}/ggFHVNu6YYI5L9pCfOacjizRGt.jpg`, // Narcos
  },
  {
    id: "12",
    title: "Afterimage",
    year: 2024,
    genre: "Sci-Fi · Drama",
    synopsis:
      "In a world where memories can be recorded and sold, a young archivist discovers she has been living someone else's life.",
    runtime: "Season 1",
    posterColor: "#6a1b9a",
    backdropColor: "#38006b",
    type: "SHOW",
    rating: "TV-14",
    episodeInfo: "Season 1 · 8 Episodes",
    posterUrl: `${P}/xPBapSNNMhQp7IWyxUjTbF8XPVC.jpg`, // Westworld
  },
  {
    id: "13",
    title: "Ash & Empire",
    year: 2022,
    genre: "Historical · Drama",
    synopsis:
      "Set in the declining years of a fictional empire, the series follows rival families fighting for control of a crumbling throne.",
    runtime: "Season 3",
    posterColor: "#e65100",
    backdropColor: "#ac1900",
    type: "SHOW",
    rating: "TV-MA",
    episodeInfo: "Season 3 · 12 Episodes",
    posterUrl: `${P}/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg`, // Game of Thrones
  },
  {
    id: "14",
    title: "Moonbreak",
    year: 2024,
    genre: "Sci-Fi · Thriller",
    synopsis:
      "When a lunar mining colony goes dark, a rescue team arrives to find the base intact, the crew gone, and something new living inside.",
    runtime: "1h 52m",
    posterColor: "#263238",
    backdropColor: "#102027",
    type: "MOVIE",
    rating: "R",
    posterUrl: `${P}/b4gYVcl8pParX7PoTnqnLqhLEJT.jpg`, // Alien Covenant
  },
  {
    id: "15",
    title: "The Farrow Index",
    year: 2021,
    genre: "Thriller · Conspiracy",
    synopsis:
      "A forensic accountant stumbles onto a decades-long financial cover-up that links three governments and a missing nuclear warhead.",
    runtime: "1h 44m",
    posterColor: "#1a237e",
    backdropColor: "#000051",
    type: "MOVIE",
    rating: "PG-13",
    posterUrl: `${P}/5c2ZkGvRCPqkQ1r7Y9eGjtF7wC3.jpg`, // The Big Short
  },
  {
    id: "16",
    title: "Ghost Latitude",
    year: 2023,
    genre: "Adventure · Mystery",
    synopsis:
      "A salvage diver finds coordinates tattooed on a corpse that lead her to a sunken vessel carrying something that should not exist.",
    runtime: "1h 38m",
    posterColor: "#004d40",
    backdropColor: "#00251a",
    type: "MOVIE",
    rating: "PG-13",
    posterUrl: `${P}/ekZobS8isE6mA53RAiGDG93hBxL.jpg`, // The Abyss
  },
  {
    id: "17",
    title: "Fracture Line",
    year: 2024,
    genre: "Disaster · Drama",
    synopsis:
      "A geologist predicts the largest earthquake in recorded history. She has 72 hours to convince a city not to ignore her.",
    runtime: "2h 06m",
    posterColor: "#4e342e",
    backdropColor: "#1a0000",
    type: "MOVIE",
    rating: "PG-13",
    posterUrl: `${P}/6CoRTJTmijhBLJTUNoVSUNxZMEI.jpg`, // San Andreas
  },
  {
    id: "18",
    title: "Halo of Rust",
    year: 2022,
    genre: "Sci-Fi · Western",
    synopsis:
      "On a terraformed frontier planet, a marshal hunts an outlaw who has stolen the only water processor for three thousand settlers.",
    runtime: "Season 2",
    posterColor: "#e65100",
    backdropColor: "#703100",
    type: "SHOW",
    rating: "TV-14",
    episodeInfo: "Season 2 · 8 Episodes",
    posterUrl: `${P}/oIF2pinu0TGNWBG2TaLO9DQDJ1C.jpg`, // Mandalorian
  },
  {
    id: "19",
    title: "Recursion",
    year: 2023,
    genre: "Horror · Sci-Fi",
    synopsis:
      "A software engineer realizes the town she grew up in is a simulation within a simulation — and someone is about to pull the plug.",
    runtime: "1h 50m",
    posterColor: "#311b92",
    backdropColor: "#1a0072",
    type: "MOVIE",
    rating: "R",
    posterUrl: `${P}/5cGPUGTjIlMr8gAT5v5smdBQnAd.jpg`, // The Matrix Resurrections
  },
  {
    id: "20",
    title: "Kingdom of Salt",
    year: 2024,
    genre: "Drama · History",
    synopsis:
      "In a 15th-century West African trading empire, a merchant's daughter inherits a trade route her enemies will kill to control.",
    runtime: "Season 1",
    posterColor: "#ff6f00",
    backdropColor: "#c43e00",
    type: "SHOW",
    rating: "TV-14",
    episodeInfo: "Season 1 · 6 Episodes",
    posterUrl: `${P}/sHEvOfSCLWKE5SKVS1OjBLFnTH1.jpg`, // Marco Polo
  },
];

export const CONTINUE_WATCHING: MediaItem[] = [
  { ...FAKE_MEDIA[2], progressPct: 0.62, type: "EPISODE", episodeInfo: "S1 · E4" },
  { ...FAKE_MEDIA[9], progressPct: 0.28, type: "EPISODE", episodeInfo: "S2 · E3" },
  { ...FAKE_MEDIA[0], progressPct: 0.81, type: "EPISODE", episodeInfo: "Movie" },
  { ...FAKE_MEDIA[11], progressPct: 0.45, type: "EPISODE", episodeInfo: "S1 · E2" },
];

export const MOVIES = FAKE_MEDIA.filter((m) => m.type === "MOVIE");
export const SHOWS = FAKE_MEDIA.filter((m) => m.type === "SHOW");
export const RECENTLY_ADDED = [...FAKE_MEDIA].reverse().slice(0, 8);
export const FEATURED = [FAKE_MEDIA[0], FAKE_MEDIA[3], FAKE_MEDIA[11]];
