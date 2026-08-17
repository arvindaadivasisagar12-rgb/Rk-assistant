export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export interface ActiveTab {
  id: 'voice' | 'studio' | 'sourcing' | 'generation' | 'automations';
}

export interface VideoAsset {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  source: string;
}

export interface RKResponse {
  message: string;
  status: string;
  bossConfirmation: "Ho Gaya Boss!";
}
