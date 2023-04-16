import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { ICustomer } from '../customer/customer-interface';
import { Title } from '@angular/platform-browser';

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
  matchedRequests: any[] = [];
  selectedRide: any = null;
  locationUrl = 'ws://localhost:8080/location';
  matchedUrl = 'ws://localhost:8080/matched';

  x;
  selectedRequest = {destination: "", locationY: 0, avatar: "", locationX: 0};

  constructor(private http: HttpClient, private titleService: Title) { }

  ngOnInit(): void {
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

    // Connect to websocket endpoint for matched requests
    const matchedWebSocket = new WebSocketSubject(this.matchedUrl);
    matchedWebSocket.subscribe(

      {
        next: (data: ICustomer) => {
          console.log('Matched Websocket opened');
          console.log('New matched request: ', data);
          if (data.driverId === this.currentUser.id) {
            this.handleMatchedRequest(data);
          }
        },

        error: (err) => {
          console.error(err);
        },

        complete: () => {
          console.log('Matched Websocket closed');
        }
      });
  }

  handleMatchedRequest(data: any): void {
    const existingIndex = this.matchedRequests.findIndex((req) => req.id === data.id);
    if (existingIndex > -1) {
      this.matchedRequests[existingIndex] = data;
    } else {
      this.matchedRequests.push(data);
    }
  }

  selectRequest(ride: any): void {
    this.selectedRide = ride;
    this.matchedRequests = []; // clear the matched requests list when a ride is selected
  }

  acceptRide(selectedRequest: any): void {
    if (this.selectedRide) {
      const payload = {
        id: this.selectedRide.id,
        name: this.selectedRide.driverName,
        locationX: this.locationX,
        locationY: this.locationY,
        rideId: this.selectedRide.customerId,
        driverId: this.selectedRide.driverId,
      };
      this.http.post('http://localhost:8080/driver/accept-ride', payload).subscribe(
        (data) => console.log('Ride accepted: ', data),
        (err) => console.error(err)
      );
    }
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
}
