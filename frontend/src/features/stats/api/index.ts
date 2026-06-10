import { apiGet } from '../../../hooks/api'
import { components } from '../../api-types'

export type Status = components['schemas']['models.Stats']

export async function getStatus(): Promise<Status> {
  return apiGet<Status>('/status')
}
