import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-folder-card',
  templateUrl: './folder-card.component.html',
  styleUrls: ['./folder-card.component.css']
})
export class FolderCardComponent {
  @Input() name = '';
  @Input() tone = 'blue';
  @Input() subtitle = 'Carpeta';
  @Output() cardClick = new EventEmitter<void>();

  onClick(): void {
    this.cardClick.emit();
  }
}
