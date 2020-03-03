import * as functions from 'firebase-functions';
import * as mkdirp from 'mkdirp-promise';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { Storage } from '@google-cloud/storage';
import { spawn } from 'child-process-promise';

import { db } from './init';

const gcp = new Storage();

export const resizeThumbnail = functions.storage.object()
  .onFinalize(async (object, context) => {
    const fileFullPath = object.name || '';
    const contentType = object.contentType || '';
    const fileDir = path.dirname(fileFullPath);
    const fileName = path.basename(fileFullPath);
    const tempLocalDir = path.join(os.tmpdir(), fileDir);

    console.log('Thumbnail generation started: ', fileFullPath, fileDir, fileName);

    if (!contentType.startsWith('image/') || fileName.startsWith('thumb_')) {
      console.log('Exiting image processing.');
      return null;
    }

    // Download the original file uploaded by the user
    await mkdirp(tempLocalDir);
    const bucket = gcp.bucket(object.bucket);
    const originalImageFile = bucket.file(fileFullPath);
    const tempLocalFile = path.join(os.tmpdir(), fileFullPath);
    await originalImageFile.download({destination: tempLocalFile});
    console.log('Downloading image to : ', tempLocalFile);

    // Generate a thumbnail using ImageMagick
    const outputFilePath = path.join(fileDir, 'thumb_' + fileName);
    const outputFile = path.join(os.tmpdir(), outputFilePath);
    console.log('Generating a thumbnail to: ', outputFile);
    await spawn('convert', [tempLocalFile, '-thumbnail','510x287 >', outputFile], {capture: ['stdout', 'stderr']});

    // Upload the Thumbnail to storage
    const metadata = {
      contentType: object.contentType,
      cacheControl: 'public, max-age=2592000, s-maxage=2592000',
    };
    console.log('Uploading the thumbnail to storage:', outputFile, outputFilePath);
    const uploadedFiles = await bucket.upload(outputFile, {destination: outputFilePath, metadata});

    // delete local files to avoid filling up the file system over time
    rimraf.sync(tempLocalDir);
    await originalImageFile.delete();

    // create link to uploaded file
    const thumbnail = uploadedFiles[0];
    const url = await thumbnail.getSignedUrl({action:'read',expires: new Date(3000,0,1)});
    console.log('Generated signed url:', url);

    // save thumbnail link in database
    const frags = fileFullPath.split('/'),
    courseId = frags[1];
    console.log('saving url to database: ' + courseId);

    return db.doc(`courses/${courseId}`).update({uploadedImageUrl: url});     
  });
