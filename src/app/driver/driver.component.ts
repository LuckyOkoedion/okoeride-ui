import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { ICustomer } from '../customer-interface';
import { Title } from '@angular/platform-browser';
import { DatafetchService } from '../datafetch.service';
import { RxStompService } from '../rx-stomp.service';
import { IDriver } from './driver-interface';
import { MatSelectChange } from '@angular/material/select';


@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {

  title = "The Ride";
  selectPlaceholder = "Switch User";
  allDrivers: IDriver[];


  currentUser = {
    id: 1, // hard-coded for now, but can be passed in from auth service
    name: 'John Doe',
  };
  locationX = Math.floor(Math.random() * 100); // pre-populated with random two digit numbers
  locationY = Math.floor(Math.random() * 100); // pre-populated with random two digit numbers
  locationPayload = {
    locationX: this.locationX,
    locationY: this.locationY,
    driverId: this.currentUser.id,
    customerId: null,
  };
  matchedRequests: ICustomer[] = [
    {name: "Harry Smith", locationY: 13, locationX: 12, id: 3, driverId: 1, rideId: 3},
    {name: "John Ukpe", locationY: 25, locationX: 19, id: 11, driverId: 8, rideId: 3},
    {name: "Chukwu Naple", locationY: 18, locationX: 22, id: 11, driverId: 1, rideId: 3},
    {name: "Harry Smith", locationY: 23, locationX: 19, id: 67, driverId: 12, rideId: 3},
    {name: "Harry Smith", locationY: 66, locationX: 45, id: 8, driverId: 1, rideId: 3}
  ];
  selectedRide: any = null;

  x;
  selectedRequest : ICustomer = {name: "Harry Smith", locationY: 13, locationX: 12, id: 3};

  constructor(private driverService: DatafetchService, 
    private titleService: Title, private rxStompService: RxStompService
    ) { }

  ngOnInit(): void {

    this.selectedRequest = null;
    this.titleService.setTitle('TheRide - Driver: ' + this.currentUser.name.split(' ')[0]);

    this.driverService.fetchDrivers$();
    this.driverService.getDrivers()
    .subscribe({
      next: (valu) => {
        this.allDrivers = valu;
        const randomIndex = Math.floor(Math.random() * this.allDrivers.length);
        this.currentUser = this.allDrivers[randomIndex];
      }
    });


    
    
    this.driverService.connectToMatchedSocket(this.currentUser.id); 
    this.driverService.getDataMatchedSocketData()
      .subscribe(data => {
        this.matchedRequests = data;
      });
  }

  async acceptRide(selectedRequestInput: ICustomer) {
  
      const payload : ICustomer = {
        id: selectedRequestInput.id,
        name: selectedRequestInput.name,
        locationX: selectedRequestInput.locationX,
        locationY: selectedRequestInput.locationY,
        rideId: selectedRequestInput.rideId,
        driverId: selectedRequestInput.driverId,
      };

      console.log(`Selected ride is: ${JSON.stringify(payload)}`);

      

      await this.driverService.acceptRide(payload).subscribe(
        {
          next: (data) => {
            console.log('Ride accepted: ', data);
            this.selectedRequest = payload;
            this.matchedRequests = [];
          } ,
          error: (err) => console.error(err)
        }
      );
    
  }

  switchUser(valu: MatSelectChange) {

    this.currentUser = valu.value;

    setTimeout(() => {
      valu.source.value = this.selectPlaceholder;
    }, 0);
    
    
  }

  submitLocation(): void {
    this.locationPayload = {
      locationX: this.locationX,
      locationY: this.locationY,
      driverId: this.currentUser.id,
      customerId: null,
    };

    this.rxStompService.publish({ destination: '/app/location', body: JSON.stringify(this.locationPayload) });

  }

  contactCustomer(val: any) {
    console.log("Customer contacted")

  }


}
