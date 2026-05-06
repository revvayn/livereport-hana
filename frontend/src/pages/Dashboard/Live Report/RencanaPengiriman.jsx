import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";

export default function RencanaPengiriman() {
  const [time, setTime] = useState("");
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [plans, setPlans] = useState({});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleString("id-ID", {
        weekday: "short", day: "2-digit", month: "short",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("rencanaPengirimanV3");
    if (saved) setPlans(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("rencanaPengirimanV3", JSON.stringify(plans));
  }, [plans]);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const generateCalendar = () => {
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startDay = (firstDay.getDay() + 6) % 7; 
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    return days;
  };

  const handleAdd = (dateKey) => {
    const text = prompt("Nama Pengiriman / Customer:");
    if (!text) return;
    const type = prompt("Prioritas? (1: Reguler, 2: Penting/Urgent, 3: Selesai)", "1");
    
    const colors = { 
      "1": "bg-blue-50 text-blue-700 border-blue-200", 
      "2": "bg-amber-50 text-amber-700 border-amber-200", 
      "3": "bg-emerald-50 text-emerald-700 border-emerald-200" 
    };

    setPlans(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { 
        id: Date.now(), 
        text, 
        style: colors[type] || colors["1"] 
      }]
    }));
  };

  const handleDelete = (dateKey, id) => {
    setPlans(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(p => p.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <CalendarIcon className="text-white w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase">
                Shipment<span className="text-indigo-600 font-light">Hub</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <p className="flex items-center gap-1.5 text-sm font-semibold italic">
                <MapPin className="w-4 h-4 text-rose-500" />
                PT Bahana Bhumiphala Persada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 w-fit">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-mono font-bold text-slate-700 tabular-nums">{time}</span>
          </div>
        </header>

        {/* --- NAVIGATION & FILTERS --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-full sm:w-auto">
            <button 
              onClick={() => { if(month === 0) {setMonth(11); setYear(year-1)} else {setMonth(month-1)} }}
              className="p-2.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-indigo-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 sm:flex-none px-6 text-center min-w-[180px]">
              <span className="text-lg font-bold text-slate-800">{months[month]} {year}</span>
            </div>

            <button 
              onClick={() => { if(month === 11) {setMonth(0); setYear(year+1)} else {setMonth(month+1)} }}
              className="p-2.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-indigo-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
          >
            Hari Ini
          </button>
        </div>

        {/* --- MAIN CALENDAR BOARD --- */}
        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, idx) => (
              <div key={day} className={`py-4 text-center text-xs font-black uppercase tracking-widest ${idx >= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Grid Days */}
          <div className="grid grid-cols-7 md:auto-rows-[minmax(120px,auto)] sm:auto-rows-[100px]">
            {generateCalendar().map((day, i) => {
              const dateKey = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const isTodayDate = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              if (!day) return <div key={`empty-${i}`} className="bg-slate-50/30 border-[0.5px] border-slate-100 hidden sm:block"></div>;

              return (
                <div 
                  key={dateKey} 
                  className={`group relative flex flex-col p-2 md:p-3 border-[0.5px] border-slate-100 transition-all hover:bg-indigo-50/20
                    ${isTodayDate ? "bg-indigo-50/40" : "bg-white"}`}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm md:text-base font-black leading-none
                      ${isTodayDate ? "text-indigo-600" : "text-slate-400"}`}>
                      {day}
                    </span>
                    {isTodayDate && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>}
                  </div>

                  {/* Shipment Items */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[80px] md:max-h-[120px] custom-scrollbar pr-1">
                    {plans[dateKey]?.map(p => (
                      <div
                        key={p.id}
                        className={`${p.style} text-[10px] md:text-[11px] font-bold px-2 py-1.5 rounded-lg border flex justify-between items-center animate-in fade-in zoom-in duration-200`}
                      >
                        <span className="truncate pr-1">{p.text}</span>
                        <button
                          onClick={() => handleDelete(dateKey, p.id)}
                          className="text-current opacity-40 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => handleAdd(dateKey)}
                    className="absolute top-2 right-2 sm:bottom-3 sm:right-3 sm:top-auto opacity-0 group-hover:opacity-100 transition-all bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg hover:scale-110 active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5 md:w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- FOOTER LEGEND --- */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span> Reguler
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span> Urgent
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Selesai
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        
        @media (max-width: 640px) {
          .grid-cols-7 { gap: 4px; background: #F1F5F9; }
          .grid-cols-7 > div { border: none !important; border-radius: 12px; height: 100px !important; }
        }
      `}</style>
    </div>
  );
}