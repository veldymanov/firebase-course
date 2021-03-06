import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

import { db } from './init';

const app = express();

app.use(cors({origin: true}));

app.get('/courses', async (req, res) => {
  const snaps = await db.collection('courses').get();
  const courses: any[] = [];

  snaps.forEach(snap => courses.push(snap.data()));

  res.status(200).json({courses});
});

export const getCourses = functions.https.onRequest(app);
export { onAddLesson, onDeleteLesson } from './lessons-counter';
// export { createThumbImgMagick } from './img-thumb-img-magick'; 
export { createThumbSharp } from './img-thumb-sharp'; 
export { convertToWebp } from './image-webp';

// export const helloWorld = functions.https.onRequest((request, response) => {
//     response.status(200).json({ message: "Hello from Firebase!" });
// });