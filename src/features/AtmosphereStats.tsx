import React from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { useJournal } from '../context/JournalContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ATMOSPHERE_EMOJIS: Record<string, string> = {
  Calm: '🧘', Energetic: '🏃', Joyful: '✨', Passionate: '🔥', 
  Harmonious: '🤝', Distracted: '🌀', Tense: '🤐', Tired: '🥱'
};

const ATMOSPHERE_LABELS: Record<string, string> = {
  Calm: '차분함', Energetic: '활기참', Joyful: '즐거움', Passionate: '열정적', 
  Harmonious: '화목함', Distracted: '산만함', Tense: '긴장됨', Tired: '피곤함'
};

const ATMOSPHERE_COLORS: Record<string, string> = {
  Calm: '#60a5fa', Energetic: '#f59e0b', Joyful: '#fbbf24', Passionate: '#ef4444',
  Harmonious: '#34d399', Distracted: '#9ca3af', Tense: '#6366f1', Tired: '#8b5cf6'
};

export const AtmosphereStats: React.FC = () => {
  const { records } = useJournal();

  // Filter records for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRecords = records
    .filter(r => new Date(r.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Statistics
  const statsMap = recentRecords.reduce((acc, curr) => {
    const atm = curr.atmosphere;
    acc[atm] = (acc[atm] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(ATMOSPHERE_LABELS).map(key => ({
    key,
    name: ATMOSPHERE_LABELS[key],
    emoji: ATMOSPHERE_EMOJIS[key],
    count: statsMap[key] || 0,
    color: ATMOSPHERE_COLORS[key]
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader title="최근 30일 교실 분위기" subtitle="우리 반의 분위기 흐름을 확인하세요" />
      <CardContent className="space-y-8">
        
        {/* 1. Frequency Chart */}
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }} 
                  width={60}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-gray-100 shadow-lg rounded-lg text-sm">
                          <p className="font-bold flex items-center gap-2">
                            <span className="text-lg">{data.emoji}</span>
                            {data.name}
                          </p>
                          <p className="text-gray-500">{data.count}회 기록됨</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              데이터가 충분하지 않습니다.
            </div>
          )}
        </div>

        {/* 2. Daily History Strip */}
        <div>
          <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">일별 기록</h4>
          <div className="flex flex-wrap gap-2">
            {recentRecords.map((record) => (
              <div 
                key={record.date}
                className="group relative flex flex-col items-center justify-center w-10 h-10 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md hover:scale-110 transition-all cursor-default border border-transparent hover:border-gray-100"
              >
                <span className="text-xl leading-none">
                  {ATMOSPHERE_EMOJIS[record.atmosphere]}
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg">
                    {record.date} ({ATMOSPHERE_LABELS[record.atmosphere]})
                  </div>
                </div>
              </div>
            ))}
            {recentRecords.length === 0 && (
              <p className="text-sm text-gray-400">최근 기록이 없습니다.</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
