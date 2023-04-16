import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) { }


  onSelect(event: any) {
    const userType = event.target.value;
    if (userType === 'admin') {
      this.router.navigate(['/admin']);
    } else if (userType === 'customer') {
      this.router.navigate(['/customer']);
    } else if (userType === 'driver') {
      this.router.navigate(['/driver']);
    }
  }


}
