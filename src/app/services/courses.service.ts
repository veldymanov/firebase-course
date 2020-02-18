import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, QueryFn } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Course, CoursesReq, CategoriesEnum } from '../model/course';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  constructor(
    private db: AngularFirestore
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
      ref => ref.orderBy(field).where('categories', 'array-contains-any', categories)
    ).snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<Course>[]) => {
         return snaps.map((snap: DocumentChangeAction<Course>) => {
            return <Course>{
              id: snap.payload.doc.id,
              ...snap.payload.doc.data()
            };
          });
        }),
        tap(courses => {
          console.log(categories, field);
          console.log(courses);}
        )
      );
  }
}
