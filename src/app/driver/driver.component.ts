import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { ICustomer } from '../customer-interface';
import { Title } from '@angular/platform-browser';
import { DatafetchService } from '../datafetch.service';
import { RxStompService } from '../rx-stomp.service';
import { IDriver } from './driver-interface';
import { MatSelectChange } from '@angular/material/select';
import { Subscription, interval, switchMap, tap } from 'rxjs';
import { IMessage } from '@stomp/rx-stomp';


@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit, OnDestroy {

  title = "The Ride";
  selectPlaceholder = "Switch User";
  allDrivers: IDriver[];

  private subscription: Subscription;

  private matchedSubscription: Subscription;


  currentUser;
  locationX = Math.floor(Math.random() * 100); // pre-populated with random two digit numbers
  locationY = Math.floor(Math.random() * 100); // pre-populated with random two digit numbers

  matchedRequests: ICustomer[] = [];
  selectedRide;

  x;
  selectedRequest;

  constructor(private driverService: DatafetchService, 
    private titleService: Title, private rxStompService: RxStompService
    ) { 

      this.subscription = interval(1000).subscribe(() => {
        this.locationX = Math.floor(Math.random() * 90) + 10;
        this.locationY = Math.floor(Math.random() * 90) + 10;
        this.submitLocation();
      });


    }
  

  ngOnInit(): void {





    this.driverService.fetchDrivers$();
    this.driverService.getDrivers()
    .subscribe({
      next: (valu) => {
        this.allDrivers = valu;
        const randomIndex = Math.floor(Math.random() * this.allDrivers.length);
        const theVal = this.allDrivers[randomIndex];
        this.currentUser = theVal;
        console.log(`CurrentUser is: ${ JSON.stringify(theVal)}`);
        this.titleService.setTitle('TheRide - Driver: ' + this.currentUser?.name.split(' ')[0]);

        this.matchedRequests = [];
        this.matchedRequests.length = 0;
        this.driverService.connectToMatchedSocket(theVal?.id); 
     this.matchedSubscription =   this.driverService.getDataMatchedSocketData()
          .subscribe(data => {
            console.log("Value from matched is: " + JSON.stringify(data));
            this.matchedRequests = [];
            this.matchedRequests.length = 0;
            this.matchedRequests = [...data];
          });
      }
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
    this.titleService.setTitle('TheRide - Driver: ' + this.currentUser.name.split(' ')[0]);

    this.matchedSubscription.unsubscribe();

    this.matchedRequests = [];
    this.matchedRequests.length = 0;
    this.driverService.connectToMatchedSocket(this.currentUser.id); 
   this.matchedSubscription = this.driverService.getDataMatchedSocketData()
      .subscribe(data => {
        console.log("Value from matched is: " + JSON.stringify(data));
        this.matchedRequests = [];
        this.matchedRequests.length = 0;
        this.matchedRequests = [...data];
      });

    setTimeout(() => {
      valu.source.value = this.selectPlaceholder;
    }, 0);
    
    
  }

  submitLocation(): void {
    const locationPayload = {
      locationX: this.locationX,
      locationY: this.locationY,
      driverId: this.currentUser.id,
      customerId: null,
    };

    this.rxStompService.publish({ destination: '/app/location', body: JSON.stringify(locationPayload) });

  }

  contactCustomer(val: any) {
    console.log("Customer contacted")

  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


}
