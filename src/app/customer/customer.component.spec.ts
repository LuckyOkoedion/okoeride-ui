import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CustomerComponent } from './customer.component';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { DatafetchService } from '../datafetch.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('CustomerComponent', () => {
  let component: CustomerComponent;
  let customerService: DatafetchService; 
  let fixture: ComponentFixture<CustomerComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ CustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {

    fixture = TestBed.createComponent(CustomerComponent);
    component = fixture.componentInstance;
    
    TestBed.configureTestingModule({ providers: [DatafetchService] });

    customerService = TestBed.inject(DatafetchService);

    fixture.detectChanges();

    router = TestBed.inject(Router);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should create a new customer account on form submission', fakeAsync(() => {
    const name = 'Test Customer';
    const newCustomer = {
      id: 4000,
      name,
      locationX: null,
      locationY: null,
      rideId: null,
      driverId: null
    };
  
    spyOn(customerService, 'createCustomer').and.returnValue(of(newCustomer));
  
    // Simulate filling in the form with a name
    const nameInput = fixture.debugElement.query(By.css('input[name="name"]')).nativeElement;
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));
  
    // Simulate submitting the form
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.dispatchEvent(new Event('submit'));
  
    // Wait for the asynchronous operations to complete
    tick();
    fixture.detectChanges();
  
    // Expect that the user service method was called with the correct argument
    expect(customerService.createCustomer).toHaveBeenCalledWith(name );
  
    // Expect that the user was redirected to the newly created customer page
    expect(router.navigateByUrl).toHaveBeenCalledWith('/customer/4000');
  }));


  it('should display a form to create a new customer account on the customer page', () => {
    // navigate to customer page
    router.navigate(['/customer']);
  
    // ensure form is present
    const form = fixture.debugElement.query(By.css('#create-customer-form'));
    expect(form).toBeTruthy();
  
    // ensure input field is present
    const input = fixture.debugElement.query(By.css('#customer-name-input'));
    expect(input).toBeTruthy();
  
    // ensure submit button is present
    const submitButton = fixture.debugElement.query(By.css('#create-customer-button'));
    expect(submitButton).toBeTruthy();
  });


  it('should set the current user on init', () => {
    expect(component.currentUser).toEqual(mockUser);
  });



  describe('locations form', () => {
    it('should be invalid when empty', () => {
      expect(component.locationsForm.valid).toBeFalsy();
    });

    it('should be valid when locationX and locationY are set', () => {
      component.locationsForm.controls['locationX'].setValue(20);
      component.locationsForm.controls['locationY'].setValue(40);

      expect(component.locationsForm.valid).toBeTruthy();
    });

    it('should not allow submission when invalid', () => {
      spyOn(component, 'onSubmitLocations');

      const submitButton = fixture.debugElement.nativeElement.querySelector('#submit-locations');
      submitButton.click();

      expect(component.onSubmitLocations).toHaveBeenCalledTimes(0);
    });

    it('should emit a payload on submission', () => {
      spyOn(component.socket$, 'next');

      component.locationsForm.controls['locationX'].setValue(20);
      component.locationsForm.controls['locationY'].setValue(40);

      const submitButton = fixture.debugElement.nativeElement.querySelector('#submit-locations');
      submitButton.click();

      expect(component.socket$.next).toHaveBeenCalledWith({
        locationX: 20,
        locationY: 40,
        driverId: null,
        customerId: mockUser.id
      });
    });
  });


  
  


  
  

});
