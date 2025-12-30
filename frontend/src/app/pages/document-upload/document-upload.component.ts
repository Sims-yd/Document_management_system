import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DocumentService } from '../../services/document.service';

@Component({
    selector: 'app-document-upload',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './document-upload.component.html'
})
export class DocumentUploadComponent {
    uploadForm: FormGroup;
    selectedFile: File | null = null;
    error: string = '';
    success: string = '';
    isUploading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private documentService: DocumentService,
        private router: Router
    ) {
        this.uploadForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            category: ['', Validators.required],
            tags: ['']
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    onSubmit() {
        if (this.uploadForm.valid && this.selectedFile) {
            this.isUploading = true;
            this.error = '';
            this.success = '';

            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('title', this.uploadForm.get('title')?.value);
            formData.append('description', this.uploadForm.get('description')?.value);
            formData.append('category', this.uploadForm.get('category')?.value);
            formData.append('tags', this.uploadForm.get('tags')?.value);

            this.documentService.uploadDocument(formData).subscribe({
                next: (res) => {
                    this.success = 'Document uploaded successfully!';
                    this.isUploading = false;
                    setTimeout(() => {
                        this.router.navigate(['/documents']);
                    }, 2000);
                },
                error: (err: any) => {
                    console.error('Upload error:', err);
                    this.error = err?.error?.message || err?.message || 'Upload failed';
                    this.isUploading = false;
                }
            });
        } else {
            this.error = 'Please fill all required fields and select a file.';
        }
    }
}
