import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ChatMessage } from '../../models/chat-message';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageApiService {
  constructor(private httpClient: HttpClient) {}

  public sendMessage(content: string, token: string) {
    return this.httpClient
      .post(`${environment.backendUrl}/chat-messages`, {
        content: content,
        token,
      })
      .pipe();
  }
}
