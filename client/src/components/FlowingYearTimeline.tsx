import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

interface TimelineData {
  lastYearBirthday: Date;
  thisYearBirthday: Date;
  nextYearBirthday: Date;
  physiologicalPeriodStart: Date;
  peakPeriod: Date;
  stormCircleStart: Date;
  stormCircleEnd: Date;
  currentDate: Date;
  currentPosition: number; // 0-100，表示當前位置在時間軸上的百分比
  isInPhysiologicalPeriod: boolean;
  isInPeakPeriod: boolean;
  isInStormCircle: boolean;
}

interface FlowingYearTimelineProps {
  birthDate: Date;
  currentDate: Date;
}

function calculateTimelineData(birthDate: Date, currentDate: Date): TimelineData {
  const birthMonth = birthDate.getMonth() + 1; // 1-12
  const birthDay = birthDate.getDate();
  const currentYear = currentDate.getFullYear();
  
  // 計算去年、今年、明年生日
  const lastYearBirthday = new Date(currentYear - 1, birthMonth - 1, birthDay);
  const thisYearBirthday = new Date(currentYear, birthMonth - 1, birthDay);
  const nextYearBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
  
  // 計算生理期起始（生日前4個月）
  let physioMonth = birthMonth - 4;
  let physioYear = currentYear;
  if (physioMonth <= 0) {
    physioMonth += 12;
    physioYear -= 1;
  }
  const physiologicalPeriodStart = new Date(physioYear, physioMonth - 1, birthDay);
  
  // 計算高峰期（生日後6個月）
  let peakMonth = birthMonth + 6;
  let peakYear = currentYear;
  if (peakMonth > 12) {
    peakMonth -= 12;
    peakYear += 1;
  }
  const peakPeriod = new Date(peakYear, peakMonth - 1, birthDay);
  
  // 計算暴風圈範圍（高峰期前後2個月）
  let stormStartMonth = peakMonth - 2;
  let stormStartYear = peakYear;
  if (stormStartMonth <= 0) {
    stormStartMonth += 12;
    stormStartYear -= 1;
  }
  const stormCircleStart = new Date(stormStartYear, stormStartMonth - 1, birthDay);
  
  let stormEndMonth = peakMonth + 2;
  let stormEndYear = peakYear;
  if (stormEndMonth > 12) {
    stormEndMonth -= 12;
    stormEndYear += 1;
  }
  const stormCircleEnd = new Date(stormEndYear, stormEndMonth - 1, birthDay);
  
  // 計算當前位置（從去年生日到明年生日的百分比）
  const totalDuration = nextYearBirthday.getTime() - lastYearBirthday.getTime();
  const currentDuration = currentDate.getTime() - lastYearBirthday.getTime();
  const currentPosition = (currentDuration / totalDuration) * 100;
  
  // 判斷當前是否在各個階段
  const isInPhysiologicalPeriod = currentDate >= physiologicalPeriodStart && currentDate < thisYearBirthday;
  const isInPeakPeriod = Math.abs(currentDate.getTime() - peakPeriod.getTime()) <= 30 * 24 * 60 * 60 * 1000; // ±1個月
  const isInStormCircle = currentDate >= stormCircleStart && currentDate <= stormCircleEnd;
  
  return {
    lastYearBirthday,
    thisYearBirthday,
    nextYearBirthday,
    physiologicalPeriodStart,
    peakPeriod,
    stormCircleStart,
    stormCircleEnd,
    currentDate,
    currentPosition,
    isInPhysiologicalPeriod,
    isInPeakPeriod,
    isInStormCircle,
  };
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function FlowingYearTimeline({ birthDate, currentDate }: FlowingYearTimelineProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const timelineData = calculateTimelineData(birthDate, currentDate);
  
  const stageInfo: Record<string, { title: string; description: string; color: string }> = {
    physiological: {
      title: '流年生理期',
      description: '從生日前4個月開始，下一個流年能量開始醞釀。這是一個過渡期，適合提前準備和規劃，為即將到來的新流年週期做好心理和實際的準備。',
      color: 'bg-red-100 border-red-300',
    },
    peak: {
      title: '流年高峰期',
      description: '生日後6個月，流年能量達到最高峰。這是流年影響力最強的時期，適合做出關鍵決策和採取重要行動。您的流年牌義在此時期表現最為明顯。',
      color: 'bg-yellow-100 border-yellow-300',
    },
    storm: {
      title: '暴風圈',
      description: '高峰期前後2個月（共4個月），流年能量影響最強烈。在這段時間內，您可能經歷重大變化、挑戰或轉折點。建議保持警覺，積極應對變化。',
      color: 'bg-red-100 border-red-300',
    },
  };
  
  // 計算各階段在時間軸上的位置（百分比）
  const totalDuration = timelineData.nextYearBirthday.getTime() - timelineData.lastYearBirthday.getTime();
  
  const physioStart = ((timelineData.physiologicalPeriodStart.getTime() - timelineData.lastYearBirthday.getTime()) / totalDuration) * 100;
  const physioEnd = ((timelineData.thisYearBirthday.getTime() - timelineData.lastYearBirthday.getTime()) / totalDuration) * 100;
  
  const stormStart = ((timelineData.stormCircleStart.getTime() - timelineData.lastYearBirthday.getTime()) / totalDuration) * 100;
  const stormEnd = ((timelineData.stormCircleEnd.getTime() - timelineData.lastYearBirthday.getTime()) / totalDuration) * 100;
  
  const peakPos = ((timelineData.peakPeriod.getTime() - timelineData.lastYearBirthday.getTime()) / totalDuration) * 100;
  
  return (
    <>
      <Card className="p-4 mb-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="mb-3">
          <h3 className="text-lg font-serif font-semibold text-purple-900 mb-1">流年能量週期</h3>
          <p className="text-sm text-gray-600">
            流年能量並非在生日當天突然切換，而是有一個漸進的週期。點擊下方標記查看各階段說明。
          </p>
        </div>
        
        {/* 時間軸容器 */}
        <div className="relative w-full h-24 mb-4">
          {/* 主時間軸線 */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2" />
          
          {/* 生理期區域 */}
          {physioStart >= 0 && physioEnd <= 100 && (
            <button
              onClick={() => setSelectedStage('physiological')}
              className="absolute top-1/2 h-3 bg-red-300 hover:bg-red-400 rounded-full transform -translate-y-1/2 transition-colors cursor-pointer"
              style={{
                left: `${Math.max(0, physioStart)}%`,
                width: `${Math.min(100, physioEnd) - Math.max(0, physioStart)}%`,
              }}
              aria-label="流年生理期"
            />
          )}
          
          {/* 暴風圈區域 */}
          {stormStart >= 0 && stormEnd <= 100 && (
            <button
              onClick={() => setSelectedStage('storm')}
              className="absolute top-1/2 h-4 rounded-full transform -translate-y-1/2 transition-colors cursor-pointer"
              style={{
                left: `${Math.max(0, stormStart)}%`,
                width: `${Math.min(100, stormEnd) - Math.max(0, stormStart)}%`,
                backgroundColor: '#eee191',
              }}
              aria-label="暴風圈"
            />
          )}
          
          {/* 高峰期標記 */}
          {peakPos >= 0 && peakPos <= 100 && (
            <button
              onClick={() => setSelectedStage('peak')}
              className="absolute top-1/2 w-6 h-6 bg-yellow-400 hover:bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-colors cursor-pointer flex items-center justify-center text-white text-xs font-bold"
              style={{ left: `${peakPos}%` }}
              aria-label="流年高峰期"
            >
              ★
            </button>
          )}
          
          {/* 去年生日標記 */}
          <div className="absolute top-1/2 left-0 w-3 h-3 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-full left-0 transform -translate-x-1/2 mt-2 text-xs text-gray-600 whitespace-nowrap">
            去年生日<br />{formatShortDate(timelineData.lastYearBirthday)}
          </div>
          
          {/* 今年生日標記 */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-semibold text-purple-900 whitespace-nowrap">
            今年生日<br />{formatShortDate(timelineData.thisYearBirthday)}
          </div>
          
          {/* 明年生日標記 */}
          <div className="absolute top-1/2 right-0 w-3 h-3 bg-gray-400 rounded-full transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-full right-0 transform translate-x-1/2 mt-2 text-xs text-gray-600 whitespace-nowrap">
            明年生日<br />{formatShortDate(timelineData.nextYearBirthday)}
          </div>
          
          {/* 當前位置標記 */}
          {timelineData.currentPosition >= 0 && timelineData.currentPosition <= 100 && (
            <>
              <div
                className="absolute top-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ left: `${timelineData.currentPosition}%` }}
              />
              <div
                className="absolute bottom-full transform -translate-x-1/2 mb-2 text-xs font-semibold text-red-600 whitespace-nowrap"
                style={{ left: `${timelineData.currentPosition}%` }}
              >
                今日<br />{formatShortDate(timelineData.currentDate)}
              </div>
            </>
          )}
        </div>
        
        {/* 當前狀態提示 */}
        <div className="flex flex-wrap gap-2 text-sm">
          {timelineData.isInPhysiologicalPeriod && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">
              🌱 目前處於生理期
            </span>
          )}
          {timelineData.isInStormCircle && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">
              ⚡ 目前處於暴風圈
            </span>
          )}
          {timelineData.isInPeakPeriod && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              ⭐ 接近高峰期
            </span>
          )}
          {!timelineData.isInPhysiologicalPeriod && !timelineData.isInStormCircle && !timelineData.isInPeakPeriod && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
              ✨ 平穩期
            </span>
          )}
        </div>
      </Card>
      
      {/* 階段說明對話框 */}
      <Dialog open={selectedStage !== null} onOpenChange={() => setSelectedStage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {selectedStage && stageInfo[selectedStage]?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {selectedStage && stageInfo[selectedStage]?.description}
            </p>
            {selectedStage === 'physiological' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-900">
                  <strong>起始日期：</strong>{formatDate(timelineData.physiologicalPeriodStart)}<br />
                  <strong>結束日期：</strong>{formatDate(timelineData.thisYearBirthday)}
                </p>
              </div>
            )}
            {selectedStage === 'peak' && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-900">
                  <strong>高峰日期：</strong>{formatDate(timelineData.peakPeriod)}
                </p>
              </div>
            )}
            {selectedStage === 'storm' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-900">
                  <strong>起始日期：</strong>{formatDate(timelineData.stormCircleStart)}<br />
                  <strong>結束日期：</strong>{formatDate(timelineData.stormCircleEnd)}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
