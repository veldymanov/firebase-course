
export enum CategoriesEnum {
  Beginner = 'BEGINNER',
  Advanced = 'ADVANCED'
}

export interface Course {
  id: string;
  titles: {
    description: string;
    longDescription: string;
  };
  iconUrl: string;
  uploadedImageUrl: string;
  courseListIcon: string;
  categories: CategoriesEnum[];
  lessonsCount: number;
  url: string;
}

export type CourseSavePayload = Pick<Course, 'id' | 'titles'>;

export interface CoursesReq {
  categories?: CategoriesEnum[];
  field?: string;
  startAt?: number;
  endAt?: number;
}
