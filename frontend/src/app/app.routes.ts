import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DocumentListComponent } from './pages/document-list/document-list.component';
import { DocumentUploadComponent } from './pages/document-upload/document-upload.component';
import { DocumentDetailComponent } from './pages/document-detail/document-detail.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'documents',
        component: DocumentListComponent,
        canActivate: [authGuard],
        pathMatch: 'full' // Added pathMatch full to prevent prefix matching issues
    },
    {
        path: 'documents/:id',
        component: DocumentDetailComponent,
        canActivate: [authGuard]
    },
    {
        path: 'upload',
        component: DocumentUploadComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Editor', 'Admin'] }
    },
    { path: '**', redirectTo: '/dashboard' }
];
