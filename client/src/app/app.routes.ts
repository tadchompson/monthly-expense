import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./components/expenses/expenses.component').then(m => m.ExpensesComponent),
  },
  {
    path: 'summary',
    loadComponent: () =>
      import('./components/summary/summary.component').then(m => m.SummaryComponent),
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./components/upload/upload.component').then(m => m.UploadComponent),
  },
];
