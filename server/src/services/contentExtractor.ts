// server/src/services/contentExtractor.ts
import { YoutubeTranscript } from "youtube-transcript";
import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
const readOnlyClient = twitterClient.readOnly;

async function getYouTubeTranscript(url: string): Promise<string> {
  console.log(`Attempting to fetch YouTube transcript for: ${url}`);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const fullText = transcript.map((item) => item.text).join(" ");
    console.log(
      `✅ Successfully fetched transcript, length: ${fullText.length}`
    );
    return fullText;
  } catch (error) {
    // This will now print the specific error from the library
    console.error("❌ YouTube Transcript Error:", error);
    return ""; // Return empty string on failure
  }
}

async function getTwitterContent(url: string): Promise<string> {
  console.log(`Attempting to fetch Tweet content for: ${url}`);
  try {
    const tweetId = url.split("/").pop()?.split("?")[0];
    if (!tweetId) {
      console.error("Could not parse tweet ID from URL:", url);
      return "";
    }
    const tweet = await readOnlyClient.v2.singleTweet(tweetId);
    if (tweet.data) {
      console.log(
        `✅ Successfully fetched tweet, length: ${tweet.data.text.length}`
      );
      return tweet.data.text;
    }
    return "";
  } catch (error) {
    // This will now print the specific error from the Twitter API
    console.error("❌ Twitter API Error:", error);
    return ""; // Return empty string on failure
  }
}

export async function extractContentFromLink(
  type: string,
  link?: string
): Promise<string> {
  if (!link) {
    return "";
  }
  if (type === "youtube") {
    return await getYouTubeTranscript(link);
  }
  if (type === "twitter") {
    return await getTwitterContent(link);
  }
  return "";
}
