'use client';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Trend } from '@/lib/types';
const colors = ['#147866', '#387dcc', '#c47b32', '#9270bc'];
export default function TrendChart({ trends }: { trends: Trend[] }) {
  const keywords = [...new Set(trends.map(t => t.keyword))];
  const groups: Record<string, Record<string, string | number>> = {};
  for (const trend of trends) { const row = groups[trend.reference_date] ??= { date: trend.reference_date }; row[trend.keyword] = Number(trend.ratio); }
  const rows = Object.values(groups).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (!rows.length) return <p className="empty">해당 기간의 검색 관심도 데이터가 없습니다.</p>;
  return <div className="chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={rows} margin={{ top: 12, right: 16, left: -20, bottom: 8 }}><CartesianGrid stroke="#e4eae6" strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={v => String(v).slice(0, 7)} tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} /><Tooltip /><Legend />{keywords.map((keyword, i) => <Line key={keyword} dataKey={keyword} stroke={colors[i % colors.length]} strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />)}</LineChart></ResponsiveContainer></div>;
}
