import { apiGet, apiDelete } from '../../../hooks/api'
import { components } from '../../api-types'

export type QueryLog = components['schemas']['models.QueryLog']

export async function getLogs(): Promise<QueryLog[]> {
  return apiGet<QueryLog[]>('/logs')
}

export async function clearLogs(): Promise<void> {
  await apiDelete('/logs')
}
