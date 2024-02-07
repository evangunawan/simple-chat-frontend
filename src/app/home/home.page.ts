import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientIdentifierService } from '../services/client-identifier.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private router: Router,
    private clientIdService: ClientIdentifierService
  ) {}

  public async joinRoom() {
    if (this.formGroup.invalid) return;
    const formValue = this.formGroup.value;

    await this.clientIdService.setClientId(formValue.username);
    await this.router.navigate([
      `/chat/${String(formValue.roomId).toUpperCase()}`,
    ]);
  }

  private initFormGroup() {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      roomId: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.initFormGroup();
    this.clientIdService.fetchClientId().subscribe((res) => {
      if (res) {
        this.formGroup.controls['username'].setValue(res);
      }
    });
  }
}
