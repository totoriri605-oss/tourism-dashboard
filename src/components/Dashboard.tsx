'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Demand, Place, Trend, Region, Analysis } from '@/lib/types';
const NaverMap = dynamic(() => import('./NaverMap'), { ssr: false, loading: () => <div className="map-empty">지도를 불러오는 중입니다.</div> });
const TrendChart = dynamic(() => import('./TrendChart'), { ssr: false, loading: () => <p className="empty">차트를 불러오는 중입니다.</p> });
type Props = { demands: Demand[]; places: Place[]; trends: Trend[]; regions: Region[]; analyses: Analysis[] };
const number = (value: number | null | undefined) => value == null ? '—' : Number(value).toFixed(2);
export default function Dashboard({ demands, places, trends, regions, analyses }: Props) {
  const [region, setRegion] = useState('11');
  const [period, setPeriod] = useState('all');
  const [category, setCategory] = useState('전체');
  const codes = [...new Set(demands.map(d => d.region_code))].sort();
  const names = new Map(regions.map(r => [r.region_code, r.region_name]));
  const months = [...new Set([...demands.map(d => d.reference_date.slice(0, 7)), ...trends.map(t => t.reference_date.slice(0, 7))])].sort().reverse();
  const categories = ['전체', ...new Set(places.map(p => p.search_category))];
  const filteredDemands = demands.filter(d => d.region_code === region && (period === 'all' || d.reference_date.startsWith(period)));
  const latest = filteredDemands[0];
  const filteredPlaces = places.filter(p => p.region_code === region && (category === '전체' || p.search_category === category));
  const filteredTrends = trends.filter(t => period === 'all' || t.reference_date.startsWith(period));
  const analysis = analyses.find(a => a.region_code === region && (period === 'all' || a.analysis_date.startsWith(period)));
  const regionName = names.get(region) ?? (region === '11' ? '서울특별시' : region);
  return <main className="shell">
    <header className="page-header"><div><p className="eyebrow">TOURISM DATA DASHBOARD</p><h1>지역 관광 수요 탐색</h1><p className="intro">관광 수요와 검색 관심도, 대표 장소를 함께 살펴보세요.</p></div><span className="badge"><span />Supabase 데이터</span></header>
    <section className="filters" aria-label="데이터 필터"><label>지역<select value={region} onChange={e => setRegion(e.target.value)}>{codes.map(code => <option key={code} value={code}>{names.get(code) ?? (code === '11' ? '서울특별시' : code)}</option>)}</select></label><label>기간<select value={period} onChange={e => setPeriod(e.target.value)}><option value="all">전체 기간 · 최신 수요</option>{months.map(month => <option key={month} value={month}>{month}</option>)}</select></label><label>장소 카테고리<select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><p className="filter-note">검색 관심도는 전국 기준입니다.</p></section>
    <div className="section-heading"><h2>{regionName}</h2><span>관광 수요 기준 {latest?.reference_date.slice(0, 7) ?? '데이터 없음'}</span></div>
    <section className="kpis" aria-label="주요 지표"><article><p>최근 분석일</p><strong>{latest?.reference_date ?? '—'}</strong><small>관광공사 기준일</small></article><article><p>관광 체류 강도</p><strong>{number(latest?.stay_strength)}</strong><small>관광공사 지표</small></article><article><p>관광 소비 강도</p><strong>{number(latest?.consumption_strength)}</strong><small>관광공사 지표</small></article><article><p>대표 장소</p><strong>{filteredPlaces.length}<span>곳</span></strong><small>전체 장소 수가 아닌 검색 대표 결과</small></article></section>
    {!latest ? <p className="notice">선택한 기간에 이 지역의 관광 수요 데이터가 없습니다. 기준월을 확인해주세요.</p> : null}
    <section className="map-section"><article className="panel map-panel"><div className="panel-title"><div><p className="eyebrow">LOCAL PLACES</p><h2>대표 관광 장소 지도</h2></div><span>{filteredPlaces.length}개 마커</span></div><NaverMap places={filteredPlaces} /></article><aside className="panel places-panel"><div className="panel-title"><h2>대표 장소</h2><span>최대 5건 수집</span></div>{filteredPlaces.length ? <ol className="places">{filteredPlaces.map((place, i) => <li key={place.id}><span className="place-number">{i + 1}</span><div><h3>{place.source_link && /^https?:\/\//.test(place.source_link) ? <a href={place.source_link} target="_blank" rel="noreferrer">{place.name} ↗</a> : place.name}</h3><p>{place.category}</p><small>{place.road_address || place.address}</small></div></li>)}</ol> : <p className="empty">이 지역·카테고리의 대표 장소가 아직 수집되지 않았습니다.</p>}</aside></section>
    <section className="bottom-grid"><article className="panel"><div className="panel-title"><div><p className="eyebrow">NATIONWIDE INTEREST</p><h2>NAVER 검색 관심도</h2></div><span>상대 지수 0–100</span></div><TrendChart trends={filteredTrends} /><p className="footnote">전국 수준의 상대 검색 관심도이며 실제 검색 건수나 지역별 검색량을 뜻하지 않습니다.</p></article><article className="panel analysis"><div className="panel-title"><div><p className="eyebrow">AI REGION ANALYSIS</p><h2>AI 지역 분석</h2></div>{analysis ? <span>{analysis.analysis_date}</span> : null}</div>{analysis ? <><p className="summary">{analysis.summary}</p><h3>데이터 한계</h3><p>{analysis.limitations || '등록된 한계 설명이 없습니다.'}</p></> : <div className="empty"><strong>등록된 AI 요약이 없습니다.</strong><p>검증된 데이터로 생성해 저장한 요약을 이곳에 표시합니다.</p></div>}</article></section>
    <footer>출처: 한국관광공사 · NAVER Search Trend · NAVER Local　|　관광 수요와 검색 관심도의 기준 기간은 서로 다를 수 있습니다.</footer>
  </main>;
}
