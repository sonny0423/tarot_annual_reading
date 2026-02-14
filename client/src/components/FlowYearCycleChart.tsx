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

    // 計算今年、去年、明年的生日
    const thisYearBirthday = new Date(currentYear, birthMonth - 1, birthDay);
    const lastYearBirthday = new Date(currentYear - 1, birthMonth - 1, birthDay);
    const nextYearBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);

    // 計算流年生理期（今年生日前4個月）
    const transitionStart = new Date(thisYearBirthday);
    transitionStart.setMonth(transitionStart.getMonth() - 4);

    // 計算流年高峰期（今年生日後6個月）
    const peakDate = new Date(thisYearBirthday);
    peakDate.setMonth(peakDate.getMonth() + 6);

    // 暴風圈範圍（高峰期前後各2個月）
    const stormStart = new Date(peakDate);
    stormStart.setMonth(stormStart.getMonth() - 2);
    const stormEnd = new Date(peakDate);
    stormEnd.setMonth(stormEnd.getMonth() + 2);

    // 計算當前日期在整個週期中的位置（0-1之間）
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
  const width = 1000;
  const height = 300;
  const padding = 50;

  // 兩個弧線的參數
  const arcWidth = (width - padding * 2) / 2; // 每個弧線佔一半寬度
  const arcHeight = 150;
  const baseY = height - 60;

  // 第一個弧線：去年生日到今年生日（0-0.5）
  const arc1StartX = padding;
  const arc1EndX = padding + arcWidth;
  const arc1ControlX = arc1StartX + arcWidth / 2;
  const arc1ControlY = baseY - arcHeight;

  // 第二個弧線：今年生日到明年生日（0.5-1）
  const arc2StartX = arc1EndX;
  const arc2EndX = width - padding;
  const arc2ControlX = arc2StartX + arcWidth / 2;
  const arc2ControlY = baseY - arcHeight;

  // 計算貝塞爾曲線上的點
  const getBezierPoint = (t: number, p0: [number, number], p1: [number, number], p2: [number, number]): [number, number] => {
    const x = Math.pow(1 - t, 2) * p0[0] + 2 * (1 - t) * t * p1[0] + Math.pow(t, 2) * p2[0];
    const y = Math.pow(1 - t, 2) * p0[1] + 2 * (1 - t) * t * p1[1] + Math.pow(t, 2) * p2[1];
    return [x, y];
  };

  // 將整體位置（0-1）轉換為具體座標
  const getPositionCoordinates = (position: number): [number, number] => {
    if (position <= 0.5) {
      // 在第一個弧線上
      const t = position * 2; // 將 0-0.5 映射到 0-1
      return getBezierPoint(t, [arc1StartX, baseY], [arc1ControlX, arc1ControlY], [arc1EndX, baseY]);
    } else {
      // 在第二個弧線上
      const t = (position - 0.5) * 2; // 將 0.5-1 映射到 0-1
      return getBezierPoint(t, [arc2StartX, baseY], [arc2ControlX, arc2ControlY], [arc2EndX, baseY]);
    }
  };

  // 生成弧線路徑
  const generateArcPath = (startPos: number, endPos: number) => {
    const points: string[] = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const pos = startPos + (endPos - startPos) * (i / steps);
      const [x, y] = getPositionCoordinates(pos);
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    return points.join(" ");
  };

  // 第一個弧線路徑（去年生日到今年生日）
  const arc1Path = generateArcPath(0, 0.5);

  // 第二個弧線路徑（今年生日到明年生日）
  const arc2Path = generateArcPath(0.5, 1);

  // 流年生理期區域路徑（今年生日前4個月到今年生日，在第一個弧線上）
  const transitionAreaPath = `
    ${generateArcPath(cycleData.transitionPosition, 0.5)}
    L ${arc1EndX} ${baseY}
    L ${getPositionCoordinates(cycleData.transitionPosition)[0]} ${baseY}
    Z
  `;

  // 流年高峰期區域路徑（今年生日後6個月±2個月，在第二個弧線上）
  const peakAreaPath = `
    ${generateArcPath(cycleData.stormStartPosition, cycleData.stormEndPosition)}
    L ${getPositionCoordinates(cycleData.stormEndPosition)[0]} ${baseY}
    L ${getPositionCoordinates(cycleData.stormStartPosition)[0]} ${baseY}
    Z
  `;

  // 當前位置的座標
  const [currentX, currentY] = getPositionCoordinates(cycleData.currentPosition);

  // 格式化日期為 MM/DD
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

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

  // 定義斜線填充圖案
  const redStripesPattern = (
    <pattern id="redStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="3" />
    </pattern>
  );

  const yellowStripesPattern = (
    <pattern id="yellowStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#eab308" strokeWidth="3" />
    </pattern>
  );

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
        <defs>
          {redStripesPattern}
          {yellowStripesPattern}
        </defs>

        {/* 流年生理期區域（紅色，在第一個弧線上） */}
        <path
          d={transitionAreaPath}
          fill="url(#redStripes)"
          fillOpacity="0.3"
          stroke="none"
        />

        {/* 流年高峰期區域（黃色，在第二個弧線上） */}
        <path
          d={peakAreaPath}
          fill="url(#yellowStripes)"
          fillOpacity="0.3"
          stroke="none"
        />

        {/* 第一個弧線（去年生日到今年生日） */}
        <path
          d={arc1Path}
          fill="none"
          stroke="#9333ea"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 第二個弧線（今年生日到明年生日） */}
        <path
          d={arc2Path}
          fill="none"
          stroke="#9333ea"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 去年生日標記 */}
        <g>
          <line
            x1={arc1StartX}
            y1={baseY}
            x2={arc1StartX}
            y2={baseY + 25}
            stroke="#6b7280"
            strokeWidth="2"
          />
          <text
            x={arc1StartX}
            y={baseY + 40}
            textAnchor="middle"
            className="text-xs fill-gray-600 font-medium"
          >
            去年生日
          </text>
          <text
            x={arc1StartX}
            y={baseY + 52}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {formatDate(cycleData.lastYearBirthday)}
          </text>
        </g>

        {/* 今年生日標記（兩個弧線的連接點） */}
        <g>
          <circle
            cx={arc1EndX}
            cy={baseY}
            r="6"
            fill="#9333ea"
            stroke="white"
            strokeWidth="2"
          />
          <line
            x1={arc1EndX}
            y1={baseY}
            x2={arc1EndX}
            y2={baseY + 25}
            stroke="#9333ea"
            strokeWidth="3"
          />
          <text
            x={arc1EndX}
            y={baseY + 40}
            textAnchor="middle"
            className="text-sm font-semibold fill-purple-900"
          >
            今年生日
          </text>
          <text
            x={arc1EndX}
            y={baseY + 54}
            textAnchor="middle"
            className="text-xs fill-purple-700 font-medium"
          >
            {formatDate(cycleData.thisYearBirthday)}
          </text>
        </g>

        {/* 明年生日標記 */}
        <g>
          <line
            x1={arc2EndX}
            y1={baseY}
            x2={arc2EndX}
            y2={baseY + 25}
            stroke="#6b7280"
            strokeWidth="2"
          />
          <text
            x={arc2EndX}
            y={baseY + 40}
            textAnchor="middle"
            className="text-xs fill-gray-600 font-medium"
          >
            明年生日
          </text>
          <text
            x={arc2EndX}
            y={baseY + 52}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {formatDate(cycleData.nextYearBirthday)}
          </text>
        </g>

        {/* 流年生理期起始標記 */}
        <g>
          {(() => {
            const [transX, transY] = getPositionCoordinates(cycleData.transitionPosition);
            return (
              <>
                <circle
                  cx={transX}
                  cy={transY}
                  r="4"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <line
                  x1={transX}
                  y1={transY}
                  x2={transX}
                  y2={transY - 20}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <text
                  x={transX}
                  y={transY - 25}
                  textAnchor="middle"
                  className="text-xs fill-red-600 font-medium"
                >
                  生理期起始
                </text>
                <text
                  x={transX}
                  y={transY - 13}
                  textAnchor="middle"
                  className="text-xs fill-red-500"
                >
                  {formatDate(cycleData.transitionStart)}
                </text>
              </>
            );
          })()}
        </g>

        {/* 流年高峰期標記（前2個月） */}
        <g>
          {(() => {
            const [stormStartX, stormStartY] = getPositionCoordinates(cycleData.stormStartPosition);
            return (
              <>
                <circle
                  cx={stormStartX}
                  cy={stormStartY}
                  r="3"
                  fill="#eab308"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <text
                  x={stormStartX}
                  y={stormStartY + 18}
                  textAnchor="middle"
                  className="text-xs fill-yellow-600"
                >
                  {formatDate(cycleData.stormStart)}
                </text>
              </>
            );
          })()}
        </g>

        {/* 流年高峰期最高峰標記（生日後6個月） */}
        <g>
          {(() => {
            const peakPosition = 0.5 + (6 / 12) * 0.5; // 今年生日後6個月
            const [peakX, peakY] = getPositionCoordinates(peakPosition);
            return (
              <>
                <circle
                  cx={peakX}
                  cy={peakY}
                  r="5"
                  fill="#eab308"
                  stroke="white"
                  strokeWidth="2"
                />
                <line
                  x1={peakX}
                  y1={peakY}
                  x2={peakX}
                  y2={peakY - 25}
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                />
                <text
                  x={peakX}
                  y={peakY - 30}
                  textAnchor="middle"
                  className="text-xs fill-yellow-700 font-semibold"
                >
                  高峰期最高峰
                </text>
                <text
                  x={peakX}
                  y={peakY - 18}
                  textAnchor="middle"
                  className="text-xs fill-yellow-600"
                >
                  {formatDate(cycleData.peakDate)}
                </text>
              </>
            );
          })()}
        </g>

        {/* 流年高峰期標記（後2個月） */}
        <g>
          {(() => {
            const [stormEndX, stormEndY] = getPositionCoordinates(cycleData.stormEndPosition);
            return (
              <>
                <circle
                  cx={stormEndX}
                  cy={stormEndY}
                  r="3"
                  fill="#eab308"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <text
                  x={stormEndX}
                  y={stormEndY + 18}
                  textAnchor="middle"
                  className="text-xs fill-yellow-600"
                >
                  {formatDate(cycleData.stormEnd)}
                </text>
              </>
            );
          })()}
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
            y2={currentY - 35}
            stroke={phaseColor}
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <text
            x={currentX}
            y={currentY - 40}
            textAnchor="middle"
            className="text-xs font-semibold"
            fill={phaseColor}
          >
            今日
          </text>
          <text
            x={currentX}
            y={currentY - 28}
            textAnchor="middle"
            className="text-xs"
            fill={phaseColor}
          >
            {formatDate(currentDate)}
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
