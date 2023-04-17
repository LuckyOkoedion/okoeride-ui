import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DatafetchService } from '../datafetch.service';
import { Title } from '@angular/platform-browser';
import { ILocation } from '../location-interface';


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  title = "The Ride"
  currentUser = {
    id: 2, // hard-coded for now, but can be passed in from auth service
    name: 'Franca Okpe',
  };
  
  rideRequestSubmitted = false;
  driverXLocation: number;
  driverYLocation;
  driverName: string;
  acceptedRide: any;
  destination: string;
  showDriverCard: boolean = false;
  locationY: number = Math.floor(Math.random() * 100);
  locationX: number = Math.floor(Math.random() * 100);;
  x;
  y;
  selectedRequest = {destination: "", locationY: 0};
  driverAvatar = "";

  private acceptedSocket$!: WebSocketSubject<any>;
  private locationSocket$!: WebSocketSubject<any>;

  constructor(
    private dataFetchService: DatafetchService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private titleService: Title
  ) {}

  async ngOnInit() {
    this.titleService.setTitle('TheRide - Customer: ' + this.currentUser.name.split(' ')[0]);
    const userId = +this.route.snapshot.paramMap.get('id');
   // this.currentUser = await this.dataFetchService.getCustomer(userId);


    this.locationSocket$ = new WebSocketSubject<any>('ws://localhost:8080/location');

    this.acceptedSocket$ = new WebSocketSubject<any>('ws://localhost:8080/accepted');
    this.acceptedSocket$.subscribe(

      {
        next: (data) => {
          if (data.customerId === this.currentUser.id && data.driverAccepted) {
            this.acceptedRide = data;
            this.showDriverCard = true;
          }
        },
        error: (error) => console.error(error),
        complete: () => console.warn('Websocket Accept endpoint flow Completed!')
      }
      
    );
  }

 
  async onRequestRide() {
    this.rideRequestSubmitted = true;

    const payload = {
      x: this.x,
      y: this.y,
      driverId: null,
      customerId: this.currentUser.id
    };

   await this.dataFetchService.requestRide(this.currentUser.id, this.destination, payload);
  }

  onProvideLocation() {
    this.x = this.locationX;
    this.y = this.locationY;

    const payload : ILocation = {
      locationX: this.locationX,
      locationY: this.locationY,
      driverId: null,
      customerId: this.currentUser.id
    };

    console.log(JSON.stringify(payload));

    
    this.locationSocket$.next(payload);


  }

}
