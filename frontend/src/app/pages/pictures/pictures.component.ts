import { Component, OnInit } from '@angular/core';
import { GetImagesService } from 'src/app/services/images/getImages/get-images.service';

@Component({
  selector: 'app-pictures',
  templateUrl: './pictures.component.html',
  styleUrls: ['./pictures.component.css']
})

export class PicturesComponent implements OnInit {
  images: any[] = [];
  isLoading = true;
  currentPage = 1;
  pageSize = 15;

  constructor(private imageService: GetImagesService) { }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    const email = localStorage.getItem('user_email'); // 👈 el email guardado

    if (!email) {
      console.error('❌ No se encontró el email en localStorage');
      this.isLoading = false;
      return;
    }

    this.imageService.getImages(email, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.images = response?.data?.value || []; // 👈 usa el array correcto
        this.isLoading = false;
        this.loadImages()
      },
      error: (error) => {
        console.error('❌ Error al cargar imágenes:', error);
        this.isLoading = false;
      },
    });
  }

  nextPage(): void {
    this.currentPage++;
    this.loadImages();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadImages();
    }
  }
}