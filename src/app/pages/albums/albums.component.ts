import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadAlbumsService } from 'src/app/services/albums/uploadAlbums/upload-albums.service';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css'],
})
export class AlbumsComponent {
  albumForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private albumService: UploadAlbumsService,
    private fb: FormBuilder
  ) {
    this.albumForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit(): void {
    if (this.albumForm.invalid) return;

    this.isLoading = true;
    const albumName = this.albumForm.value.name;

    this.albumService.createAlbum(albumName).subscribe({
      next: () => {
        this.albumForm.reset();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al crear el álbum';
        this.isLoading = false;
      },
    });
  }
}
