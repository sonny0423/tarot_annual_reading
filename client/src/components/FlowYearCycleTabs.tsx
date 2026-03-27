import { FlowYearCycleChart } from "./FlowYearCycleChart";

interface FlowYearCycleTabsProps {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  currentDate: Date;
}

export function FlowYearCycleTabs({
  birthMonth,
  birthDay,
  currentDate,
}: FlowYearCycleTabsProps) {
  return (
    <div className="mb-6">
      <FlowYearCycleChart
        birthMonth={birthMonth}
        birthDay={birthDay}
        currentDate={currentDate}
      />
    </div>
  );
}
