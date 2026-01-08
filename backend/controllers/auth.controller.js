const bcrypt = require("bcryptjs");
const pool = require("../db");

/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi",
      });
    }

    const result = await pool.query(
      `SELECT user_id, username, nama_lengkap, email, password
       FROM public.users
       WHERE username = $1 OR email = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    req.session.user = {
      id: user.user_id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
    };

    await pool.query(
      "UPDATE public.users SET last_login = NOW() WHERE user_id = $1",
      [user.user_id]
    );

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * ME
 */
exports.me = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Belum login" });
  }
  res.json({ success: true, user: req.session.user });
};

/**
 * UPDATE PROFILE
 */
exports.updateProfile = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Belum login" });
  }

  const { nama_lengkap, email } = req.body;
  const userId = req.session.user.id;

  if (!nama_lengkap || !email) {
    return res.status(400).json({
      success: false,
      message: "Nama lengkap dan email wajib diisi"
    });
  }

  try {
    await pool.query(
      `UPDATE public.users
       SET nama_lengkap = $1, email = $2
       WHERE user_id = $3`,
      [nama_lengkap, email, userId]
    );

    // update session
    req.session.user.nama_lengkap = nama_lengkap;
    req.session.user.email = email;

    res.json({
      success: true,
      message: "Profil berhasil diperbarui",
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * CHANGE PASSWORD
 */
exports.changePassword = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Belum login" });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.session.user.id;

  try {
    const result = await pool.query(
      "SELECT password FROM public.users WHERE user_id = $1",
      [userId]
    );

    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Password lama salah" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE public.users SET password = $1 WHERE user_id = $2",
      [hashed, userId]
    );

    res.json({ success: true, message: "Password berhasil diubah" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid"); // 🔥 HARUS SAMA
    res.json({ success: true, message: "Logout berhasil" });
  });
};
