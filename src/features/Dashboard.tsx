import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TodoListManager } from './TodoListManager';
import { AtmosphereStats } from './AtmosphereStats';

const COLORS = {
  Present: '#16a34a',
  Absent: '#dc2626',
  Late: '#ca8a04',
  'Early Leave': '#2563eb'
};

const WEATHER_EMOJIS: Record<string, string> = {
  Sunny: '☀️', Cloudy: '☁️', Rainy: '☔', Snowy: '❄️', Windy: '🌬️', Stormy: '⚡', Foggy: '🌫️'
};

const ATMOSPHERE_EMOJIS: Record<string, string> = {
  Calm: '🧘', Energetic: '🏃', Joyful: '✨', Passionate: '🔥', Harmonious: '🤝', Distracted: '🌀', Tense: '🤐', Tired: '🥱'
};

const ATMOSPHERE_LABELS: Record<string, string> = {
  Calm: '차분함', Energetic: '활기참', Joyful: '즐거움', Passionate: '열정적', Harmonious: '화목함', Distracted: '산만함', Tense: '긴장됨', Tired: '피곤함'
};

export const Dashboard: React.FC = () => {
  const { records, students, currentDate } = useJournal();

  // Find record for current date
  const currentRecord = records.find(r => r.date === currentDate);
  
  const attendanceData = currentRecord ? [
    { name: '출석', value: currentRecord.attendance.filter(a => a.status === 'Present').length, color: COLORS.Present },
    { name: '결석', value: currentRecord.attendance.filter(a => a.status === 'Absent').length, color: COLORS.Absent },
    { name: '지각', value: currentRecord.attendance.filter(a => a.status === 'Late').length, color: COLORS.Late },
    { name: '조퇴', value: currentRecord.attendance.filter(a => a.status === 'Early Leave').length, color: COLORS['Early Leave'] },
  ].filter(d => d.value > 0) : [];

  // Weekly attendance trend (up to current date, max 7 days)
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const currentIndex = sortedRecords.findIndex(r => r.date === currentDate);
  
  // If current date exists, take up to 7 records ending at current date
  // If not, take up to 7 records ending at the last available date before current date
  let last7DaysRecords = [];
  
  if (currentIndex !== -1) {
    last7DaysRecords = sortedRecords.slice(Math.max(0, currentIndex - 6), currentIndex + 1);
  } else {
     const pastRecords = sortedRecords.filter(r => new Date(r.date) <= new Date(currentDate));
     last7DaysRecords = pastRecords.slice(-7);
  }

  const last7Days = last7DaysRecords.map(r => ({
    date: r.date.slice(5), // MM-DD
    present: r.attendance.filter(a => a.status === 'Present').length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="오늘의 출결 현황" subtitle={currentDate} />
          <CardContent className="h-64">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                기록된 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="최근 출석 인원 추이" subtitle="선택 날짜 기준 최근 7회" />
          <CardContent className="h-64">
            {last7Days.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={[0, students.length]} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="출석 인원" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                기록된 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Atmosphere Stats Component */}
      <AtmosphereStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="오늘의 요약" />
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="text-3xl">{currentRecord ? WEATHER_EMOJIS[currentRecord.weather] : '❓'}</div>
                <div>
                  <p className="text-xs text-blue-500 font-bold uppercase">날씨</p>
                  <p className="text-lg font-bold text-blue-900">{currentRecord ? currentRecord.weather : '기록 없음'}</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                <div className="text-3xl">{currentRecord ? ATMOSPHERE_EMOJIS[currentRecord.atmosphere] : '❓'}</div>
                <div>
                  <p className="text-xs text-purple-500 font-bold uppercase">분위기</p>
                  <p className="text-lg font-bold text-purple-900">{currentRecord ? ATMOSPHERE_LABELS[currentRecord.atmosphere] : '기록 없음'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">총 학생 수</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}명</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">누적 기록</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}개</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <TodoListManager />
      </div>
    </div>
  );
};