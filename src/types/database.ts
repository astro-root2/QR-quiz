export type ButtonStatus = 'unused' | 'used'

export interface Event {
  id: string
  name: string
  status: 'active' | 'archived'
  created_at: string
}

export interface Player {
  id: string
  event_id: string
  name: string
  player_token: string
  created_at: string
}

export interface Button {
  id: string
  event_id: string
  code: string
  location_name: string
  status: ButtonStatus
  used_by: string | null
  used_at: string | null
  created_at: string
}

export interface Score {
  id: string
  player_id: string
  event_id: string
  delta: number
  reason: string | null
  admin_id: string | null
  created_at: string
}

export interface Admin {
  id: string
  email: string
  role: 'admin'
}
