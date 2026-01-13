import { useEffect, useState } from "react";

export default function RencanaPengiriman() {
  /* ================= TIME ================= */
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
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

  /* ================= CALENDAR ================= */
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // plans: { "2025-08-15": [{ id, text }] }
  const [plans, setPlans] = useState({});

  /* ================= RESTORE FROM LOCALSTORAGE ================= */
  useEffect(() => {
    const saved = localStorage.getItem("rencanaPengiriman");
    if (saved) {
      setPlans(JSON.parse(saved));
    }
  }, []);

  /* ================= SAVE TO LOCALSTORAGE ================= */
  useEffect(() => {
    localStorage.setItem("rencanaPengiriman", JSON.stringify(plans));
  }, [plans]);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const generateCalendar = () => {
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startDay = (firstDay.getDay() + 6) % 7; // Monday start

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
      [dateKey]: [
        ...(prev[dateKey] || []),
        { id: Date.now(), text }
      ]
    }));
  };

  const handleDelete = (dateKey, id) => {
    setPlans(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(p => p.id !== id)
    }));
  };

  const days = generateCalendar();

  /* ================= RENDER ================= */
  return (
    <div className="p-4">
      {/* HEADER */}
      <h1 className="text-lg font-semibold">Live Report</h1>
      <p className="text-xs text-slate-400">
        PT Bahana Bhumiphala Persada
      </p>
      <p className="text-xs text-gray-400 mt-2">{time}</p>

      {/* FILTER */}
      <div className="flex gap-2 mt-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border px-2 py-1 text-sm"
        >
          {months.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-2 py-1 text-sm"
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* CALENDAR */}
      <div className="grid grid-cols-7 mt-4 border text-sm">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div
            key={d}
            className="bg-blue-800 text-white text-center py-1 font-semibold"
          >
            {d}
          </div>
        ))}

        {days.map((day, i) => {
          if (!day) return <div key={i} className="border h-28"></div>;

          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          return (
            <div key={i} className="border h-28 p-1 relative">
              <div className="font-semibold">{day}</div>

              {plans[dateKey]?.map(p => (
                <div
                  key={p.id}
                  className="bg-blue-100 text-xs mt-1 p-1 rounded flex justify-between"
                >
                  <span>{p.text}</span>
                  <button
                    onClick={() => handleDelete(dateKey, p.id)}
                    className="text-red-500 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onClick={() => handleAdd(dateKey)}
                className="absolute bottom-1 right-1 text-xs text-blue-600"
              >
                + Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
