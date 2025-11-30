import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { clerkClient } from '@clerk/nextjs/server';

export class ClassroomService {
    private oauth2Client: OAuth2Client;

    constructor(accessToken: string) {
        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({ access_token: accessToken });
    }

    static async getClientForUser(userId: string) {
        const client = await clerkClient();

        console.log(`[ClassroomService] Getting token for user: ${userId}`);

        try {
            const token = await client.users.getUserOauthAccessToken(
                userId,
                'oauth_google'
            );

            console.log(`[ClassroomService] Token response length: ${token.data.length}`);

            if (token.data.length === 0 || !token.data[0].token) {
                console.error('[ClassroomService] No token found in response:', JSON.stringify(token.data));
                throw new Error('No Google OAuth token found. Ensure scopes are granted.');
            }

            return new ClassroomService(token.data[0].token);
        } catch (error) {
            console.error('[ClassroomService] Error retrieving token:', error);
            throw error;
        }
    }

    async listCourses() {
        const classroom = google.classroom({
            version: 'v1',
            auth: this.oauth2Client,
        });

        const response = await classroom.courses.list({
            courseStates: ['ACTIVE'],
        });

        return response.data.courses || [];
    }

    async listCourseWork(courseId: string) {
        const classroom = google.classroom({
            version: 'v1',
            auth: this.oauth2Client,
        });

        const response = await classroom.courses.courseWork.list({
            courseId,
        });

        return response.data.courseWork || [];
    }
}
