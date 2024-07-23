export interface OutageItem {
  date: string;
  locality: string;
  streets: string;
  district: string;
  from: Date;
  to: Date;
  id: string;
}

export interface Data {
  today: OutageItem[];
  future: OutageItem[];
}

export interface ApiResponse {
  data: Data;
}
