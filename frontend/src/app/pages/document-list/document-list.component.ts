import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';

@Component({
    selector: 'app-document-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './document-list.component.html'
})
export class DocumentListComponent implements OnInit {
    documents: any[] = [];
    keyword: string = '';
    category: string = '';

    constructor(
        private documentService: DocumentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadDocuments();
    }

    loadDocuments() {
        this.documentService.getDocuments(this.keyword, this.category).subscribe({
            next: (docs) => {
                console.log('Documents loaded:', docs);
                this.documents = docs;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading documents:', err);
                this.cdr.detectChanges();
            }
        });
    }

    onSearch() {
        this.loadDocuments();
    }
}
