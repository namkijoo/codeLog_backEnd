import BoardRepo from '#src/repos/BoardRepo.ts';

export type ActivityDay = {
  date: string;
  count: number;
};

export type ActivityResponse = {
  totalSolved: number;
  currentStreak: number;
  range: { from: string; to: string };
  days: ActivityDay[];
};

function toKstDateString(date = new Date()): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  d.setDate(d.getDate() + days);
  return toKstDateString(d);
}

function calcStreak(countByDate: Map<string, number>, today: string): number {
  let streak = 0;
  let cursor = today;
  if ((countByDate.get(cursor) ?? 0) === 0) {
    cursor = addDays(cursor, -1);
  }
  while ((countByDate.get(cursor) ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

async function getActivity(userId: number): Promise<ActivityResponse> {
  const today = toKstDateString();
  const from = addDays(today, -364);

  const [totalSolved, rows] = await Promise.all([
    BoardRepo.countByUserId(userId),
    BoardRepo.findActivityCountsByUserId(userId, from),
  ]);

  const countByDate = new Map<string, number>();
  for (const row of rows) {
    countByDate.set(row.date, row.count);
  }
  const days: ActivityDay[] = [];
  for (let cursor = from; cursor <= today; cursor = addDays(cursor, 1)) {
    days.push({
      date: cursor,
      count: countByDate.get(cursor) ?? 0,
    });
  }
  return {
    totalSolved,
    currentStreak: calcStreak(countByDate, today),
    range: { from, to: today },
    days,
  };
}

export default {
  getActivity,
};
