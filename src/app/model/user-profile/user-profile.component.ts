import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  @Input() user: any;
  @Output() closeProfile = new EventEmitter<void>();

  close() {
    this.closeProfile.emit();
  }
}
