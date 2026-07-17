export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface HostedZone {
  id: string;
  name: string;
  type: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Record {
  id: number;
  zone_id: string;
  name: string;
  type: string;
  ttl: number;
  value: string;
  routing_policy: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
