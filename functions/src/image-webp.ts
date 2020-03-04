import * as path from 'path';

import * as functions from 'firebase-functions';
import { Storage,  GetSignedUrlConfig } from '@google-cloud/storage'
import * as sharp from 'sharp';

import { db } from './init';

const gcs = new Storage();

export const convertToWebp = functions.storage.object().onFinalize(async (object, context) => {
  // File and directory paths.
  const fileBucket = object.bucket;
  const filePath = object.name || '';
  const fileName = path.basename(filePath);  
  const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
  const contentType = object.contentType || '';
  const webpbFileName = `${fileNameWithoutExt}.webp`;
  const webpFilePath = path.join(path.dirname(filePath), webpbFileName);

  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  if (contentType.startsWith('image/webp')) {
    console.log('Already a webp.');
    return null;
  }

  // Download file from bucket.
  const bucket = gcs.bucket(fileBucket);
  const metadata = {
    contentType: 'image/webp',
    // cacheControl: 'public, max-age=2592000, s-maxage=2592000',
  };
  const wepbpUploadStream = bucket.file(webpFilePath).createWriteStream({metadata}); 

  // Create Sharp pipeline
  const pipeline = sharp();

  pipeline.webp({quality: 100}).pipe(wepbpUploadStream);
  bucket.file(filePath).createReadStream().pipe(pipeline);

  await new Promise((resolve, reject) => wepbpUploadStream.on('finish', resolve).on('error', reject));

  // Get the Signed URLs for the thumbnail and original image.
  const webp = bucket.file(webpFilePath);
  const config: GetSignedUrlConfig = {
    action: 'read',
    expires: '03-01-2500',
  };

  const result = await webp.getSignedUrl(config);

  // save webp link in database
  const frags = filePath.split('/');
  const courseId = frags[1];
  const webpFileUrl = result[0];

  return fileName.startsWith('thumb_')
    ? db.doc(`courses/${courseId}`).update({ imgThumbWebpUrl: webpFileUrl })
    : db.doc(`courses/${courseId}`).update({ imgWebpUrl: webpFileUrl });  
});
