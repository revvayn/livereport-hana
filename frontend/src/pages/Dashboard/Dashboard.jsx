import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, User, ArrowUpRight, Activity, Command } from "lucide-react";

function Dashboard() {
  const { user } = useOutletContext();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return <LoadingState />;

  const formattedTime = time.toLocaleTimeString("id-ID", { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6 md:p-12 space-y-12"
    >
      {/* Upper Section: Minimalist Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-sm font-medium text-slate-400 uppercase tracking-[0.2em]">Overview</h1>
          <p className="text-3xl font-light text-slate-900">
            Welcome, <span className="font-medium text-black">{user?.nama_lengkap || user?.username}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-slate-400 border-l pl-6 border-slate-200">
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest">Local Time</p>
            <p className="text-lg font-mono font-medium text-slate-800">{formattedTime}</p>
          </div>
          <Clock size={20} className="text-slate-300" />
        </div>
      </header>

      {/* Grid Section: Clean Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Large Feature Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="md:col-span-8 group relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white"
        >
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[200px]">
            <div className="flex justify-between items-start">
              <Activity className="text-indigo-400" size={24} />
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/10 rounded-full">
                <ArrowUpRight size={20} />
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-light mb-2">Sistem Siap Digunakan.</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Semua modul berjalan optimal. Anda dapat mulai mengelola data melalui menu navigasi.
              </p>
            </div>
          </div>
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        </motion.div>

        {/* Small Profile Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-8 flex flex-col justify-between"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
            <User size={24} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-tighter">Current User</p>
            <p className="text-xl font-medium text-slate-900 truncate">@{user?.username}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const LoadingState = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="w-16 h-[2px] bg-slate-100 overflow-hidden relative">
      <motion.div 
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        className="w-full h-full bg-slate-900 absolute"
      />
    </div>
  </div>
);

export default Dashboard;