import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import * as functions from 'firebase-functions';
import { Storage, GetSignedUrlConfig  } from '@google-cloud/storage';

import * as mkdirp from 'mkdirp-promise';
import { spawn } from 'child-process-promise';

import { db } from './init';

const gcp = new Storage();
const THUMB_MAX_HEIGHT = 200;
const THUMB_MAX_WIDTH = 200;
const THUMB_PREFIX = 'thumb_';

export const resizeThumbnail = functions.storage.object()
  .onFinalize(async (object, context) => {
    // File and directory paths.
    const fileFullPath = object.name || '';
    const contentType = object.contentType || '';
    const fileDir = path.dirname(fileFullPath);
    const fileName = path.basename(fileFullPath);
    const thumbFilePath = path.normalize(path.join(fileDir, `${THUMB_PREFIX}${fileName}`));
    const tempLocalFile = path.join(os.tmpdir(), fileFullPath);
    const tempLocalDir = path.dirname(tempLocalFile);
    const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);

    if (!contentType.startsWith('image/')) {
      console.log('This is not an image.')
      return null;
    }
  
    if (fileName.startsWith(THUMB_PREFIX)) {
      console.log('Already a Thumbnail.')
      return null;
    }

    // Cloud Storage files.
    const bucket = gcp.bucket(object.bucket);
    const originalFile = bucket.file(fileFullPath);
    const thumbFile = bucket.file(thumbFilePath);
    const metadata = {
      contentType: object.contentType,
      cacheControl: 'public, max-age=2592000, s-maxage=2592000',
    };

    await mkdirp(tempLocalDir);
    await originalFile.download({destination: tempLocalFile});
    // console.log('The file has been downloaded to', tempLocalFile);
    await spawn('convert', [tempLocalFile, '-thumbnail', `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`, tempLocalThumbFile], {capture: ['stdout', 'stderr']});
    // console.log('Thumbnail created at', tempLocalThumbFile);

    // Uploading the Thumbnail.
    await bucket.upload(tempLocalThumbFile, {destination: thumbFilePath, metadata});
    // console.log('Thumbnail uploaded to Storage at', thumbFilePath);

    // Once the image has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalFile);
    fs.unlinkSync(tempLocalThumbFile);

    // delete original file from firestore
    // await originalFile.delete();

    // Get the Signed URLs for the thumbnail and original image.
    const config: GetSignedUrlConfig = {
      action: 'read',
      expires: '03-01-2500',
    };
    const results = await Promise.all([
      thumbFile.getSignedUrl(config),
      originalFile.getSignedUrl(config),
    ]);

    // save thumbnail link in database
    const frags = fileFullPath.split('/');
    const courseId = frags[1];
    const thumbResult = results[0];
    const originalResult = results[1];
    const thumbFileUrl = thumbResult[0];
    const originalFileUrl = originalResult[0];
    // console.log('saving urls to database: ' + courseId);

    return db.doc(`courses/${courseId}`).update({
      imgUrl: originalFileUrl,
      imgThumbUrl: thumbFileUrl,
    });     
  });

// export const convertToWebp = functions.storage.object()
//   .onFinalize(async (object, context) => {
//     // File and directory paths.
//     const fileFullPath = object.name || '';
//     const contentType = object.contentType || '';
//     const fileDir = path.dirname(fileFullPath);
//     const fileName = path.basename(fileFullPath);
//     const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
//     const webpFilePath = path.normalize(path.join(fileDir, `${fileNameWithoutExt}.webp`));
//     const tempLocalFile = path.join(os.tmpdir(), fileFullPath);
//     const tempLocalDir = path.dirname(tempLocalFile);
//     const tempLocalWebpFile = path.join(os.tmpdir(), webpFilePath);

//     if (!contentType.startsWith('image/')) {
//       console.log('This is not an image.')
//       return null;
//     }
  
//     if (contentType.startsWith('image/webp')) {
//       console.log('Already a webp image.')
//       return null;
//     }

//     // Cloud Storage files.
//     const bucket = gcp.bucket(object.bucket);
//     const originalFile = bucket.file(fileFullPath);
//     const webpFile = bucket.file(webpFilePath);
//     const metadata = {
//       contentType: object.contentType,
//       cacheControl: 'public, max-age=2592000, s-maxage=2592000',
//     };

//     await mkdirp(tempLocalDir);
//     await originalFile.download({destination: tempLocalFile});
//     console.log('The file has been downloaded to', tempLocalFile);
//     await spawn('magick', [tempLocalFile, '-quality 100 -define webp:lossless=false', tempLocalWebpFile], {capture: ['stdout', 'stderr']});
//     console.log('Webp created at', tempLocalWebpFile);

//     // Uploading the Thumbnail.
//     await bucket.upload(tempLocalWebpFile, {destination: webpFilePath, metadata});
//     console.log('Webp uploaded to Storage at', webpFilePath);

//     // Once the image has been uploaded delete the local files to free up disk space.
//     fs.unlinkSync(tempLocalFile);
//     fs.unlinkSync(tempLocalWebpFile);

//     // Get the Signed URLs for the thumbnail and original image.
//     const config: GetSignedUrlConfig = {
//       action: 'read',
//       expires: '03-01-2500',
//     };
//     const results = await Promise.all([
//       webpFile.getSignedUrl(config),
//       originalFile.getSignedUrl(config),
//     ]);

//     // save thumbnail link in database
//     const frags = fileFullPath.split('/');
//     const courseId = frags[1];
//     const webpResult = results[0];
//     // const originalResult = results[1];
//     const webpFileUrl = webpResult[0];
//     // const originalFileUrl = originalResult[0];
//     console.log('saving urls to database: ' + courseId);

//     return db.doc(`courses/${courseId}`).update({
//       // imgUrl: originalFileUrl,
//       imgWebpUrl: webpFileUrl,
//     });     
//   });
