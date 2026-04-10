import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  
  getWeather(city: string): Observable<WeatherData> {
    const mockData: WeatherData = {
      name: '',
      main: {
        temp: 22,
        feels_like: 24,
        humidity: 55
      },
      weather: [
        {
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }
      ],
      wind: {
        speed: 4.5
      }
    };

  
    return of(mockData);
  }
}