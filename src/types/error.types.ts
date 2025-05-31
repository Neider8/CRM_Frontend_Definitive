// src/types/error.types.ts
export interface ApiErrorResponseDTO {
  timestamp: string; // LocalDateTime se serializa como string ISO 8601
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>; // O Map<string, string> si prefieres
  details?: string[];
}