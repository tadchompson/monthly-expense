export const SUBSCRIPTION_REGEX =
  /netflix|hulu|disney\+?|spotify|apple\s?(music|tv|one|arcade|storage|icloud)|youtube|amazon\s?prime|hbo\s?max|max\.com|peacock|paramount|crunchyroll|audible|kindle|adobe|microsoft\s?365|office\s?365|google\s?(one|storage|workspace)|dropbox|icloud|chatgpt|openai|claude|anthropic|nordvpn|expressvpn|surfshark|1password|lastpass|bitwarden|dashlane|notion|evernote|grammarly|canva|figma|github|copilot|xbox\s?(game\s?pass|live|gold)|playstation\s?(plus|now)|nintendo|ea\s?play|geforce\s?now|twitch|discord\s?nitro|patreon|substack|medium|nyt|new\s?york\s?times|wall\s?street\s?journal|wsj|washington\s?post|headspace|calm|peloton|planet\s?fitness|anytime\s?fitness|la\s?fitness|gym|ymca|strava|fitbit|whoop|tidal|pandora|deezer|siriusxm|sirius|ancestry|23andme|ring|adt|simplisafe|nest|doordash\s?dashpass|uber\s?(one|pass|eats\s?pass)|grubhub|instacart|walmart\s?plus|costco|sam.?s\s?club|bj.?s|chewy|bark\s?box|hellofresh|blue\s?apron|home\s?chef|factor|daily\s?harvest/i;

export function isSubscription(description: string): boolean {
  return SUBSCRIPTION_REGEX.test(description);
}
