declare module 'instagram-scraping' {
  export function scrapeTag(tag: string): Promise<any>;
  export function scrapeComment(shortcode: string): Promise<any>;
  export function deepScrapeTagPage(tag: string): Promise<any>;
  export function scrapeUserPage(username: string): Promise<any>;
}