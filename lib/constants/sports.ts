export type SportType = 'nba' | 'nfl' | 'mlb' | 'nhl' | 'mls' | 'tennis' | 'golf';

export const sportPaths: Record<SportType, string> = {
  nba: 'basketball/nba',
  nfl: 'football/nfl',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
  mls: 'soccer/usa.1',
  tennis: 'tennis/atp',
  golf: 'golf/pga',
};

export const sportDisplayNames: Record<SportType, string> = {
  nba: 'Basketball',
  nfl: 'Football',
  mlb: 'Baseball',
  nhl: 'Hockey',
  mls: 'Soccer',
  tennis: 'Tennis',
  golf: 'Golf',
};

export const sports = [
  {
    id: 'nba' as SportType,
    name: 'NBA',
    fullName: 'National Basketball Association',
    emoji: '\u{1F3C0}',
    gradient: 'from-orange-500 to-red-500',
    hoverGradient: 'hover:from-orange-600 hover:to-red-600',
    bgGradient: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
  },
  {
    id: 'nfl' as SportType,
    name: 'NFL',
    fullName: 'National Football League',
    emoji: '\u{1F3C8}',
    gradient: 'from-green-500 to-emerald-600',
    hoverGradient: 'hover:from-green-600 hover:to-emerald-700',
    bgGradient: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10',
  },
  {
    id: 'mlb' as SportType,
    name: 'MLB',
    fullName: 'Major League Baseball',
    emoji: '\u26BE',
    gradient: 'from-blue-500 to-indigo-600',
    hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
    bgGradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10',
  },
  {
    id: 'nhl' as SportType,
    name: 'NHL',
    fullName: 'National Hockey League',
    emoji: '\u{1F3D2}',
    gradient: 'from-cyan-500 to-blue-600',
    hoverGradient: 'hover:from-cyan-600 hover:to-blue-700',
    bgGradient: 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10',
  },
  {
    id: 'mls' as SportType,
    name: 'MLS',
    fullName: 'Major League Soccer',
    emoji: '\u26BD',
    gradient: 'from-purple-500 to-pink-600',
    hoverGradient: 'hover:from-purple-600 hover:to-pink-700',
    bgGradient: 'bg-gradient-to-br from-purple-500/10 to-pink-600/10',
  },
  {
    id: 'tennis' as SportType,
    name: 'Tennis',
    fullName: 'ATP Tennis Tour',
    emoji: '\u{1F3BE}',
    gradient: 'from-yellow-500 to-amber-600',
    hoverGradient: 'hover:from-yellow-600 hover:to-amber-700',
    bgGradient: 'bg-gradient-to-br from-yellow-500/10 to-amber-600/10',
  },
  {
    id: 'golf' as SportType,
    name: 'Golf',
    fullName: 'PGA Tour',
    emoji: '\u26F3',
    gradient: 'from-teal-500 to-green-600',
    hoverGradient: 'hover:from-teal-600 hover:to-green-700',
    bgGradient: 'bg-gradient-to-br from-teal-500/10 to-green-600/10',
  },
];
