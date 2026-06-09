import { useState, useEffect } from 'react'
import { getRecords, addRecord, deleteRecord } from '../api'

const recordTypeColors: Record<string, string> = {
  A: 'bg-secondary-container text-on-secondary-container',
  CNAME: 'bg-tertiary-fixed text-on-tertiary-fixed',
  AAAA: 'bg-primary-fixed text-on-primary-fixed',
  MX: 'bg-secondary-fixed text-on-secondary',
  TXT: 'bg-surface-variant text-on-surface-variant',
}

function getTypeLabel(ip: string): string {
  if (ip.includes(':')) return 'AAAA'
  if (ip.includes('.')) return 'A'
  return 'CNAME'
}

export default function RecordManager() {
  const [records, setRecords] = useState<Record<string, string>>({})
  const [domain, setDomain] = useState('')
  const [ip, setIp] = useState('')
  const [recordType, setRecordType] = useState('A (IPv4 Address)')

  useEffect(() => {
    getRecords().then((data) => setRecords(data || {}))
  }, [])

  const handleAdd = async () => {
    if (!domain || !ip) return
    await addRecord(domain, ip)
    const data = await getRecords()
    setRecords(data || {})
    setDomain('')
    setIp('')
  }

  const handleDelete = async (d: string) => {
    await deleteRecord(d)
    const data = await getRecords()
    setRecords(data || {})
  }

  const entries = Object.entries(records || {})

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="mb-2xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-xs">Local DNS Records</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Manage authoritative records for your local network environment.</p>
      </div>

      <div className="grid grid-cols-12 gap-lg mb-2xl">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm">
          <div className="flex items-center gap-sm mb-lg">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            <h3 className="font-headline-sm text-headline-sm">Create New Record</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg items-end">
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">Record Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-md font-label-md focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                <option>A (IPv4 Address)</option>
                <option>AAAA (IPv6 Address)</option>
                <option>CNAME (Alias)</option>
                <option>MX (Mail Exchange)</option>
                <option>TXT (Text)</option>
              </select>
            </div>
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">Domain Name</label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-md font-label-md focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-outline"
                placeholder="e.g. internal.app.local"
                type="text"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant uppercase tracking-wider">Value</label>
              <input
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg p-md font-label-md focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-outline"
                placeholder="e.g. 192.168.1.50"
                type="text"
              />
            </div>
            <div className="lg:col-span-3 flex justify-end gap-md pt-md">
              <button
                onClick={() => { setDomain(''); setIp('') }}
                className="px-xl py-2 border border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-2xl py-2 bg-primary text-on-primary rounded-lg font-label-md font-bold hover:shadow-lg transition-all active:scale-95"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-lg">
          <div className="col-span-2 bg-primary-container text-on-primary-container p-lg rounded-xl flex flex-col justify-between border border-primary/20">
            <span className="material-symbols-outlined text-4xl">hub</span>
            <div>
              <p className="text-4xl font-bold tracking-tight">{entries.length > 0 ? (entries.length * 30).toLocaleString() : '0'}</p>
              <p className="font-label-sm uppercase tracking-widest opacity-80">Total Queries/24h</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-between shadow-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div>
              <p className="text-2xl font-bold text-on-surface">{entries.length}</p>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Active Records</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-between shadow-sm">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <div>
              <p className="text-2xl font-bold text-on-surface">0</p>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Conflicts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline-sm text-headline-sm">Existing Local Records</h3>
          <div className="flex items-center gap-md">
            <button className="flex items-center gap-xs px-md py-1.5 border border-outline-variant rounded-lg text-label-sm hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-xs px-md py-1.5 border border-outline-variant rounded-lg text-label-sm hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
              <tr>
                <th className="px-lg py-md font-bold uppercase tracking-wider">Type</th>
                <th className="px-lg py-md font-bold uppercase tracking-wider">Domain Name</th>
                <th className="px-lg py-md font-bold uppercase tracking-wider">Record Value / IP</th>
                <th className="px-lg py-md font-bold uppercase tracking-wider">TTL</th>
                <th className="px-lg py-md font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-xl px-lg text-center text-on-surface-variant font-body-md">
                    No custom records yet.
                  </td>
                </tr>
              ) : (
                entries.map(([d, val]) => {
                  const type = getTypeLabel(val)
                  const typeColor = recordTypeColors[type] || recordTypeColors.A
                  return (
                    <tr key={d} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-lg py-md">
                        <span className={`${typeColor} px-sm py-xs rounded font-bold text-[10px]`}>{type}</span>
                      </td>
                      <td className="px-lg py-md">
                        <span className="font-body-md font-semibold text-primary hover:underline cursor-pointer">{d}</span>
                      </td>
                      <td className="px-lg py-md relative">
                        <span className="font-code text-body-sm bg-surface-container px-sm py-1 rounded border border-outline-variant">{val}</span>
                        <button className="copy-action opacity-0 absolute top-1/2 -translate-y-1/2 ml-xs p-xs hover:bg-surface-container-high rounded text-primary transition-opacity">
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </td>
                      <td className="px-lg py-md text-on-surface-variant font-label-sm">3600s</td>
                      <td className="px-lg py-md text-right">
                        <div className="flex justify-end gap-sm">
                          <button className="p-xs text-outline hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(d)} className="p-xs text-outline hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-md flex justify-between items-center bg-surface border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing {entries.length} of {entries.length} records</p>
          <div className="flex gap-xs">
            <button className="p-xs border border-outline-variant rounded disabled:opacity-50" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-md py-xs bg-primary-container text-on-primary-container rounded font-bold text-label-sm">1</button>
            <button className="p-xs border border-outline-variant rounded hover:bg-surface-container-high">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2xl relative rounded-2xl overflow-hidden bg-inverse-surface p-2xl">
        <div className="relative z-10 max-w-2xl">
          <h4 className="font-headline-md text-headline-md text-inverse-on-surface mb-md">Need to manage global zones?</h4>
          <p className="text-body-lg text-inverse-on-surface opacity-80 mb-lg">NetShield Pro allows you to synchronize local records with global edge nodes for sub-millisecond resolution worldwide.</p>
          <button className="bg-primary text-on-primary px-xl py-3 rounded-xl font-bold hover:bg-surface-tint transition-all active:scale-95 flex items-center gap-md">
            Upgrade to Pro
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-primary to-transparent"></div>
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-sm p-lg">
            <div className="bg-primary-fixed-dim rounded-full scale-150 blur-3xl opacity-30"></div>
            <div className="bg-secondary-fixed rounded-full blur-2xl opacity-20 col-start-3 row-start-2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
