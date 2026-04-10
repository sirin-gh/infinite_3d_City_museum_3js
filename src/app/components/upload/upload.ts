import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityService } from '../../services/city';
import { WeatherService, WeatherData } from '../../services/weather';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.html',
  styles: [`
    :host {
      display: block;
      margin: 0;
      padding: 0;
    }
    button {
      cursor: pointer !important;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.4) !important;
    }
    
    button:active {
      transform: translateY(0px);
    }
    
    .color-btn:hover {
      opacity: 0.9;
      transform: translateY(-3px) scale(1.05);
    }
  `]
})
export class UploadComponent implements OnInit {
  private cityService = inject(CityService);
  private weatherService = inject(WeatherService);

  birds$: Observable<any[]> = this.cityService.getItems();
  flowers$: Observable<any[]> = this.cityService.getFlowers();
  benches$: Observable<any[]> = this.cityService.getBenches();

  // Weather properties
  weather: WeatherData | null = null;
  loadingWeather = false;
  weatherError = '';

  ngOnInit() {
    this.loadWeather();
    console.log('Upload component initialized');
    console.log('Flowers observable:', this.flowers$);
  }

  loadWeather() {
    this.loadingWeather = true;
    this.weatherError = '';
    this.weatherService.getWeather('Tunis').subscribe({
      next: (data) => {
        this.weather = data;
        this.loadingWeather = false;
        console.log('Weather data:', data);
      },
      error: (err) => {
        this.loadingWeather = false;
        console.error('Weather API Error:', err);
        if (err.status === 401) {
          this.weatherError = 'Invalid API key. Please check your weather.ts file.';
        } else if (err.status === 404) {
          this.weatherError = 'City not found.';
        } else {
          this.weatherError = 'Failed to load weather. Check console for details.';
        }
      }
    });
  }

  refreshWeather() {
    this.loadWeather();
  }

  // Bird methods
  add() {
    console.log('Adding bird...');
    this.cityService.addBird();
  }

  remove() {
    console.log('Removing bird...');
    this.cityService.deleteBird();
  }

  updateBirdColor(color: string) {
    console.log('Updating bird color to:', color);
    this.cityService.setBirdColor(color).then(() => {
      console.log('✓ Bird color successfully updated to:', color);
    }).catch((error) => {
      console.error('✗ Error updating bird color:', error);
    });
  }

  // Flower methods
  addFlower() {
    console.log('Adding flower...');
    this.cityService.addFlower();
  }

  removeFlower() {
    console.log('Removing flower...');
    this.cityService.deleteFlower();
  }

  updateFlowerColor(color: string) {
    console.log('Updating flower color to:', color);
    this.cityService.setFlowerColor(color).then(() => {
      console.log('✓ Flower color successfully updated to:', color);
    }).catch((error) => {
      console.error('✗ Error updating flower color:', error);
    });
  }

  // Bench methods
  addBench() {
    console.log('Adding bench...');
    this.cityService.addBench();
  }

  removeBench() {
    console.log('Removing bench...');
    this.cityService.deleteBench();
  }

  updateBenchColor(color: string) {
    console.log('Updating bench color to:', color);
    this.cityService.setBenchColor(color).then(() => {
      console.log('✓ Bench color successfully updated to:', color);
    }).catch((error) => {
      console.error('✗ Error updating bench color:', error);
    });
  }
}