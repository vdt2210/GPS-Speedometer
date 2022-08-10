import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Insomnia } from '@awesome-cordova-plugins/insomnia/ngx';
import { Platform } from '@ionic/angular';
import { UnitService } from '../../services/unit/unit.service';
import { ToastComponent } from 'src/app/common/components/toast/toast.component';
import { CalculateService } from 'src/app/services/calculate/calculate.service';
import { TimerService } from 'src/app/services/timer/timer.service';
import { GeolocationService } from 'src/app/services/geolocation/geolocation.service';
import SwiperCore, { Autoplay, Pagination } from 'swiper';
import AppConstant from 'src/app/utilities/app-constant';
import { Subject, takeUntil } from 'rxjs';

SwiperCore.use([Autoplay, Pagination]);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomePage implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();
  public lat: number;
  public lon: number;
  public speedo: number;
  public topSpeed: number;
  public speedUnit: string;
  public lenghtUnit: string;
  public distanceUnit: string;
  public accuracy: number;
  public altitude: string;
  public avgSpeed: string;
  public distance: any;
  public totalTime: string;
  public isSwitchTrip = true;

  public timerIcon = 'time';
  public settingsIcon = 'settings';

  constructor(
    private insomnia: Insomnia,
    private platform: Platform,
    private unitService: UnitService,
    private toastComponent: ToastComponent,
    private calculateService: CalculateService,
    private timerService: TimerService,
    private geolocationService: GeolocationService
  ) {}

  public ngOnInit() {
    this.convertUnit();
    this.platform.ready().then(() => {
      this.insomnia.keepAwake();
      this.initial();
    });
  }

  public changeUnit() {
    switch (this.unitService.unit) {
      case AppConstant.UNIT_SYSTEM.IMPERIAL.UNIT:
        this.unitService
          .saveUnit(AppConstant.UNIT_SYSTEM.METRIC.UNIT)
          .then(() => {
            this.toastComponent.presentToast(
              'toast.unit_change.' + AppConstant.UNIT_SYSTEM.METRIC.UNIT,
              null,
              500,
              null
            );
          });
        break;

      case AppConstant.UNIT_SYSTEM.METRIC.UNIT:
        this.unitService
          .saveUnit(AppConstant.UNIT_SYSTEM.IMPERIAL.UNIT)
          .then(() => {
            this.toastComponent.presentToast(
              'toast.unit_change.' + AppConstant.UNIT_SYSTEM.IMPERIAL.UNIT,
              null,
              500,
              null
            );
          });
        break;
    }
  }

  // public stopTracking() {
  //   this.geolocationService.stop();
  //   this.insomnia.allowSleepAgain();
  // }

  public ngOnDestroy() {
    this.insomnia.allowSleepAgain();
    this.onDestroy$.next();
  }

  public switchTrip() {
    this.isSwitchTrip = !this.isSwitchTrip;
    this.distance = this.isSwitchTrip
      ? this.calculateService.trip
      : this.calculateService.odo;
  }

  private initial() {
    this.unitService.unitSystem
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.geolocationService.convertUnit();
        this.speedUnit = this.unitService.speedUnit;
        this.distanceUnit = this.unitService.distanceUnit;
        this.lenghtUnit = this.unitService.lenghtUnit;
      });

    this.geolocationService.geolocationData
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.geolocationService.convertUnit();
        this.lat = this.geolocationService.lat;
        this.lon = this.geolocationService.lon;
      });

    this.calculateService.calculateData
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.speedo = this.calculateService.speedo;
        this.topSpeed = this.calculateService.topSpeed;
        this.accuracy = this.calculateService.accuracy;
        this.altitude = this.calculateService.altitude;
        this.distance = this.isSwitchTrip
          ? this.calculateService.trip
          : this.calculateService.odo;
        this.avgSpeed = this.calculateService.avgSpeed;
      });

    this.timerService.totalTime
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((data) => {
        this.totalTime = data;
      });
  }

  private convertUnit() {
    this.unitService.convertUnit();
    this.lenghtUnit = this.unitService.lenghtUnit;
    this.speedUnit = this.unitService.speedUnit;
    this.distanceUnit = this.unitService.distanceUnit;

    this.geolocationService.convertUnit();
    this.speedo = this.calculateService.speedo;
    this.topSpeed = this.calculateService.topSpeed;
    this.accuracy = this.calculateService.accuracy;
    this.altitude = this.calculateService.altitude;
    this.distance = this.isSwitchTrip
      ? this.calculateService.trip
      : this.calculateService.odo;
    this.avgSpeed = this.calculateService.avgSpeed;
    this.lat = this.geolocationService.lat;
    this.lon = this.geolocationService.lon;

    this.totalTime = this.timerService.convertedTotalTime;
  }
}
