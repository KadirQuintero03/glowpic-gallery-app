import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-user-config',
    templateUrl: './user-config.component.html',
    styleUrls: ['./user-config.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class UserConfigComponent {
  stateConfigFalse: boolean = false;
  @Output() StateConfigFalse = new EventEmitter<boolean>();

  changeStateConfigFalse() {
    this.StateConfigFalse.emit(this.stateConfigFalse);
  }
}
