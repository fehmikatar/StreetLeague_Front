import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';

export interface SportSpace {
  id: number | string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  pricePerHour: number;
  rating: number;
  openingTime: string;
  closingTime: string;
}

type NearbySportSpace = SportSpace & { distance: number };

@Component({
  selector: 'app-nearby-spaces',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nearby-spaces.component.html',
  styleUrls: ['./nearby-spaces.component.css']
})
export class NearbySpacesComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() spaces: SportSpace[] = [];
  @ViewChild('nearbyMap') private mapContainer?: ElementRef<HTMLDivElement>;

  userPosition: { lat: number; lng: number } | null = null;
  sortedSpaces: NearbySportSpace[] = [];
  isLoading = false;
  errorMessage = '';

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private viewInitialized = false;

  constructor(
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.viewInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['spaces'] && this.userPosition) {
      this.sortSpacesByDistance();
      this.cdr.detectChanges();
      this.deferMapRender();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  async findNearbySpaces(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.userPosition = await this.locationService.getCurrentPosition();
      this.sortSpacesByDistance();

      if (this.sortedSpaces.length === 0) {
        this.errorMessage = 'Aucun terrain avec coordonnées GPS disponibles.';
      }

      this.cdr.detectChanges();
      this.deferMapRender();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Impossible de récupérer votre position.';
      this.errorMessage = message;
      this.sortedSpaces = [];
      this.userPosition = null;
      this.cdr.detectChanges();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getDistanceBadgeClass(distance: number): string {
    if (distance < 2) {
      return 'distance-badge distance-near';
    }

    if (distance <= 5) {
      return 'distance-badge distance-medium';
    }

    return 'distance-badge distance-far';
  }

  getRatingStars(rating: number): boolean[] {
    const normalizedRating = Math.max(0, Math.min(5, Math.round(rating)));
    return Array.from({ length: 5 }, (_, index) => index < normalizedRating);
  }

  trackBySpace(_: number, space: NearbySportSpace): number | string {
    return space.id;
  }

  private sortSpacesByDistance(): void {
    if (!this.userPosition) {
      this.sortedSpaces = [];
      return;
    }

    this.sortedSpaces = this.spaces
      .filter((space) => typeof space.latitude === 'number' && typeof space.longitude === 'number')
      .map((space) => ({
        ...space,
        distance: this.locationService.calculateDistance(
          this.userPosition!.lat,
          this.userPosition!.lng,
          space.latitude as number,
          space.longitude as number
        )
      }))
      .sort((left, right) => left.distance - right.distance);
  }

  private deferMapRender(): void {
    if (!this.viewInitialized || !this.userPosition || this.sortedSpaces.length === 0) {
      return;
    }

    setTimeout(() => this.renderMap(), 0);
  }

  private renderMap(): void {
    if (!this.mapContainer || !this.userPosition) {
      return;
    }

    if (!this.map) {
      this.map = L.map(this.mapContainer.nativeElement, {
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
    }

    if (!this.markersLayer) {
      this.markersLayer = L.layerGroup().addTo(this.map);
    }

    this.markersLayer.clearLayers();

    const userMarker = L.marker([this.userPosition.lat, this.userPosition.lng], {
      icon: this.buildMarkerIcon('#2563eb', '📍')
    }).bindPopup('Vous êtes ici');

    this.markersLayer.addLayer(userMarker);

    const bounds = L.latLngBounds([[this.userPosition.lat, this.userPosition.lng]]);

    for (const space of this.sortedSpaces) {
      const marker = L.marker([space.latitude as number, space.longitude as number], {
        icon: this.buildMarkerIcon('#16a34a', '🏟️')
      }).bindPopup(`<strong>${space.name}</strong><br>${space.distance} km`);

      this.markersLayer.addLayer(marker);
      bounds.extend([space.latitude as number, space.longitude as number]);
    }

    this.map.fitBounds(bounds, { padding: [40, 40] });
    if (this.map.getZoom() > 13) {
      this.map.setZoom(13);
    }
  }

  private buildMarkerIcon(backgroundColor: string, emoji: string): L.DivIcon {
    return L.divIcon({
      className: 'nearby-marker-wrapper',
      html: `<div style="width: 34px; height: 34px; border-radius: 999px; background: ${backgroundColor}; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(15,23,42,0.22); font-size: 16px; border: 2px solid white;">${emoji}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -16]
    });
  }
}
