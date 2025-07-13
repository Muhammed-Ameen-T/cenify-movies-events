"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookService = void 0;
const axios_1 = __importDefault(require("axios"));
//Service for handling Facebook OAuth authentication.
class FacebookService {
    constructor() {
        this.appId = process.env.FACEBOOK_APP_ID;
        this.appSecret = process.env.FACEBOOK_APP_SECRET;
    }
    /**
     * Exchanges an authorization code for an access token.
     * @param code - The authorization code received from Facebook.
     * @param redirectUri - The redirect URI configured in Facebook Developer Console.
     * @returns A promise resolving to the access token.
     */
    async getAccessToken(code, redirectUri) {
        const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&code=${code}&redirect_uri=${redirectUri}`;
        try {
            const response = await axios_1.default.get(url);
            return response.data.access_token;
        }
        catch (error) {
            throw new Error('Failed to get Facebook access token');
        }
    }
    /**
     * Fetches the Facebook user's profile details.
     * @param accessToken - The access token obtained from Facebook OAuth.
     * @returns A promise resolving to the user's ID, name, and optional email.
     */
    async getUserProfile(accessToken) {
        const url = `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${accessToken}`;
        try {
            const response = await axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch Facebook user profile');
        }
    }
}
exports.FacebookService = FacebookService;
