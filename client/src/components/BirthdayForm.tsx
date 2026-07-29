import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Sparkles } from "lucide-react";
import { solarToLunar, lunarToSolar } from "@/lib/lunarConverter";

interface BirthdayFormProps {
  onSubmit: (data: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    soulShift: number;
  }) => void;
}

// 取得某年某月的天數（考慮閏年）
function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}

// 農曆每月最多天數（農曆月最多 30 天）
const LUNAR_MAX_DAYS = 30;

// 驗證年份
function validateYear(val: string): string {
  if (!val) return "";
  const n = parseInt(val);
  if (isNaN(n)) return "請輸入有效數字";
  if (n < 1900 || n > 2100) return "年份須介於 1900 – 2100";
  return "";
}

// 驗證月份
function validateMonth(val: string): string {
  if (!val) return "";
  const n = parseInt(val);
  if (isNaN(n)) return "請輸入有效數字";
  if (n < 1 || n > 12) return "月份須介於 1 – 12";
  return "";
}

// 驗證日期（基本範圍）
function validateDay(val: string): string {
  if (!val) return "";
  const n = parseInt(val);
  if (isNaN(n)) return "請輸入有效數字";
  if (n < 1 || n > 31) return "日期須介於 1 – 31";
  return "";
}

// 驗證日期合法性（跨欄位：需要年份+月份）
function validateDayInMonth(
  dayVal: string,
  monthVal: string,
  yearVal: string,
  isLunar = false
): string {
  const basicErr = validateDay(dayVal);
  if (basicErr) return basicErr;
  if (!dayVal || !monthVal) return "";

  const day = parseInt(dayVal);
  const month = parseInt(monthVal);
  if (isNaN(day) || isNaN(month) || month < 1 || month > 12) return "";

  if (isLunar) {
    if (day > LUNAR_MAX_DAYS) return "農曆每月最多 30 天";
    return "";
  }

  const year = parseInt(yearVal) || 2000; // 年份未填時用 2000 估算
  const maxDays = getDaysInMonth(year, month);
  if (day > maxDays) return "該月沒有這一天";
  return "";
}

export function BirthdayForm({ onSubmit }: BirthdayFormProps) {
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");

  // 國曆輸入
  const [solarYear, setSolarYear] = useState("");
  const [solarMonth, setSolarMonth] = useState("");
  const [solarDay, setSolarDay] = useState("");

  // 國曆錯誤
  const [solarYearErr, setSolarYearErr] = useState("");
  const [solarMonthErr, setSolarMonthErr] = useState("");
  const [solarDayErr, setSolarDayErr] = useState("");

  // 農曆輸入
  const [lunarYear, setLunarYear] = useState("");
  const [lunarMonth, setLunarMonth] = useState("");
  const [lunarDay, setLunarDay] = useState("");
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // 農曆錯誤
  const [lunarYearErr, setLunarYearErr] = useState("");
  const [lunarMonthErr, setLunarMonthErr] = useState("");
  const [lunarDayErr, setLunarDayErr] = useState("");

  // 轉換後的顯示
  const [convertedDate, setConvertedDate] = useState<string>("");

  // 靈魂換日線選項：0 = 無（預設）, 1 = +1, -1 = -1
  const [soulShift, setSoulShift] = useState<number>(0);

  // 手動觸發國曆轉農曆（onBlur）- 本地計算，無需網路請求
  const handleSolarToLunar = () => {
    if (calendarType === "solar" && solarYear && solarMonth && solarDay) {
      const year = parseInt(solarYear);
      const month = parseInt(solarMonth);
      const day = parseInt(solarDay);
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const data = solarToLunar(year, month, day);
        if (data) {
          const m = Math.abs(data.month);
          setConvertedDate(`農曆：${data.year}年${data.isLeapMonth ? '閏' : ''}${m}月${data.day}日`);
        }
      }
    }
  };

  // 手動觸發農曆轉國曆（onBlur）- 本地計算，無需網路請求
  const handleLunarToSolar = () => {
    if (calendarType === "lunar" && lunarYear && lunarMonth && lunarDay) {
      const year = parseInt(lunarYear);
      const month = parseInt(lunarMonth);
      const day = parseInt(lunarDay);
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const data = lunarToSolar(year, month, day, isLeapMonth);
        if (data) {
          setConvertedDate(`國曆：${data.year}年${data.month}月${data.day}日`);
        }
      }
    }
  };

  const hasErrors = () => {
    if (calendarType === "solar") {
      return !!(solarYearErr || solarMonthErr || solarDayErr);
    }
    return !!(lunarYearErr || lunarMonthErr || lunarDayErr);
  };

  // 國曆：當年份或月份改變時，重新驗證日期
  const revalidateSolarDay = (year: string, month: string, day: string) => {
    if (day) setSolarDayErr(validateDayInMonth(day, month, year, false));
  };

  // 農曆：當月份改變時，重新驗證日期
  const revalidateLunarDay = (month: string, day: string) => {
    if (day) setLunarDayErr(validateDayInMonth(day, month, "2000", true));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (calendarType === "solar") {
      const yErr = validateYear(solarYear) || (!solarYear ? "請輸入年份" : "");
      const mErr = validateMonth(solarMonth) || (!solarMonth ? "請輸入月份" : "");
      const dErr = validateDayInMonth(solarDay, solarMonth, solarYear, false) || (!solarDay ? "請輸入日期" : "");
      setSolarYearErr(yErr);
      setSolarMonthErr(mErr);
      setSolarDayErr(dErr);
      if (yErr || mErr || dErr) return;

      const year = parseInt(solarYear);
      const month = parseInt(solarMonth);
      const day = parseInt(solarDay);

      // 本地直接計算農曆，無需等待後端
      const lunarData = solarToLunar(year, month, day);
      if (lunarData) {
        onSubmit({
          solarYear: year,
          solarMonth: month,
          solarDay: day,
          lunarYear: lunarData.year,
          lunarMonth: Math.abs(lunarData.month),
          lunarDay: lunarData.day,
          isLeapMonth: lunarData.isLeapMonth,
          soulShift,
        });
      }
    } else {
      const yErr = validateYear(lunarYear) || (!lunarYear ? "請輸入年份" : "");
      const mErr = validateMonth(lunarMonth) || (!lunarMonth ? "請輸入月份" : "");
      const dErr = validateDayInMonth(lunarDay, lunarMonth, "2000", true) || (!lunarDay ? "請輸入日期" : "");
      setLunarYearErr(yErr);
      setLunarMonthErr(mErr);
      setLunarDayErr(dErr);
      if (yErr || mErr || dErr) return;

      const year = parseInt(lunarYear);
      const month = parseInt(lunarMonth);
      const day = parseInt(lunarDay);

      // 本地直接計算國曆，無需等待後端
      const solarData = lunarToSolar(year, month, day, isLeapMonth);
      if (solarData) {
        onSubmit({
          solarYear: solarData.year,
          solarMonth: solarData.month,
          solarDay: solarData.day,
          lunarYear: year,
          lunarMonth: month,
          lunarDay: day,
          isLeapMonth,
          soulShift,
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-card/80 border-primary/20 shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl font-serif bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            輸入您的生日
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          請選擇曆法類型並輸入完整的出生日期，系統將為您計算專屬的塔羅靈數運勢
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 曆法選擇 */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={calendarType === "solar" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setCalendarType("solar");
              setConvertedDate("");
            }}
          >
            國曆 (西元)
          </Button>
          <Button
            type="button"
            variant={calendarType === "lunar" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setCalendarType("lunar");
              setConvertedDate("");
            }}
          >
            農曆
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {calendarType === "solar" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* 年份 */}
                <div className="space-y-1">
                  <Label htmlFor="solar-year">年份</Label>
                  <Input
                    id="solar-year"
                    type="number"
                    placeholder="1990"
                    value={solarYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSolarYear(val);
                      setSolarYearErr(validateYear(val));
                      revalidateSolarDay(val, solarMonth, solarDay);
                    }}
                    onBlur={handleSolarToLunar}
                    min="1900"
                    max="2100"
                    className={solarYearErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {solarYearErr && <p className="text-xs text-red-500 mt-1">{solarYearErr}</p>}
                </div>
                {/* 月份 */}
                <div className="space-y-1">
                  <Label htmlFor="solar-month">月份</Label>
                  <Input
                    id="solar-month"
                    type="number"
                    placeholder="1"
                    value={solarMonth}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSolarMonth(val);
                      setSolarMonthErr(validateMonth(val));
                      revalidateSolarDay(solarYear, val, solarDay);
                    }}
                    onBlur={handleSolarToLunar}
                    min="1"
                    max="12"
                    className={solarMonthErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {solarMonthErr && <p className="text-xs text-red-500 mt-1">{solarMonthErr}</p>}
                </div>
                {/* 日期 */}
                <div className="space-y-1">
                  <Label htmlFor="solar-day">日期</Label>
                  <Input
                    id="solar-day"
                    type="number"
                    placeholder="1"
                    value={solarDay}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSolarDay(val);
                      setSolarDayErr(validateDayInMonth(val, solarMonth, solarYear, false));
                    }}
                    onBlur={handleSolarToLunar}
                    min="1"
                    max="31"
                    className={solarDayErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {solarDayErr && <p className="text-xs text-red-500 mt-1">{solarDayErr}</p>}
                </div>
              </div>
              {convertedDate && (
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-sm text-center text-secondary font-medium">{convertedDate}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* 農曆年份 */}
                <div className="space-y-1">
                  <Label htmlFor="lunar-year">年份</Label>
                  <Input
                    id="lunar-year"
                    type="number"
                    placeholder="1990"
                    value={lunarYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLunarYear(val);
                      setLunarYearErr(validateYear(val));
                    }}
                    onBlur={handleLunarToSolar}
                    min="1900"
                    max="2100"
                    className={lunarYearErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {lunarYearErr && <p className="text-xs text-red-500 mt-1">{lunarYearErr}</p>}
                </div>
                {/* 農曆月份 */}
                <div className="space-y-1">
                  <Label htmlFor="lunar-month">月份</Label>
                  <Input
                    id="lunar-month"
                    type="number"
                    placeholder="3"
                    value={lunarMonth}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLunarMonth(val);
                      setLunarMonthErr(validateMonth(val));
                      revalidateLunarDay(val, lunarDay);
                    }}
                    onBlur={handleLunarToSolar}
                    min="1"
                    max="12"
                    className={lunarMonthErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {lunarMonthErr && <p className="text-xs text-red-500 mt-1">{lunarMonthErr}</p>}
                </div>
                {/* 農曆日期 */}
                <div className="space-y-1">
                  <Label htmlFor="lunar-day">日期</Label>
                  <Input
                    id="lunar-day"
                    type="number"
                    placeholder="20"
                    value={lunarDay}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLunarDay(val);
                      setLunarDayErr(validateDayInMonth(val, lunarMonth, "2000", true));
                    }}
                    onBlur={handleLunarToSolar}
                    min="1"
                    max="30"
                    className={lunarDayErr ? "border-red-500 focus-visible:ring-red-400" : ""}
                  />
                  {lunarDayErr && <p className="text-xs text-red-500 mt-1">{lunarDayErr}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="leap-month"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                  className="w-4 h-4 rounded border-primary/30"
                />
                <Label htmlFor="leap-month" className="cursor-pointer">
                  閏月
                </Label>
              </div>
              {convertedDate && (
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-sm text-center text-secondary font-medium">{convertedDate}</p>
                </div>
              )}
            </div>
          )}

          {/* 靈魂換日線選項 */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <Label className="text-sm font-medium text-foreground">靈魂換日線</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSoulShift(soulShift === -1 ? 0 : -1)}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  soulShift === -1
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => setSoulShift(soulShift === 1 ? 0 : 1)}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  soulShift === 1
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                +1
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 text-lg py-6"
            disabled={hasErrors()}
          >
            <Sparkles className="w-5 h-5" />
            開始計算
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
