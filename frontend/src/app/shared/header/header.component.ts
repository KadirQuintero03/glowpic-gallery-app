import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UploadImagesService } from 'src/app/services/images/uploadImages/upload-images.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  // Estado para el nav
  state: boolean = true;
  @Output() changeStateNav = new EventEmitter<boolean>();

  stateControlNav() {
    this.state = !this.state;
    this.changeStateNav.emit(this.state);
  }

  // Estado para configuración
  stateConfigTrue: boolean = true;
  @Output() StateConfigTrue = new EventEmitter<boolean>();

  changeStateConfigTrue() {
    this.StateConfigTrue.emit(this.stateConfigTrue);
  }

  // ➕ NUEVO: Mostrar perfil de usuario
  @Output() showUserProfile = new EventEmitter<boolean>();

  openUserProfile() {
    this.showUserProfile.emit(true);
  }

  constructor(private uploadService: UploadImagesService, private router: Router) { }
  Exit(): void {
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadImage(file);
    }
  }

  uploadImage(file: File) {
    this.uploadService.uploadImage(file).subscribe({
      next: (response) => {
        console.log("✅ Respuesta al subir imagen:", response);
        alert('Imagen subida correctamente');
      },
      error: (error) => {
        console.error('❌ Error al subir la imagen', error);
        alert('Error al subir la imagen');
      },
    });
  }
}
