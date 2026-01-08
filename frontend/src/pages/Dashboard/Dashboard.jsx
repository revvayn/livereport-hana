import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

function Dashboard() {
  const { user } = useOutletContext();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return <p className="text-center mt-20">Loading user...</p>;
  }

  return (
      <div className="bg-white p-8 rounded-xl shadow-lg w-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h2>

        <p className="text-gray-600 mb-4">
          Selamat datang,{" "}
          <span className="font-semibold text-gray-900">
            {user?.nama_lengkap || user?.username}
          </span>
        </p>

        <div className="border-t pt-4 text-sm text-gray-500">
          Silakan pilih menu di samping untuk melanjutkan aktivitas Anda.
        </div>
      </div>

  );
}

export default Dashboard;
