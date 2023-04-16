import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DatafetchService } from '../datafetch.service';
import { Title } from '@angular/platform-browser';


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
  locationsForm!: FormGroup;
  rideRequestForm!: FormGroup;
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

  private socket$!: WebSocketSubject<any>;

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

    this.locationsForm = this.formBuilder.group({
      locationX: [Math.floor(Math.random() * 90) + 10, Validators.required],
      locationY: [Math.floor(Math.random() * 90) + 10, Validators.required]
    });

    this.rideRequestForm = this.formBuilder.group({
      destination: ['', Validators.required],
      x: [this.locationsForm.get('locationX').value, Validators.required],
      y: [this.locationsForm.get('locationY').value, Validators.required]
    });

    this.socket$ = new WebSocketSubject<any>('ws://localhost:8080/accepted');
    this.socket$.subscribe(

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

  onSubmitLocations() {
    if (this.locationsForm.invalid) {
      return;
    }

    const payload = {
      locationX: this.locationsForm.get('locationX').value,
      locationY: this.locationsForm.get('locationY').value,
      driverId: null,
      customerId: this.currentUser.id
    };
    this.socket$.next(payload);
  }

  async onRequestRide() {
    this.rideRequestSubmitted = true;

    if (this.rideRequestForm.invalid) {
      return;
    }

    const payload = {
      x: this.rideRequestForm.get('x').value,
      y: this.rideRequestForm.get('y').value,
      driverId: null,
      customerId: this.currentUser.id
    };

   await this.dataFetchService.requestRide(this.currentUser.id, this.destination, payload);
  }

  onProvideLocation() {
    this.x = this.locationX;
    this.y = this.locationY;

  }

}
