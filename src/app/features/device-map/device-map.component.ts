import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { DevicePositionService } from '../../core/device-position.service';
import { GoogleMapsLoaderService } from '../../core/google-maps-loader.service';
import { DevicePosition } from '../../models/device-position';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-device-map',
  imports: [GoogleMap, MapMarker, DatePipe, NgIf, NgFor],
  templateUrl: './device-map.component.html',
  styleUrl: './device-map.component.scss'
})
export class DeviceMapComponent implements OnInit, OnDestroy {
  private readonly devicePositionService = inject(DevicePositionService);
  private readonly mapsLoader = inject(GoogleMapsLoaderService);
  private readonly destroy$ = new Subject<void>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly markers = signal<DevicePosition[]>([]);
  protected readonly isMapsReady = signal(false);
  protected readonly lastRefresh = signal<Date | null>(null);

  protected readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true
  };

  protected readonly center = signal<google.maps.LatLngLiteral>({ lat: 39.5, lng: -98.35 });
  protected readonly zoom = signal(3);

  async ngOnInit(): Promise<void> {
    try {
      await this.mapsLoader.load(environment.googleMapsApiKey);
      this.isMapsReady.set(true);
      this.startPolling();
    } catch (error) {
      this.loading.set(false);
      this.error.set((error as Error).message);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected trackById = (_: number, marker: DevicePosition): string => marker.id;

  private startPolling(): void {
    timer(0, environment.refreshIntervalMs)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(() => this.devicePositionService.getPositions()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (markers) => {
          this.markers.set(markers);
          this.lastRefresh.set(new Date());
          this.loading.set(false);
          this.error.set(null);
          this.recenterMap(markers);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Unable to load device positions from tive-query API.');
        }
      });
  }

  private recenterMap(markers: DevicePosition[]): void {
    if (markers.length === 0) {
      return;
    }

    const first = markers[0];
    this.center.set({ lat: first.latitude, lng: first.longitude });
    this.zoom.set(8);
  }
}


