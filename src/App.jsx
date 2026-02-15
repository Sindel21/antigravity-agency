import React, { useState, useEffect } from 'react'
import {
    Rocket,
    Search,
    BarChart3,
    Users,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    Activity,
    Mail,
    ExternalLink
} from 'lucide-react'

const App = () => {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState(null)
    const [discoveryStatus, setDiscoveryStatus] = useState(null)
    const [search, setSearch] = useState({ niche: '', location: '' })

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/leads')
            const data = await res.json()
            setLeads(data)
        } finally {
            setLoading(false)
        }
    }

    const handleDiscover = async (e) => {
        e.preventDefault()
        setDiscoveryStatus('Searching...')
        try {
            const res = await fetch('/api/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(search)
            })
            const data = await res.json()
            setLeads(data)
            setDiscoveryStatus(null)
        } catch (err) {
            setDiscoveryStatus('Error searching')
        }
    }

    const stats = {
        total: leads.length,
        success: leads.filter(l => l.performance_score > 60).length,
        critical: leads.filter(l => l.performance_score < 40).length,
        avgPerf: Math.round(leads.reduce((acc, l) => acc + (l.performance_score || 0), 0) / (leads.length || 1))
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-12 animate-fade">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Rocket className="text-blue-500" />
                        Mission Control
                    </h1>
                    <p className="text-slate-400 mt-2">Antigravity LeadGen CRM v1.0</p>
                </div>

                <form onSubmit={handleDiscover} className="flex gap-4 glass-card p-2 px-4 shadow-xl">
                    <input
                        placeholder="Niche (e.g. zubaři)"
                        className="bg-transparent border-none outline-none p-2 text-sm w-40"
                        value={search.niche}
                        onChange={e => setSearch({ ...search, niche: e.target.value })}
                    />
                    <div className="w-px bg-slate-800 my-2" />
                    <input
                        placeholder="Location (city)"
                        className="bg-transparent border-none outline-none p-2 text-sm w-40"
                        value={search.location}
                        onChange={e => setSearch({ ...search, location: e.target.value })}
                    />
                    <button className="btn-primary flex items-center gap-2">
                        <Search size={18} />
                        Discover
                    </button>
                </form>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-fade" style={{ animationDelay: '0.1s' }}>
                <StatCard icon={<Users />} label="Total Leads" value={stats.total} color="blue" />
                <StatCard icon={<Activity />} label="Avg Performance" value={`${stats.avgPerf}%`} color="blue" />
                <StatCard icon={<CheckCircle2 />} label="Healthy Sites" value={stats.success} color="emerald" />
                <StatCard icon={<AlertCircle />} label="Critical Issues" value={stats.critical} color="rose" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade" style={{ animationDelay: '0.2s' }}>
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 border-bottom">
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th className="p-4 text-slate-400 font-medium">Company</th>
                                <th className="p-4 text-slate-400 font-medium text-center">PSI Score</th>
                                <th className="p-4 text-slate-400 font-medium text-center">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <Loader2 className="animate-spin inline-block mr-3" />
                                        Fetching mission data...
                                    </td>
                                </tr>
                            ) : leads.map((lead, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-b border-zinc-800 transition-colors hover:bg-zinc-900/40 cursor-pointer ${selectedLead?.company_name === lead.company_name ? 'bg-zinc-800/40' : ''}`}
                                    onClick={() => setSelectedLead(lead)}
                                >
                                    <td className="p-4">
                                        <div className="font-semibold">{lead.company_name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{lead.url}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <PerfGauge score={lead.performance_score} />
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`status-badge ${lead.performance_score < 60 ? 'status-ready' : 'status-skip'}`}>
                                            {lead.performance_score < 60 ? 'Priority' : 'Monitor'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <ChevronRight size={18} className="text-zinc-600 inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Lead Details / Action Panel */}
                <div className="glass-card p-6 h-fit sticky top-8">
                    {selectedLead ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold">{selectedLead.company_name}</h2>
                                <a href={selectedLead.url} target="_blank" className="text-blue-500 hover:text-blue-400">
                                    <ExternalLink size={18} />
                                </a>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Score</div>
                                    <div className="text-2xl font-bold">{selectedLead.performance_score || '--'}</div>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">LCP</div>
                                    <div className="text-2xl font-bold">{selectedLead.lcp_value ? `${selectedLead.lcp_value}s` : '--'}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                                    <Mail size={16} className="text-blue-500" />
                                    Acquisition Email
                                </h3>
                                <div className="bg-slate-900 p-4 rounded-lg text-sm leading-relaxed border border-slate-800/50">
                                    {selectedLead.performance_score < 60 ? (
                                        <div className="whitespace-pre-wrap text-slate-300">
                                            Dobrý den, při analýze firem v oboru jsem narazil na váš web.
                                            Všiml jsem si, že se potýkáte se zpomalením na mobilech ({selectedLead.lcp_value}s).
                                            Mám pro vás 3 rychlé tipy na zlepšení...
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 italic">Web is performing well. Email drafting hidden for non-priority leads.</div>
                                    )}
                                </div>
                            </div>

                            <button className="btn-primary w-full py-4 text-lg">
                                Finalize & Send
                            </button>
                        </div>
                    ) : (
                        <div className="text-center p-20 text-slate-600">
                            <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                            Select a lead to view mission details
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass-card p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
            {icon}
        </div>
        <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    </div>
)

const PerfGauge = ({ score }) => {
    const color = score > 60 ? 'text-emerald-500' : score > 40 ? 'text-amber-500' : 'text-rose-500'
    return (
        <div className={`font-mono text-lg font-bold ${color}`}>
            {score || '--'}
        </div>
    )
}

export default App
