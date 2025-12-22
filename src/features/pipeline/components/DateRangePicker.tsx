'use client';

import React, { useEffect, useRef, useState } from 'react';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | '7d'
  | '14d'
  | '30d'
  | '90d'
  | 'custom';

export type DateRangeValue = {
  preset: DateRangePreset;
  startDate: Date | null;
  endDate: Date | null;
};

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

// ───────────────────────── helpers ─────────────────────────

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfMonth(d: Date) {
  const r = new Date(d);
  r.setDate(1);
  r.setHours(0, 0, 0, 0);
  return r;
}

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 = Minggu
  const gridStart = new Date(year, month, 1 - startDay);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function formatHumanDate(d: Date) {
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatRangeLabel(value: DateRangeValue): {
  headline: string;
  text: string;
} {
  const { preset, startDate, endDate } = value;

  if (preset === 'today') {
    return { headline: 'TODAY', text: 'Today' };
  }

  if (preset === 'yesterday') {
    return { headline: 'YESTERDAY', text: 'Yesterday' };
  }

  if (!startDate || !endDate) {
    return {
      headline: 'CUSTOM RANGE',
      text: 'Pilih rentang tanggal',
    };
  }

  if (preset === '7d') {
    return {
      headline: 'LAST 7 DAYS',
      text: `${formatHumanDate(startDate)} – ${formatHumanDate(endDate)}`,
    };
  }

  if (preset === '14d') {
    return {
      headline: 'LAST 14 DAYS',
      text: `${formatHumanDate(startDate)} – ${formatHumanDate(endDate)}`,
    };
  }

  if (preset === '30d') {
    return {
      headline: 'LAST 30 DAYS',
      text: `${formatHumanDate(startDate)} – ${formatHumanDate(endDate)}`,
    };
  }

  if (preset === '90d') {
    return {
      headline: 'LAST 90 DAYS',
      text: `${formatHumanDate(startDate)} – ${formatHumanDate(endDate)}`,
    };
  }

  return {
    headline: 'CUSTOM RANGE',
    text: `${formatHumanDate(startDate)} – ${formatHumanDate(endDate)}`,
  };
}

const weekdayShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ───────────────────────── component ─────────────────────────

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // temp selection di panel
  const [tempStart, setTempStart] = useState<Date | null>(value.startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(value.endDate);

  // bulan kiri yang ditampilkan (lazy init dari value)
  const [displayMonth, setDisplayMonth] = useState<Date>(() =>
    startOfMonth(value.startDate ?? new Date())
  );

  // klik di luar menutup panel
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const headlineInfo = formatRangeLabel(value);

  const applySelection = (
    preset: DateRangePreset,
    start: Date | null,
    end: Date | null
  ) => {
    onChange({ preset, startDate: start, endDate: end });
    setIsOpen(false);
  };

  const handleQuickRange = (
    range: 'today' | 'yesterday' | '7d' | '14d' | '30d' | '90d'
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (range === 'today') {
      applySelection('today', today, today);
      return;
    }

    if (range === 'yesterday') {
      const y = addDays(today, -1);
      applySelection('yesterday', y, y);
      return;
    }

    if (range === '7d') {
      const start = addDays(today, -6);
      applySelection('7d', start, today);
      return;
    }

    if (range === '14d') {
      const start = addDays(today, -13);
      applySelection('14d', start, today);
      return;
    }

    if (range === '30d') {
      const start = addDays(today, -29);
      applySelection('30d', start, today);
      return;
    }

    if (range === '90d') {
      const start = addDays(today, -89);
      applySelection('90d', start, today);
      return;
    }
  };

  const handleDayClick = (day: Date) => {
    // klik pertama
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(day);
      setTempEnd(null);
      return;
    }

    // klik kedua
    if (tempStart && !tempEnd) {
      if (day < tempStart) {
        setTempEnd(tempStart);
        setTempStart(day);
      } else {
        setTempEnd(day);
      }
    }
  };

  const handleApplyCustom = () => {
    if (!tempStart || !tempEnd) return;
    applySelection('custom', tempStart, tempEnd);
  };

  const isInTempRange = (day: Date) => {
    if (!tempStart || !tempEnd) return false;
    const time = day.getTime();
    return time >= tempStart.getTime() && time <= tempEnd.getTime();
  };

  const monthLeft = displayMonth;
  const monthRight = new Date(displayMonth);
  monthRight.setMonth(monthRight.getMonth() + 1);

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const cells = getMonthGrid(year, month);

    return (
      <div className="flex flex-col gap-2">
        <div className="text-center text-[11px] font-semibold text-slate-700">
          {monthDate.toLocaleDateString('id-ID', {
            month: 'short',
            year: 'numeric',
          })}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
          {weekdayShort.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
          {cells.map((day) => {
            const isCurrentMonth = day.getMonth() === month;
            const isStart = isSameDay(day, tempStart);
            const isEnd = isSameDay(day, tempEnd);
            const inRange = isInTempRange(day);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = isSameDay(day, today);

            let bg = '';
            let text = '';
            let rounded = '';

            if (inRange) {
              bg = 'bg-slate-900/10';
            }

            if (isStart || isEnd) {
              bg = 'bg-slate-900 text-white';
              text = 'font-semibold';
              rounded = 'rounded-full';
            } else if (isToday && !inRange) {
              bg = 'bg-slate-100';
              text = 'font-medium';
              rounded = 'rounded-full';
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDayClick(day)}
                className={[
                  'h-7 w-7 mx-auto flex items-center justify-center',
                  'text-[11px]',
                  isCurrentMonth ? 'text-slate-700' : 'text-slate-300',
                  bg,
                  text,
                  rounded,
                  'hover:bg-slate-900 hover:text-white hover:rounded-full transition-colors',
                ].join(' ')}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* TRIGGER PILL */}
      <button
        type="button"
        onClick={() =>
          setIsOpen((open) => {
            const next = !open;
            if (next) {
              // saat panel dibuka, sinkronkan dari value luar
              setTempStart(value.startDate);
              setTempEnd(value.endDate);
              setDisplayMonth(startOfMonth(value.startDate ?? new Date()));
            }
            return next;
          })
        }
        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200 hover:ring-slate-300 transition"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[14px]">
          📅
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[9px] font-semibold tracking-[0.08em] text-slate-400">
            {headlineInfo.headline}
          </span>
          <span className="text-[11px] text-slate-800">{headlineInfo.text}</span>
        </div>
        <span className="text-[10px] text-slate-400">▾</span>
      </button>

      {/* PANEL */}
      {isOpen && (
        <div className="absolute left-0 z-40 mt-2 w-[620px] max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex gap-3">
            {/* QUICK RANGES */}
            <div className="w-32 border-r border-slate-100 pr-3 text-left text-[11px]">
              <p className="mb-2 text-[11px] font-semibold text-slate-700">
                Quick ranges
              </p>

              <button
                type="button"
                onClick={() => handleQuickRange('7d')}
                className="block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-50"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange('14d')}
                className="block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-50"
              >
                Last 14 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange('30d')}
                className="block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-50"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange('90d')}
                className="block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-50"
              >
                Last 90 Days
              </button>

              <button
                type="button"
                onClick={() => handleQuickRange('today')}
                className="mt-1 block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-50"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange('yesterday')}
                className="block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-50"
              >
                Yesterday
              </button>

              <button
                type="button"
                onClick={() => {
                  setTempStart(null);
                  setTempEnd(null);
                  applySelection('custom', null, null);
                }}
                className="mt-2 block w-full rounded-lg px-2 py-1 text-left text-[11px] text-rose-500 hover:bg-rose-50"
              >
                Clear
              </button>
            </div>

            {/* CALENDARS */}
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setDisplayMonth((prev) => {
                        const d = new Date(prev);
                        d.setMonth(d.getMonth() - 1);
                        return d;
                      })
                    }
                    className="h-6 w-6 rounded-full border border-slate-200 bg-white text-xs hover:bg-slate-50"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDisplayMonth((prev) => {
                        const d = new Date(prev);
                        d.setMonth(d.getMonth() + 1);
                        return d;
                      })
                    }
                    className="h-6 w-6 rounded-full border border-slate-200 bg-white text-xs hover:bg-slate-50"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {renderMonth(monthLeft)}
                {renderMonth(monthRight)}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!tempStart || !tempEnd}
                  onClick={handleApplyCustom}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
