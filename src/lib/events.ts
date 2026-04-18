// Film & Awards Events Data
// Central source of truth for all events displayed on TrendiMovies

export type EventStatus = 'upcoming' | 'live' | 'past';

export interface FilmEvent {
  id: string;
  name: string;
  shortName: string;
  year: number;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  description: string;
  color: string;
  accentColor: string;
  emoji: string;
  slug: string;
  pageUrl: string;
  categories: string[];
  highlights: string[];
  topAward?: string;
  winner?: string;
  edition?: string;
}

export const filmEvents: FilmEvent[] = [
  {
    id: 'cannes-2026',
    name: 'Cannes Film Festival 2026',
    shortName: 'Cannes 2026',
    year: 2026,
    status: 'upcoming',
    startDate: '2026-05-13',
    endDate: '2026-05-24',
    location: 'Cannes, France',
    venue: 'Palais des Festivals et des Congres',
    description: "The 79th Cannes Film Festival — the most prestigious film festival in the world. The Palme d'Or and all competition awards are presented at the closing ceremony on May 24.",
    color: '#B50C1B',
    accentColor: '#F7D000',
    emoji: '🌴',
    slug: 'cannes-2026',
    pageUrl: '/cannes-2026',
    categories: ["Palme d'Or", 'Grand Prix', 'Jury Prize', 'Best Director', 'Best Actress', 'Best Actor', 'Best Screenplay', "Camera d'Or", 'Special Jury Prize'],
    highlights: ['79th Edition', 'May 13-24, 2026', 'Palais des Festivals, Cannes', 'International Jury presides'],
    topAward: "Palme d'Or",
    edition: '79th',
  },
  {
    id: 'mtv-2026',
    name: 'MTV Movie & TV Awards 2026',
    shortName: 'MTV Awards 2026',
    year: 2026,
    status: 'upcoming',
    startDate: '2026-06-07',
    endDate: '2026-06-07',
    location: 'Los Angeles, CA',
    venue: 'Peacock Theater',
    description: 'The annual MTV Movie & TV Awards celebrate the best in film and television as voted on by fans worldwide.',
    color: '#FF0033',
    accentColor: '#FFE600',
    emoji: '🎬',
    slug: 'mtv-awards-2026',
    pageUrl: '/events',
    categories: ['Movie of the Year', 'Best Performance', 'Best Kiss', 'Best Fight', 'Best Hero', 'Best Villain', 'Best Documentary'],
    highlights: ['Fan-voted awards', 'June 7, 2026', 'Los Angeles'],
    topAward: 'Movie of the Year',
    edition: '2026',
  },
  {
    id: 'venice-2026',
    name: 'Venice Film Festival 2026',
    shortName: 'Venice 2026',
    year: 2026,
    status: 'upcoming',
    startDate: '2026-08-26',
    endDate: '2026-09-05',
    location: 'Venice, Italy',
    venue: 'Palazzo del Cinema, Lido di Venezia',
    description: "The 83rd Venice International Film Festival, the world's oldest film festival. The Golden Lion is awarded to the best film in competition.",
    color: '#8B0000',
    accentColor: '#FFD700',
    emoji: '🦁',
    slug: 'venice-2026',
    pageUrl: '/events',
    categories: ['Golden Lion', 'Silver Lion Grand Jury Prize', 'Silver Lion Best Director', 'Volpi Cup Best Actor', 'Volpi Cup Best Actress', 'Special Jury Prize'],
    highlights: ['83rd Edition', 'Aug 26 - Sep 5, 2026', 'Lido di Venezia'],
    topAward: 'Golden Lion',
    edition: '83rd',
  },
  {
    id: 'tiff-2026',
    name: 'Toronto International Film Festival 2026',
    shortName: 'TIFF 2026',
    year: 2026,
    status: 'upcoming',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    location: 'Toronto, Canada',
    venue: 'TIFF Bell Lightbox',
    description: "TIFF is one of the most influential film festivals in the world and a key launchpad for Oscar season. The People's Choice Award is a bellwether for Best Picture.",
    color: '#E8002D',
    accentColor: '#FFFFFF',
    emoji: '🍁',
    slug: 'tiff-2026',
    pageUrl: '/events',
    categories: ["People's Choice Award", 'Best Canadian Film', 'Discovery Award', 'NETPAC Award', 'FIPRESCI Prize'],
    highlights: ['51st Edition', 'Sep 10-20, 2026', 'Toronto, Canada'],
    topAward: "People's Choice Award",
    edition: '51st',
  },
  {
    id: 'emmys-2026',
    name: 'Emmy Awards 2026',
    shortName: 'Emmys 2026',
    year: 2026,
    status: 'upcoming',
    startDate: '2026-09-21',
    endDate: '2026-09-21',
    location: 'Los Angeles, CA',
    venue: 'Peacock Theater',
    description: 'The 78th Primetime Emmy Awards honour the best in American prime time television.',
    color: '#6B21A8',
    accentColor: '#D4AF37',
    emoji: '📺',
    slug: 'emmys-2026',
    pageUrl: '/events',
    categories: ['Outstanding Drama Series', 'Outstanding Comedy Series', 'Outstanding Limited Series', 'Outstanding Lead Actor Drama', 'Outstanding Lead Actress Drama'],
    highlights: ['78th Edition', 'September 21, 2026', 'Los Angeles'],
    topAward: 'Outstanding Drama Series',
    edition: '78th',
  },
  {
    id: 'golden-globes-2027',
    name: 'Golden Globe Awards 2027',
    shortName: 'Golden Globes 2027',
    year: 2027,
    status: 'upcoming',
    startDate: '2027-01-11',
    endDate: '2027-01-11',
    location: 'Beverly Hills, CA',
    venue: 'The Beverly Hilton',
    description: 'The 84th Golden Globe Awards honour excellence in film and television from the 2026 calendar year.',
    color: '#B8860B',
    accentColor: '#FFD700',
    emoji: '🌐',
    slug: 'golden-globes-2027',
    pageUrl: '/events',
    categories: ['Best Motion Picture Drama', 'Best Motion Picture Musical or Comedy', 'Best Animated Feature Film', 'Best Non-English Language Film', 'Best Director'],
    highlights: ['84th Edition', 'January 11, 2027', 'Beverly Hills, CA'],
    topAward: 'Best Motion Picture Drama',
    edition: '84th',
  },
  {
    id: 'oscars-2026',
    name: 'Academy Awards 2026',
    shortName: 'Oscars 2026',
    year: 2026,
    status: 'past',
    startDate: '2026-03-15',
    endDate: '2026-03-15',
    location: 'Hollywood, CA',
    venue: 'Dolby Theatre',
    description: 'The 98th Academy Awards ceremony. One Battle after Another dominated the night taking home Best Picture, Best Director, Best Adapted Screenplay, Best Film Editing, and Best Casting.',
    color: '#D4AF37',
    accentColor: '#FFD700',
    emoji: '🏆',
    slug: 'oscars-2026',
    pageUrl: '/oscars-2026',
    categories: ['Best Picture', 'Best Director', 'Best Actor', 'Best Actress', 'Best Supporting Actor', 'Best Supporting Actress', 'Best Original Screenplay', 'Best Adapted Screenplay'],
    highlights: ['98th Edition', 'March 15, 2026', 'Dolby Theatre, Hollywood'],
    topAward: 'Best Picture',
    winner: 'One Battle after Another',
    edition: '98th',
  },
  {
    id: 'sundance-2026',
    name: 'Sundance Film Festival 2026',
    shortName: 'Sundance 2026',
    year: 2026,
    status: 'past',
    startDate: '2026-01-22',
    endDate: '2026-02-01',
    location: 'Park City, Utah',
    venue: 'Park City venues',
    description: 'The premier festival for independent cinema in the United States. Sundance 2026 showcased groundbreaking independent films and documentaries.',
    color: '#DC2626',
    accentColor: '#F97316',
    emoji: '❄️',
    slug: 'sundance-2026',
    pageUrl: '/events',
    categories: ['Grand Jury Prize Drama', 'Grand Jury Prize Documentary', 'Audience Award Drama', 'Audience Award Documentary'],
    highlights: ['2026 Edition', 'Jan 22 - Feb 1, 2026', 'Park City, Utah'],
    topAward: 'Grand Jury Prize',
    edition: '2026',
  },
  {
    id: 'bafta-2026',
    name: 'BAFTA Film Awards 2026',
    shortName: 'BAFTAs 2026',
    year: 2026,
    status: 'past',
    startDate: '2026-02-22',
    endDate: '2026-02-22',
    location: 'London, UK',
    venue: 'Royal Festival Hall',
    description: 'The 79th BAFTA Film Awards, presented by the British Academy of Film and Television Arts.',
    color: '#1E3A5F',
    accentColor: '#C5A028',
    emoji: '🎭',
    slug: 'bafta-2026',
    pageUrl: '/events',
    categories: ['Best Film', 'Best Director', 'Best Actor', 'Best Actress', 'Outstanding British Film'],
    highlights: ['79th Edition', 'February 22, 2026', 'Royal Festival Hall, London'],
    topAward: 'Best Film',
    edition: '79th',
  },
  {
    id: 'cannes-2025',
    name: 'Cannes Film Festival 2025',
    shortName: 'Cannes 2025',
    year: 2025,
    status: 'past',
    startDate: '2025-05-13',
    endDate: '2025-05-24',
    location: 'Cannes, France',
    venue: 'Palais des Festivals et des Congres',
    description: 'The 78th Cannes Film Festival, presided over by jury president Juliette Binoche.',
    color: '#B50C1B',
    accentColor: '#F7D000',
    emoji: '🌴',
    slug: 'cannes-2025',
    pageUrl: '/events',
    categories: ["Palme d'Or", 'Grand Prix', 'Jury Prize', 'Best Director', 'Best Actress', 'Best Actor'],
    highlights: ['78th Edition', 'May 13-24, 2025', 'Cannes, France'],
    topAward: "Palme d'Or",
    edition: '78th',
  },
  {
    id: 'oscars-2025',
    name: 'Academy Awards 2025',
    shortName: 'Oscars 2025',
    year: 2025,
    status: 'past',
    startDate: '2025-03-02',
    endDate: '2025-03-02',
    location: 'Hollywood, CA',
    venue: 'Dolby Theatre',
    description: 'The 97th Academy Awards ceremony. The Brutalist won Best Picture.',
    color: '#D4AF37',
    accentColor: '#FFD700',
    emoji: '🏆',
    slug: 'oscars-2025',
    pageUrl: '/events',
    categories: ['Best Picture', 'Best Director', 'Best Actor', 'Best Actress'],
    highlights: ['97th Edition', 'March 2, 2025', 'Dolby Theatre'],
    topAward: 'Best Picture',
    winner: 'The Brutalist',
    edition: '97th',
  },
];

export function getUpcomingEvents(): FilmEvent[] {
  return filmEvents.filter(e => e.status === 'upcoming').sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export function getLiveEvents(): FilmEvent[] {
  return filmEvents.filter(e => e.status === 'live');
}

export function getPastEvents(): FilmEvent[] {
  return filmEvents.filter(e => e.status === 'past').sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
