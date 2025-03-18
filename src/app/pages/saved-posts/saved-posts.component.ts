import { Component, OnInit } from '@angular/core';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/FirebaseTSFirestore';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Component({
  selector: 'app-saved-posts',
  templateUrl: './saved-posts.component.html',
  styleUrls: ['./saved-posts.component.css']
})
export class SavedPostsComponent implements OnInit {
  firestore = new FirebaseTSFirestore();
  savedPosts: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.firestore.listenToCollection({
      name: "Saved Posts Listener",
      path: ["Users", "USER_ID", "SavedPosts"], // Substitua USER_ID pelo ID real do usuário
      where: [],
      onUpdate: (result) => {
        this.savedPosts = result.docs.map(doc => doc.data());
      }
    });
  }

  deletePost(userId: string, postId: string) {
    firebase.firestore().collection("Users").doc(userId)
      .collection("SavedPosts").doc(postId).delete()
      .then(() => console.log("Post deletado com sucesso."))
      .catch((error) => console.error("Erro ao deletar post:", error));
  }
}
