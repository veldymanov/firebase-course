import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { CoursesService } from './courses.service';
import { Course } from '../model/course';


@Injectable()
export class CourseResolver implements Resolve<Course> {

  constructor(
    private coursesServise: CoursesService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Course> {
    const courseUrl = route.paramMap.get('courseUrl');

    return this.coursesServise.findCourseByUrl(courseUrl);
  }
}
