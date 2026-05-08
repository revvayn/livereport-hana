import { useEffect, useState } from "react";
import { 
  Plus, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, Search, 
  X, Check, Printer, Download, Filter 
} from "lucide-react";

export default function ProductionSchedule() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({ text: "", type: "1" });

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem("prodScheduleCorporateV1");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("prodScheduleCorporateV1", JSON.stringify(plans));
  }, [plans]);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const generateCalendar = () => {
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startDay = (firstDay.getDay() + 6) % 7; 
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    return days;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.text) return;

    const config = {
      "1": { label: "Reguler", style: "bg-slate-50 text-slate-700 border-slate-200" },
      "2": { label: "Urgent", style: "bg-orange-50 text-orange-700 border-orange-200" },
      "3": { label: "Selesai", style: "bg-blue-50 text-blue-700 border-blue-200" }
    };

    setPlans(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), { 
        id: Date.now(), 
        text: formData.text, 
        ...config[formData.type]
      }]
    }));

    setFormData({ text: "", type: "1" });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-700">
      {/* --- NAV BAR: SIMETRIS & ALIGNED --- */}
      <nav className="bg-white border-b border-slate-200 px-8 py-3.5 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="bg-[#1e293b] w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">
              <CalendarIcon className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[15px] font-bold text-[#1e293b] leading-tight tracking-tight">Shipment Management</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-tight mt-0.5">
                Enterprise Resource Planning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <button className="p-2.5 hover:bg-slate-50 border-r border-slate-200 text-slate-400 transition-colors">
                <Printer className="w-4 h-4" />
              </button>
              <button className="p-2.5 hover:bg-slate-50 text-slate-400 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <button className="bg-[#2563eb] hover:bg-blue-700 text-white text-[11px] font-bold py-2.5 px-6 rounded-lg shadow-md shadow-blue-100 transition-all uppercase tracking-wider">
              Export Data
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-8">
        {/* --- CONTROL PANEL --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 p-5 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-[450px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nomor SO atau nama customer..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={() => month === 0 ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1)} 
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-6 text-xs font-bold text-slate-800 min-w-[160px] text-center uppercase tracking-[0.1em]">
              {months[month]} {year}
            </div>
            <button 
              onClick={() => month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1)} 
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- CALENDAR GRID --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/30">
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day, idx) => (
              <div key={day} className="py-4 text-center border-r border-slate-200 last:border-0">
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${idx >= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-[minmax(130px,auto)]">
            {generateCalendar().map((day, i) => {
              const dateKey = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayPlans = plans[dateKey]?.filter(p => p.text.toLowerCase().includes(searchTerm)) || [];

              if (!day) return <div key={i} className="bg-slate-50/20 border-r border-b border-slate-100" />;

              return (
                <div key={dateKey} className={`group relative p-3 border-r border-b border-slate-100 transition-all hover:bg-blue-50/30 ${isToday ? 'bg-blue-50/10' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                      {String(day).padStart(2, '0')}
                    </span>
                    <button 
                      onClick={() => { setSelectedDate(dateKey); setIsModalOpen(true); }}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-all transform scale-90 group-hover:scale-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[90px] overflow-y-auto pr-1 custom-scrollbar">
                    {dayPlans.map(p => (
                      <div key={p.id} className={`${p.style} p-1.5 px-2 rounded-md border text-[10px] font-bold flex justify-between items-center shadow-sm`}>
                        <span className="truncate pr-1">{p.text}</span>
                        <button 
                          onClick={() => {
                            const newPlans = { ...plans };
                            newPlans[dateKey] = newPlans[dateKey].filter(x => x.id !== p.id);
                            setPlans(newPlans);
                          }}
                          className="hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Form Agenda Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Shipment / Detail</label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="SO-8812 - PT Maju Jaya"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none text-sm font-bold transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Level Prioritas</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{v:"1", l:"Reguler"}, {v:"2", l:"Urgent"}, {v:"3", l:"Selesai"}].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: opt.v })}
                      className={`py-2.5 text-[10px] font-bold rounded-xl border transition-all ${formData.type === opt.v ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-xl transition-all">BATAL</button>
                <button type="submit" className="flex-1 py-3 bg-[#2563eb] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                  <Check className="w-4 h-4" /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}