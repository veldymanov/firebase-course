import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Course } from '../model/course';

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

  public loadAllCourses(): Observable<Course[]> {
    return this.db.collection('courses').snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<Course>[]) => {
         return snaps.map((snap: DocumentChangeAction<Course>) => {
            return <Course>{
              id: snap.payload.doc.id,
              ...snap.payload.doc.data()
            };
          });
        })
      );
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
}
