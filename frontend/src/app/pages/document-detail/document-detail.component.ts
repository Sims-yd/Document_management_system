import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './document-detail.component.html'
})
export class DocumentDetailComponent implements OnInit {

  document: any = null;
  history: any[] = [];
  error: string = '';
  userRole: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    // ✅ Correct way to read route param
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.error = 'Invalid document ID';
        this.loading = false;
        return;
      }

      console.log('📌 Document ID from route:', id);

      this.loadDocument(id);
      this.loadHistory(id);
    });
  }

  // ✅ FIXED: Document loader
  loadDocument(id: string): void {
    this.documentService.getDocumentById(id).subscribe({
      next: (doc) => {
        console.log('✅ Document received:', doc);
        this.document = doc;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load document:', err);
        this.error = 'Failed to load document details';
        this.loading = false;
      }
    });
  }

  // ✅ FIXED: History loader
  loadHistory(id: string): void {
    this.documentService.getDocumentHistory(id).subscribe({
      next: (history) => {
        console.log('📜 History received:', history);
        this.history = history.reverse();
      },
      error: (err) => {
        console.error('❌ Failed to load history:', err);
      }
    });
  }

  // ✅ Delete document
  deleteDocument(): void {
    if (!this.document?._id) return;

    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(this.document._id).subscribe({
        next: () => {
          alert('Document deleted successfully');
          this.router.navigate(['/documents']);
        },
        error: (err) => {
          console.error('❌ Delete failed:', err);
          alert('Failed to delete document');
        }
      });
    }
  }
}
