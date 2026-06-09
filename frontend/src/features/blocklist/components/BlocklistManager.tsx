import { useState, useEffect } from 'react'
import { getBlocklist, addToBlocklist, removeFromBlocklist, type BlockedDomain } from '../api'

interface AdlistSource {
  name: string
  url: string
  domains: number
  lastSynced: string
  enabled: boolean
}

export default function BlocklistManager() {
  const [list, setList] = useState<BlockedDomain[]>([])
  const [domain, setDomain] = useState('')
  const [wildcard, setWildcard] = useState(false)
  const [listName, setListName] = useState('')
  const [listUrl, setListUrl] = useState('')
  const [listDesc, setListDesc] = useState('')

  const [sources] = useState<AdlistSource[]>([
    { name: 'StevenBlack Unified Ads', url: 'raw.githubusercontent.com/...', domains: 134812, lastSynced: '2 mins ago', enabled: true },
    { name: 'OISD Full (Security Only)', url: 'small.oisd.nl/dns', domains: 892104, lastSynced: '1 hour ago', enabled: true },
    { name: 'Experimental Cryptojacking', url: 'mirror.blocklist.net/...', domains: 12476, lastSynced: '3 days ago', enabled: false },
    { name: 'Privacy Protections', url: 'tracking-list.internal', domains: 209000, lastSynced: '12 mins ago', enabled: true },
  ])

  useEffect(() => {
    getBlocklist().then((data) => setList(data || []))
  }, [])

  const handleAdd = async () => {
    if (!domain) return
    await addToBlocklist(domain, wildcard)
    const data = await getBlocklist()
    setList(data || [])
    setDomain('')
    setWildcard(false)
  }

  const handleDelete = async (d: string) => {
    await removeFromBlocklist(d)
    const data = await getBlocklist()
    setList(data || [])
  }

  return (
    <section className="pt-24 px-xl pb-xl max-w-[1440px] mx-auto" style={{ paddingTop: 0 }}>
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Blocklist Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Control the security perimeter of your network by managing active blocklists.</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex items-center gap-6 shadow-sm min-w-[320px]">
          <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
          </div>
          <div>
            <span className="font-label-sm text-on-surface-variant block uppercase tracking-widest">Total Blocked Domains</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-headline-lg font-bold text-on-surface">{list.length.toLocaleString()}</span>
              <span className="text-secondary font-label-md">+{Math.max(1, Math.round(list.length * 0.01))} today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter items-start">
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="font-headline-sm text-headline-sm mb-lg">Add New Adlist</h3>
            <form className="space-y-md" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">List Name</label>
                <input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-3 font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="e.g. Social Media Block"
                  type="text"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">List Source URL</label>
                <input
                  value={listUrl}
                  onChange={(e) => setListUrl(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-3 font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="https://raw.githubusercontent.com/..."
                  type="url"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">Description (Optional)</label>
                <textarea
                  value={listDesc}
                  onChange={(e) => setListDesc(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-3 font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-label-md py-4 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">add_circle</span> Save and Sync List
              </button>
            </form>
          </div>
          <div className="relative h-[280px] rounded-xl overflow-hidden group cursor-pointer border border-outline-variant bg-gradient-to-br from-primary-container/20 to-surface-container-low">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-lg">
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded w-fit mb-2 uppercase font-bold tracking-widest">Network Insights</span>
              <h4 className="text-white font-headline-sm mb-xs">Protect your fleet with AI-driven threat intelligence.</h4>
              <p className="text-white/70 font-body-sm">Automated updates for over 2M malicious domains.</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-lg flex justify-between items-center border-b border-outline-variant">
            <h3 className="font-headline-sm text-headline-sm">Active Blocklists</h3>
            <div className="flex gap-2">
              <button className="text-label-md font-medium border border-outline-variant px-4 py-2 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">cloud_download</span> Update All
              </button>
              <button className="text-label-md font-medium border border-outline-variant px-4 py-2 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">filter_alt</span> Filters
              </button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="py-4 px-lg font-label-md uppercase text-on-surface-variant tracking-wider">Source Name</th>
                <th className="py-4 px-md font-label-md uppercase text-on-surface-variant tracking-wider">Domains</th>
                <th className="py-4 px-md font-label-md uppercase text-on-surface-variant tracking-wider">Last Synced</th>
                <th className="py-4 px-md font-label-md uppercase text-on-surface-variant tracking-wider">Status</th>
                <th className="py-4 px-lg text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {sources.map((source) => (
                <tr key={source.name} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-5 px-lg">
                    <div className="flex flex-col">
                      <span className={`font-body-md font-semibold ${source.enabled ? 'text-on-surface' : 'text-on-surface opacity-50'}`}>{source.name}</span>
                      <span className={`font-code text-label-sm text-on-surface-variant ${source.enabled ? 'opacity-70' : 'opacity-40'}`}>{source.url}</span>
                    </div>
                  </td>
                  <td className="py-5 px-md">
                    <span className={`font-code font-body-sm ${source.enabled ? 'text-primary' : 'text-on-surface-variant opacity-50'}`}>{source.domains.toLocaleString()}</span>
                  </td>
                  <td className="py-5 px-md">
                    <span className={`font-body-sm ${source.enabled ? 'text-on-surface-variant' : 'text-on-surface-variant opacity-50'}`}>{source.lastSynced}</span>
                  </td>
                  <td className="py-5 px-md">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={source.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className={`ml-3 font-body-sm font-medium ${source.enabled ? 'text-secondary' : 'text-on-surface-variant opacity-50'}`}>
                        {source.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </td>
                  <td className="py-5 px-lg text-right">
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-surface-container-high rounded-lg transition-all text-on-surface-variant">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-lg bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Showing {sources.length} of {sources.length} active blocklists</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface transition-colors active:scale-95">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-primary text-white active:scale-95">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface transition-colors active:scale-95">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-xl right-xl">
        <button className="bg-primary-container text-on-primary-container p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">bolt</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap px-0 group-hover:px-2 font-label-md">Optimise All Lists</span>
        </button>
      </div>
    </section>
  )
}
