
import { COURSES, findLessonsForCourse } from './db-data';

import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyAXxlqxYXySVMga4g3Qie0faAA0BKrIRVM',
  authDomain: 'fir-course-f6088.firebaseapp.com',
  databaseURL: 'https://fir-course-f6088.firebaseio.com',
  projectId: 'fir-course-f6088',
  storageBucket: 'fir-course-f6088.appspot.com',
  messagingSenderId: '339808080680',
  appId: '1:339808080680:web:29f49c01e9eee04889b61d',
  measurementId: 'G-WDJSDY2EM5'
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
