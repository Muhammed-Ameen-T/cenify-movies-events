// src/infrastructure/services/cloudinary.service.ts
import { injectable } from 'tsyringe';
import { v2 as cloudinary } from 'cloudinary';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import { env } from '../../config/env.config';

@injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(fileBuffer: Buffer, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'user_profiles',
          public_id: fileName,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            return reject(
              new CustomError(
                error.message || 'Failed to upload image to Cloudinary',
                HttpResCode.INTERNAL_SERVER_ERROR,
              ),
            );
          }
          if (!result || !result.secure_url) {
            return reject(
              new CustomError(
                'Cloudinary upload did not return a valid result',
                HttpResCode.INTERNAL_SERVER_ERROR,
              ),
            );
          }
          resolve(result.secure_url);
        },
      );

      stream.end(fileBuffer);
    });
  }
}
