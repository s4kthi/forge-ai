export interface HealthResponse {
  name: "FORGE AI";
  status: "ok";
  timestamp: string;
}

export interface DatabaseHealthResponse {
  status: "connected" | "unavailable";
  timestamp: string;
}

export interface ApiResponse<Data> {
  data: Data;
}

export interface ApiValidationIssue {
  path: string[];
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  issues?: ApiValidationIssue[];
  runId?: string;
  runStatus?: "FAILED" | "CANCELLED";
}
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
