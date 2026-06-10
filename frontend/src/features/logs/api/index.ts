import { apiGet, apiDelete } from '../../../hooks/api'
import { components } from '../../api-types'

export type QueryLog = components['schemas']['models.QueryLog']

export async function getLogs(params?: { action?: string; domain?: string; limit?: number }): Promise<QueryLog[]> {
  const qs = new URLSearchParams()
  if (params?.action) qs.set('action', params.action)
  if (params?.domain) qs.set('domain', params.domain)
  if (params?.limit) qs.set('limit', String(params.limit))
  const query = qs.toString()
  return apiGet<QueryLog[]>(`/logs${query ? `?${query}` : ''}`)
}

export async function clearLogs(): Promise<void> {
  await apiDelete('/logs')
}
