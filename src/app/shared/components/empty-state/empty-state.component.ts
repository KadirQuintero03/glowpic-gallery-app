import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
  @Input() title = 'Esta carpeta está vacía todavía.';
  @Input() description = '';
  @Input() isSearch = false;
}
