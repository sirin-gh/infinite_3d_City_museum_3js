import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, limit, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CityService {
  private firestore = inject(Firestore);
  private birdsColl = collection(this.firestore, 'birds');

  // Returns live stream of birds from Firebase
  getItems(): Observable<any[]> {
    return collectionData(this.birdsColl, { idField: 'id' });
  }

  async addBird() {
    await addDoc(this.birdsColl, {
      type: 'bird',
      x: (Math.random() - 0.5) * 1000,
      y: 60 + Math.random() * 40,
      z: (Math.random() - 0.5) * 2000
    });
  }

  async deleteBird() {
    const q = query(this.birdsColl, limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(this.firestore, `birds/${snapshot.docs[0].id}`));
    }
  }
}