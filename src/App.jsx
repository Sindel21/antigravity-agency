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
    Zap,
    RefreshCcw,
    ShieldCheck,
    TrendingUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const App = () => {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedLead, setSelectedLead] = useState(null)
    const [discoveryStatus, setDiscoveryStatus] = useState(null)
    const [search, setSearch] = useState({ niche: '', location: '' })
    const [pilotStatus, setPilotStatus] = useState('idle')

    useEffect(() => {
        fetchLeads()
        const interval = setInterval(fetchPilotStatus, 3000)
        return () => clearInterval(interval)
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
            setError("Synchronizace selhala. Zkontrolujte připojení k backendu.")
        } finally {
            setLoading(false)
        }
    }

    const fetchPilotStatus = async () => {
        try {
            const res = await fetch('/api/pilot-status')
            const data = await res.json()
            setPilotStatus(data.status || 'idle')
        } catch (e) { }
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
            if (!res.ok) throw new Error("Search failed")
            await fetchLeads()
            setDiscoveryStatus(null)
        } catch (err) {
            setDiscoveryStatus('Error')
            setTimeout(() => setDiscoveryStatus(null), 3000)
        }
    }

    const stats = {
        total: leads.length,
        success: leads.filter(l => (l.performance_score || 0) > 60).length,
        critical: leads.filter(l => (l.performance_score || 0) < 40).length,
        avgPerf: Math.round(leads.reduce((acc, l) => acc + (l.performance_score || 0), 0) / (leads.length || 1))
    }

    return (
        <div className="min-h-screen bg-[#050506] text-[#f0f0f2] font-sans selection:bg-blue-500/30 overflow-x-hidden">
            {/* Dynamic Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full"
                />
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-12">
                {/* Navigation / Header */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 animate-fade">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Rocket className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent uppercase">
                                    MISSION CONTROL
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black tracking-[0.3em] text-blue-500/80 uppercase">Antigravity LeadGen</span>
                                    <div className="h-1 w-1 bg-slate-800 rounded-full" />
                                    <div className="flex items-center gap-1.5 capitalize">
                                        <div className={`h-1.5 w-1.5 rounded-full ${pilotStatus === 'idle' ? 'bg-slate-600' : 'bg-emerald-500 animate-pulse'}`} />
                                        <span className="text-[10px] text-slate-500 font-bold tracking-widest">{pilotStatus === 'idle' ? 'Ready' : 'Pilot Active'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleDiscover}
                        className="flex flex-col sm:flex-row gap-1 p-1.5 bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] w-full lg:w-auto"
                    >
                        <div className="flex items-center px-4 gap-3 py-3 sm:py-0">
                            <Target size={18} className="text-blue-500/50" />
                            <input
                                placeholder="Obor (např. Reality)"
                                className="bg-transparent border-none outline-none text-sm w-full sm:w-40 placeholder:text-slate-700 font-medium"
                                value={search.niche}
                                onChange={e => setSearch({ ...search, niche: e.target.value })}
                            />
                        </div>
                        <div className="hidden sm:block w-px bg-white/5 my-3" />
                        <div className="flex items-center px-4 gap-3 py-3 sm:py-0">
                            <Activity size={18} className="text-blue-500/50" />
                            <input
                                placeholder="Lokalita..."
                                className="bg-transparent border-none outline-none text-sm w-full sm:w-40 placeholder:text-slate-700 font-medium"
                                value={search.location}
                                onChange={e => setSearch({ ...search, location: e.target.value })}
                            />
                        </div>
                        <button
                            disabled={!!discoveryStatus}
                            className="bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {discoveryStatus ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                            <span>{discoveryStatus || 'Spustit Průzkum'}</span>
                        </button>
                    </motion.form>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <StatCard icon={<Users size={20} />} label="Nalezené Kontakty" value={stats.total} color="blue" delay={0.1} />
                    <StatCard icon={<TrendingUp size={20} />} label="Průměrné Skóre" value={`${stats.avgPerf}%`} color="indigo" delay={0.15} />
                    <StatCard icon={<ShieldCheck size={20} />} label="Skenování Dokončeno" value={stats.success} color="emerald" delay={0.2} />
                    <StatCard icon={<AlertCircle size={20} />} label="Kritické Nedostatky" value={stats.critical} color="rose" delay={0.25} />
                </div>

                {/* Main Interface Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Table Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-8 group"
                    >
                        <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/10">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div>
                                    <h3 className="font-black text-lg text-white/90 tracking-tight">Lead Pipeline</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Aktuální přehled příležitostí</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {error && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
                                            <AlertCircle size={14} className="text-rose-500" />
                                            <span className="text-rose-500 text-[10px] font-black uppercase tracking-tight">{error}</span>
                                        </div>
                                    )}
                                    <button onClick={fetchLeads} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400">
                                        <RefreshCcw size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-white/5 bg-white/[0.005]">
                                            <th className="p-8 font-black uppercase tracking-[0.2em] text-[10px]">Identifikace Firmy</th>
                                            <th className="p-8 font-black uppercase tracking-[0.2em] text-[10px] text-center">PSI Index</th>
                                            <th className="p-8 font-black uppercase tracking-[0.2em] text-[10px] text-center">Priorita</th>
                                            <th className="p-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        <AnimatePresence mode="popLayout">
                                            {loading ? (
                                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    <td colSpan="4" className="py-32 text-center">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <Loader2 className="animate-spin text-blue-500" size={32} />
                                                            <span className="text-slate-500 font-bold tracking-[0.1em] text-xs uppercase italic">Dekódování datové vrstvy...</span>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ) : leads.length === 0 ? (
                                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <td colSpan="4" className="py-32 text-center text-slate-600 font-medium italic">V této sekci nebyly detekovány žádné nové záznamy.</td>
                                                </motion.tr>
                                            ) : leads.map((lead, idx) => (
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={lead.company_name}
                                                    className={`group/row transition-all hover:bg-white/[0.02] cursor-pointer ${selectedLead?.company_name === lead.company_name ? 'bg-blue-500/[0.03]' : ''}`}
                                                    onClick={() => setSelectedLead(lead)}
                                                >
                                                    <td className="p-8">
                                                        <div className="font-bold text-base text-white/90 group-hover/row:text-blue-400 transition-colors">{lead.company_name}</div>
                                                        <div className="text-[11px] text-slate-600 mt-1 font-mono group-hover/row:text-slate-400 transition-colors">{lead.url}</div>
                                                    </td>
                                                    <td className="p-8 text-center">
                                                        <div className={`text-2xl font-black tabular-nums ${lead.performance_score > 60 ? 'text-emerald-500' : lead.performance_score > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                            {lead.performance_score || '--'}
                                                        </div>
                                                    </td>
                                                    <td className="p-8 text-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${lead.performance_score < 60 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800/50 text-slate-500 border-white/5'}`}>
                                                            {lead.performance_score < 60 ? 'Top Priority' : 'Monitoring'}
                                                        </span>
                                                    </td>
                                                    <td className="p-8 text-right">
                                                        <ChevronRight size={20} className={`inline-block transition-all duration-300 ${selectedLead?.company_name === lead.company_name ? 'text-blue-500 translate-x-2' : 'text-zinc-800'}`} />
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                    {/* Details Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-4 h-fit sticky top-12"
                    >
                        <AnimatePresence mode="wait">
                            {selectedLead ? (
                                <motion.div
                                    key={selectedLead.company_name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[100px] -z-10" />

                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight mb-2 leading-none">{selectedLead.company_name}</h2>
                                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">{selectedLead.category || 'Strategic Target'}</p>
                                        </div>
                                        <a href={selectedLead.url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-90">
                                            <ExternalLink size={20} />
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5 mb-10">
                                        <DetailStat label="Core Score" value={selectedLead.performance_score} sub="PSI Index" />
                                        <DetailStat label="Latency" value={selectedLead.lcp_value ? `${selectedLead.lcp_value}s` : '--'} sub="LCP Metric" />
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                                <div className="h-px flex-1 bg-white/5" />
                                                <span className="flex items-center gap-2"><Mail size={12} className="text-blue-500" /> AI Draft</span>
                                                <div className="h-px flex-1 bg-white/5" />
                                            </h3>
                                            <div className="bg-black/40 p-8 rounded-3xl text-[13px] leading-relaxed border border-white/5 text-slate-300 font-medium">
                                                {selectedLead.performance_score < 60 ? (
                                                    <div className="whitespace-pre-wrap italic">
                                                        "Dobrý den, při analýze firem v oboru jsem narazil na váš web.
                                                        Všiml jsem si, že se potýkáte se zpomalením na mobilech ({selectedLead.lcp_value}s).
                                                        Mám pro vás řešení, které to zrychlí o 50%..."
                                                    </div>
                                                ) : (
                                                    <div className="text-slate-600 text-center py-6 text-xs font-bold uppercase tracking-widest">Technicky v normě. Draft pozastaven.</div>
                                                )}
                                            </div>
                                        </div>

                                        <button className="group/btn relative w-full py-5 bg-white text-black rounded-3xl font-black tracking-[0.2em] text-xs uppercase shadow-2xl shadow-white/5 overflow-hidden transition-all active:scale-[0.97]">
                                            <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 opacity-10" />
                                            Odeslat Nabídku
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-zinc-900/10 border-2 border-dashed border-white/5 rounded-[3rem] p-24 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                        <BarChart3 size={32} className="text-slate-800" />
                                    </div>
                                    <div className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">Vyberte cíl pro analýzu Inteligence</div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="relative group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-xl overflow-hidden hover:border-white/10 transition-all duration-500"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -z-10 group-hover:bg-${color}-500/10 transition-all`} />
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">{label}</div>
        <div className="text-4xl font-black text-white tracking-tight">{value}</div>
    </motion.div>
)

const DetailStat = ({ label, value, sub }) => (
    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</div>
        <div className="text-3xl font-black text-white tabular-nums">{value || '--'}</div>
        <div className="text-[9px] text-slate-700 font-bold uppercase mt-1">{sub}</div>
    </div>
)

export default App
