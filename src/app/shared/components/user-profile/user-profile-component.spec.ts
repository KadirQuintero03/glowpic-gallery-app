import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { By } from '@angular/platform-browser';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;

    // Simulamos un usuario de ejemplo
    component.user = {
      name: 'Test User',
      email: 'test@example.com'
    };

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name and email', () => {
    const info = (fixture.nativeElement as HTMLElement).querySelector('.profile-info');
    expect(info).not.toBeNull();
    expect(info!.textContent).toContain('Test User');
    expect(info!.textContent).toContain('test@example.com');
  });

  it('should emit closeProfile event on button click', () => {
    spyOn(component.closeProfile, 'emit');

    const closeButton = fixture.debugElement.query(By.css('.close-btn'));
    closeButton.triggerEventHandler('click', null);

    expect(component.closeProfile.emit).toHaveBeenCalled();
  });
});
