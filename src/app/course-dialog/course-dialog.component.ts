import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { last, concatMap } from 'rxjs/operators';

import { Course } from '../model/course';
import { CoursesService } from '../services/courses.service';


@Component({
  selector: 'course-dialog',
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit {

  public form: FormGroup;
  public description: string;
  public downloadUrl$: Observable<string>;
  public uploadPercent$: Observable<number>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public course: Course,
    private courseService: CoursesService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    private storage: AngularFireStorage
  ) {  }

  ngOnInit() {
    this.form = this.fb.group({
      description: [this.course.titles.description, Validators.required],
      longDescription: [this.course.titles.longDescription, Validators.required]
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close(this.form.value);
  }

  public uploadFile(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const filePath = `courses/${this.course.id}/${file.name}`;
    const task = this.storage.upload(filePath, file);

    this.uploadPercent$ = task.percentageChanges();

    this.downloadUrl$ = task.snapshotChanges()
      .pipe(
        last(),
        concatMap(() => this.storage.ref(filePath).getDownloadURL() as Observable<string>)
      );

    const saveUrl$ = this.downloadUrl$
      .pipe(
        concatMap((url: string) => this.courseService.saveCourse(this.course.id, {
          uploadedImageUrl: url
        }))
      )

    saveUrl$.subscribe(val => {
      console.log('saveUrl$ : ', val);
    });
  }
}
