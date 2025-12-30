import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './document-detail.component.html'
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  doc: any = null;
  history: any[] = [];
  error: string = '';
  userRole: string = '';
  loading: boolean = true;
  
  // Sanitized URLs (computed once to prevent re-renders)
  sanitizedFileUrl: SafeResourceUrl | null = null;
  
  // Media loading states (separated by type to avoid document loaders hanging)
  mediaLoading: { [key: string]: boolean } = {
    image: false,
    video: false,
    document: false,
  };
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper method to detect media type based on resource_type or file extension
  getMediaType(doc: any): string {
    if (!doc) return '';
    
    // Prefer resourceType from metadata, but verify it's correct for the format
    if (doc.resourceType && doc.resourceType !== 'raw') {
      if (doc.resourceType === 'image') return 'image';
      if (doc.resourceType === 'video') return 'video';
    }
    
    // Fallback to file extension (handles resourceType: 'raw' or missing)
    const ext = (doc.fileFormat || doc.fileUrl?.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext)) return 'document';
    
    return 'unknown';
  }

  // ✅ FIXED: Document loader
  loadDocument(id: string): void {
    this.loading = true;
    this.documentService.getDocumentById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (doc) => {
          console.log('✅ Document received:', doc);
          this.doc = doc;
          
          const mediaType = this.getMediaType(doc);
          
          // Sanitize URL once to prevent repeated calls
          if (doc.fileUrl) {
            if (mediaType === 'document') {
              // Use Google Docs Viewer for Office files
              const url = `https://docs.google.com/gview?url=${encodeURIComponent(doc.fileUrl)}&embedded=true`;
              this.sanitizedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            } else {
              this.sanitizedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileUrl);
            }
          }
          
          // Set loading state for the specific media type
          const loadingKey = ['pdf', 'document'].includes(mediaType) ? 'document' : mediaType;
          if (this.mediaLoading.hasOwnProperty(loadingKey)) {
             this.mediaLoading[loadingKey] = true;
             
             // Safety timeout for images/videos too (in case load events miss)
             if (loadingKey === 'image' || loadingKey === 'video') {
               setTimeout(() => {
                 if (this.mediaLoading[loadingKey]) {
                   console.log(`⚠️ Timeout fallback for ${loadingKey}`);
                   this.mediaLoading[loadingKey] = false;
                   this.cdr.detectChanges();
                 }
               }, 3000);
             }
          }
          
          // For documents/PDFs, verify accessibility to turn off loader
          if (['pdf', 'document'].includes(mediaType)) {
            this.verifyDocumentAccessibility(doc.fileUrl, loadingKey);
          }
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to load document:', err);
          this.error = 'Failed to load document details';
          this.cdr.detectChanges();
        }
      });
  }

  // Verify document is accessible via HEAD request or timeout
  private verifyDocumentAccessibility(fileUrl: string, loadingKey: string): void {
    // Try HEAD request first (may fail on cross-origin, but attempt is low-cost)
    this.http.head(fileUrl, { responseType: 'text' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`✅ ${loadingKey} verified accessible`);
          this.mediaLoading[loadingKey] = false;
          this.cdr.detectChanges();
        },
        error: () => {
          // HEAD failed (cross-origin or other), use fallback timeout
          console.log(`⚠️ HEAD failed for ${loadingKey}, using timeout fallback`);
          setTimeout(() => {
            this.mediaLoading[loadingKey] = false;
            this.cdr.detectChanges();
          }, 1000); // 1s timeout for cross-origin Cloudinary assets
        }
      });
  }

  // Image/video load handlers (keep load events for these)
  onImageLoad(): void {
    console.log('✅ Image loaded');
    this.mediaLoading['image'] = false;
    this.cdr.detectChanges();
  }

  onImageError(): void {
    console.error('❌ Image failed to load');
    this.mediaLoading['image'] = false;
    this.cdr.detectChanges();
  }

  onVideoLoad(): void {
    console.log('✅ Video loaded');
    this.mediaLoading['video'] = false;
    this.cdr.detectChanges();
  }

  onVideoError(): void {
    console.error('❌ Video failed to load');
    this.mediaLoading['video'] = false;
    this.cdr.detectChanges();
  }

  // ✅ FIXED: History loader
  loadHistory(id: string): void {
    this.documentService.getDocumentHistory(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          console.log('📜 History received:', history);
          this.history = history.reverse();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to load history:', err);
          this.cdr.detectChanges();
        }
      });
  }

  // ✅ Delete document
  deleteDocument(): void {
    if (!this.doc?._id) return;

    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(this.doc._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Document deleted successfully');
            this.router.navigate(['/documents']);
          },
          error: (err) => {
            console.error('❌ Delete failed:', err);
            alert('Failed to delete document');
            this.cdr.detectChanges();
          }
        });
    }
  }
}
