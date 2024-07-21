export const District = [
  "blackriver",
  "flacq",
  "grandport",
  "moka",
  "pamplemousses",
  "plainewilhems",
  "portlouis",
  "rivieredurempart",
  "savanne",
  "rodrigues",
];

export interface OutageRecord {
  date: string;
  locality: string;
  streets: string;
  district: string;
  from: Date;
  to: Date;
  id: string;
}

export interface OutageItem {
  date: string;
  locality: string;
  streets: string;
  district: string;
  from: string;
  to: string;
  id: string;
}

export interface Data {
  outage: OutageItem[];
}

export interface ApiResponse {
  data: Data;
}
