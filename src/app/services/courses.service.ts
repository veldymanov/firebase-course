import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';

import { Observable, of, from } from 'rxjs';
import { map, tap, take, catchError } from 'rxjs/operators';

import { FirestoreUtilsService } from './firestore-utils.service';
import { Course, CoursesReq, CategoriesEnum } from '../model/course';
import { Lesson, LessonsReq } from '../model/lesson';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(
    private db: AngularFirestore,
    private fsUtils: FirestoreUtilsService,
  ) { }

  public getCoursesValues(): Observable<Course[]> {
    return this.db.collection('courses').valueChanges() as Observable<Course[]>;
  }

  public getCoursesChanges(): Observable<Course[]> {
    return this.db.collection('courses').stateChanges()
      .pipe(
        map((changes: DocumentChangeAction<Course>[]) => {
         return changes.map((change: DocumentChangeAction<Course>) => {
            return <Course>{
              id: change.payload.doc.id,
              ...change.payload.doc.data()
            };
          });
        })
      );
  }

  public findCourseByUrl(courseUrl: string): Observable<Course> {
    return this.db.collection(
      'courses',
      ref => ref.where('url', '==', courseUrl)
    )
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<Course>[]) => {
          const courses = this.fsUtils.convertSnaps<Course>(snaps);
          return courses.length === 1 ? courses[0] : null;
        }),
        take(1)
      );
  }

  public findLessons({
    courseId = null,
    pageNumber = 0,
    pageSize = 3,
    sortOrder = 'asc',
  }: LessonsReq = <LessonsReq>{}): Observable<Lesson[]> {
    return this.db.collection(
      `courses/${courseId}/lessons`,
      ref => ref.orderBy('seqNo', sortOrder)
        .limit(pageSize)
        .startAfter(pageNumber * pageSize)
    )
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<Lesson>[]) => {
          return this.fsUtils.convertSnaps<Lesson>(snaps);
        }),
        take(1)
      );
  }

  public loadAllCourses({
    categories = Object.values(CategoriesEnum),
    field = 'seqNo',
    startAt = 0,
    endAt = 5
  }: CoursesReq = {}): Observable<Course[]> {
    return this.db.collection(
      'courses',
      // ref => ref.orderBy(field) // .startAfter(startAt).endAt(endAt)
      // ref => ref.where('categories', 'array-contains', CategoriesEnum.Beginner)
      // ref => ref.where('seqNo', '==', 5).where('lessonsCount', '>=', 5)
      ref => ref.orderBy(field)
        .where('categories', 'array-contains-any', categories)
    ).snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<Course>[]) => this.fsUtils.convertSnaps<Course>(snaps)),
        // tap(courses => {
        //   console.log(categories, field);
        //   console.log(courses);}
        // )
      );
  }

  public saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
    return from(this.db.doc(`courses/${courseId}`).update(changes));
  }
}
