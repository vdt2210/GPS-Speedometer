import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-toast',
  template: '',
})
export class ToastComponent {
  constructor(
    private toastController: ToastController,
    private translateService: TranslateService
  ) {}

  public async presentToast(msg: any, value: any, time: number) {
    const toast = await this.toastController.create({
      message: this.translateService.instant(msg, { value: value }),
      duration: time,
    });
    await toast.present();
  }
}