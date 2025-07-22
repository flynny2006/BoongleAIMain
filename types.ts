export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  content: string;
  file?: {
    name: string;
    type: string;
    content: string; // base64 for images, text for others
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type Theme = 'light' | 'dark';

export type Language = 'English' | 'Hungarian' | 'German';

export interface UserProfile {
  name: string;
  hobbies: string;
  notes: string;
}
