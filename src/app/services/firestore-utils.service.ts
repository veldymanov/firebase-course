import { Injectable } from '@angular/core';
import { DocumentChangeAction } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreUtilsService {

  constructor() { }

  public convertSnaps<T>(snaps: DocumentChangeAction<T>[]): T[] {
    return snaps.map((snap: DocumentChangeAction<T>) => {
      return <T>{
        id: snap.payload.doc.id,
        ...snap.payload.doc.data()
      };
    });
  }
}
