import { Component, OnInit } from '@angular/core';
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

    constructor(private documentService: DocumentService) { }

    ngOnInit() {
        this.loadDocuments();
    }

    loadDocuments() {
        this.documentService.getDocuments(this.keyword, this.category).subscribe({
            next: (docs) => {
                this.documents = docs;
            },
            error: (err) => console.error(err)
        });
    }

    onSearch() {
        this.loadDocuments();
    }
}
