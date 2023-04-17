import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { ICustomer } from '../customer-interface';
import { Title } from '@angular/platform-browser';
import { DatafetchService } from '../datafetch.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {

  title = "The Ride"

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
    {name: "Harry Smith", locationY: 13, locationX: 12, id: 3, driverId: 1},
    {name: "John Ukpe", locationY: 25, locationX: 19, id: 11, driverId: 8},
    {name: "Chukwu Naple", locationY: 18, locationX: 22, id: 11, driverId: 1},
    {name: "Harry Smith", locationY: 23, locationX: 19, id: 67, driverId: 12},
    {name: "Harry Smith", locationY: 66, locationX: 45, id: 8, driverId: 1}
  ];
  selectedRide: any = null;
  locationUrl = 'ws://localhost:8080/location';
  matchedUrl = 'ws://localhost:8080/matched';

  x;
  selectedRequest : ICustomer = {name: "Harry Smith", locationY: 13, locationX: 12, id: 3};

  constructor(private driverService: DatafetchService, private titleService: Title) { }

  ngOnInit(): void {
    this.selectedRequest = null;
    this.titleService.setTitle('TheRide - Driver: ' + this.currentUser.name.split(' ')[0]);
    // Connect to websocket endpoint for providing location
    const webSocket = new WebSocketSubject(this.locationUrl);
    webSocket.subscribe(

      {
        next: (data) => console.log('Location updated: ', data),
        error: (err) => console.error(err),
        complete: () => console.log('Websocket closed')
      }  
      
    );
    
    this.driverService.connectToMatchedSocket(this.currentUser.id); // replace 123 with the driverId you want to filter
    this.driverService.getDataMatchedSocketData()
      .subscribe(data => {
        this.matchedRequests = data;
      });
  }

  async acceptRide(selectedRequest: ICustomer) {
  
      const payload : ICustomer = {
        id: this.selectedRequest.id,
        name: this.selectedRequest.name,
        locationX: this.selectedRequest.locationX,
        locationY: this.selectedRequest.locationY,
        rideId: this.selectedRequest.rideId,
        driverId: this.selectedRequest.driverId,
      };

      

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

  submitLocation(): void {
    this.locationPayload = {
      locationX: this.locationX,
      locationY: this.locationY,
      driverId: this.currentUser.id,
      customerId: null,
    };
    const webSocket = new WebSocket(this.locationUrl);
    webSocket.onopen = (event) => {
      webSocket.send(JSON.stringify(this.locationPayload));
      webSocket.close();
    };
  }

  contactCustomer(val: any) {
    console.log("Customer contacted")

  }


}
