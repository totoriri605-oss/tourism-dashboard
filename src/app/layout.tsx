import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '지역 관광 수요 Dashboard', description: '관광 수요 강도와 대표 장소, NAVER 검색 관심도' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
