import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
}

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class UserProfileComponent {
  @Input() user: UserProfile | null = null;
  @Output() closeProfile = new EventEmitter<void>();

  close(): void {
    this.closeProfile.emit();
  }
}
