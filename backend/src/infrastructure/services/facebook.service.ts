import axios from 'axios';

//Service for handling Facebook OAuth authentication.
export class FacebookService {
  private appId: string = process.env.FACEBOOK_APP_ID!;
  private appSecret: string = process.env.FACEBOOK_APP_SECRET!;

  /**
   * Exchanges an authorization code for an access token.
   * @param code - The authorization code received from Facebook.
   * @param redirectUri - The redirect URI configured in Facebook Developer Console.
   * @returns A promise resolving to the access token.
   */
  async getAccessToken(code: string, redirectUri: string): Promise<string> {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&code=${code}&redirect_uri=${redirectUri}`;
    try {
      const response = await axios.get(url);
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get Facebook access token');
    }
  }

  /**
   * Fetches the Facebook user's profile details.
   * @param accessToken - The access token obtained from Facebook OAuth.
   * @returns A promise resolving to the user's ID, name, and optional email.
   */
  async getUserProfile(
    accessToken: string,
  ): Promise<{ picture: null; phone: string; id: string; name: string; email?: string }> {
    const url = `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${accessToken}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Facebook user profile');
    }
  }
}
