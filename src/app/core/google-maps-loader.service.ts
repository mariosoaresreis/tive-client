import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private readonly scriptId = 'google-maps-script';

  load(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.includes('REPLACE_WITH') || apiKey.includes('__GOOGLE_MAPS_API_KEY__')) {
      return Promise.reject(new Error('Google Maps API key is missing.'));
    }

    if ((window as unknown as { google?: unknown }).google) {
      return Promise.resolve();
    }

    const existingScript = document.getElementById(this.scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      return this.waitUntilLoaded(existingScript);
    }

    const script = document.createElement('script');
    script.id = this.scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return this.waitUntilLoaded(script);
  }

  private waitUntilLoaded(script: HTMLScriptElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Unable to load Google Maps script.')), {
        once: true
      });
    });
  }
}

