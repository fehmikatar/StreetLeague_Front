import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Vous avez refusé l\'accès à la géolocalisation.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Position GPS indisponible pour le moment.'));
              break;
            case error.TIMEOUT:
              reject(new Error('La demande de géolocalisation a expiré.'));
              break;
            default:
              reject(new Error('Impossible de récupérer votre position actuelle.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const earthRadiusKm = 6371;
    const toRadians = (value: number) => value * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
  }
}
