import { createClient } from 'redis';
import { env } from '../../config/env.config';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

/**
 * RedisService provides an abstraction for interacting with a Redis database.
 * It supports basic operations such as setting, retrieving, and deleting keys.
 */
export class RedisService {
  private client: ReturnType<typeof createClient>;

  /**
   * Initializes the Redis client and connects to the Redis server.
   * Handles connection events and logs errors if any occur.
   */
  constructor() {
    this.client = createClient({
      url: env.REDIS_URL, // Uses the cloud Redis URL
    });

    this.client.on('error', (err) =>
      console.error(ERROR_MESSAGES.GENERAL.REDIS_CONNECTION_ERROR, err),
    );
    this.client.on('connect', () => console.log(SuccessMsg.REDIS_CONNECTED));

    this.client
      .connect()
      .catch((err) => console.error(ERROR_MESSAGES.GENERAL.REDIS_CONNECTION_ERROR, err));
  }

  /**
   * Stores a key-value pair in Redis with an expiration time.
   * @param {string} key - The key under which the value is stored.
   * @param {string} value - The value to store in Redis.
   * @param {number} expirySeconds - Expiration time in seconds.
   * @returns {Promise<void>} Resolves if the operation is successful.
   * @throws {Error} If the Redis operation fails.
   */
  async set(key: string, value: string, expirySeconds: number): Promise<void> {
    try {
      await this.client.setEx(key, expirySeconds, value);
    } catch (error) {
      throw new Error('Redis set failed');
    }
  }

  /**
   * Retrieves a value from Redis based on the provided key.
   * @param {string} key - The key to fetch the value for.
   * @returns {Promise<string | null>} The value stored in Redis or null if not found.
   * @throws {Error} If the Redis operation fails.
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      throw new Error('Redis get failed');
    }
  }

  /**
   * Deletes a key-value pair from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<void>} Resolves if the operation is successful.
   * @throws {Error} If the Redis operation fails.
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      throw new Error('Redis delete failed');
    }
  }
}
