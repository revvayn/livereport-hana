import { useEffect, useState } from "react";

export default function RencanaPengiriman() {
  /* ================= TIME ================= */
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= CALENDAR LOGIC ================= */
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [plans, setPlans] = useState({});

  // Cek apakah sebuah tanggal adalah hari ini
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem("rencanaPengiriman");
    if (saved) setPlans(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("rencanaPengiriman", JSON.stringify(plans));
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
    const text = prompt("Masukkan rencana pengiriman:");
    if (!text) return;

    setPlans(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { id: Date.now(), text }]
    }));
  };

  const handleDelete = (dateKey, id) => {
    setPlans(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(p => p.id !== id)
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Rencana Pengiriman</h1>
        <p className="text-sm text-blue-600 font-medium">PT Bahana Bhumiphala Persada</p>
        <p className="text-xs text-gray-500 mt-1 tabular-nums">{time}</p>
      </div>

      {/* FILTER & NAV */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2 bg-white shadow-sm"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2 bg-white shadow-sm"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 font-medium transition-all"
        >
          Hari Ini
        </button>
      </div>

      {/* CALENDAR TABLE */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* DAYS HEADER */}
        <div className="grid grid-cols-7 bg-blue-600">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => (
            <div key={d} className="text-white text-center py-3 text-xs font-bold uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* DAYS GRID */}
        <div className="grid grid-cols-7">
          {generateCalendar().map((day, i) => {
            if (!day) return <div key={i} className="border-[0.5px] border-gray-100 h-32 bg-gray-50/50"></div>;

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const currentDay = isToday(day);

            return (
              <div 
                key={i} 
                className={`border-[0.5px] border-gray-100 h-32 p-2 relative group transition-all hover:bg-blue-50/30 
                  ${currentDay ? "ring-2 ring-inset ring-blue-500 bg-blue-50/20" : ""}`}
              >
                {/* Tanggal */}
                <span className={`text-sm font-bold ${currentDay ? "text-blue-600" : "text-gray-700"}`}>
                  {day}
                </span>

                {/* List Rencana */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[70%] custom-scrollbar">
                  {plans[dateKey]?.map(p => (
                    <div
                      key={p.id}
                      className="bg-white border border-blue-200 text-[10px] p-1 rounded shadow-sm flex justify-between items-start animate-fadeIn"
                    >
                      <span className="text-gray-700 leading-tight truncate mr-1">{p.text}</span>
                      <button
                        onClick={() => handleDelete(dateKey, p.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tombol Add (Hanya muncul saat hover) */}
                <button
                  onClick={() => handleAdd(dateKey)}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-lg shadow-lg hover:scale-110 active:scale-95"
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}