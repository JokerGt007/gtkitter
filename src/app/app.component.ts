import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthenticatorComponent } from './tools/authenticator/authenticator.component';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/FirebaseTSAuth';
import { Router } from '@angular/router';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/FirebaseTSFirestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gtkitter';
  auth = new FirebaseTSAuth();
  firestore = new FirebaseTSFirestore();
  userHasProfile = true;
  private static userDocument: UserDocument | null = null;
  isDarkMode = false;

  constructor(private loginSheet: MatBottomSheet, private router: Router) {
    this.auth.listenToSignInStateChanges(
      user => {
        this.auth.checkSignInState({
          whenSignedIn: user => {},
          whenSignedOut: user => {
            AppComponent.userDocument = null;
          },
          whenSignedInAndEmailNotVerified: user => {
            this.router.navigate(['/emailVerification']);
          },
          whenSignedInAndEmailVerified: user => {
            this.getUserProfile();
          },
          whenChanged: user => {}
        });
      }
    );

    // Carregar modo escuro do localStorage
    this.isDarkMode = localStorage.getItem('dark-mode') === 'true';
    this.updateTheme();
  }

  public static getUserDocument() {
    return AppComponent.userDocument;
  }

  getUsername() {
    try {
      return AppComponent.userDocument?.publicName;
    } catch (err) {}
  }

  getUserProfile() {
    this.firestore.listenToDocument({
      name: 'Getting Document',
      path: ['Users', this.auth.getAuth().currentUser?.uid],
      onUpdate: result => {
        AppComponent.userDocument = result.data() as UserDocument;
        this.userHasProfile = result.exists;
        AppComponent.userDocument.userId = this.auth.getAuth().currentUser?.uid;
        if (this.userHasProfile) {
          this.router.navigate(['postfeed']);
        }
      }
    });
  }

  onLogoutClick() {
    this.auth.signOut();
  }

  loggedIn() {
    return this.auth.isSignedIn();
  }

  onLoginClick() {
    this.loginSheet.open(AuthenticatorComponent);
  }

  // Funções do Dark Mode
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('dark-mode', String(this.isDarkMode));
    this.updateTheme();
  }

  updateTheme() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}

export interface UserDocument {
  publicName: string;
  description: string;
  userId: string;
}
