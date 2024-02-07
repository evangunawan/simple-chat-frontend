import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import { ChatMessage } from '../../models/chat-message';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageApiService {
  constructor(private httpClient: HttpClient) {}

  public sendMessage(roomId: string, message: ChatMessage) {
    return this.httpClient
      .post(`${environment.backendUrl}/chat-messages`, {
        content: message.content,
        roomId: roomId,
        clientId: message.clientId,
      })
      .pipe();
  }
}
