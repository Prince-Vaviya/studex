import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { clerkClient } from '@clerk/nextjs/server';

export class DriveService {
    private oauth2Client: OAuth2Client;

    constructor(accessToken: string) {
        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({ access_token: accessToken });
    }

    static async getClientForUser(userId: string) {
        const client = await clerkClient();
        const token = await client.users.getUserOauthAccessToken(
            userId,
            'oauth_google'
        );

        if (token.data.length === 0 || !token.data[0].token) {
            throw new Error('No Google OAuth token found');
        }

        return new DriveService(token.data[0].token);
    }

    async getFileContent(fileId: string, mimeType: string): Promise<Buffer> {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        try {
            if (mimeType === 'application/vnd.google-apps.document') {
                // Export Google Doc as text
                const response = await drive.files.export({
                    fileId,
                    mimeType: 'text/plain',
                });
                return Buffer.from(response.data as string);
            } else {
                // Download binary file (PDF, etc.)
                const response = await drive.files.get(
                    { fileId, alt: 'media' },
                    { responseType: 'arraybuffer' }
                );
                return Buffer.from(response.data as ArrayBuffer);
            }
        } catch (error) {
            console.error(`Failed to download file ${fileId}`, error);
            throw error;
        }
    }
}
