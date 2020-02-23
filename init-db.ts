
import { COURSES, findLessonsForCourse } from './db-data';

import * as firebase from 'firebase';

const config = {
  apiKey: "AIzaSyA39gJEZJk2taPuAK-xxiBlnwScr58As-c",
  authDomain: "fir-course-staging.firebaseapp.com",
  databaseURL: "https://fir-course-staging.firebaseio.com",
  projectId: "fir-course-staging",
  storageBucket: "fir-course-staging.appspot.com",
  messagingSenderId: "983755097736",
  appId: "1:983755097736:web:b06115e2c977ff5359413d",
  measurementId: "G-CC3P96XK5G"
};

console.log('Uploading data to the database with the following config:');
console.log(JSON.stringify(config));
console.log('Make sure that this is your own database, so that you have write access to it.');

firebase.initializeApp(config);

const db = firebase.firestore();

async function uploadData() {
  const batch = db.batch();
  const courses = db.collection('courses');

  Object.values(COURSES)
    .sort((c1: any, c2: any) => c1.seqNo - c2.seqNo)
    .forEach(async (course: any) => {
      const newCourse = removeId(course);
      const courseRef = await courses.add(newCourse);
      const lessons = courseRef.collection('lessons');
      const courseLessons = findLessonsForCourse(course.id);

      // console.log(`Adding ${courseLessons.length} lessons to ${course.description}`);

      courseLessons.forEach(async lesson => {
        const newLesson = removeId(lesson);
        await lessons.add(newLesson);
      });
    });

  return batch.commit();
}


function removeId(data: any) {
  const newData: any = {...data};

  delete newData.id;

  return newData;
}


uploadData()
  .then(() => {
    console.log('Writing data, exiting in 10 seconds ...');

    setTimeout(() => {

      console.log('Data Upload Completed.');
      process.exit(0);

    }, 10000);

  })
  .catch(err => {
    console.log('Data upload failed, reason:', err, '');
    process.exit(-1);
  });
