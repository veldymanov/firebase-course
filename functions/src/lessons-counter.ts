import * as functions from 'firebase-functions';
import { db } from './init';

import { Course } from '../../src/app/model/course';

export const onAddLesson = functions.firestore.document('courses/{courseId}/lessons/{lessonId}')
  .onCreate(async (snap, context) => {
    // const courseId = context.params.courseId;
    console.log('running onAddLesson trigger ...');

    return db.runTransaction(async transaction => {
      const courseRef = snap.ref.parent.parent as FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
      const courseSnap = await transaction.get(courseRef);
      const course = <Course>courseSnap.data();
      const changes: Partial<Course> = { lessonsCount: course.lessonsCount + 1 };

      transaction.update(courseRef, changes);
    });
  });