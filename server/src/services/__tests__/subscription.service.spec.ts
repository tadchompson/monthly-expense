import { describe, it, expect } from 'vitest';
import { isSubscription, matchSubscription, buildSubscriptionRegex, buildExclusionRegex, escapeRegex, SUBSCRIPTION_PATTERNS } from '../subscription.service';

describe('isSubscription', () => {
  describe('streaming services', () => {
    it.each([
      'NETFLIX.COM',
      'HULU *MONTHLY',
      'DISNEY PLUS',
      'DISNEY+',
      'SPOTIFY USA',
      'YOUTUBE PREMIUM',
      'AMAZON PRIME*MEMBERSHIP',
      'AMAZONPRIME',
      'HBO MAX',
      'MAX.COM SUBSCRIPTION',
      'PEACOCK TV',
      'PARAMOUNT PLUS',
      'CRUNCHYROLL',
      'AUDIBLE MEMBERSHIP',
      'KINDLE UNLIMITED',
    ])('should match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(true);
    });
  });

  describe('tech/productivity', () => {
    it.each([
      'ADOBE CREATIVE CLOUD',
      'MICROSOFT 365 SUBSCRIPTION',
      'OFFICE 365',
      'GOOGLE ONE STORAGE',
      'GOOGLE WORKSPACE',
      'DROPBOX PLUS',
      'CHATGPT PLUS',
      'OPENAI SUBSCRIPTION',
      'NOTION TEAM',
      'EVERNOTE PREMIUM',
      'GRAMMARLY',
      'CANVA PRO',
      'FIGMA PROFESSIONAL',
      'GITHUB COPILOT',
    ])('should match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(true);
    });
  });

  describe('VPN/security', () => {
    it.each([
      'NORDVPN SUBSCRIPTION',
      'EXPRESSVPN',
      'SURFSHARK',
      '1PASSWORD FAMILIES',
      'LASTPASS PREMIUM',
      'BITWARDEN',
      'DASHLANE PREMIUM',
    ])('should match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(true);
    });
  });

  describe('gaming', () => {
    it.each([
      'XBOX GAME PASS ULTIMATE',
      'XBOX LIVE GOLD',
      'PLAYSTATION PLUS',
      'PLAYSTATION NOW',
      'NINTENDO ONLINE',
      'EA PLAY PRO',
      'GEFORCE NOW',
      'DISCORD NITRO',
    ])('should match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(true);
    });
  });

  describe('fitness/wellness', () => {
    it.each([
      'HEADSPACE ANNUAL',
      'CALM APP',
      'PELOTON MEMBERSHIP',
      'PLANET FITNESS',
      'ANYTIME FITNESS',
      'LA FITNESS',
      'STRAVA SUMMIT',
      'WHOOP MEMBERSHIP',
    ])('should match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(true);
    });
  });

  describe('food/retail subscriptions', () => {
    it.each([
      'DOORDASH DASHPASS',
      'UBER ONE MEMBERSHIP',
      'WALMART PLUS MEMBERSHIP',
      'COSTCO MEMBERSHIP',
      "SAM'S CLUB MEMBERSHIP",
      "BJ'S CLUB",
      'CHEWY AUTOSHIP',
      'BARK BOX',
      'HELLOFRESH WEEKLY',
      'BLUE APRON',
      'HOME CHEF',
      'FACTOR MEALS',
      'DAILY HARVEST',
    ])('should match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(true);
    });
  });

  describe('media/news', () => {
    it.each([
      'PATREON* MEMBERSHIP',
      'SUBSTACK SUBSCRIPTION',
      'NYT DIGITAL',
      'NEW YORK TIMES',
      'WALL STREET JOURNAL',
      'WSJ DIGITAL',
      'WASHINGTON POST',
    ])('should match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(true);
    });
  });

  describe('false positives — should NOT match', () => {
    it.each([
      'WALMART SUPERCENTER #1234',
      'UBER TRIP',
      'AMAZON.COM*AMZN MKTP',
      'TARGET STORE',
      'TACO BELL #4567',
      'SHELL OIL 57444',
      'BEST BUY #789',
      'MCDONALD\'S F12345',
      'VENMO PAYMENT',
      'ZELLE TRANSFER',
    ])('should NOT match "%s"', (desc) => {
      expect(isSubscription(desc)).toBe(false);
    });
  });
});

describe('matchSubscription', () => {
  it('returns the correct key for Netflix', () => {
    expect(matchSubscription('NETFLIX.COM')).toBe('netflix');
  });

  it('returns the correct key for Spotify', () => {
    expect(matchSubscription('SPOTIFY USA')).toBe('spotify');
  });

  it('returns the correct key for ChatGPT', () => {
    expect(matchSubscription('CHATGPT PLUS')).toBe('chatgpt');
  });

  it('returns the correct key for Planet Fitness', () => {
    expect(matchSubscription('PLANET FITNESS')).toBe('planet_fitness');
  });

  it('returns the correct key for Xbox Game Pass', () => {
    expect(matchSubscription('XBOX GAME PASS ULTIMATE')).toBe('xbox');
  });

  it('returns null for non-subscription descriptions', () => {
    expect(matchSubscription('WALMART SUPERCENTER #1234')).toBeNull();
    expect(matchSubscription('UBER TRIP')).toBeNull();
    expect(matchSubscription('TARGET STORE')).toBeNull();
  });
});

describe('buildSubscriptionRegex', () => {
  it('builds a regex that matches all patterns when no exclusions', () => {
    const regex = buildSubscriptionRegex([]);
    expect(regex).not.toBeNull();
    expect(regex!.test('NETFLIX.COM')).toBe(true);
    expect(regex!.test('SPOTIFY USA')).toBe(true);
    expect(regex!.test('PLANET FITNESS')).toBe(true);
  });

  it('excludes specified keys from the regex', () => {
    const regex = buildSubscriptionRegex(['netflix', 'spotify']);
    expect(regex).not.toBeNull();
    expect(regex!.test('NETFLIX.COM')).toBe(false);
    expect(regex!.test('SPOTIFY USA')).toBe(false);
    // Other patterns still work
    expect(regex!.test('HULU *MONTHLY')).toBe(true);
    expect(regex!.test('PLANET FITNESS')).toBe(true);
  });

  it('returns null when all patterns are excluded', () => {
    const allKeys = SUBSCRIPTION_PATTERNS.map((p) => p.key);
    const regex = buildSubscriptionRegex(allKeys);
    expect(regex).toBeNull();
  });

  it('ignores unknown keys in the exclusion list', () => {
    const regex = buildSubscriptionRegex(['unknown_service', 'fake_key']);
    expect(regex).not.toBeNull();
    expect(regex!.test('NETFLIX.COM')).toBe(true);
  });
});

describe('escapeRegex', () => {
  it('escapes special regex characters', () => {
    expect(escapeRegex('DISNEY+')).toBe('DISNEY\\+');
    expect(escapeRegex('AMAZON PRIME*Y10JS')).toBe('AMAZON PRIME\\*Y10JS');
    expect(escapeRegex('BJ\'S CLUB')).toBe('BJ\'S CLUB');
    expect(escapeRegex('test.com')).toBe('test\\.com');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeRegex('NETFLIX')).toBe('NETFLIX');
    expect(escapeRegex('PLANET FITNESS')).toBe('PLANET FITNESS');
  });
});

describe('buildExclusionRegex', () => {
  it('returns null for empty array', () => {
    expect(buildExclusionRegex([])).toBeNull();
  });

  it('builds a case-insensitive contains regex', () => {
    const regex = buildExclusionRegex(['AMAZON PRIME']);
    expect(regex).not.toBeNull();
    expect(regex!.test('AMAZON PRIME*Y10JS3503')).toBe(true);
    expect(regex!.test('AMAZON PRIME*G23TS2304')).toBe(true);
    expect(regex!.test('amazon prime membership')).toBe(true);
    expect(regex!.test('NETFLIX.COM')).toBe(false);
  });

  it('handles multiple exclusion patterns', () => {
    const regex = buildExclusionRegex(['AMAZON PRIME', 'PLANET FITNESS']);
    expect(regex).not.toBeNull();
    expect(regex!.test('AMAZON PRIME*Y10JS3503')).toBe(true);
    expect(regex!.test('PLANET FITNESS #1234')).toBe(true);
    expect(regex!.test('NETFLIX.COM')).toBe(false);
  });

  it('escapes special characters in patterns', () => {
    const regex = buildExclusionRegex(['DISNEY+']);
    expect(regex).not.toBeNull();
    // Should match literal "DISNEY+" not "DISNEY" followed by anything
    expect(regex!.test('DISNEY+ MONTHLY')).toBe(true);
    expect(regex!.test('DISNEY PLUS')).toBe(false);
  });

  it('does not exclude unrelated descriptions', () => {
    const regex = buildExclusionRegex(['GOOGLE *YouTubePremium']);
    expect(regex!.test('GOOGLE *YouTubePremium')).toBe(true);
    expect(regex!.test('GOOGLE *Reverse 1999')).toBe(false);
  });
});
