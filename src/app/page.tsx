import Dashboard from '@/components/Dashboard';
import { getSupabase } from '@/lib/supabase';
import type { Demand, Place, Trend, Region, Analysis } from '@/lib/types';
export const dynamic = 'force-dynamic';
export default async function Home() {
  try {
    const db = getSupabase();
    const results = await Promise.all([
      db.from('tourism_demand').select('reference_date,region_code,stay_strength,consumption_strength').order('reference_date', { ascending: false }).limit(2000),
      db.from('local_places').select('id,name,region_code,search_category,category,road_address,address,latitude,longitude,source_link').order('name').limit(500),
      db.from('naver_trend').select('reference_date,keyword,ratio').order('reference_date').limit(2000),
      db.from('regions').select('region_code,region_name').order('region_code'),
      db.from('ai_region_analysis').select('analysis_date,region_code,summary,limitations').order('analysis_date', { ascending: false }).limit(100),
    ]);
    const error = results.find(r => r.error)?.error;
    if (error) throw new Error(error.message);
    return <Dashboard demands={(results[0].data ?? []) as Demand[]} places={(results[1].data ?? []) as Place[]} trends={(results[2].data ?? []) as Trend[]} regions={(results[3].data ?? []) as Region[]} analyses={(results[4].data ?? []) as Analysis[]} />;
  } catch (error) {
    return <main className="shell"><h1>Supabase 연결 확인이 필요합니다</h1><p role="alert">{error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.'}</p></main>;
  }
}
