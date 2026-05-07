import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DevicePositionService } from './device-position.service';
import { environment } from '../../environments/environment';

describe('DevicePositionService', () => {
  let service: DevicePositionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DevicePositionService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(DevicePositionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps supported payload formats into DevicePosition[]', () => {
    service.getPositions().subscribe((positions) => {
      expect(positions.length).toBe(1);
      expect(positions[0].name).toBe('abc');
      expect(positions[0].latitude).toBe(42.3);
      expect(positions[0].longitude).toBe(-71.1);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}${environment.devicesEndpoint}`);
    req.flush([
      {
        trackerId: 'abc',
        latitude: 42.3,
        longitude: -71.1,
        lastAlertType: 'TEMP_HIGH'
      }
    ]);
  });
});




