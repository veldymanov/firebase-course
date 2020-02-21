import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  public isLoggedIn$: Observable<boolean>;
  public isLoggedOut$: Observable<boolean>;
  public pictureUrl$: Observable<string>;

  private asAuthSubs: Subscription;

  constructor(
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit(): void {
    this.asAuthSubs = this.afAuth.authState.subscribe(user => console.log(user));

    this.isLoggedIn$ = this.afAuth.authState.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
    this.pictureUrl$ =
      this.afAuth.authState.pipe(map(user => user ? user.photoURL : null));
  }

  ngOnDestroy(): void {
    this.asAuthSubs.unsubscribe();
  }

  public logout(): void {
    this.afAuth.auth.signOut();
  }
}
