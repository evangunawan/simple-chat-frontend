import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SocketClientService } from '../services/socket-client.service';
import { ChatMessageApiService } from '../services/api/chat-message.api.service';
import { ChatMessage } from '../models/chat-message';
import { ClientIdentifierService } from '../services/client-identifier.service';
import * as moment from 'moment';
import { IonContent, ToastController } from '@ionic/angular';
import { ChatRoomApiService } from '../services/api/chat-room.api.service';
import { SystemMessage } from '../models/system-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('ionContent') ionContent: IonContent;

  public roomId: string;
  public messageInput: string;
  private sessionToken: string;

  public chatMessages: (ChatMessage | SystemMessage)[] = [];

  private clientId: string;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private socketService: SocketClientService,
    private chatMessageService: ChatMessageApiService,
    private clientIdentifierService: ClientIdentifierService,
    private chatRoomApiService: ChatRoomApiService,
    private router: Router,
    private toastController: ToastController
  ) {}

  public parseTime(timestamp: number): string {
    return moment(timestamp).format('HH:mm');
  }

  public isSystemMessage(msg: ChatMessage | SystemMessage) {
    return msg instanceof SystemMessage;
  }

  public sendMessage() {
    if (!this.messageInput) {
      return;
    }
    const newMessage = new ChatMessage();
    newMessage.content = this.messageInput;
    newMessage.clientId = this.clientId;
    newMessage.type = 'outgoing';
    newMessage.timestamp = moment().unix() * 1000;

    this.chatMessages.push(newMessage);
    this.chatMessageService
      .sendMessage(this.messageInput, this.sessionToken)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
    this.messageInput = '';
    this.ionContent.scrollToBottom(200);
  }

  public async exitRoom() {
    this.socketService.leaveRoom();
    await this.router.navigate(['/home'], { replaceUrl: true });
  }

  private joinRoom(room: string) {
    this.chatRoomApiService
      .generateRoomChatToken(room, this.clientId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((token) => {
        console.log(token);
        this.sessionToken = token.token;
        this.socketService.joinRoom(token.token);
        this.showConnectedToast();
      });

    this.socketService
      .consume('chat')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        const parsed = JSON.parse(res);
        if (parsed.clientId === this.clientId) {
          return;
        }

        const incomingMsg = new ChatMessage();
        incomingMsg.content = parsed['content'];
        incomingMsg.type = 'incoming';
        incomingMsg.clientId = parsed.clientId;
        incomingMsg.timestamp = parsed.timestamp;

        this.chatMessages.push(incomingMsg);
        this.ionContent.scrollToBottom(200);

        this.cdr.detectChanges();
      });
    this.socketService
      .consume('roomjoin')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        const parsed = JSON.parse(res);
        if (parsed.clientId === this.clientId) {
          return;
        }
        const msg = new SystemMessage();
        msg.content = `${parsed.clientId} joined the room.`;

        this.chatMessages.push(msg);
        this.ionContent.scrollToBottom(200);
        this.cdr.detectChanges();
      });
    this.socketService
      .consume('roomleave')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        const parsed = JSON.parse(res);
        if (parsed.clientId === this.clientId) {
          return;
        }
        const msg = new SystemMessage();
        msg.content = `${parsed.clientId} left the room.`;

        this.chatMessages.push(msg);
        this.ionContent.scrollToBottom(200);
        this.cdr.detectChanges();
      });

    this.chatRoomApiService
      .getRoomClients(this.roomId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        console.log(res);
      });
  }

  private async showConnectedToast() {
    const toast = await this.toastController.create({
      message: 'Connected to the room.',
      position: 'top',
      duration: 2000,
    });
    await toast.present();
  }

  ngOnInit() {
    this.clientIdentifierService.fetchClientId().subscribe((res) => {
      if (!res) {
        this.exitRoom();
        return;
      }
      this.clientId = res;
      this.activatedRoute.paramMap
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((param) => {
          this.roomId = param.get('roomId');
          this.joinRoom(this.roomId);
        });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
