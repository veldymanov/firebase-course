import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { FirestoreUtilsService } from '../services/firestore-utils.service';
import { Course } from '../model/course';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(
    private db: AngularFirestore,
    private fsUtils: FirestoreUtilsService,
  ) { }

  ngOnInit(): void {
    const courseRef = this.db.doc('/courses/3RtttYVC1VvTVYoBge2r')
      .snapshotChanges()
      .subscribe(snap => {
        const course = snap.payload.data();
        console.log(course);
      });
  }

  public save(): void {
    const firebaseCourseRef = this.db.doc('/courses/1qmL1O7wWMRz05KVHSOh').ref;
    const rxjsCourseRef = this.db.doc('/courses/3RtttYVC1VvTVYoBge2r').ref;
    const batch = this.db.firestore.batch();

    batch.update(firebaseCourseRef, {titles: {description: 'firebase course 28'}});
    batch.update(rxjsCourseRef, {titles: {description: 'rxjs course 28'}});

    const batch$ = of(batch.commit());
  }

  public async runTransaction(): Promise<number> {
    const newCounter = await this.db.firestore.runTransaction(async (transaction) => {
      console.log('Running transaction ...');

      const courseRef = this.db.doc('/courses/1qmL1O7wWMRz05KVHSOh').ref;
      const snap = await transaction.get(courseRef);
      const course = <Course>snap.data();
      const lessonsCount = course.lessonsCount + 1;

      transaction.update(courseRef, {lessonsCount});

      // use in the app only this returned value!!!
      // because it is possible that transaction can be stopped
      // and then re-run again
      return lessonsCount;
    });

    console.log('newCounter', newCounter);

    return newCounter;
  }
}
