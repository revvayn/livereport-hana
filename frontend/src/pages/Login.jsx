import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "./assets/logo.png";
import Swal from "sweetalert2";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      return Swal.fire("Warning", "Username & Password wajib diisi", "warning");
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { username, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        sessionStorage.setItem("isLoggedIn", "true");

        Swal.fire({
          toast: true,
          position: "top",
          icon: "success",
          title: "Login berhasil",
          showConfirmButton: false,
          timer: 2000,
        });

        navigate("/dashboard");
      } else {
        Swal.fire("Login gagal", res.data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        {/* LOGO */}
        <img src={logo} alt="Logo" className="login-logo" />

        {/* INPUT */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
