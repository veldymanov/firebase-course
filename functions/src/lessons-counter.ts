import * as functions from 'firebase-functions';
import { db } from './init';

export const onAddLesson = functions.firestore.document('courses/{courseId}/lessons/{lessonId}')
  .onCreate(async (snap, context) => {
    // const courseId = context.params.courseId;
    console.log('running onAddLesson trigger ...');

    return courseTransaction(snap, course => {
      return { lessonsCount: course.lessonsCount + 1 }
    });
  });

export const onDeleteLesson = functions.firestore.document('courses/{courseId}/lessons/{lessonId}')
  .onDelete(async (snap, context) => {
    console.log('running onDeleteLesson trigger ...');

    return courseTransaction(snap, course => {
      return { lessonsCount: course.lessonsCount - 1 }
    });
  });


function courseTransaction(snap: FirebaseFirestore.DocumentSnapshot, cb: Function) {
  return db.runTransaction(async transaction => {
    const courseRef = snap.ref.parent.parent as FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
    const courseSnap = await transaction.get(courseRef);
    const course = courseSnap.data() as FirebaseFirestore.DocumentData;
    const changes = cb(course);
    
    transaction.update(courseRef, changes);
  });
}
