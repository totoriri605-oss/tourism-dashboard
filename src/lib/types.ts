export type Demand = { reference_date: string; region_code: string; stay_strength: number | null; consumption_strength: number | null };
export type Place = { id: number; name: string; region_code: string | null; search_category: string; category: string | null; road_address: string | null; address: string | null; latitude: number | null; longitude: number | null; source_link: string | null };
export type Trend = { reference_date: string; keyword: string; ratio: number };
export type Region = { region_code: string; region_name: string };
export type Analysis = { analysis_date: string; region_code: string; summary: string; limitations: string | null };
