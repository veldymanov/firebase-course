import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebaseui from 'firebaseui';
import * as firebase from 'firebase/app';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private ui: firebaseui.auth.AuthUI;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const uiConfig = {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult:
          (athResult: any, redirectUrl?: string) => this.onLoginSuccessful(athResult),
      }
    };

    this.ui = new firebaseui.auth.AuthUI(this.afAuth.auth);
    this.ui.start('#firebaseui-auth-container', uiConfig);
  }

  ngOnDestroy(): void {
    this.ui.delete();
  }

  private onLoginSuccessful(athResult: any): boolean {
    this.ngZone.run(() => this.router.navigateByUrl('/courses'));
    return true;
  }
}
