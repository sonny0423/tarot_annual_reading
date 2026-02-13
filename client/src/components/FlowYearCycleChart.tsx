import { useMemo } from "react";

interface FlowYearCycleChartProps {
  birthMonth: number;
  birthDay: number;
  currentDate: Date;
}

export function FlowYearCycleChart({
  birthMonth,
  birthDay,
  currentDate,
}: FlowYearCycleChartProps) {
  const cycleData = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // 計算今年、去年、明年的生日
    const thisYearBirthday = new Date(currentYear, birthMonth - 1, birthDay);
    const lastYearBirthday = new Date(currentYear - 1, birthMonth - 1, birthDay);
    const nextYearBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);

    // 計算流年生理期（生日前4個月）
    const transitionStart = new Date(thisYearBirthday);
    transitionStart.setMonth(transitionStart.getMonth() - 4);

    // 計算流年高峰期（生日後6個月）
    const peakDate = new Date(thisYearBirthday);
    peakDate.setMonth(peakDate.getMonth() + 6);

    // 暴風圈範圍（高峰期前後各2個月）
    const stormStart = new Date(peakDate);
    stormStart.setMonth(stormStart.getMonth() - 2);
    const stormEnd = new Date(peakDate);
    stormEnd.setMonth(stormEnd.getMonth() + 2);

    // 計算當前日期在週期中的位置（0-1之間）
    const totalDays = (nextYearBirthday.getTime() - lastYearBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLastBirthday = (currentDate.getTime() - lastYearBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const currentPosition = daysSinceLastBirthday / totalDays;

    // 計算流年生理期在週期中的位置
    const transitionDays = (transitionStart.getTime() - lastYearBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const transitionPosition = transitionDays / totalDays;

    // 計算流年高峰期在週期中的位置
    const stormStartDays = (stormStart.getTime() - lastYearBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const stormEndDays = (stormEnd.getTime() - lastYearBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const stormStartPosition = stormStartDays / totalDays;
    const stormEndPosition = stormEndDays / totalDays;

    // 判斷當前處於哪個階段
    let currentPhase = "normal";
    if (currentDate >= transitionStart && currentDate < thisYearBirthday) {
      currentPhase = "transition";
    } else if (currentDate >= stormStart && currentDate <= stormEnd) {
      currentPhase = "peak";
    }

    return {
      lastYearBirthday,
      thisYearBirthday,
      nextYearBirthday,
      transitionStart,
      peakDate,
      stormStart,
      stormEnd,
      currentPosition,
      transitionPosition,
      stormStartPosition,
      stormEndPosition,
      currentPhase,
    };
  }, [birthMonth, birthDay, currentDate]);

  // SVG 尺寸
  const width = 800;
  const height = 200;
  const padding = 40;

  // 弧線參數
  const arcWidth = width - padding * 2;
  const arcHeight = 120;
  const centerY = height - 40;

  // 將位置（0-1）轉換為 SVG X 座標
  const positionToX = (position: number) => padding + position * arcWidth;

  // 計算弧線上的 Y 座標（使用拋物線）
  const positionToY = (position: number) => {
    // 使用二次函數創建弧線：y = -4h(x-0.5)^2 + centerY - h
    const normalizedX = position; // 0 到 1
    const h = arcHeight;
    return centerY - h * (1 - 4 * Math.pow(normalizedX - 0.5, 2));
  };

  // 生成弧線路徑
  const generateArcPath = (startPos: number, endPos: number) => {
    const points: string[] = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const pos = startPos + (endPos - startPos) * (i / steps);
      const x = positionToX(pos);
      const y = positionToY(pos);
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    return points.join(" ");
  };

  // 主弧線路徑
  const mainArcPath = generateArcPath(0, 1);

  // 流年生理期區域路徑（生日前4個月到生日）
  const transitionAreaPath = `
    ${generateArcPath(cycleData.transitionPosition, 0.5)}
    L ${positionToX(0.5)} ${centerY}
    L ${positionToX(cycleData.transitionPosition)} ${centerY}
    Z
  `;

  // 流年高峰期區域路徑（生日後6個月±2個月）
  const peakAreaPath = `
    ${generateArcPath(cycleData.stormStartPosition, cycleData.stormEndPosition)}
    L ${positionToX(cycleData.stormEndPosition)} ${centerY}
    L ${positionToX(cycleData.stormStartPosition)} ${centerY}
    Z
  `;

  // 當前位置的座標
  const currentX = positionToX(cycleData.currentPosition);
  const currentY = positionToY(cycleData.currentPosition);

  // 階段說明文字
  const phaseText = {
    transition: "流年生理期（醞釀期）",
    peak: "流年高峰期（暴風圈）",
    normal: "正常能量期",
  }[cycleData.currentPhase];

  const phaseColor = {
    transition: "#ef4444",
    peak: "#eab308",
    normal: "#8b5cf6",
  }[cycleData.currentPhase];

  return (
    <div className="w-full bg-white/50 rounded-lg p-6 mb-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">
          流年能量週期圖
        </h3>
        <p className="text-sm text-gray-600">
          當前階段：
          <span
            className="font-semibold ml-2"
            style={{ color: phaseColor }}
          >
            {phaseText}
          </span>
        </p>
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* 流年生理期區域（紅色） */}
        <path
          d={transitionAreaPath}
          fill="#fecaca"
          fillOpacity="0.6"
          stroke="none"
        />

        {/* 流年高峰期區域（黃色） */}
        <path
          d={peakAreaPath}
          fill="#fef08a"
          fillOpacity="0.6"
          stroke="none"
        />

        {/* 主弧線 */}
        <path
          d={mainArcPath}
          fill="none"
          stroke="#9333ea"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 去年生日標記 */}
        <g>
          <line
            x1={positionToX(0)}
            y1={centerY}
            x2={positionToX(0)}
            y2={centerY + 20}
            stroke="#6b7280"
            strokeWidth="2"
          />
          <text
            x={positionToX(0)}
            y={centerY + 35}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            去年生日
          </text>
        </g>

        {/* 今年生日標記 */}
        <g>
          <line
            x1={positionToX(0.5)}
            y1={positionToY(0.5)}
            x2={positionToX(0.5)}
            y2={centerY + 20}
            stroke="#9333ea"
            strokeWidth="3"
          />
          <text
            x={positionToX(0.5)}
            y={centerY + 35}
            textAnchor="middle"
            className="text-sm font-semibold fill-purple-900"
          >
            今年生日
          </text>
        </g>

        {/* 明年生日標記 */}
        <g>
          <line
            x1={positionToX(1)}
            y1={centerY}
            x2={positionToX(1)}
            y2={centerY + 20}
            stroke="#6b7280"
            strokeWidth="2"
          />
          <text
            x={positionToX(1)}
            y={centerY + 35}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            明年生日
          </text>
        </g>

        {/* 當前日期標記 */}
        <g>
          <circle
            cx={currentX}
            cy={currentY}
            r="8"
            fill={phaseColor}
            stroke="white"
            strokeWidth="2"
          />
          <line
            x1={currentX}
            y1={currentY}
            x2={currentX}
            y2={currentY - 30}
            stroke={phaseColor}
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <text
            x={currentX}
            y={currentY - 35}
            textAnchor="middle"
            className="text-xs font-semibold"
            fill={phaseColor}
          >
            今日
          </text>
        </g>
      </svg>

      {/* 圖例說明 */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span>流年生理期（生日前4個月）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span>流年高峰期（生日後6個月±2個月）</span>
        </div>
      </div>
    </div>
  );
}
