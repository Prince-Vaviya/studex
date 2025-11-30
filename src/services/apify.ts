import { ApifyClient } from 'apify-client';

export class ApifyService {
    private static client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
    });

    /**
     * Search Google using Apify's Google Search Scraper
     * Actor: apify/google-search-scraper
     */
    static async searchGoogle(query: string) {
        if (!process.env.APIFY_API_TOKEN) {
            console.warn('APIFY_API_TOKEN is missing. Skipping web search.');
            return [];
        }

        try {
            console.log(`[Apify] Searching Google for: "${query}"`);
            const run = await this.client.actor('apify/google-search-scraper').call({
                queries: [query],
                maxPagesPerQuery: 1,
                resultsPerPage: 3,
                mobileResults: false,
                languageCode: 'en',
            });

            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

            // Transform items into a cleaner format
            return items.map((item: any) => ({
                title: item.title,
                description: item.description,
                url: item.url,
            }));
        } catch (error) {
            console.error('[Apify] Google Search failed:', error);
            return [];
        }
    }

    /**
     * Get YouTube Video Transcript
     * Actor: apify/youtube-transcript-scraper
     * Note: Using a community actor or official one if available. 
     * 'apify/youtube-transcript-scraper' is a common choice but let's verify availability.
     * Actually 'alexey/youtube-transcript-scraper' or similar is often used.
     * Let's use a generic approach or a known reliable one.
     * For now, we'll try 'apify/youtube-transcript-scraper' or fallback to a known one.
     * 
     * Let's use 'apify/youtube-scraper' which is official and robust, but might be overkill just for transcripts.
     * 'dtrungtin/youtube-transcript-scraper' is a popular one for just transcripts.
     * Let's stick to the plan: fetch transcript.
     */
    static async getVideoTranscript(videoUrl: string) {
        if (!process.env.APIFY_API_TOKEN) {
            throw new Error('APIFY_API_TOKEN is missing');
        }

        try {
            console.log(`[Apify] Fetching transcript for: ${videoUrl}`);
            // Using 'streamers/youtube-scraper' as it has been verified to work
            // Increasing wait time to avoid ECONNRESET on slower cold starts
            const run = await this.client.actor('streamers/youtube-scraper').call({
                startUrls: [{ url: videoUrl }],
                downloadSubtitles: true,
                maxResults: 1,
            }, {
                waitSecs: 120, // Wait up to 2 minutes for the run to finish
            });

            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

            if (items && items.length > 0) {
                const videoData = items[0] as any;

                // Check for subtitles (streamers/youtube-scraper format)
                if (videoData.subtitles && Array.isArray(videoData.subtitles) && videoData.subtitles.length > 0) {
                    const subtitleTrack = videoData.subtitles.find((s: any) => s.language === 'en') || videoData.subtitles[0];
                    if (subtitleTrack && subtitleTrack.srt) {
                        return this.cleanSrt(subtitleTrack.srt);
                    }
                }

                // Check for transcript field directly
                if (videoData.transcript) {
                    return videoData.transcript;
                }

                // Fallback to description
                if (videoData.description) {
                    console.warn('[Apify] No subtitles found, using description.');
                    return videoData.description;
                }
            }

            console.warn('[Apify] No transcript or description found in actor output.');
            return null;
        } catch (error: any) {
            console.error('[Apify] Transcript fetch failed:', error);
            // Enhance error message for common issues
            if (error.message.includes('Actor with this name was not found')) {
                throw new Error('Apify configuration error: Actor not found.');
            }
            if (error.message.includes('timeout')) {
                throw new Error('Transcript fetch timed out. The video might be too long.');
            }
            throw error;
        }
    }

    private static cleanSrt(srt: string): string {
        // Remove numeric counters and timestamps
        return srt
            .replace(/^\d+$/gm, '') // Remove line numbers
            .replace(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/gm, '') // Remove timestamps
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .trim();
    }
}
