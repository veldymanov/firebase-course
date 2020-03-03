import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Course } from '../model/course';
import { CourseDialogComponent } from '../course-dialog/course-dialog.component';
import { CoursesService } from '../services/courses.service';

@Component({
  selector: 'courses-card-list',
  templateUrl: './courses-card-list.component.html',
  styleUrls: ['./courses-card-list.component.css']
})
export class CoursesCardListComponent implements OnInit {

  @Input()
  courses: Course[];

  constructor(
    private coursesService: CoursesService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {

  }

  public editCourse(course: Course): void {
   const dialogRef = this.dialog.open(CourseDialogComponent, {
      disableClose: true,
      autoFocus: true,
      data: course,
    });

    dialogRef.afterClosed().subscribe(courseTitles => {
      if (courseTitles) {
        this.coursesService.saveCourse(course.id, { titles: courseTitles })
          .subscribe(resp => console.log('resp', resp));
      }
    })
  }

  public getImgUrl(course: Course): string {
    return course.imgThumbUrl 
      ? course.imgThumbUrl 
      : course.imgUrl
        ? course.imgUrl
        : course.iconUrl;
  }
}
