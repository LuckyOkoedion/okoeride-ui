import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;
  let dropdownMenu: DebugElement;
  let dropdownItems: DebugElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ HomeComponent ]
    })
    .compileComponents();

  });


  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    dropdownMenu = fixture.debugElement.query(By.css('.dropdown-menu'));
    dropdownItems = dropdownMenu.queryAll(By.css('.dropdown-item'));
    fixture.detectChanges();

  })



  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should display welcome section on home page', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const welcomeEl = fixture.debugElement.query(By.css('.welcome-section'));
    expect(welcomeEl).toBeTruthy();
    const titleEl = welcomeEl.query(By.css('h1'));
    expect(titleEl.nativeElement.textContent).toContain('Welcome To The Ride');
    const subtitleEl = welcomeEl.query(By.css('h3'));
    expect(subtitleEl.nativeElement.textContent).toContain('login as');
  });


  it('should display list of customers and form on customer page', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const dropdownEl = fixture.debugElement.query(By.css('.dropdown'));
    dropdownEl.triggerEventHandler('click', null);
    fixture.detectChanges();
    const customerOptionEl = dropdownEl.query(By.css('.dropdown-item[data-option="customer"]'));
    customerOptionEl.triggerEventHandler('click', null);
    fixture.detectChanges();
    const customerEl = fixture.debugElement.query(By.css('app-customer'));
    expect(customerEl).toBeTruthy();
    const customersListEl = customerEl.query(By.css('.customers-list'));
    expect(customersListEl).toBeTruthy();
    const formEl = customerEl.query(By.css('form'));
    expect(formEl).toBeTruthy();
  });


  it('should route to selected customer page', () => {
    const dropdownEl = fixture.debugElement.query(By.css('.dropdown'));
    dropdownEl.triggerEventHandler('click', null);
    fixture.detectChanges();
    const customerOptionEl = dropdownEl.query(By.css('.dropdown-item[data-option="customer"]'));
    customerOptionEl.triggerEventHandler('click', null);
    fixture.detectChanges();
    const customerEl = fixture.debugElement.query(By.css('app-customer'));
    const customerCardEl = customerEl.queryAll(By.css('.customer-card'))[0];
    customerCardEl.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(location.pathname).toBe('/customer/1000');
  });


  it('should navigate to the admin page when "Admin" is selected from the dropdown', () => {
    const location = TestBed.inject(Location);
    fixture.detectChanges();
  
    // Select the "Admin" option from the dropdown
    const selectEl = fixture.debugElement.query(By.css('#user-select'));
    selectEl.nativeElement.value = 'Admin';
    selectEl.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  
    // Click the "Proceed" button
    const buttonEl = fixture.debugElement.query(By.css('#proceed-button'));
    buttonEl.nativeElement.click();
    fixture.detectChanges();
  
    fixture.whenStable().then(() => {
      // Expect the URL to be changed to the admin page
      expect(location.pathname).toBe('/admin');
    });
  });


  it('should display the dropdown menu when the "login as" button is clicked', () => {
    expect(dropdownMenu).toBeFalsy();
    const button = fixture.debugElement.query(By.css('.dropdown-toggle'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(dropdownMenu).toBeTruthy();
  });


  it('should have dropdown items for "Admin", "Customer", and "Driver"', () => {
    expect(dropdownItems.length).toBe(3);
    expect(dropdownItems[0].nativeElement.textContent.trim()).toBe('Admin');
    expect(dropdownItems[1].nativeElement.textContent.trim()).toBe('Customer');
    expect(dropdownItems[2].nativeElement.textContent.trim()).toBe('Driver');
  });


  it('should navigate to the corresponding route when a dropdown item is clicked', () => {
    spyOn(router, 'navigate');
    dropdownItems[1].triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalledWith(['/customer']);
    dropdownItems[2].triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalledWith(['/driver']);
  });
  
  
  



});
