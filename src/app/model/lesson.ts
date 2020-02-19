
import { FieldPath, OrderByDirection } from '@firebase/firestore-types';

export interface Lesson {
  id: number;
  description: string;
  duration: string;
  seqNo: number;
  courseId: number;
}

export interface LessonsReq {
  courseId: FieldPath | string;
  pageNumber?: number;
  pageSize?: number;
  sortOrder?: OrderByDirection;
}
