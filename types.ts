
export interface ScanResult {
  id: string;
  originalImage: string;
  processedImage: string;
  ocrText: string;
  title: string;
  createdAt: number;
  fileSize: number;
}

export enum AppState {
  HOME = 'HOME',
  SCANNING = 'SCANNING',
  REVIEW = 'REVIEW',
  HISTORY = 'HISTORY'
}

export interface GeminiProcessedData {
  title: string;
  ocrContent: string;
  qualityScore: number;
}
