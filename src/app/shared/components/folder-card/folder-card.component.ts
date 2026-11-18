import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-folder-card',
    templateUrl: './folder-card.component.html',
    styleUrls: ['./folder-card.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
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
