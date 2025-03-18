import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/FirebaseTSAuth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
  auth = new FirebaseTSAuth();
  private checkInterval: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const user = this.auth.getAuth().currentUser;

    if (user && !user.emailVerified) {
      user.sendEmailVerification()
        .then(() => console.log('E-mail de verificação enviado!'))
        .catch(err => console.error('Erro ao enviar o e-mail:', err));

      // Verifica se o e-mail foi verificado a cada 3 segundos
      this.checkInterval = setInterval(() => {
        user.reload().then(() => {
          if (user.emailVerified) {
            clearInterval(this.checkInterval); // Para o loop
            location.reload(); // Atualiza a página
          }
        }).catch(err => console.error('Erro ao recarregar usuário:', err));
      }, 3000);
    } else {
      this.router.navigate(["/"]);
    }
  }

  onResendClick() {
    const user = this.auth.getAuth().currentUser;

    if (user) {
      user.sendEmailVerification()
        .then(() => console.log('E-mail reenviado!'))
        .catch(err => console.error('Erro ao reenviar o e-mail:', err));
    }
  }

  ngOnDestroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval); // Garante que o intervalo seja limpo ao sair da página
    }
  }
}
