import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ICustomer } from './customer-interface';
import { IDriver } from './driver/driver-interface';
import { RxStompService } from './rx-stomp.service';
import { IMessage } from '@stomp/rx-stomp';


@Injectable({
  providedIn: 'root'
})
export class DatafetchService {
  

  private matchedData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private drivers$: BehaviorSubject<IDriver[]> = new BehaviorSubject<IDriver[]>([]);
  private customers$: BehaviorSubject<ICustomer[]> = new BehaviorSubject<ICustomer[]>([]);
  private driverId: number;
  
  private currentUser: any;
  private apiUrl = 'http://localhost:8080';

  customers: ICustomer[];



  drivers: IDriver[];

  constructor(private http: HttpClient, private rxStompService: RxStompService) { 

 
  }

  connectToMatchedSocket(driverId: number) {

    this.driverId = driverId;
 
    this.rxStompService.watch
      ({ destination: "/topic/matched" })
      .subscribe((message: IMessage) => {
      console.log(`Data from ws: ${message.body}`);

      const payload: ICustomer = JSON.parse(message.body);

      if (payload.driverId === this.driverId) {
        const newData = [...this.matchedData$.getValue(), message];
        this.matchedData$.next(newData);
      }
        
      });




  }

  getDataMatchedSocketData(): Observable<any[]> {
    return this.matchedData$.asObservable();
  }

  acceptRide(payload: ICustomer) {
   return this.http.post(`${this.apiUrl}/driver/accept-ride`, payload);
  }


  async getCustomer(userId: number) {

   await this.http.get<ICustomer[]>(`${this.apiUrl}/customer`).subscribe({
    next: (val) => {
      this.customers = val;
    },
    error: (err) => {
      console.error(err);
    },

    complete: () => {
      console.log("customer data fetch is complete");
      this.currentUser = this.customers.find(val => val.id == userId);
      this.currentUser["type"] = "customer";
    }
    
   })

    return await this.currentUser;
    
  }



  async getDriver(userId: number) {

    await this.http.get<IDriver[]>(`${this.apiUrl}/driver`).subscribe({
     next: (val) => {
       this.drivers = val;
     },
     error: (err) => {
       console.error(err);
     },
 
     complete: () => {
       console.log("driver data fetch is complete");
       this.currentUser = this.drivers.find(val => val.id == userId);
       this.currentUser["type"] = "driver";
     }
     
    })
 
     return await this.currentUser;
     
   }



  async requestRide(id: any, destination: any, payload: { x: any; y: any; driverId: null; customerId: any; }) {
    const all = {
      id,
      destination,
      payload
    }
    console.log(JSON.stringify(all));
    await this.http.post(`${this.apiUrl}/customer/request/${payload.customerId}/${destination}`, payload).subscribe({
      next: (val) => {
        console.log(val);
      },

      error: (err) => {
        console.log(err);
      },

      complete: () => {
        console.log("Ride request complete");
      }
    })
  }

  getUsers(type: string): Observable<any[]> {
    // For now, return a static list of users
    const customers = [
      {
        id: 1000,
        name: 'customer 1',
        locationX: null,
        locationY: null,
        rideId: null,
        driverId: null
      },
      {
        id: 2000,
        name: 'customer 2',
        locationX: null,
        locationY: null,
        rideId: null,
        driverId: null
      },
      {
        id: 3000,
        name: 'customer 3',
        locationX: null,
        locationY: null,
        rideId: null,
        driverId: null
      }
    ];

    const drivers = [
      {
        id: 1000,
        name: 'driver 1',
        locationX: null,
        locationY: null,
        rideId: null,
        customerId: null
      },
      {
        id: 2000,
        name: 'driver 2',
        locationX: null,
        locationY: null,
        rideId: null,
        customerId: null
      },
      {
        id: 3000,
        name: 'driver 3',
        locationX: null,
        locationY: null,
        rideId: null,
        customerId: null
      }
    ];

    // Get the users based on the current user type
    if (this.currentUser && this.currentUser.type === 'customer') {
      return of(customers);
    } else if (this.currentUser && this.currentUser.type === 'driver') {
      return of(drivers);
    } else {
      return of([]);
    }
  }

  createCustomer(name: string): Observable<any> {
    const data = { name: name };
    return this.http.post(`${this.apiUrl}/customer`, data);
  }

  setCurrentUser(user: any): void {
    this.currentUser = user;
  }

  getCurrentUser(): Observable<any> {
    return of(this.currentUser);
  }

  onboardDriver(theName: string) {

    console.log(theName);

    const url = 'http://localhost:8080/admin/onboard-driver';
    const data = { name: theName };

    return this.http.post(url, data);
  }



  fetchDrivers$() {
    this.http.get<IDriver[]>("http://localhost:8080/driver")
    .subscribe({
      next: (valu) => {
        console.log("Data from get all drivers: " + JSON.stringify(valu));
        const newData = [...valu];
        this.drivers$.next(newData);
      }
    });

  }

  fetchCustomers$() {
    this.http.get<ICustomer[]>("http://localhost:8080/customer")
    .subscribe({
      next: (valu) => {
        console.log("Data from get all customers: " + JSON.stringify(valu));
        const newData = [...valu];
        this.customers$.next(newData);
      }
    })

  }


  getDrivers() {
    return this.drivers$.asObservable();

  }

  getCustomers() {
    return this.customers$.asObservable();
  }
  
}
