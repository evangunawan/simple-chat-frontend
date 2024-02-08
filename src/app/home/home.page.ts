import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientIdentifierService } from '../services/client-identifier.service';
import { SocketClientService } from '../services/socket-client.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public formGroup: FormGroup;
  public isSocketConnected = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private clientIdService: ClientIdentifierService,
    private socketService: SocketClientService,
    private toast: ToastController
  ) {}

  public async joinRoom() {
    if (this.formGroup.invalid) return;

    if (this.isSocketConnected === false) {
      const toast = await this.toast.create({
        message: 'Socket not connected',
        duration: 3000,
        position: 'bottom',
      });
      await toast.present();

      return;
    }

    const formValue = this.formGroup.value;

    await this.clientIdService.setClientId(formValue.username);
    await this.router.navigate([
      `/chat/${String(formValue.roomId).toUpperCase()}`,
    ]);
  }

  private initFormGroup() {
    this.formGroup = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      roomId: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
    });
  }

  ngOnInit() {
    this.initFormGroup();
    this.clientIdService.fetchClientId().subscribe((res) => {
      if (res) {
        this.formGroup.controls['username'].setValue(res);
      }
    });
    this.socketService.socketConnected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((status) => {
        this.isSocketConnected = status;
      });
  }
}
