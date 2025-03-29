import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgxFloatingComponent} from "ngx-floating";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxFloatingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'playground';
}
