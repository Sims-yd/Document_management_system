import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DocumentService } from '../../services/document.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    userRole: string = '';
    recentDocuments: any[] = [];

    constructor(
        public authService: AuthService,
        private documentService: DocumentService
    ) { }

    ngOnInit() {
        this.userRole = this.authService.getUserRole();
        this.loadRecentDocuments();
    }

    loadRecentDocuments() {
        this.documentService.getDocuments().subscribe({
            next: (docs) => {
                // Show last 5 documents
                this.recentDocuments = docs.slice(0, 5);
            },
            error: (err) => console.error(err)
        });
    }

    logout() {
        this.authService.logout();
    }
}
