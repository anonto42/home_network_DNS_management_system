import { apiGet, apiPost, apiDelete } from '../../../hooks/api'

export async function getRecords(): Promise<Record<string, string>> {
  return apiGet<Record<string, string>>('/records')
}

export async function addRecord(domain: string, ip: string): Promise<void> {
  await apiPost('/records', { domain, ip })
}

export async function deleteRecord(domain: string): Promise<void> {
  await apiDelete('/records', { domain })
}
