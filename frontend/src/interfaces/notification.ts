export interface Notification {
  id: number;
  message: string;
  details?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}
