import * as path from 'path';

import * as functions from 'firebase-functions';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage'
import * as sharp from 'sharp';

import { db } from './init';

const gcs = new Storage();

export const createThumbSharp = functions.storage.object().onFinalize(async (object, context) => {
  // File and directory paths.
  const fileBucket = object.bucket;
  const filePath = object.name || '';
  const fileName = path.basename(filePath);  
  const contentType = object.contentType || '';
  const thumbFileName = `thumb_${fileName}`;
  const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);

  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.');
    return null;
  }

  if (contentType.startsWith('image/webp')) {
    console.log('This is a webp.');
    return null;
  }

  if (fileName.startsWith('thumb_')) {
    console.log('Already a Thumbnail.');
    return null;
  }

  // Create write stream for uploading thumbnail
  const bucket = gcs.bucket(fileBucket);
  const metadata = {
    contentType: contentType,
    // cacheControl: 'public, max-age=2592000, s-maxage=2592000',
  };
  const thumbnailUploadStream = bucket.file(thumbFilePath).createWriteStream({metadata});

  // Create Sharp pipeline for resizing the image and use pipe to read from bucket read stream
  const pipeline = sharp();

  pipeline.resize({height: 200, width: 200, fit: sharp.fit.inside}).pipe(thumbnailUploadStream);
  bucket.file(filePath).createReadStream().pipe(pipeline);

  await new Promise((resolve, reject) => thumbnailUploadStream.on('finish', resolve).on('error', reject));

  // Get the Signed URLs for the thumbnail and original image.
  const file = bucket.file(filePath);
  const thumbFile = bucket.file(thumbFilePath);
  const config: GetSignedUrlConfig = {
    action: 'read',
    expires: '03-01-2500',
  };

  const results = await Promise.all([
    thumbFile.getSignedUrl(config),
    file.getSignedUrl(config),
  ]);

  // save thumbnail link in database
  const frags = filePath.split('/');
  const courseId = frags[1];
  const thumbFileUrl = results[0][0];
  const fileUrl = results[1][0];
  // console.log('urls: ', thumbFileUrl, fileUrl);

  return db.doc(`courses/${courseId}`).update({
    imgUrl: fileUrl,
    imgThumbUrl: thumbFileUrl,
  });   
});
