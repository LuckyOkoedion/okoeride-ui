import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DatafetchService } from '../datafetch.service';
import { Title } from '@angular/platform-browser';
import { ILocation } from '../location-interface';
import { RxStompService } from '../rx-stomp.service';
import { IMessage } from '@stomp/rx-stomp';
import { ICustomer } from '../customer-interface';
import { IRide } from '../ride-interface';
import { concatMap, switchMap } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';



@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  title = "The Ride"
  currentUser: ICustomer;

  selectPlaceholder = "Switch User";

  allCustomers: ICustomer[];
  newUserName;
  
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
    private titleService: Title,
    private rxStompService: RxStompService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {


   
    const userId = +this.route.snapshot.paramMap.get('id');
   // this.currentUser = await this.dataFetchService.getCustomer(userId);

   this.dataFetchService.fetchCustomers$();
   this.dataFetchService.getCustomers()
   .subscribe({
     next: (valu) => {
       this.allCustomers = valu;
       const randomIndex = Math.floor(Math.random() * this.allCustomers.length);
       this.currentUser = this.allCustomers[randomIndex];
       this.titleService.setTitle('TheRide - Customer: ' + this.currentUser?.name.split(' ')[0]);
     }
   });



      this.rxStompService.watch('/topic/accepted').subscribe((data: IMessage) => {
        console.log(`Data from ws: ${data.body}`);

        const payload: IRide = JSON.parse(data.body);
  
        if (payload.customerId === this.currentUser.id && payload.driverAccepted) {
          this.acceptedRide = data;
          this.showDriverCard = true;
        }
          
        });

  }

  switchUser(valu: MatSelectChange) {

    this.currentUser = valu.value;
    this.titleService.setTitle('TheRide - Driver: ' + this.currentUser.name.split(' ')[0]);
    this.cdr.detectChanges();

    setTimeout(() => {
      valu.source.value = this.selectPlaceholder;
    }, 0);
    
    
  }

  createUser() {
    this.dataFetchService.createCustomer(this.newUserName)
    .pipe(
      concatMap(async () => this.dataFetchService.fetchCustomers$()),
      switchMap(() => this.dataFetchService.getCustomers())
    ).subscribe(
      {
        next: (value) => {

          this.allCustomers = value;
          this.newUserName = "Create User";

        }
      }
    )
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

    this.rxStompService.publish({ destination: '/app/location', body: JSON.stringify(payload) });


  }

}
