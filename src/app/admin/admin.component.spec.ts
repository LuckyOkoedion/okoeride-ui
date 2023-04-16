import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import { By } from '@angular/platform-browser';
import { DatafetchService } from '../datafetch.service';
import { of } from 'rxjs';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let adminService: DatafetchService; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminComponent ]
    })
    .compileComponents();

  });

  beforeEach(() => {

    TestBed.configureTestingModule({ providers: [DatafetchService] });

    adminService = TestBed.inject(DatafetchService);
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();



  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the "Onboard Driver" form on the admin page', () => {
    fixture.detectChanges();
    const onboardDriverForm = fixture.debugElement.query(By.css('form#onboard-driver'));
    expect(onboardDriverForm).toBeTruthy();
  });

  it('should have a single input for driver name on the "Onboard Driver" form', () => {
    fixture.detectChanges();
    const onboardDriverForm = fixture.debugElement.query(By.css('form#onboard-driver'));
    const inputs = onboardDriverForm.queryAll(By.css('input'));
    expect(inputs.length).toBe(1);
    expect(inputs[0].nativeElement.getAttribute('name')).toBe('name');
    expect(inputs[0].nativeElement.getAttribute('type')).toBe('text');
  });
  

  it('should send a POST request to /admin/onboard-driver when the "Onboard Driver" form is submitted', fakeAsync(async () => {
    const onboardDriverSpy = spyOn(adminService, 'onboardDriver').and.returnValue(of());
    fixture.detectChanges();
    const onboardDriverForm = fixture.debugElement.query(By.css('form#onboard-driver'));
    const nameInput = onboardDriverForm.query(By.css('input[name="name"]'));
    const submitButton = onboardDriverForm.query(By.css('button[type="submit"]'));
  
    nameInput.nativeElement.value = 'Test Driver';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    submitButton.nativeElement.click();
    tick();
  
    expect(onboardDriverSpy).toHaveBeenCalledWith( 'Test Driver' );
    expect(onboardDriverForm.classes['ng-valid']).toBeTruthy();
  }));

  
  it('should display a progress bar indicating success or failure when the "Onboard Driver" form is submitted', fakeAsync(() => {
    spyOn(adminService, 'onboardDriver').and.returnValue(of());
    fixture.detectChanges();
    const onboardDriverForm = fixture.debugElement.query(By.css('form#onboard-driver'));
    const nameInput = onboardDriverForm.query(By.css('input[name="name"]'));
    const submitButton = onboardDriverForm.query(By.css('button[type="submit"]'));
  
    nameInput.nativeElement.value = 'Test Driver';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    submitButton.nativeElement.click();
    tick();
  
    const progressBar = fixture.debugElement.query(By.css('.progress-bar'));
    expect(progressBar).toBeTruthy();
    expect(progressBar.nativeElement.classList).toContain('bg-success');
  }));

  

  


});
