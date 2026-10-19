'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { Place } from '@/lib/types';
type Position = object;
type MapHandle = { fitBounds(bounds: object): void };
type MarkerHandle = { setMap(map: MapHandle | null): void };
type Maps = {
  Map: new (container: HTMLElement, options: { center: Position; zoom: number }) => MapHandle;
  LatLng: new (lat: number, lng: number) => Position;
  LatLngBounds: new () => { extend(position: Position): void };
  Marker: new (options: { position: Position; map: MapHandle; title: string }) => MarkerHandle;
};
declare global { interface Window { naver?: { maps: Maps }; navermap_authFailure?: () => void } }
export default function NaverMap({ places }: { places: Place[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapHandle | null>(null);
  const markers = useRef<MarkerHandle[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const key = process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID;
  useEffect(() => {
    const onFailure = () => setError('지도 인증을 확인해주세요. 허용 Web Service URL과 지도 키를 확인하세요.');
    window.navermap_authFailure = onFailure;
    return () => { if (window.navermap_authFailure === onFailure) delete window.navermap_authFailure; };
  }, []);
  useEffect(() => {
    if (!ready || !window.naver?.maps || !container.current) return;
    const maps = window.naver.maps;
    if (!map.current) map.current = new maps.Map(container.current, { center: new maps.LatLng(37.5665, 126.978), zoom: 11 });
    const currentMap = map.current;
    markers.current.forEach(marker => marker.setMap(null));
    const bounds = new maps.LatLngBounds();
    const valid = places.filter(p => p.latitude != null && p.longitude != null && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180);
    markers.current = valid.map(place => {
      const position = new maps.LatLng(place.latitude!, place.longitude!);
      bounds.extend(position);
      return new maps.Marker({ position, map: currentMap, title: place.name });
    });
    if (valid.length > 1) currentMap.fitBounds(bounds);
    return () => { markers.current.forEach(marker => marker.setMap(null)); markers.current = []; };
  }, [places, ready]);
  if (!key) return <div className="map-empty"><strong>NAVER 지도 연결 준비 중</strong><p>지도 키 등록 후 저장된 대표 장소를 지도에 표시합니다.</p></div>;
  return <><Script src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(key)}`} strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setError('지도를 불러오지 못했습니다. 다시 시도해주세요.')} />{error ? <p className="notice" role="alert">{error}</p> : null}<div ref={container} className="map" aria-label="대표 관광 장소 지도" /></>;
}
