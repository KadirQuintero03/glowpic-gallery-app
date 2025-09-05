import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html',
  styleUrls: ['./user-config.component.css']
})
export class UserConfigComponent {
  stateConfigFalse: boolean = false;
  @Output() StateConfigFalse = new EventEmitter<boolean>();

  changeStateConfigFalse() {
    this.StateConfigFalse.emit(this.stateConfigFalse);
  }
}
