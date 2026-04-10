import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { UploadComponent } from './components/upload/upload';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: UploadComponent },
  { path: '**', redirectTo: '' }
];