import { ChangeDetectionStrategy, Component, inject, DestroyRef, signal } from '@angular/core';
import { TestimonioService } from '@app/features/testimony/services';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { latLng, tileLayer, MapOptions, Map, marker, icon, MarkerClusterGroup } from 'leaflet';
import 'leaflet.markercluster';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpinnerComponent } from '@app/features/shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [LeafletModule, SpinnerComponent],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class MapsComponent {
  private testimonyService = inject(TestimonioService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal<string | null>(null);

  options: MapOptions = {
    center: latLng(-17.0, -65.0),
    zoom: 5,
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    ]
  };

  myIcon = icon({
    iconUrl: 'assets/images/marker.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  onMapReady(map: Map) {
    this.testimonyService.getTestimonyMap()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (testimonios) => {
          this.loading.set(false);

          if (testimonios.length === 0) {
            this.error.set('No hay testimonios con ubicación disponible');
            return;
          }

          const markers = testimonios.map(t => {
            const coords = t.coordinates;
            const m = marker([coords[0], coords[1]], { icon: this.myIcon, title: t.title, riseOnHover: true });
            m.bindPopup(t.title);
            return m;
          });

          const clusterGroup = new MarkerClusterGroup();
          clusterGroup.addLayers(markers);
          map.addLayer(clusterGroup);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('Error al cargar los datos del mapa');
          console.error('Error loading map data:', err);
        },
      });
  }
}
