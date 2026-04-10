import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, query, limit, getDocs, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private firestore = inject(Firestore);
   // Collections (like database tables)
  private birdsColl = collection(this.firestore, 'birds');
  private flowersColl = collection(this.firestore, 'flowers');
  private benchesColl = collection(this.firestore, 'benches');
  // Documents for storing colors
  private birdColorDoc = doc(this.firestore, 'settings', 'birdColor');
  private flowerColorDoc = doc(this.firestore, 'settings', 'flowerColor');
  private benchColorDoc = doc(this.firestore, 'settings', 'benchColor');

  // Birds
  // READING Data
  getItems(): Observable<any[]> {
    return collectionData(this.birdsColl, { idField: 'id' });
  }

  getBirdColor(): Observable<any[]> {
    const settingsColl = collection(this.firestore, 'settings');
    return collectionData(settingsColl, { idField: 'id' });
  }

  async setBirdColor(color: string): Promise<void> {
    console.log('Setting bird color in Firebase:', color);
    try {
      await setDoc(this.birdColorDoc, { color }, { merge: true });
      console.log('Firebase updated successfully with bird color:', color);
    } catch (error) {
      console.error('Firebase update error:', error);
      throw error;
    }
  }

  async addBird() {
    await addDoc(this.birdsColl, {
      x: (Math.random() - 0.5) * 800,
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

  // Flowers
  getFlowers(): Observable<any[]> {
    return collectionData(this.flowersColl, { idField: 'id' });
  }

  getFlowerColor(): Observable<any[]> {
    const settingsColl = collection(this.firestore, 'settings');
    return collectionData(settingsColl, { idField: 'id' });
  }

  async setFlowerColor(color: string): Promise<void> {
    console.log('Setting flower color in Firebase:', color);
    try {
      await setDoc(this.flowerColorDoc, { color }, { merge: true });
      console.log('Firebase updated successfully with flower color:', color);
    } catch (error) {
      console.error('Firebase update error:', error);
      throw error;
    }
  }

  async addFlower() {
    await addDoc(this.flowersColl, {
      x: (Math.random() - 0.5) * 800,
      z: (Math.random() - 0.5) * 2000
    });
  }

  async deleteFlower() {
    const q = query(this.flowersColl, limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(this.firestore, `flowers/${snapshot.docs[0].id}`));
    }
  }

  // Benches
  getBenches(): Observable<any[]> {
    return collectionData(this.benchesColl, { idField: 'id' });
  }

  getBenchColor(): Observable<any[]> {
    const settingsColl = collection(this.firestore, 'settings');
    return collectionData(settingsColl, { idField: 'id' });
  }

  async setBenchColor(color: string): Promise<void> {
    console.log('Setting bench color in Firebase:', color);
    try {
      await setDoc(this.benchColorDoc, { color }, { merge: true });
      console.log('Firebase updated successfully with bench color:', color);
    } catch (error) {
      console.error('Firebase update error:', error);
      throw error;
    }
  }

  async addBench() {
    await addDoc(this.benchesColl, {
      x: (Math.random() - 0.5) * 800,
      z: (Math.random() - 0.5) * 2000
    });
  }

  async deleteBench() {
    const q = query(this.benchesColl, limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(this.firestore, `benches/${snapshot.docs[0].id}`));
    }
  }
}