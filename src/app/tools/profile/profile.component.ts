import { Component, Input, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/FirebaseTSAuth';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/FirebaseTSFirestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Input() show: boolean;

  firestore: FirebaseTSFirestore;
  auth: FirebaseTSAuth;

  constructor() { 
    this.firestore = new FirebaseTSFirestore();
    this.auth = new FirebaseTSAuth();
  }

  ngOnInit(): void {
  }


  onContinueClick(
    nameInput: HTMLInputElement,
    descriptionInput: HTMLInputElement
  ) {
    let name = nameInput.value;
    let description = descriptionInput.value;
    this.firestore.create(
      {
        path: ["Users", this.auth.getAuth().currentUser.uid],
        data: {
          publicName: name,
          description: description
        },
        onComplete: (docId) => {
          alert("Profile created successfully");
          nameInput.value = "";
          descriptionInput.value = "";
        },
        onFail: (error) => {

        }
      }
    );
  }
}
