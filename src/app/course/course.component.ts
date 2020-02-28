import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { tap, finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

import { CoursesService } from '../services/courses.service';

import { Course } from '../model/course';
import { Lesson, LessonsReq } from '../model/lesson';


@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {

  public course: Course;
  public displayedColumns = ['seqNo', 'description', 'duration'];
  public lessons: Lesson[] = [];
  public lessons$: Observable<Lesson[]>;
  public loading = false;

  private lastPageLoaded = 0;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {  }

  ngOnInit(): void {
    this.course = this.route.snapshot.data['course'];
    this.loadMore();
  }

  public loadMore(): void {
    this.loading = true;

    const lessonsReq: LessonsReq = {
      courseId: this.course.id,
      pageNumber: this.lastPageLoaded++,
      pageSize: 4
    };

    this.coursesService.findLessons(lessonsReq)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe((lessons: Lesson[]) => {
        this.lessons = this.lessons.concat(lessons);
      });
  }
}
