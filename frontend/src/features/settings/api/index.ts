import { apiGet, apiPut } from '../../../hooks/api'

export async function getSettings(): Promise<Record<string, string>> {
  return apiGet<Record<string, string>>('/settings')
}

export async function saveSettings(settings: Record<string, string>): Promise<void> {
  await apiPut('/settings', settings)
}
