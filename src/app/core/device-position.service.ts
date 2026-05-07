import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DevicePosition } from '../models/device-position';

@Injectable({ providedIn: 'root' })
export class DevicePositionService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.devicesEndpoint}`;

  getPositions(): Observable<DevicePosition[]> {
    return this.http.get<unknown>(this.endpoint).pipe(
      map((response) => this.normalizeResponse(response)),
      map((positions) =>
        positions.filter(
          (position) =>
            Number.isFinite(position.latitude) &&
            Number.isFinite(position.longitude) &&
            position.latitude >= -90 &&
            position.latitude <= 90 &&
            position.longitude >= -180 &&
            position.longitude <= 180
        )
      )
    );
  }

  private normalizeResponse(response: unknown): DevicePosition[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.toDevicePosition(item));
    }

    if (this.isObject(response) && Array.isArray(response.items)) {
      return response.items.map((item) => this.toDevicePosition(item));
    }

    return [];
  }

  private toDevicePosition(item: unknown): DevicePosition {
    const candidate = this.isObject(item) ? item : {};

    const latitude = this.pickNumber(candidate, ['latitude', 'lat', 'positionLat']);
    const longitude = this.pickNumber(candidate, ['longitude', 'lng', 'lon', 'positionLng']);

    return {
      id: this.pickString(candidate, ['trackerId', 'id', 'deviceId', 'serial']) ?? crypto.randomUUID(),
      name:
        this.pickString(candidate, ['trackerId', 'name', 'deviceName', 'label']) ?? 'Unknown device',
      latitude,
      longitude,
      status: this.pickString(candidate, ['status', 'lastAlertType']),
      lastSeen:
        this.pickString(candidate, ['lastSeen', 'timestamp', 'lastAlertAt']) ??
        this.pickValueAsString(candidate, ['positionEpoch'])
    };
  }

  private pickNumber(source: Record<string, unknown>, fields: string[]): number {
    for (const field of fields) {
      const raw = source[field];
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
      }
      if (typeof raw === 'string') {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
    return 0;
  }

  private pickString(source: Record<string, unknown>, fields: string[]): string | undefined {
    for (const field of fields) {
      const raw = source[field];
      if (typeof raw === 'string' && raw.trim().length > 0) {
        return raw;
      }
    }
    return undefined;
  }

  private pickValueAsString(source: Record<string, unknown>, fields: string[]): string | undefined {
    for (const field of fields) {
      const raw = source[field];
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        return String(raw);
      }
    }
    return undefined;
  }

  private isObject(value: unknown): value is Record<string, unknown> & { items?: unknown[] } {
    return typeof value === 'object' && value !== null;
  }
}




