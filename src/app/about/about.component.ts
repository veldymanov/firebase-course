import { Component, OnInit } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { Course } from '../model/course';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.db.collection('courses')
      .valueChanges()
      .subscribe(val => {
        console.log('valueChanges ', val);
      });

    this.db.collection('courses')
      .snapshotChanges()
      .subscribe((snaps: DocumentChangeAction<Course>[]) => {
        const courses: Course[] = snaps.map(snap => {
          return <Course>{
            id: snap.payload.doc.id,
            ...snap.payload.doc.data()
          };
        });

        console.log('snapshotChanges courses ', courses);
      });
  }

}
