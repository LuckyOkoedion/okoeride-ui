import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatafetchService } from '../datafetch.service';
import { Title } from '@angular/platform-browser';
import { IDriver } from '../driver/driver-interface';
import { ICustomer } from '../customer-interface';
import { concatMap, switchMap } from 'rxjs';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  driverName = '';
  isLoading = false;
  progress = 0;
  showSuccess = false;
  showFailure = false;
  title = "The Ride";
  registeredDrivers: IDriver[];
  registeredCustomers: ICustomer[];
  currentUser = {
    id: 2, // hard-coded for now, but can be passed in from auth service
    name: 'Admin',
  };

  constructor(private http: HttpClient, 
    private adminService: DatafetchService,
    private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('TheRide - Admin');
    this.adminService.fetchCustomers$();
    this.adminService.fetchDrivers$();
    this.adminService.getCustomers()
    .subscribe({
      next: (valu) => {
        this.registeredCustomers = valu;
      }
    });

    this.adminService.getDrivers()
    .subscribe({
      next: (valu) => {
        this.registeredDrivers = valu;
      }
    });
    
  }

  onSubmit(): void {

    


    this.isLoading = true;
    this.progress = 0;
    this.showSuccess = false;
    this.showFailure = false;

  

    this.adminService.onboardDriver(this.driverName).
    pipe(
      concatMap(async () => this.adminService.fetchDrivers$()),
      switchMap(() => this.adminService.getDrivers())
    )
    .subscribe(

      {
        next: (response) => {
          console.log(response);
          this.isLoading = false;
          this.progress = 100;
          this.showSuccess = true;
          this.showFailure = false;
          this.registeredDrivers = response;

        },
        error: (err: any) => {
          console.log(err);
          this.isLoading = false;
          this.progress = 100;
          this.showSuccess = false;
          this.showFailure = true;

         },
        complete: () => { }
     
      }
    
    );
  }

}
