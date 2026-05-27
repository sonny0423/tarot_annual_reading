import { useMemo, useState, useEffect, useRef, useCallback } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 監聽容器寬度變化
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // 同時參考 window.innerWidth 和容器寬度，取較小值確保手機正確觸發
        const effectiveWidth = Math.min(containerRef.current.offsetWidth, window.innerWidth);
        setContainerWidth(effectiveWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 監聽滾動狀態，更新左右箭頭的顯示
  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // 初始化時檢查是否需要滾動
    setTimeout(updateScrollIndicators, 100);
    el.addEventListener("scroll", updateScrollIndicators);
    window.addEventListener("resize", updateScrollIndicators);
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators);
      window.removeEventListener("resize", updateScrollIndicators);
    };
  }, [updateScrollIndicators]);

  // 當 svgParams 改變時重新計算滾動指示器
  useEffect(() => {
    setTimeout(updateScrollIndicators, 150);
  }, [containerWidth, updateScrollIndicators]);

  // 根據容器寬度決定顯示模式
  const responsiveMode = useMemo(() => {
    if (containerWidth >= 768) return "desktop";
    if (containerWidth >= 640) return "tablet";
    if (containerWidth >= 400) return "mobile";
    return "compact";
  }, [containerWidth]);

  const cycleData = useMemo(() => {
    const currentYear = currentDate.getFullYear();

    // 找到「最近的下一個生日」（今天或之後最近的生日）
    const thisYearBirthday = new Date(currentYear, birthMonth - 1, birthDay);
    const nextBirthday = currentDate <= thisYearBirthday
      ? thisYearBirthday
      : new Date(currentYear + 1, birthMonth - 1, birthDay);
    const prevBirthday = new Date(nextBirthday.getFullYear() - 1, birthMonth - 1, birthDay);

    // 計算今日距離「最近下一個生日」的相對位置 d（0~1）
    // d=0 表示今天就是生日，d 越大表示距下個生日越近
    const msPerYear = nextBirthday.getTime() - prevBirthday.getTime();
    const msToNext = nextBirthday.getTime() - currentDate.getTime();
    const d = msToNext / msPerYear; // 0~1，0=今天是生日，1=距下個生日還有一整年

    // 依據 d 決定中間生日：
    // d < 0.5 → 今日距下個生日較近（< 半年），以「下一個生日」為中間，今日在左弧
    // d >= 0.5 → 今日距上個生日較近（> 半年），以「上一個生日」為中間，今日在右弧
    let leftBirthday: Date;
    let centerBirthday: Date;
    let rightBirthday: Date;

    if (d < 0.5) {
      // 以「下一個生日」為中間，今日在左弧右半部
      centerBirthday = nextBirthday;
      leftBirthday = prevBirthday;
      rightBirthday = new Date(nextBirthday.getFullYear() + 1, birthMonth - 1, birthDay);
    } else {
      // 以「上一個生日」為中間，今日在右弧左半部
      centerBirthday = prevBirthday;
      leftBirthday = new Date(prevBirthday.getFullYear() - 1, birthMonth - 1, birthDay);
      rightBirthday = nextBirthday;
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

    // 基於左生日（leftBirthday）計算上一個流年的高峰期
    const leftPeakDate = new Date(leftBirthday);
    leftPeakDate.setMonth(leftPeakDate.getMonth() + 6);

    const leftStormStart = new Date(leftPeakDate);
    leftStormStart.setMonth(leftStormStart.getMonth() - 2);

    const leftStormEnd = new Date(leftPeakDate);
    leftStormEnd.setMonth(leftStormEnd.getMonth() + 2);

    // 基於右生日計算下一個流年的關鍵期
    const rightTransitionStart = new Date(rightBirthday);
    rightTransitionStart.setMonth(rightTransitionStart.getMonth() - 4);

    const rightPeakDate = new Date(rightBirthday);
    rightPeakDate.setMonth(rightPeakDate.getMonth() + 6);

    const rightStormStart = new Date(rightPeakDate);
    rightStormStart.setMonth(rightStormStart.getMonth() - 2);

    const rightStormEnd = new Date(rightPeakDate);
    rightStormEnd.setMonth(rightStormEnd.getMonth() + 2);

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

    // 計算右生日的生理期和高峰期在週期中的位置
    const rightTransitionDays = (rightTransitionStart.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const rightTransitionPosition = rightTransitionDays / totalDays;

    const rightPeakDays = (rightPeakDate.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const rightPeakPosition = rightPeakDays / totalDays;

    const rightStormStartDays = (rightStormStart.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const rightStormEndDays = (rightStormEnd.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const rightStormStartPosition = rightStormStartDays / totalDays;
    const rightStormEndPosition = rightStormEndDays / totalDays;

    // 計算左生日高峰期在週期中的位置
    const leftPeakDays = (leftPeakDate.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const leftPeakPosition = leftPeakDays / totalDays;

    const leftStormStartDays = (leftStormStart.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const leftStormEndDays = (leftStormEnd.getTime() - leftBirthday.getTime()) / (1000 * 60 * 60 * 24);
    const leftStormStartPosition = leftStormStartDays / totalDays;
    const leftStormEndPosition = leftStormEndDays / totalDays;

    // 判斷當前處於哪個階段
    let currentPhase = "normal";
    if (currentDate >= centerTransitionStart && currentDate < centerBirthday) {
      currentPhase = "transition";
    } else if (currentDate >= centerStormStart && currentDate <= centerStormEnd) {
      currentPhase = "peak";
    }

    return {
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
      // 右生日的下一個流年關鍵期
      rightTransitionStart,
      rightPeakDate,
      rightStormStart,
      rightStormEnd,
      rightTransitionPosition,
      rightPeakPosition,
      rightStormStartPosition,
      rightStormEndPosition,
      // 左生日的高峰期
      leftPeakDate,
      leftStormStart,
      leftStormEnd,
      leftPeakPosition,
      leftStormStartPosition,
      leftStormEndPosition,
    };
  }, [birthMonth, birthDay, currentDate]);

  // 響應式SVG尺寸參數
  // 手機版使用固定寬度（不隨容器縮小），配合橫向滾動容器
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
          fixedWidth: false, // 桌面版自適應寬度
        };
      case "tablet":
        return {
          width: 900,
          height: 330,
          padding: 40,
          arcHeight: 160,
          fontSize: { xs: 10, sm: 12, md: 14 },
          showAllLabels: true,
          fixedWidth: false,
        };
      case "mobile":
        return {
          width: 700,
          height: 520,
          padding: 30,
          arcHeight: 280,
          fontSize: { xs: 14, sm: 16, md: 18 },
          showAllLabels: true, // 橫向滾動後可顯示所有標籤
          fixedWidth: true, // 手機版固定寬度，啟用橫向滾動
        };
      case "compact":
        return {
          width: 700,
          height: 520,
          padding: 25,
          arcHeight: 260,
          fontSize: { xs: 13, sm: 15, md: 17 },
          showAllLabels: true,
          fixedWidth: true,
        };
    }
  }, [responsiveMode]);

  const { width, height, padding, arcHeight, fontSize, showAllLabels, fixedWidth } = svgParams;

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

  // 右生日的生理期區域路徑（第二個弧線上）
  const rightTransitionAreaPath = `
    ${generateArcPath(cycleData.rightTransitionPosition, 1)}
    L ${arc2EndX} ${baseY}
    L ${getPositionCoordinates(cycleData.rightTransitionPosition)[0]} ${baseY}
    Z
  `;

  // 右生日的高峰期區域路徑（第二個弧線上，若在範圍內）
  const rightPeakAreaPath = `
    ${generateArcPath(cycleData.rightStormStartPosition, cycleData.rightStormEndPosition)}
    L ${getPositionCoordinates(cycleData.rightStormEndPosition)[0]} ${baseY}
    L ${getPositionCoordinates(cycleData.rightStormStartPosition)[0]} ${baseY}
    Z
  `;

  // 左生日的高峰期區域路徑（第一個弧線上，若在範圍內）
  const leftPeakAreaPath = `
    ${generateArcPath(cycleData.leftStormStartPosition, cycleData.leftStormEndPosition)}
    L ${getPositionCoordinates(cycleData.leftStormEndPosition)[0]} ${baseY}
    L ${getPositionCoordinates(cycleData.leftStormStartPosition)[0]} ${baseY}
    Z
  `;

  // 當前位置的座標
  const [currentX, currentY] = getPositionCoordinates(cycleData.currentPosition);

  // 手機版初始自動滾動，將「今日」標記置中
  useEffect(() => {
    if (!fixedWidth) return; // 只在手機版（fixedWidth=true）時觸發
    const el = scrollRef.current;
    if (!el) return;

    // 等待 SVG 渲染完成再計算
    const timer = setTimeout(() => {
      const svgWidth = width;                        // SVG 寬度（700px）
      const containerVisibleWidth = el.clientWidth; // 可見區域寬度

      // 計算讓今日置中的 scrollLeft
      const targetScrollLeft = currentX - containerVisibleWidth / 2;
      const clampedScrollLeft = Math.max(0, Math.min(targetScrollLeft, svgWidth - containerVisibleWidth));

      el.scrollTo({ left: clampedScrollLeft, behavior: 'smooth' });
    }, 200);

    return () => clearTimeout(timer);
  }, [fixedWidth, currentX, width]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const [rightTransX] = getPositionCoordinates(cycleData.rightTransitionPosition);
  const [rightPeakX] = getPositionCoordinates(cycleData.rightPeakPosition);
  const [rightStormStartX] = getPositionCoordinates(cycleData.rightStormStartPosition);
  const [rightStormEndX] = getPositionCoordinates(cycleData.rightStormEndPosition);
  const [leftPeakX] = getPositionCoordinates(cycleData.leftPeakPosition);
  const [leftStormStartX] = getPositionCoordinates(cycleData.leftStormStartPosition);
  const [leftStormEndX] = getPositionCoordinates(cycleData.leftStormEndPosition);

  const isMobileMode = fixedWidth;

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

      {/* 橫向滾動容器（手機版） */}
      <div className="relative">
        {/* 左側漸層指示器 */}
        {isMobileMode && canScrollLeft && (
          <div
            className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, rgba(255,255,255,0.9), transparent)",
            }}
          />
        )}
        {/* 右側漸層指示器 */}
        {isMobileMode && canScrollRight && (
          <div
            className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, rgba(255,255,255,0.9), transparent)",
            }}
          />
        )}

        <div
          ref={scrollRef}
          className={isMobileMode ? "overflow-x-auto" : ""}
          style={isMobileMode ? { WebkitOverflowScrolling: "touch", scrollbarWidth: "none" } : {}}
        >
      <svg
        width={fixedWidth ? width : "100%"}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        style={{ display: "block", minWidth: fixedWidth ? `${width}px` : undefined }}
      >
        <defs>
          {redStripesPattern}
          {yellowStripesPattern}
        </defs>

        {/* 流年生理期區域 */}
        <path d={transitionAreaPath} fill="url(#redStripes)" fillOpacity="0.3" stroke="none" />

        {/* 流年高峰期區域 */}
        <path d={peakAreaPath} fill="url(#yellowStripes)" fillOpacity="0.3" stroke="none" />

        {/* 右生日的生理期區域（第二個弧線） */}
        <path d={rightTransitionAreaPath} fill="url(#redStripes)" fillOpacity="0.3" stroke="none" />

        {/* 右生日的高峰期區域（第二個弧線，若在可見範圍內） */}
        {cycleData.rightStormStartPosition <= 1 && (
          <path d={rightPeakAreaPath} fill="url(#yellowStripes)" fillOpacity="0.3" stroke="none" />
        )}

        {/* 左生日的高峰期區域（第一個弧線，若在可見範圍內） */}
        {cycleData.leftStormStartPosition >= 0 && cycleData.leftStormStartPosition <= 0.5 && (
          <path d={leftPeakAreaPath} fill="url(#yellowStripes)" fillOpacity="0.3" stroke="none" />
        )}

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

        {/* 右生日的生理期起始標記 */}
        <g>
          <circle cx={rightTransX} cy={timelineY} r="3" fill="#ef4444" stroke="white" strokeWidth="1.5" />
          <text x={rightTransX} y={timelineY - 8} textAnchor="middle" fontSize={fontSize.xs} fill="#dc2626" fontWeight="500">
            生理期起始
          </text>
          <text x={rightTransX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ef4444">
            {formatDateShort(cycleData.rightTransitionStart)}
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

            {/* 右生日高峰期標記（若在可見範圍內） */}
            {cycleData.rightStormStartPosition <= 1 && (
              <g>
                <circle cx={rightStormStartX} cy={timelineY} r="2.5" fill="#eab308" stroke="white" strokeWidth="1" />
                <text x={rightStormStartX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04">
                  {formatDateShort(cycleData.rightStormStart)}
                </text>
              </g>
            )}
            {cycleData.rightPeakPosition <= 1 && (
              <g>
                <circle cx={rightPeakX} cy={timelineY} r="4" fill="#eab308" stroke="white" strokeWidth="1.5" />
                <text x={rightPeakX} y={timelineY - 8} textAnchor="middle" fontSize={fontSize.xs} fill="#a16207" fontWeight="600">
                  高峰期最高峰
                </text>
                <text x={rightPeakX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04" fontWeight="500">
                  {formatDateShort(cycleData.rightPeakDate)}
                </text>
              </g>
            )}
            {cycleData.rightStormEndPosition <= 1 && (
              <g>
                <circle cx={rightStormEndX} cy={timelineY} r="2.5" fill="#eab308" stroke="white" strokeWidth="1" />
                <text x={rightStormEndX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04">
                  {formatDateShort(cycleData.rightStormEnd)}
                </text>
              </g>
            )}

            {/* 左生日高峰期標記（若在可見範圍內） */}
            {cycleData.leftStormStartPosition >= 0 && cycleData.leftStormStartPosition <= 0.5 && (
              <g>
                <circle cx={leftStormStartX} cy={timelineY} r="2.5" fill="#eab308" stroke="white" strokeWidth="1" />
                <text x={leftStormStartX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04">
                  {formatDateShort(cycleData.leftStormStart)}
                </text>
              </g>
            )}
            {cycleData.leftPeakPosition >= 0 && cycleData.leftPeakPosition <= 0.5 && (
              <g>
                <circle cx={leftPeakX} cy={timelineY} r="4" fill="#eab308" stroke="white" strokeWidth="1.5" />
                <text x={leftPeakX} y={timelineY - 8} textAnchor="middle" fontSize={fontSize.xs} fill="#a16207" fontWeight="600">
                  高峰期最高峰
                </text>
                <text x={leftPeakX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04" fontWeight="500">
                  {formatDateShort(cycleData.leftPeakDate)}
                </text>
              </g>
            )}
            {cycleData.leftStormEndPosition >= 0 && cycleData.leftStormEndPosition <= 0.5 && (
              <g>
                <circle cx={leftStormEndX} cy={timelineY} r="2.5" fill="#eab308" stroke="white" strokeWidth="1" />
                <text x={leftStormEndX} y={timelineY + 15} textAnchor="middle" fontSize={fontSize.xs} fill="#ca8a04">
                  {formatDateShort(cycleData.leftStormEnd)}
                </text>
              </g>
            )}
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
          {/* 外圈光暈呼吸燈效果 */}
          <circle cx={currentX} cy={currentY} r="8" fill={phaseColor} fillOpacity="0.3" stroke="none">
            <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          {/* 主圓點 */}
          <circle cx={currentX} cy={currentY} r="8" fill={phaseColor} stroke="white" strokeWidth="2">
            <animate attributeName="r" values="8;9.5;8" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.75;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <line x1={currentX} y1={currentY} x2={currentX} y2={currentY - 45} stroke={phaseColor} strokeWidth="2" strokeDasharray="4 2" />
          <text x={currentX} y={currentY - 55} textAnchor="middle" fontSize={fontSize.md * 1.5} fill={phaseColor} fontWeight="700">
            今日
            <animate attributeName="opacity" values="1;0.08;1" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="fontSize" values={`${fontSize.md * 1.5};${fontSize.md * 1.5 * 0.85};${fontSize.md * 1.5}`} dur="1.5s" repeatCount="indefinite" />
          </text>
          <text x={currentX} y={currentY - 35} textAnchor="middle" fontSize={fontSize.sm * 1.5} fill={phaseColor} fontWeight="500">
            {formatDateWithYear(currentDate)}
            <animate attributeName="opacity" values="1;0.08;1" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="fontSize" values={`${fontSize.sm * 1.5};${fontSize.sm * 1.5 * 0.85};${fontSize.sm * 1.5}`} dur="1.5s" repeatCount="indefinite" />
          </text>
        </g>
      </svg>
        </div>
      </div>

      {/* 手機版滾動提示 */}
      {isMobileMode && (
        <p className="text-center text-xs text-gray-400 mt-1 mb-1">
          ← 左右滑動查看完整圖表 →
        </p>
      )}

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
