import { describe, it, expect } from 'vitest';
import { isSubscription } from '../subscription.service';

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
