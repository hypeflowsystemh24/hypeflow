export interface MemberActivity {
  id: string
  name: string
  avatar: string
  role: string
  calls_made: number
  calls_target: number
  messages_sent: number
  emails_sent: number
  meetings_booked: number
  meetings_target: number
  deals_closed: number
  deals_target: number
  response_time_avg: number   // minutes
  active_days: number
  login_streak: number
  score_avg: number
  trend: 'up' | 'down' | 'flat'
  daily: number[]             // last 7 days activity units
}

export type Metric = 'calls' | 'messages' | 'meetings' | 'deals' | 'score'
export type Period = '7d' | '30d' | '90d'

export const DAYS_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export const MOCK_TEAM: MemberActivity[] = [
  {
    id: 'm1', name: 'Dex Silva',   avatar: 'D', role: 'Senior Closer',
    calls_made: 47,  calls_target: 40,  messages_sent: 134, emails_sent: 28,
    meetings_booked: 12, meetings_target: 10, deals_closed: 8, deals_target: 6,
    response_time_avg: 18, active_days: 22, login_streak: 7,
    score_avg: 87, trend: 'up',
    daily: [6, 8, 5, 9, 7, 4, 8],
  },
  {
    id: 'm2', name: 'Quinn Costa', avatar: 'Q', role: 'Closer',
    calls_made: 31,  calls_target: 40,  messages_sent: 98,  emails_sent: 19,
    meetings_booked: 7,  meetings_target: 10, deals_closed: 5, deals_target: 6,
    response_time_avg: 34, active_days: 19, login_streak: 3,
    score_avg: 72, trend: 'flat',
    daily: [4, 3, 5, 4, 5, 3, 7],
  },
  {
    id: 'm3', name: 'River Lopes', avatar: 'R', role: 'SDR',
    calls_made: 62,  calls_target: 60,  messages_sent: 201, emails_sent: 45,
    meetings_booked: 15, meetings_target: 15, deals_closed: 3, deals_target: 4,
    response_time_avg: 11, active_days: 22, login_streak: 14,
    score_avg: 91, trend: 'up',
    daily: [8, 9, 10, 8, 9, 7, 9],
  },
  {
    id: 'm4', name: 'Ana Ferreira', avatar: 'A', role: 'SDR Júnior',
    calls_made: 22,  calls_target: 30,  messages_sent: 67,  emails_sent: 12,
    meetings_booked: 4,  meetings_target: 8,  deals_closed: 1, deals_target: 3,
    response_time_avg: 52, active_days: 14, login_streak: 1,
    score_avg: 58, trend: 'down',
    daily: [3, 2, 4, 1, 2, 2, 3],
  },
]

export function pct(val: number, target: number) {
  if (target === 0) return 0
  return Math.min(100, Math.round((val / target) * 100))
}
