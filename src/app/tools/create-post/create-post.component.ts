import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/FirebaseTSAuth';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/FirebaseTSFirestore';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/FirebaseTSApp';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  selectedImageFile: File;
  imageUrl: string; 
  auth = new FirebaseTSAuth();
  firestore = new FirebaseTSFirestore();

  constructor(private dialog: MatDialogRef<CreatePostComponent>) { }

  ngOnInit(): void {
  }

  // Função chamada quando o botão de envio é pressionado
  onPostClick(commentInput: HTMLTextAreaElement) {
    let comment = commentInput.value;
    if(comment.length <= 0) return;

    // Verifica se há imagem selecionada e usa a URL local
    if (this.selectedImageFile) {
      this.generateLocalImageUrl().then(() => {
        this.uploadPostWithImage(comment).then(() => {
          window.location.reload();  // Recarga a página após o upload ser concluído
        }).catch(error => {
          console.error("Erro ao criar post com imagem:", error);
        });
      }).catch(error => {
        console.error("Erro ao gerar URL da imagem:", error);
      });
    } else {
      this.uploadPost(comment).then(() => {
        window.location.reload();  // Recarga a página após o upload ser concluído
      }).catch(error => {
        console.error("Erro ao criar post sem imagem:", error);
      });
    }
  }

  // Função para gerar a URL local da imagem
  generateLocalImageUrl(): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result; // A URL da imagem é gerada aqui
        resolve();
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(this.selectedImageFile);
    });
  }

  // Função para fazer o upload do post com a imagem
  uploadPostWithImage(comment: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.imageUrl) {
        reject("imageUrl não foi gerada corretamente.");
        return;
      }

      let postId = this.firestore.genDocId();
      this.firestore.create(
        {
          path: ["Posts", postId],
          data: {
            comment: comment,
            creatorId: this.auth.getAuth().currentUser.uid,
            imageUrl: this.imageUrl, // Usa a URL local da imagem
            timestamp: FirebaseTSApp.getFirestoreTimestamp()
          },
          onComplete: () => {
            resolve();  // Marca como concluído
          },
          onFail: (error) => {
            reject(error);  // Marca como erro
          }
        }
      );
    });
  }

  // Função para fazer o upload do post sem a imagem
  uploadPost(comment: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.firestore.create(
        {
          path: ["Posts"],
          data: {
            comment: comment,
            creatorId: this.auth.getAuth().currentUser.uid,
            imageUrl: "assets/home_background.png", // Imagem padrão caso não haja imagem
            timestamp: FirebaseTSApp.getFirestoreTimestamp()
          },
          onComplete: () => {
            resolve();  // Marca como concluído
          },
          onFail: (error) => {
            reject(error);  // Marca como erro
          }
        }
      );
    });
  }

  // Função para selecionar a imagem
  onPhotoSelected(photoSelector: HTMLInputElement) {
    this.selectedImageFile = photoSelector.files[0];
    if (!this.selectedImageFile) return;

    // Aqui é a pré-visualização da imagem
    let fileReader = new FileReader();
    fileReader.readAsDataURL(this.selectedImageFile);
    fileReader.addEventListener(
      "loadend", (ev) => {
        let readableString = fileReader.result.toString();
        let postPreviewImage = <HTMLImageElement>document.getElementById("post-preview-image");
        postPreviewImage.src = readableString;
      }
    );
  }
}
