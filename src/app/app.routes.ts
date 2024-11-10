import { Routes } from '@angular/router';
import { CodeReviewComponent } from './components/code-review/code-review.component';

export const routes: Routes = [
  { path: '', component: CodeReviewComponent },
  { path: '**', redirectTo: '' }
];