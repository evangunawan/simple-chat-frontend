import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, take, takeUntil } from 'rxjs';
import { SocketClientService } from '../services/socket-client.service';
import { ChatMessageApiService } from '../services/api/chat-message.api.service';
import { ChatMessage } from '../models/chat-message';
import { ClientIdentifierService } from '../services/client-identifier.service';
import * as moment from 'moment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  public roomId: string;
  public messageInput: string;

  public chatMessages: ChatMessage[] = [];

  private clientId: string;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private socketService: SocketClientService,
    private chatMessageService: ChatMessageApiService,
    private clientIdentifierService: ClientIdentifierService,
    private router: Router
  ) {}

  public parseTime(timestamp: number): string {
    return moment(timestamp).format('HH:mm');
  }

  public sendMessage() {
    if (!this.messageInput) {
      return;
    }
    const newMessage = new ChatMessage();
    newMessage.content = this.messageInput;
    newMessage.clientId = this.clientId;
    newMessage.type = 'outgoing';

    this.chatMessages.push(newMessage);
    this.chatMessageService
      .sendMessage(this.roomId, newMessage)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
    this.messageInput = '';
  }

  public exitRoom() {
    this.socketService.leaveRoom();
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  private joinRoom(room: string) {
    this.socketService.joinRoom(room);
    this.socketService
      .consume('chat')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        const parsed = JSON.parse(res);
        console.log('incoming', parsed);
        if (parsed.clientId === this.clientId) {
          return;
        }

        const incomingMsg = new ChatMessage();
        incomingMsg.content = parsed['content'];
        incomingMsg.type = 'incoming';
        incomingMsg.clientId = parsed.clientId;
        incomingMsg.timestamp = parsed.timestamp;

        this.chatMessages.push(incomingMsg);
        this.cdr.detectChanges();
      });
  }

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((param) => {
        this.roomId = param.get('roomId');
        this.joinRoom(this.roomId);
      });
    this.clientIdentifierService.fetchClientId().subscribe((res) => {
      if (!res) {
        this.exitRoom();
        return;
      }
      this.clientId = res;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
