import { Component, Input, OnInit } from '@angular/core';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/FirebaseTSFirestore';
import { PostData } from 'src/app/pages/post-feed/post-feed.component';
import { MatDialog } from '@angular/material/dialog';
import { ReplyComponent } from '../reply/reply.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() postData: PostData;
  creatorName: string;
  creatorDescription: string;
  firestore = new FirebaseTSFirestore();
  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.postData && this.postData.creatorId) {
      this.getCreatorInfo();
    } else {
      console.error("Erro: postData ou creatorId está indefinido.");
    }
  }

  onReplyClick(){
    this.dialog.open(ReplyComponent, {data: this.postData.postId});
  }

  getCreatorInfo() {
    this.firestore.getDocument(
      {
        path: ["Users", this.postData.creatorId],
        onComplete: result => {
          let userDocument = result.data();
          this.creatorName = userDocument.publicName;
          this.creatorDescription = userDocument.description;
        }
      }
    );
  }
}


