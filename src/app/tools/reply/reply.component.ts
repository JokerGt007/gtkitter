import { Component, Inject, OnInit } from '@angular/core';
import { FirebaseTSFirestore, OrderBy } from 'firebasets/firebasetsFirestore/FirebaseTSFirestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/FirebaseTSApp';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.css']
})
export class ReplyComponent implements OnInit {
  firestore = new FirebaseTSFirestore();
  comments: Comment[] = [];
  loadedCommentIds = new Set<string>(); // Evita duplicação de comentários

  constructor(@Inject(MAT_DIALOG_DATA) private postId: string) { }

  ngOnInit(): void {
    this.getComments();
  }

  isCommentCreator(comment: Comment) {
    try {
      return comment.creatorId === AppComponent.getUserDocument().userId;
    } catch (err) {
      return false;
    }
  }

  getComments() {
    this.firestore.listenToCollection({
      name: "Post Comments",
      path: ["Posts", this.postId, "PostComments"],
      where: [new OrderBy("timestamp", "asc")],
      onUpdate: (result) => {
        result.docChanges().forEach(postCommentDoc => {
          if (postCommentDoc.type === "added") {
            const newComment = <Comment>postCommentDoc.doc.data();
            const commentId = postCommentDoc.doc.id;

            // Verifica se o comentário já foi carregado
            if (!this.loadedCommentIds.has(commentId)) {
              this.comments.unshift(newComment);
              this.loadedCommentIds.add(commentId);
            }
          }
        });
      }
    });
  }

  onSendClick(commentInput: HTMLInputElement) {
    if (commentInput.value.trim().length === 0) return; // Evita comentários vazios ou apenas espaços

    this.firestore.create({
      path: ["Posts", this.postId, "PostComments"],
      data: {
        comment: commentInput.value,
        creatorId: AppComponent.getUserDocument().userId,
        creatorName: AppComponent.getUserDocument().publicName,
        timestamp: FirebaseTSApp.getFirestoreTimestamp()
      },
      onComplete: () => {
        commentInput.value = ""; // Limpa o input após envio
      }
    });
  }
}

export interface Comment {
  creatorId: string;
  creatorName: string;
  comment: string;
}
