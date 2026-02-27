import { useMemo, useState, useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  // 監聽容器寬度變化
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 根據容器寬度決定顯示模式
  const responsiveMode = useMemo(() => {
    if (containerWidth >= 768) return "desktop";
    if (containerWidth >= 640) return "tablet";
    if (containerWidth >= 400) return "mobile";
    return "compact";
  }, [containerWidth]);

  const cycleData = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    
    // 找到最近的生日（可能是去年或今年）
    const thisYearBirthday = new Date(currentYear, birthMonth - 1, birthDay);
    const lastYearBirthday = new Date(currentYear - 1, birthMonth - 1, birthDay);
    
    // 決定以哪個生日為基準點
    const referenceBirthday = currentDate >= thisYearBirthday ? thisYearBirthday : lastYearBirthday;

    // 計算流年生理期起始（基準生日前4個月）
    const transitionStart = new Date(referenceBirthday);
    transitionStart.setMonth(transitionStart.getMonth() - 4);

    // 計算流年高峰期結束（基準生日後8個月）
    const peakEnd = new Date(referenceBirthday);
    peakEnd.setMonth(peakEnd.getMonth() + 8);

    // 判斷顯示模式：決定顯示哪三個生日年份
    let displayMode: 'current' | 'previous' | 'next';
    let leftBirthday: Date;
    let centerBirthday: Date;
    let rightBirthday: Date;

    if (currentDate < transitionStart) {
      // 規則2：今日在流年生理期之前 → 顯示前年/去年/今年
      displayMode = 'previous';
      const refYear = referenceBirthday.getFullYear();
      leftBirthday = new Date(refYear - 1, birthMonth - 1, birthDay);
      centerBirthday = new Date(refYear, birthMonth - 1, birthDay);
      rightBirthday = new Date(refYear + 1, birthMonth - 1, birthDay);
    } else if (currentDate > peakEnd) {
      // 規則3：今日在流年高峰期之後 → 顯示今年/明年/後年
      displayMode = 'next';
      const refYear = referenceBirthday.getFullYear();
      leftBirthday = new Date(refYear, birthMonth - 1, birthDay);
      centerBirthday = new Date(refYear + 1, birthMonth - 1, birthDay);
      rightBirthday = new Date(refYear + 2, birthMonth - 1, birthDay);
    } else {
      // 規則1：今日在流年生理期至高峰期之間 → 顯示去年/今年/明年
      displayMode = 'current';
      const refYear = referenceBirthday.getFullYear();
      leftBirthday = new Date(refYear - 1, birthMonth - 1, birthDay);
      centerBirthday = new Date(refYear, birthMonth - 1, birthDay);
      rightBirthday = new Date(refYear + 1, birthMonth - 1, birthDay);
    }

    // 基於中間生日（centerBirthday）計算流年關鍵期
    const centerTransitionStart = new Date(centerBirthday);
    centerTransitionStart.setMonth(centerTransitionStart.getMonth() - 4);

    const centerPeakDate = new Date(centerBirthday);
    centerPeakDate.setMonth(centerPeakDate.getMonth() + 6);

    const centerStormStart = new Date(centerPeakDate);
    centerStormStart.setMonth(centerStormStart.getMonth() - 2);
    
    const centerStormEnd = new Date(centerPeakDate);
    centerStormEnd.setMonth(centerStormEnd.getMonth() + 2);

    // 計算當前日期在整個週期中的位置（0-1之間）
    const totalDays = (rightBirthday.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLeftBirthday = (currentDate.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const currentPosition = daysSinceLeftBirthday / totalDays;

    // 計算流年生理期在週期中的位置
    const transitionDays = (centerTransitionStart.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const transitionPosition = transitionDays / totalDays;

    // 計算流年高峰期在週期中的位置
    const peakDays = (centerPeakDate.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const peakPosition = peakDays / totalDays;

    const stormStartDays = (centerStormStart.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const stormEndDays = (centerStormEnd.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const stormStartPosition = stormStartDays / totalDays;
    const stormEndPosition = stormEndDays / totalDays;

    // 判斷當前處於哪個階段
    let currentPhase = "normal";
    if (currentDate >= centerTransitionStart && currentDate < centerBirthday) {
      currentPhase = "transition";
    } else if (currentDate >= centerStormStart && currentDate <= centerStormEnd) {
      currentPhase = "peak";
    }

    return {
      displayMode,
      leftBirthday,
      centerBirthday,
      rightBirthday,
      transitionStart: centerTransitionStart,
      peakDate: centerPeakDate,
      stormStart: centerStormStart,
      stormEnd: centerStormEnd,
      currentPosition,
      transitionPosition,
      peakPosition,
      stormStartPosition,
      stormEndPosition,
      currentPhase,
    };
  }, [birthMonth, birthDay, currentDate]);

  // 響應式SVG尺寸參數
  const svgParams = useMemo(() => {
    switch (responsiveMode) {
      case "desktop":
        return {
          width: 1000,
          height: 350,
          padding: 50,
          arcHeight: 180,
          fontSize: { xs: 11, sm: 13, md: 15 },
          showAllLabels: true,
        };
      case "tablet":
        return {
          width: 900,
          height: 330,
          padding: 40,
          arcHeight: 160,
          fontSize: { xs: 10, sm: 12, md: 14 },
          showAllLabels: true,
        };
      case "mobile":
        return {
          width: 800,
          height: 650,
          padding: 30,
          arcHeight: 360,
          fontSize: { xs: 16, sm: 18, md: 20 },
          showAllLabels: false,
        };
      case "compact":
        return {
          width: 700,
          height: 600,
          padding: 20,
          arcHeight: 320,
          fontSize: { xs: 14, sm: 16, md: 18 },
          showAllLabels: false,
        };
    }
  }, [responsiveMode]);

  const { width, height, padding, arcHeight, fontSize, showAllLabels } = svgParams;

  // 兩個弧線的參數
  const arcWidth = (width - padding * 2) / 2;
  const baseY = responsiveMode === "mobile" || responsiveMode === "compact" ? height - 150 : height - 120; // 增加底部空間以容納日期標註

  // 第一個弧線：左生日到中間生日（0-0.5）
  const arc1StartX = padding;
  const arc1EndX = padding + arcWidth;
  const arc1ControlX = arc1StartX + arcWidth / 2;
  const arc1ControlY = baseY - arcHeight;

  // 第二個弧線：中間生日到右生日（0.5-1）
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
      const t = position * 2;
      return getBezierPoint(t, [arc1StartX, baseY], [arc1ControlX, arc1ControlY], [arc1EndX, baseY]);
    } else {
      const t = (position - 0.5) * 2;
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

  // 弧線路徑
  const arc1Path = generateArcPath(0, 0.5);
  const arc2Path = generateArcPath(0.5, 1);

  // 流年生理期區域路徑
  const transitionAreaPath = `
    ${generateArcPath(cycleData.transitionPosition, 0.5)}
    L ${arc1EndX} ${baseY}
    L ${getPositionCoordinates(cycleData.transitionPosition)[0]} ${baseY}
    Z
  `;

  // 流年高峰期區域路徑
  const peakAreaPath = `
    ${generateArcPath(cycleData.stormStartPosition, cycleData.stormEndPosition)}
    L ${getPositionCoordinates(cycleData.stormEndPosition)[0]} ${baseY}
    L ${getPositionCoordinates(cycleData.stormStartPosition)[0]} ${baseY}
    Z
  `;

  // 當前位置的座標
  const [currentX, currentY] = getPositionCoordinates(cycleData.currentPosition);

  // 格式化日期（加上年份）
  const formatDateWithYear = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}`;
  };

  // 格式化日期（僅月日）
  const formatDateShort = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // 階段說明
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

  // 計算水平軸上的日期標註位置
  const timelineY = baseY + 40;
  const [transX] = getPositionCoordinates(cycleData.transitionPosition);
  const [peakX] = getPositionCoordinates(cycleData.peakPosition);
  const [stormStartX] = getPositionCoordinates(cycleData.stormStartPosition);
  const [stormEndX] = getPositionCoordinates(cycleData.stormEndPosition);

  return (
    <div ref={containerRef} className="w-full bg-white/50 rounded-lg p-2 sm:p-4 mb-4">
      <div className="text-center mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-1">
          流年能量週期圖
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          當前階段：
          <span className="font-semibold ml-2" style={{ color: phaseColor }}>
            {phaseText}
          </span>
        </p>
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        style={{ maxHeight: responsiveMode === "compact" ? "350px" : responsiveMode === "mobile" ? "320px" : "auto" }}
      >
        <defs>
          {redStripesPattern}
          {yellowStripesPattern}
        </defs>

        {/* 流年生理期區域 */}
        <path d={transitionAreaPath} fill="url(#redStripes)" fillOpacity="0.3" stroke="none" />

        {/* 流年高峰期區域 */}
        <path d={peakAreaPath} fill="url(#yellowStripes)" fillOpacity="0.3" stroke="none" />

        {/* 第一個弧線 */}
        <path d={arc1Path} fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />

        {/* 第二個弧線 */}
        <path d={arc2Path} fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />

        {/* 水平時間軸 */}
        <line x1={arc1StartX} y1={timelineY} x2={arc2EndX} y2={timelineY} stroke="#d1d5db" strokeWidth="2" />

        {/* 左生日標記 */}
        <g>
          <circle cx={arc1StartX} cy={baseY} r="4" fill="#6b7280" stroke="white" strokeWidth="1.5" />
          <line x1={arc1StartX} y1={baseY} x2={arc1StartX} y2={timelineY} stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={arc1StartX} cy={timelineY} r="3" fill="#6b7280" />
          <text x={arc1StartX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#6b7280" fontWeight="500">
            {cycleData.leftBirthday.getFullYear()}年生日
          </text>
          <text x={arc1StartX} y={timelineY + 27} textAnchor="middle" fontSize={fontSize.xs} fill="#9ca3af">
            {formatDateShort(cycleData.leftBirthday)}
          </text>
        </g>

        {/* 中間生日標記 */}
        <g>
          <circle cx={arc1EndX} cy={baseY} r="6" fill="#9333ea" stroke="white" strokeWidth="2" />
          <line x1={arc1EndX} y1={baseY} x2={arc1EndX} y2={timelineY} stroke="#9333ea" strokeWidth="2" />
          <circle cx={arc1EndX} cy={timelineY} r="4" fill="#9333ea" />
          <text x={arc1EndX} y={timelineY + 16} textAnchor="middle" fontSize={fontSize.sm} fill="#7c3aed" fontWeight="600">
            {cycleData.centerBirthday.getFullYear()}年生日
          </text>
          <text x={arc1EndX} y={timelineY + 29} textAnchor="middle" fontSize={fontSize.xs} fill="#9333ea" fontWeight="500">
            {formatDateShort(cycleData.centerBirthday)}
          </text>
        </g>

        {/* 右生日標記 */}
        <g>
          <circle cx={arc2EndX} cy={baseY} r="4" fill="#6b7280" stroke="white" strokeWidth="1.5" />
          <line x1={arc2EndX} y1={baseY} x2={arc2EndX} y2={timelineY} stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={arc2EndX} cy={timelineY} r="3" fill="#6b7280" />
          <text x={arc2EndX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#6b7280" fontWeight="500">
            {cycleData.rightBirthday.getFullYear()}年生日
          </text>
          <text x={arc2EndX} y={timelineY + 27} textAnchor="middle" fontSize={fontSize.xs} fill="#9ca3af">
            {formatDateShort(cycleData.rightBirthday)}
          </text>
        </g>

        {/* 流年生理期起始標記（在水平軸上） */}
        <g>
          <circle cx={transX} cy={timelineY} r="3" fill="#ef4444" stroke="white" strokeWidth="1.5" />
          <text x={transX} y={timelineY - 8} textAnchor="middle" fontSize={fontSize.xs} fill="#dc2626" fontWeight="500">
            生理期起始
          </text>
          <text x={transX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ef4444">
            {formatDateShort(cycleData.transitionStart)}
          </text>
        </g>

        {/* 流年高峰期標記（在水平軸上） */}
        {showAllLabels && (
          <>
            {/* 高峰期前2個月 */}
            <g>
              <circle cx={stormStartX} cy={timelineY} r="2.5" fill="#eab308" stroke="white" strokeWidth="1" />
              <text x={stormStartX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04">
                {formatDateShort(cycleData.stormStart)}
              </text>
            </g>

            {/* 高峰期最高峰 */}
            <g>
              <circle cx={peakX} cy={timelineY} r="4" fill="#eab308" stroke="white" strokeWidth="1.5" />
              <text x={peakX} y={timelineY - 8} textAnchor="middle" fontSize={fontSize.xs} fill="#a16207" fontWeight="600">
                高峰期最高峰
              </text>
              <text x={peakX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04" fontWeight="500">
                {formatDateShort(cycleData.peakDate)}
              </text>
            </g>

            {/* 高峰期後2個月 */}
            <g>
              <circle cx={stormEndX} cy={timelineY} r="2.5" fill="#eab308" stroke="white" strokeWidth="1" />
              <text x={stormEndX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04">
                {formatDateShort(cycleData.stormEnd)}
              </text>
            </g>
          </>
        )}

        {/* 手機版簡化顯示：只顯示高峰期最高峰 */}
        {!showAllLabels && (
          <g>
            <circle cx={peakX} cy={timelineY} r="3.5" fill="#eab308" stroke="white" strokeWidth="1.5" />
            <text x={peakX} y={timelineY - 8} textAnchor="middle" fontSize={fontSize.xs} fill="#a16207" fontWeight="600">
              高峰期
            </text>
            <text x={peakX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04" fontWeight="500">
              {formatDateShort(cycleData.peakDate)}
            </text>
          </g>
        )}

        {/* 當前日期標記（唯一顯示在弧線上） */}
        <g>
          <circle cx={currentX} cy={currentY} r="8" fill={phaseColor} stroke="white" strokeWidth="2" />
          <line x1={currentX} y1={currentY} x2={currentX} y2={currentY - 30} stroke={phaseColor} strokeWidth="2" strokeDasharray="4 2" />
          <text x={currentX} y={currentY - 35} textAnchor="middle" fontSize={fontSize.md} fill={phaseColor} fontWeight="700">
            今日
          </text>
          <text x={currentX} y={currentY - 22} textAnchor="middle" fontSize={fontSize.sm} fill={phaseColor} fontWeight="500">
            {formatDateWithYear(currentDate)}
          </text>
        </g>
      </svg>

      {/* 圖例說明 */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs text-gray-600">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded flex-shrink-0"></div>
          <span className="text-center sm:text-left">流年生理期（生日前4個月）</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 rounded flex-shrink-0"></div>
          <span className="text-center sm:text-left">流年高峰期（生日後6個月±2個月）</span>
        </div>
      </div>
    </div>
  );
}
