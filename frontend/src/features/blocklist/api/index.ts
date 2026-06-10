import { apiGet, apiPost, apiDelete } from '../../../hooks/api'
import { components } from '../../api-types'

export type BlockedDomain = components['schemas']['models.BlockedDomain']

export async function getBlocklist(): Promise<BlockedDomain[]> {
  return apiGet<BlockedDomain[]>('/blocklist')
}

export async function addToBlocklist(domain: string, wildcard = false): Promise<void> {
  await apiPost('/blocklist', { domain, wildcard })
}

export async function removeFromBlocklist(domain: string): Promise<void> {
  await apiDelete('/blocklist', { domain })
}
