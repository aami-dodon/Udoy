export interface StoragePresignRequestPayload {
  objectKey: string;
  contentType?: string;
  expiresIn?: number;
}

export interface StoragePresignDownloadRequestPayload {
  objectKey: string;
  expiresIn?: number;
}

export interface StoragePresignedUrlResponse {
  url: string;
  method?: string;
  headers?: Record<string, string>;
}
