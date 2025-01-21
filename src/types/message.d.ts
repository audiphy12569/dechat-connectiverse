export interface Message {
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
}