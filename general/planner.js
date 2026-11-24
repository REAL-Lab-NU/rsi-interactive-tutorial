'use strict';
// The host supplies opening times, seat limits and setup times. The solver ranks
// available bookings according to the reader's brief. Verification always uses
// the actual shared resource, independently of the rule a writer proposed.
const EVENTS = {
  day: {
    hour: 10,
    minGap: 15,
    rooms: [T('大厅', 'Hall'), T('工坊', 'Studio')],
    seats: [48, 24],
    sessions: [T('修理课', 'Repair'), T('版画课', 'Print')],
    resource: T('同一位领队', 'One host'),
    slots: [
      { minute: 30, room: 1 },
      { minute: 75, room: 0 },
      { minute: 90, room: 1 },
      { minute: 120, room: 1 }
    ]
  },
  night: {
    hour: 18,
    minGap: 45,
    rooms: [T('舞台', 'Stage'), T('庭院', 'Yard')],
    seats: [36, 60],
    sessions: [T('乐队', 'Band'), T('访谈', 'Talk')],
    resource: T('一套音响', 'One PA kit'),
    slots: [
      { minute: 75, room: 1 },
      { minute: 105, room: 1 },
      { minute: 135, room: 0 }
    ]
  }
};
function clockAt(event, minute) {
  return `${String(event.hour + Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}
function evaluatePlan(event, slot) {
  const gap = slot.minute - 60;
  return { slot, gap, seats: event.seats[0] + event.seats[slot.room], feasible: gap >= event.minGap };
}
function makePlan(event, priority, rule, bookings = event.slots) {
  const requiredGap = rule === 'resource' ? event.minGap : rule === 'presenter' ? 15 : -Infinity;
  const candidates = bookings
    .map((slot) => evaluatePlan(event, slot))
    .filter((plan) => plan.gap >= requiredGap);
  return candidates.sort((a, b) =>
    priority === 'buffer' ? b.gap - a.gap : b.seats - a.seats || a.gap - b.gap
  )[0];
}
const goalOption = {
  key: 'priority',
  label: T('你的活动目标', 'Your planning brief'),
  values: [
    ['capacity', T('更多名额', 'More seats')],
    ['buffer', T('更长换场', 'More setup time')]
  ]
};
const writerOption = {
  key: 'writer',
  label: T('谁写排程规则', 'Who writes the rule?'),
  values: [
    ['fixed', T('原 Improver', 'Original improver')],
    ['learned', T('更新后的 Improver', 'Updated improver')]
  ]
};
const bookingOption = {
  key: 'availability',
  label: T('大厅预订', 'Hall booking'),
  values: [
    ['open', T('有空', 'Available')],
    ['closed', T('临时占用', 'New booking')]
  ]
};
