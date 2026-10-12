
import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
  HostListener
} from '@angular/core';

type Verdict = 'confiavel' | 'falsa' | 'inconclusiva';

interface Evidence {
  title: string;
  type: string;
  description: string;
  finding: string;
  isDecoy: boolean;
  examined: boolean;
  collected: boolean;
}

interface GameCase {
  number: number;
  title: string;
  claim: string;
  briefing: string;
  timeLimit: number;
  correctVerdict: Verdict;
  evidences: Evidence[];
}

@Component({
  selector: 'app-desafio',
  standalone: false,
  templateUrl: './desafio.html',
  styleUrl: './desafio.css'
})
export class Desafio implements OnDestroy {
  @ViewChild('gameShell') gameShell?: ElementRef<HTMLElement>;

  gameStarted = false;
  isFullscreen = false;
  showExitConfirmation = false;
  campaignCompleted = false;

  activeEvidence: number | null = null;
  selectedVerdict: Verdict | null = null;
  submitted = false;
  gameOver = false;

  score = 0;
  lastPoints = 0;
  casesSolved = 0;
  currentLevel = 0;

  timeLeft = 300;
  timerId: ReturnType<typeof setInterval> | null = null;
  deadline = 0;

  feedback = '';
  feedbackKind: 'success' | 'warning' | 'error' = 'warning';

  readonly fireworksParticles = Array.from({ length: 36 }, (_, i) => i);

  readonly cases: GameCase[] = [
    {
      number: 1,
      title: 'Uma verdade suspeita',
      claim: 'Uma resposta produzida por inteligência artificial pode ser aceita como verdadeira sem consultar outras fontes.',
      briefing: 'Um relatório foi criado com ajuda de IA. Investigue os documentos, o histórico e a origem das informações.',
      timeLimit: 300,
      correctVerdict: 'falsa',
      evidences: [
        {
          title: 'Histórico do assistente',
          type: 'REGISTRO DIGITAL',
          description: 'O histórico mostra uma resposta segura, mas não apresenta referências para todos os dados citados.',
          finding: 'A confiança do texto não comprova sua precisão. Respostas geradas por IA podem conter erros ou referências inexistentes.',
          isDecoy: false, examined: false, collected: false
        },
        {
          title: 'Relatório com selo de aprovação',
          type: 'DOCUMENTO SUSPEITO',
          description: 'O documento possui um selo de aprovação e a frase “verificado por especialistas”. Não há nomes, links ou data de revisão.',
          finding: 'O selo não comprova uma verificação real. Sem responsáveis identificados ou evidências consultáveis, a alegação não pode ser confirmada.',
          isDecoy: true, examined: false, collected: false
        },
        {
          title: 'Manual de uso da ferramenta',
          type: 'ORIENTAÇÃO OFICIAL',
          description: 'O manual alerta que o conteúdo gerado deve ser avaliado conforme o contexto e a importância da informação.',
          finding: 'A própria orientação da ferramenta reconhece limitações. Isso reforça a necessidade de verificar informações relevantes.',
          isDecoy: false, examined: false, collected: false
        },
        {
          title: 'Artigo de referência',
          type: 'FONTE INDEPENDENTE',
          description: 'Um artigo explica como sistemas generativos podem apresentar informações incorretas em textos bem escritos.',
          finding: 'A explicação é compatível com limitações conhecidas de IA generativa. A qualidade da fonte e as evidências citadas também precisam ser avaliadas.',
          isDecoy: false, examined: false, collected: false
        }
      ]
    },
    {
      number: 2,
      title: 'A fonte duvidosa',
      claim: 'Um dado compartilhado por vários sites é necessariamente confiável, mesmo quando todos citam a mesma publicação original.',
      briefing: 'Uma estatística viral aparece em diferentes páginas. Descubra se existe confirmação independente ou apenas repetição.',
      timeLimit: 180,
      correctVerdict: 'falsa',
      evidences: [
        {
          title: 'Cinco páginas, uma origem',
          type: 'RASTRO DE CITAÇÕES',
          description: 'Cinco páginas publicam o mesmo número. Ao abrir as referências, todas apontam para um único texto original.',
          finding: 'Cinco páginas não equivalem a cinco confirmações independentes quando todas dependem da mesma fonte.',
          isDecoy: false, examined: false, collected: false
        },
        {
          title: 'Gráfico sem metodologia',
          type: 'EVIDÊNCIA INCOMPLETA',
          description: 'Um gráfico chama atenção pelo visual, mas não informa amostra, período, método ou conjunto de dados.',
          finding: 'A aparência profissional não substitui metodologia verificável. Sem esses dados, não é possível avaliar adequadamente a conclusão.',
          isDecoy: false, examined: false, collected: false
        },
        {
          title: 'Comentários concordantes',
          type: 'SINAL ENGANOSO',
          description: 'Muitos comentários repetem a estatística e dizem que ela “parece correta”. Nenhum apresenta uma fonte primária.',
          finding: 'Concordância popular não comprova um fato. Os comentários podem repetir a mesma informação sem verificá-la.',
          isDecoy: true, examined: false, collected: false
        },
        {
          title: 'Base de dados original',
          type: 'FONTE PRIMÁRIA',
          description: 'Uma base de dados permite conferir o período e os números usados na publicação viral.',
          finding: 'Comparar com a fonte primária ajuda a verificar se o número foi representado corretamente e se o contexto foi preservado.',
          isDecoy: false, examined: false, collected: false
        }
      ]
    },
    {
      number: 3,
      title: 'O relatório adulterado',
      claim: 'Uma captura de tela de um resultado de pesquisa é prova suficiente de que a informação continua atual e correta.',
      briefing: 'Um relatório depende de uma captura sem endereço completo e sem data visível. Investigue a autenticidade e o contexto.',
      timeLimit: 120,
      correctVerdict: 'falsa',
      evidences: [
        {
          title: 'Captura sem endereço',
          type: 'EVIDÊNCIA AMBÍGUA',
          description: 'A imagem mostra um resultado convincente, mas o endereço, a data e o contexto da pesquisa não aparecem.',
          finding: 'A imagem isolada não permite verificar a página original, a data ou possíveis alterações. É necessário localizar a fonte.',
          isDecoy: false, examined: false, collected: false
        },
        {
          title: 'Página atualmente disponível',
          type: 'VERIFICAÇÃO ATUAL',
          description: 'A página original foi encontrada, mas o conteúdo atual apresenta uma atualização posterior à captura.',
          finding: 'Uma captura antiga pode não representar o conteúdo atual. Datas e versões precisam ser comparadas antes de concluir.',
          isDecoy: false, examined: false, collected: false
        },
        {
          title: 'Logotipo conhecido',
          type: 'PISTA ENGANOSA',
          description: 'O logotipo parece legítimo. Porém, ele pode ser copiado para imagens, documentos e páginas falsas.',
          finding: 'Um logotipo não autentica o conteúdo. Verifique o domínio, a autoria, o contexto e a fonte original.',
          isDecoy: true, examined: false, collected: false
        },
        {
          title: 'Comunicado de atualização',
          type: 'FONTE PRIMÁRIA',
          description: 'O comunicado oficial descreve a mudança e apresenta a data de publicação.',
          finding: 'O comunicado ajuda a estabelecer o contexto temporal. A conclusão deve considerar a data do documento original e a atualização posterior.',
          isDecoy: false, examined: false, collected: false
        }
      ]
    }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  get activeCase(): GameCase {
    return this.cases[this.currentLevel];
  }

  get evidences(): Evidence[] {
    return this.activeCase.evidences;
  }

  get examinedCount(): number {
    return this.evidences.filter(e => e.examined).length;
  }

  get collectedCount(): number {
    return this.evidences.filter(e => e.collected).length;
  }

  get progress(): number {
    return Math.round(this.examinedCount / this.evidences.length * 100);
  }

  get allEvidenceExamined(): boolean {
    return this.examinedCount === this.evidences.length;
  }

  get rank(): string {
    if (this.score >= 700) return 'Lenda da investigação';
    if (this.score >= 450) return 'Detetive especialista';
    if (this.score >= 250) return 'Investigador';
    return 'Estagiário';
  }

  get feedbackTitle(): string {
    if (this.gameOver && !this.submitted) return 'Tempo esgotado!';
    if (this.selectedVerdict === this.activeCase.correctVerdict) return 'Caso resolvido!';
    return 'Conclusão incorreta';
  }

  get feedbackMessage(): string {
    if (this.gameOver && !this.submitted) {
      return 'O tempo acabou antes de você registrar um veredito. Tente novamente.';
    }

    if (this.selectedVerdict === this.activeCase.correctVerdict) {
      return 'Você chegou à conclusão correta. Verifique sempre a origem, a independência e o contexto das informações.';
    }

    return 'Sua conclusão não corresponde às evidências deste caso. Reavalie a origem das informações e a diferença entre aparência convincente e comprovação.';
  }

  startGame(): void {
    this.resetEntireGame();
    this.gameStarted = true;
    this.startTimer();
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement;
    this.cdr.detectChanges();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (!document.hidden) this.updateTimer();
  }

  async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await this.gameShell?.nativeElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Não foi possível alterar a tela cheia.', error);
    }
  }

  exitGame(): void {
    if (this.campaignCompleted) {
      this.resetEntireGame();
      return;
    }

    this.showExitConfirmation = true;
  }

  cancelExit(): void {
    this.showExitConfirmation = false;
  }

  async confirmExit(): Promise<void> {
    this.showExitConfirmation = false;

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Não foi possível sair da tela cheia.', error);
      }
    }

    this.resetEntireGame();
  }

  examineEvidence(index: number): void {
    if (this.submitted || this.gameOver) return;
    if (this.evidences[index].examined) return;
    this.activeEvidence = index;
  }

  closeEvidence(): void {
    this.activeEvidence = null;
  }

  collectEvidence(): void {
    if (this.activeEvidence === null) return;

    const evidence = this.evidences[this.activeEvidence];

    if (!evidence.examined) {
      evidence.examined = true;

      if (evidence.isDecoy) {
        this.feedback = 'Pista enganosa identificada. Ela não conta como evidência válida.';
        this.feedbackKind = 'warning';
      } else {
        evidence.collected = true;
        this.score += 50;
        this.feedback = 'Evidência válida registrada: +50 XP.';
        this.feedbackKind = 'success';
      }
    }

    this.activeEvidence = null;
    this.cdr.detectChanges();
  }

  chooseVerdict(verdict: Verdict): void {
    if (this.submitted || this.gameOver || !this.allEvidenceExamined) return;
    this.selectedVerdict = verdict;
    this.feedback = '';
  }

  submitVerdict(): void {
    if (!this.selectedVerdict || this.submitted || this.gameOver || !this.allEvidenceExamined) return;

    this.updateTimer();
    if (this.gameOver || this.timeLeft <= 0) return;

    this.stopTimer();
    this.submitted = true;
    this.casesSolved++;

    if (this.selectedVerdict === this.activeCase.correctVerdict) {
      this.lastPoints = 100;

      if (this.timeLeft > this.activeCase.timeLimit * 0.6) {
        this.lastPoints += 50;
      }

      this.feedbackKind = 'success';
    } else {
      this.lastPoints = 0;
      this.feedbackKind = 'error';
    }

    this.score += this.lastPoints;
    this.feedback = this.feedbackMessage;
    this.cdr.detectChanges();
  }

  nextLevel(): void {
    if (!this.submitted || this.selectedVerdict !== this.activeCase.correctVerdict) return;

    if (this.currentLevel >= this.cases.length - 1) {
      this.stopTimer();
      this.campaignCompleted = true;
      this.activeEvidence = null;
      this.cdr.detectChanges();
      return;
    }

    this.currentLevel++;
    this.resetCurrentCase();
    this.startTimer();
  }

  retryCase(): void {
    this.resetCurrentCase();
    this.startTimer();
  }

  restartGame(): void {
    this.resetEntireGame();
    this.gameStarted = true;
    this.startTimer();
  }

  returnToMenu(): void {
    this.resetEntireGame();
  }

  private resetEntireGame(): void {
    this.stopTimer();

    this.gameStarted = false;
    this.isFullscreen = false;
    this.showExitConfirmation = false;
    this.campaignCompleted = false;
    this.activeEvidence = null;
    this.selectedVerdict = null;
    this.submitted = false;
    this.gameOver = false;

    this.score = 0;
    this.lastPoints = 0;
    this.casesSolved = 0;
    this.currentLevel = 0;
    this.timeLeft = this.cases[0].timeLimit;
    this.deadline = 0;
    this.feedback = '';

    this.cases.forEach(gameCase => {
      gameCase.evidences.forEach(evidence => {
        evidence.examined = false;
        evidence.collected = false;
      });
    });

    this.cdr.detectChanges();
  }

  private resetCurrentCase(): void {
    this.stopTimer();

    this.activeEvidence = null;
    this.selectedVerdict = null;
    this.submitted = false;
    this.gameOver = false;
    this.lastPoints = 0;
    this.timeLeft = this.activeCase.timeLimit;
    this.deadline = 0;
    this.feedback = '';

    this.evidences.forEach(evidence => {
      evidence.examined = false;
      evidence.collected = false;
    });

    this.cdr.detectChanges();
  }

  private startTimer(): void {
    this.stopTimer();

    if (!this.gameStarted || this.submitted || this.gameOver) return;

    this.timeLeft = this.activeCase.timeLimit;
    this.deadline = Date.now() + this.timeLeft * 1000;

    this.timerId = setInterval(() => this.updateTimer(), 200);
    this.cdr.detectChanges();
  }

  private updateTimer(): void {
    if (!this.gameStarted || this.submitted || this.gameOver || !this.deadline) return;

    this.timeLeft = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.gameOver = true;
      this.feedbackKind = 'error';
      this.stopTimer();
    }

    this.cdr.detectChanges();
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
