import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterComponent } from './components/ui/sonner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToasterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('streetLeaguefront-angular');
}
