import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Course, CategoriesEnum } from '../model/course';
import { CoursesService } from '../services/courses.service';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public advancedCourses$: Observable<Course[]>;
  public beginnerCourses$: Observable<Course[]>;

  constructor(
    private coursesService: CoursesService
  ) { }

  ngOnInit() {
    this.advancedCourses$ = this.coursesService.loadAllCourses({
      categories: [CategoriesEnum.Advanced],
      startAt: 3
    });
      // .pipe(
      //   map((courses: Course[]) => courses.filter(
      //     course => course.categories.includes(CategoriesEnum.Advanced)
      //   )),
      // );

    this.beginnerCourses$ = this.coursesService.loadAllCourses({
      categories: [CategoriesEnum.Beginner],
    });
  }
}
