import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // 1. Import this

@Component({
  selector: 'app-solutions',
  standalone: true, 
  imports: [RouterLink], 
  templateUrl: './solutions.component.html',
  styleUrl: './solutions.component.css'
})
export class SolutionsComponent {
}