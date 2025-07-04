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

  constructor(private imageService: GetImagesService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.imageService.getImages().subscribe({
      next: (response) => {
        this.images = response; // Asigna la respuesta directamente
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar imágenes:', error);
        this.isLoading = false;
      }
    });
  }

  refreshImages(): void {
    this.isLoading = true;
    this.loadImages();
  }
}