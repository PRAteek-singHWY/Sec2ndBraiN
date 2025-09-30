// server/src/declarations.d.ts

declare module "twitter-fetcher" {
  // You can add more properties here if you need them from the tweet object
  export interface Tweet {
    id: string;
    text: string;
    name?: string;
    username?: string;
    // ... any other properties
  }

  export function getTweet(tweetId: string): Promise<Tweet>;
}
