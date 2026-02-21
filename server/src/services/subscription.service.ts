export interface SubscriptionPattern {
  key: string;
  pattern: RegExp;
  label: string;
}

export const SUBSCRIPTION_PATTERNS: SubscriptionPattern[] = [
  // Streaming services
  { key: 'netflix', pattern: /netflix/i, label: 'Netflix' },
  { key: 'hulu', pattern: /hulu/i, label: 'Hulu' },
  { key: 'disney_plus', pattern: /disney\+?/i, label: 'Disney+' },
  { key: 'spotify', pattern: /spotify/i, label: 'Spotify' },
  { key: 'apple_services', pattern: /apple\s?(music|tv|one|arcade|storage|icloud)/i, label: 'Apple Services' },
  { key: 'youtube', pattern: /youtube/i, label: 'YouTube' },
  { key: 'amazon_prime', pattern: /amazon\s?prime/i, label: 'Amazon Prime' },
  { key: 'hbo_max', pattern: /hbo\s?max|max\.com/i, label: 'HBO Max' },
  { key: 'peacock', pattern: /peacock/i, label: 'Peacock' },
  { key: 'paramount', pattern: /paramount/i, label: 'Paramount+' },
  { key: 'crunchyroll', pattern: /crunchyroll/i, label: 'Crunchyroll' },
  { key: 'audible', pattern: /audible/i, label: 'Audible' },
  { key: 'kindle', pattern: /kindle/i, label: 'Kindle' },

  // Tech/productivity
  { key: 'adobe', pattern: /adobe/i, label: 'Adobe' },
  { key: 'microsoft_365', pattern: /microsoft\s?365|office\s?365/i, label: 'Microsoft 365' },
  { key: 'google_services', pattern: /google\s?(one|storage|workspace)/i, label: 'Google Services' },
  { key: 'dropbox', pattern: /dropbox/i, label: 'Dropbox' },
  { key: 'icloud', pattern: /icloud/i, label: 'iCloud' },
  { key: 'chatgpt', pattern: /chatgpt|openai/i, label: 'ChatGPT/OpenAI' },
  { key: 'claude', pattern: /claude|anthropic/i, label: 'Claude/Anthropic' },
  { key: 'notion', pattern: /notion/i, label: 'Notion' },
  { key: 'evernote', pattern: /evernote/i, label: 'Evernote' },
  { key: 'grammarly', pattern: /grammarly/i, label: 'Grammarly' },
  { key: 'canva', pattern: /canva/i, label: 'Canva' },
  { key: 'figma', pattern: /figma/i, label: 'Figma' },
  { key: 'github', pattern: /github/i, label: 'GitHub' },
  { key: 'copilot', pattern: /copilot/i, label: 'Copilot' },

  // VPN/security
  { key: 'nordvpn', pattern: /nordvpn/i, label: 'NordVPN' },
  { key: 'expressvpn', pattern: /expressvpn/i, label: 'ExpressVPN' },
  { key: 'surfshark', pattern: /surfshark/i, label: 'Surfshark' },
  { key: '1password', pattern: /1password/i, label: '1Password' },
  { key: 'lastpass', pattern: /lastpass/i, label: 'LastPass' },
  { key: 'bitwarden', pattern: /bitwarden/i, label: 'Bitwarden' },
  { key: 'dashlane', pattern: /dashlane/i, label: 'Dashlane' },

  // Gaming
  { key: 'xbox', pattern: /xbox\s?(game\s?pass|live|gold)/i, label: 'Xbox' },
  { key: 'playstation', pattern: /playstation\s?(plus|now)/i, label: 'PlayStation' },
  { key: 'nintendo', pattern: /nintendo/i, label: 'Nintendo' },
  { key: 'ea_play', pattern: /ea\s?play/i, label: 'EA Play' },
  { key: 'geforce_now', pattern: /geforce\s?now/i, label: 'GeForce Now' },
  { key: 'twitch', pattern: /twitch/i, label: 'Twitch' },
  { key: 'discord_nitro', pattern: /discord\s?nitro/i, label: 'Discord Nitro' },

  // Media/news
  { key: 'patreon', pattern: /patreon/i, label: 'Patreon' },
  { key: 'substack', pattern: /substack/i, label: 'Substack' },
  { key: 'medium', pattern: /medium/i, label: 'Medium' },
  { key: 'nyt', pattern: /nyt|new\s?york\s?times/i, label: 'NY Times' },
  { key: 'wsj', pattern: /wall\s?street\s?journal|wsj/i, label: 'Wall Street Journal' },
  { key: 'washington_post', pattern: /washington\s?post/i, label: 'Washington Post' },

  // Fitness/wellness
  { key: 'headspace', pattern: /headspace/i, label: 'Headspace' },
  { key: 'calm', pattern: /calm/i, label: 'Calm' },
  { key: 'peloton', pattern: /peloton/i, label: 'Peloton' },
  { key: 'planet_fitness', pattern: /planet\s?fitness/i, label: 'Planet Fitness' },
  { key: 'anytime_fitness', pattern: /anytime\s?fitness/i, label: 'Anytime Fitness' },
  { key: 'la_fitness', pattern: /la\s?fitness/i, label: 'LA Fitness' },
  { key: 'gym', pattern: /gym/i, label: 'Gym' },
  { key: 'ymca', pattern: /ymca/i, label: 'YMCA' },
  { key: 'strava', pattern: /strava/i, label: 'Strava' },
  { key: 'fitbit', pattern: /fitbit/i, label: 'Fitbit' },
  { key: 'whoop', pattern: /whoop/i, label: 'Whoop' },

  // Music
  { key: 'tidal', pattern: /tidal/i, label: 'Tidal' },
  { key: 'pandora', pattern: /pandora/i, label: 'Pandora' },
  { key: 'deezer', pattern: /deezer/i, label: 'Deezer' },
  { key: 'siriusxm', pattern: /siriusxm|sirius/i, label: 'SiriusXM' },

  // Home/security
  { key: 'ancestry', pattern: /ancestry/i, label: 'Ancestry' },
  { key: '23andme', pattern: /23andme/i, label: '23andMe' },
  { key: 'ring', pattern: /ring/i, label: 'Ring' },
  { key: 'adt', pattern: /adt/i, label: 'ADT' },
  { key: 'simplisafe', pattern: /simplisafe/i, label: 'SimpliSafe' },
  { key: 'nest', pattern: /nest/i, label: 'Nest' },

  // Food/retail subscriptions
  { key: 'doordash_dashpass', pattern: /doordash\s?dashpass/i, label: 'DoorDash DashPass' },
  { key: 'uber_subscription', pattern: /uber\s?(one|pass|eats\s?pass)/i, label: 'Uber One' },
  { key: 'grubhub', pattern: /grubhub/i, label: 'Grubhub' },
  { key: 'instacart', pattern: /instacart/i, label: 'Instacart' },
  { key: 'walmart_plus', pattern: /walmart\s?plus/i, label: 'Walmart+' },
  { key: 'costco', pattern: /costco/i, label: 'Costco' },
  { key: 'sams_club', pattern: /sam.?s\s?club/i, label: "Sam's Club" },
  { key: 'bjs', pattern: /bj.?s/i, label: "BJ's" },
  { key: 'chewy', pattern: /chewy/i, label: 'Chewy' },
  { key: 'bark_box', pattern: /bark\s?box/i, label: 'BarkBox' },
  { key: 'hellofresh', pattern: /hellofresh/i, label: 'HelloFresh' },
  { key: 'blue_apron', pattern: /blue\s?apron/i, label: 'Blue Apron' },
  { key: 'home_chef', pattern: /home\s?chef/i, label: 'Home Chef' },
  { key: 'factor', pattern: /factor/i, label: 'Factor' },
  { key: 'daily_harvest', pattern: /daily\s?harvest/i, label: 'Daily Harvest' },
];

/** Returns the matched pattern key, or null if no match */
export function matchSubscription(description: string): string | null {
  for (const p of SUBSCRIPTION_PATTERNS) {
    if (p.pattern.test(description)) {
      return p.key;
    }
  }
  return null;
}

/** Backward-compat: returns true if description matches any subscription pattern */
export function isSubscription(description: string): boolean {
  return matchSubscription(description) !== null;
}

/** Builds a combined regex omitting excluded pattern keys. Returns null if all excluded. */
export function buildSubscriptionRegex(excludedKeys: string[]): RegExp | null {
  const excludeSet = new Set(excludedKeys);
  const activePatterns = SUBSCRIPTION_PATTERNS.filter((p) => !excludeSet.has(p.key));
  if (activePatterns.length === 0) return null;

  const combined = activePatterns.map((p) => p.pattern.source).join('|');
  return new RegExp(combined, 'i');
}

/** The combined regex of ALL patterns (no exclusions) — for backward compat */
export const SUBSCRIPTION_REGEX = buildSubscriptionRegex([])!;

/** Escapes special regex characters in a string for safe use in RegExp */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Builds a regex that matches any description containing any of the exclusion patterns (case-insensitive). Returns null if empty. */
export function buildExclusionRegex(patterns: string[]): RegExp | null {
  if (patterns.length === 0) return null;
  const combined = patterns.map(escapeRegex).join('|');
  return new RegExp(combined, 'i');
}
