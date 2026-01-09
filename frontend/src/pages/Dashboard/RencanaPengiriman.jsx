import { useEffect, useState } from "react";

export default function RencanaPengiriman() {
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

  return (
    <div>
      <h1 className="text-lg font-semibold">Live Report</h1>
      <p className="text-xs text-slate-400">
        PT Bahana Bhumiphala Persada
      </p>
      <p className="text-xs text-gray-400 mt-2">{time}</p>
    </div>
  );
}
