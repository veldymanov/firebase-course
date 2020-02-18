
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
  description?: string;
  lessonsCount: number;
  url: string;
}

export interface CoursesReq {
  categories?: CategoriesEnum[];
  field?: string;
  startAt?: number;
  endAt?: number;
}
