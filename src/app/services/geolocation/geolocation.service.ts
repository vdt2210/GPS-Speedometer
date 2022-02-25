import { Injectable, NgZone } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ToastComponent } from 'src/app/common/components/toast/toast.component';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { TopSpeedService } from '../top-speed/top-speed.service';
import { CalculateService } from '../calculate/calculate.service';
import { TimerService } from '../timer/timer.service';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  public speed: number;
  public lat: number;
  public lon: number;
  public rawAccuracy: number;
  public rawAltitude: number;

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private geolocation: Geolocation,
    private ngZone: NgZone,
    private toastComponent: ToastComponent,
    private topSpeedService: TopSpeedService,
    private calculateService: CalculateService,
    private timerService: TimerService
  ) {}

  public startGeolocation() {
    this.geolocation
      .watchPosition({ enableHighAccuracy: true })
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((res) => {
        if ('coords' in res) {
          this.prepareTracking(res);
        } else if ('code' in res) {
          const msg = res.message;
          this.toastComponent.presentToast('TOAST.err', msg, 1000);
        }
      });

    this.timerService.calculateTime();
  }

  private prepareTracking(res: any) {
    this.speed = res.coords.speed;
    this.lat = res.coords.latitude;
    this.lon = res.coords.longitude;
    this.rawAccuracy = res.coords.accuracy;
    this.rawAltitude = res.coords.altitude;
    if (this.speed != null && this.timerService.totalElapsedTime != null) {
      this.getSpeedAndTime();
    }
    this.topSpeedService.saveTopSpeed(this.speed);
  }

  public getSpeedAndTime() {
    this.calculateService.getValue(
      this.speed,
      this.timerService.totalElapsedTime
    );

    clearInterval(this.timerService.timerInterval);
    this.timerService.calculateTime();
  }

  public stop() {
    this.onDestroy$.next();
  }
}
