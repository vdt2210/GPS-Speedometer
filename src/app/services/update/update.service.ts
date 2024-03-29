import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertComponent } from 'src/app/common/components/alert/alert.component';
import { AppUpdateModel } from 'src/app/common/models/update.model';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { ToastComponent } from 'src/app/common/components/toast/toast.component';
import AppConstant from 'src/app/utilities/app-constant';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  public isCheckingForUpdate: boolean = false;

  public versionNumber: string;

  constructor(
    private http: HttpClient,
    private alertComponent: AlertComponent,
    private toastComponent: ToastComponent
  ) {}

  public async checkForUpdate(isManual: boolean) {
    this.isCheckingForUpdate = true;
    this.versionNumber = (await App.getInfo()).version;

    if ((await Network.getStatus()).connected) {
      this.http
        .get(AppConstant.defaultUrl.gitHubApiUrl)
        .subscribe(async (info: AppUpdateModel) => {
          try {
            const splittedVersion = this.versionNumber
              .split(/[.-]/)
              .filter(Number);
            const serverVersion = info.tag_name.split(/[.-]/).filter(Number);

            if (isManual) {
              this.toastComponent.presentToast(
                'toast.checkingForUpdate',
                null,
                null,
                null
              );
            }

            if (
              (serverVersion[0] > splittedVersion[0] ||
                serverVersion[1] > splittedVersion[1] ||
                serverVersion[2] > splittedVersion[2]) &&
              info
            ) {
              if (info.assets.length > 1) {
                await this.alertComponent.alertWithButtons(
                  'alert.header.h2',
                  info.tag_name,
                  'alert.msg.changelog',
                  info.html_url,
                  'common.later',
                  'common.download',
                  null,
                  this,
                  () => window.open(info.html_url, '_blank')
                );
              } else {
                await this.alertComponent.alertWithButtons(
                  'alert.header.h2',
                  info.tag_name,
                  'alert.msg.changelog',
                  info.html_url,
                  'common.later',
                  'common.download',
                  (info.assets[0].size * 9.5367431640625e-7).toFixed(2),
                  this,
                  () =>
                    window.open(info.assets[0].browser_download_url, '_blank')
                );
              }
            } else if (isManual) {
              await this.alertComponent.alertWithButton(
                'alert.header.h3',
                this.versionNumber,
                'alert.msg.m2',
                null,
                'common.ok'
              );
            }

            if (isManual) {
              this.toastComponent.dismissToast();
            }

            this.isCheckingForUpdate = false;
          } catch (e) {
            this.toastComponent.presentToast(
              'toast.checkForUpdateFailed',
              e,
              2000,
              'warning'
            );
            this.isCheckingForUpdate = false;
          }
        });
    } else {
      this.isCheckingForUpdate = false;

      if (isManual) {
        await this.alertComponent.alertWithButton(
          'alert.header.h4',
          null,
          'alert.msg.m3',
          null,
          'common.ok'
        );
      }
    }
  }
}
