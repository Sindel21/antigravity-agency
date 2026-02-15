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
    ExternalLink,
    Target,
    Zap
} from 'lucide-react'

const App = () => {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedLead, setSelectedLead] = useState(null)
    const [discoveryStatus, setDiscoveryStatus] = useState(null)
    const [search, setSearch] = useState({ niche: '', location: '' })

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/leads')
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            setLeads(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Fetch leads failed:", err)
            setError("Failed to load leads mission data. Ensure backend is active.")
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
        <div className="min-h-screen bg-[#0a0a0b] text-[#f0f0f2] font-sans selection:bg-blue-500/30">
            {/* Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto p-8 lg:p-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 animate-fade">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Rocket className="text-blue-500" size={24} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                MISSION CONTROL
                            </h1>
                        </div>
                        <p className="text-slate-500 font-medium">Antigravity LeadGen CRM <span className="text-blue-500/80">v1.1</span></p>
                    </div>

                    <form onSubmit={handleDiscover} className="flex gap-1 p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl w-full md:w-auto">
                        <div className="flex items-center px-4 gap-2 flex-1 md:flex-none">
                            <Target size={18} className="text-slate-600" />
                            <input
                                placeholder="Niche..."
                                className="bg-transparent border-none outline-none py-3 text-sm w-full md:w-32 placeholder:text-slate-700"
                                value={search.niche}
                                onChange={e => setSearch({ ...search, niche: e.target.value })}
                            />
                        </div>
                        <div className="w-px bg-white/5 my-3" />
                        <div className="flex items-center px-4 gap-2 flex-1 md:flex-none">
                            <Activity size={18} className="text-slate-600" />
                            <input
                                placeholder="Location..."
                                className="bg-transparent border-none outline-none py-3 text-sm w-full md:w-32 placeholder:text-slate-700"
                                value={search.location}
                                onChange={e => setSearch({ ...search, location: e.target.value })}
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            {discoveryStatus ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            <span>{discoveryStatus || 'Discover'}</span>
                        </button>
                    </form>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <StatCard icon={<Users size={20} />} label="Identified Leads" value={stats.total} color="blue" delay="0.1s" />
                    <StatCard icon={<Zap size={20} />} label="Avg Performance" value={`${stats.avgPerf}%`} color="indigo" delay="0.15s" />
                    <StatCard icon={<CheckCircle2 size={20} />} label="Healthy Systems" value={stats.success} color="emerald" delay="0.2s" />
                    <StatCard icon={<AlertCircle size={20} />} label="Critical Gaps" value={stats.critical} color="rose" delay="0.25s" />
                </div>

                {/* Main Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Table Area */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="font-bold text-slate-300">Target Pipeline</h3>
                                {error && <span className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle size={14} />{error}</span>}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-white/5">
                                            <th className="p-6 font-semibold uppercase tracking-widest text-[10px]">Company Objective</th>
                                            <th className="p-6 font-semibold uppercase tracking-widest text-[10px] text-center">PSI Score</th>
                                            <th className="p-6 font-semibold uppercase tracking-widest text-[10px] text-center">Priority Status</th>
                                            <th className="p-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="py-24 text-center">
                                                    <Loader2 className="animate-spin inline-block mr-3 text-blue-500" />
                                                    <span className="text-slate-500 font-medium tracking-tight">Accessing encrypted lead database...</span>
                                                </td>
                                            </tr>
                                        ) : leads.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-24 text-center text-slate-600 italic">No leads detected in current sector. Use Discovery.</td>
                                            </tr>
                                        ) : leads.map((lead, idx) => (
                                            <tr
                                                key={idx}
                                                className={`group transition-all hover:bg-white/[0.02] cursor-pointer ${selectedLead?.company_name === lead.company_name ? 'bg-blue-500/5' : ''}`}
                                                onClick={() => setSelectedLead(lead)}
                                            >
                                                <td className="p-6">
                                                    <div className="font-bold text-[15px] group-hover:text-blue-400 transition-colors">{lead.company_name}</div>
                                                    <div className="text-[11px] text-slate-500 mt-1 font-mono tracking-tight opacity-60">{lead.url}</div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className={`text-xl font-black ${lead.performance_score > 60 ? 'text-emerald-500' : lead.performance_score > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                        {lead.performance_score || '--'}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${lead.performance_score < 60 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                                        {lead.performance_score < 60 ? 'Priority A' : 'B-List'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <ChevronRight size={18} className={`transition-all ${selectedLead?.company_name === lead.company_name ? 'text-blue-500 translate-x-1' : 'text-zinc-700'}`} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Details Sidebar */}
                    <div className="lg:col-span-4 h-fit sticky top-8">
                        {selectedLead ? (
                            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10" />

                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight mb-1">{selectedLead.company_name}</h2>
                                        <p className="text-xs text-slate-500 font-mono">{selectedLead.category || 'Professional Services'}</p>
                                    </div>
                                    <a href={selectedLead.url} target="_blank" className="p-2 bg-zinc-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                                        <ExternalLink size={20} />
                                    </a>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Metrics</div>
                                        <div className="text-3xl font-black text-white">{selectedLead.performance_score || '--'}</div>
                                    </div>
                                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Responsiveness</div>
                                        <div className="text-3xl font-black text-white">{selectedLead.lcp_value ? `${selectedLead.lcp_value}s` : '--'}</div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Mail size={14} /> AI Draft Engine
                                        </h3>
                                        <div className="bg-black/60 p-6 rounded-2xl text-[13px] leading-relaxed border border-white/5 text-slate-300 font-medium">
                                            {selectedLead.performance_score < 60 ? (
                                                <div className="whitespace-pre-wrap italic">
                                                    "Dobrý den, při analýze firem v oboru jsem narazil na váš web.
                                                    Všiml jsem si, že se potýkáte se zpomalením na mobilech ({selectedLead.lcp_value}s).
                                                    Mám pro vás 3 rychlé tipy na zlepšení..."
                                                </div>
                                            ) : (
                                                <div className="text-slate-600 text-center py-4">High performance detected. No intervention required.</div>
                                            )}
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black tracking-widest text-sm shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all">
                                        ENGAGE CONTACT
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-900/20 border-2 border-dashed border-white/5 rounded-3xl p-20 text-center">
                                <BarChart3 size={48} className="mx-auto mb-6 text-slate-800" />
                                <div className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Awaiting Intelligence Selection</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ icon, label, value, color, delay }) => (
    <div
        className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl animate-fade"
        style={{ animationDelay: delay }}
    >
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-6`}>
            {icon}
        </div>
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</div>
        <div className="text-3xl font-black text-white">{value}</div>
    </div>
)

export default App
