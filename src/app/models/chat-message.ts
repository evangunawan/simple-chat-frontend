export class ChatMessage {
  public timestamp: number;
  public content: string;
  public clientId: string;
  public type: 'incoming' | 'outgoing' | 'system';

  constructor() {}
}
