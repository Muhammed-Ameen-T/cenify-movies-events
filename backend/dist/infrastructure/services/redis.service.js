"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const env_config_1 = require("../../config/env.config");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
/**
 * RedisService provides an abstraction for interacting with a Redis database.
 * It supports basic operations such as setting, retrieving, and deleting keys.
 */
class RedisService {
    /**
     * Initializes the Redis client and connects to the Redis server.
     * Handles connection events and logs errors if any occur.
     */
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: env_config_1.env.REDIS_URL, // Uses the cloud Redis URL
        });
        this.client.on('error', (err) => console.error(commonErrorMsg_constants_1.default.GENERAL.REDIS_CONNECTION_ERROR, err));
        this.client.on('connect', () => console.log(commonSuccessMsg_constants_1.SuccessMsg.REDIS_CONNECTED));
        this.client
            .connect()
            .catch((err) => console.error(commonErrorMsg_constants_1.default.GENERAL.REDIS_CONNECTION_ERROR, err));
    }
    /**
     * Stores a key-value pair in Redis with an expiration time.
     * @param {string} key - The key under which the value is stored.
     * @param {string} value - The value to store in Redis.
     * @param {number} expirySeconds - Expiration time in seconds.
     * @returns {Promise<void>} Resolves if the operation is successful.
     * @throws {Error} If the Redis operation fails.
     */
    async set(key, value, expirySeconds) {
        try {
            await this.client.setEx(key, expirySeconds, value);
        }
        catch (error) {
            throw new Error('Redis set failed');
        }
    }
    /**
     * Retrieves a value from Redis based on the provided key.
     * @param {string} key - The key to fetch the value for.
     * @returns {Promise<string | null>} The value stored in Redis or null if not found.
     * @throws {Error} If the Redis operation fails.
     */
    async get(key) {
        try {
            return await this.client.get(key);
        }
        catch (error) {
            throw new Error('Redis get failed');
        }
    }
    /**
     * Deletes a key-value pair from Redis.
     * @param {string} key - The key to delete.
     * @returns {Promise<void>} Resolves if the operation is successful.
     * @throws {Error} If the Redis operation fails.
     */
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            throw new Error('Redis delete failed');
        }
    }
}
exports.RedisService = RedisService;
