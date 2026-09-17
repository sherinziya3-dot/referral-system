
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function SalesLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        throw loginError;
      }

      const user = data.user;

      // Check whether this user is a sales executive
      const { data: profile, error: profileError } = await supabase
        .from("clients")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error("Sales profile not found.");
      }

      if (profile.role !== "sales") {
        await supabase.auth.signOut();
        throw new Error("This account does not have Sales access.");
      }

      navigate("/sales");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow}></div>

      <div style={styles.card}>
        {/* BRAND */}
        <div style={styles.brand}>
          <div style={styles.brandMark}>S</div>

          <div>
            <div style={styles.brandName}>STRATIX</div>
            <div style={styles.brandSub}>ALGO</div>
          </div>
        </div>

        <div style={styles.divider}></div>

        {/* TITLE */}
        <div style={styles.headingArea}>
          <p style={styles.eyebrow}>SALES PORTAL</p>

          <h1 style={styles.title}>Welcome Back</h1>

          <p style={styles.subtitle}>
            Sign in to access your Sales Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <label style={styles.label}>Email Address</label>

          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>@</span>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* PASSWORD */}
          <label style={styles.label}>Password</label>

          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>●</span>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* ERROR */}
          {error && <div style={styles.error}>{error}</div>}

          {/* LOGIN */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footerText}>
          Authorized Sales Executives Only
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at top left, #26332b 0%, transparent 35%), linear-gradient(135deg, #111612 0%, #171d19 50%, #0d110f 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  backgroundGlow: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(197, 169, 100, 0.07)",
    filter: "blur(90px)",
    right: "-150px",
    bottom: "-160px",
    pointerEvents: "none",
  },

  card: {
    position: "relative",
    width: "100%",
    maxWidth: "430px",
    boxSizing: "border-box",
    padding: "38px 38px 30px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(247,248,245,0.98))",
    border: "1px solid rgba(213, 190, 132, 0.25)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.04)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "11px",
    marginBottom: "22px",
  },

  brandMark: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #d7bd78 0%, #a98d4d 100%)",
    color: "#171b17",
    fontSize: "19px",
    fontWeight: "900",
    boxShadow: "0 6px 16px rgba(169, 141, 77, 0.22)",
  },

  brandName: {
    color: "#1b211d",
    fontSize: "16px",
    fontWeight: "900",
    letterSpacing: "2.8px",
    lineHeight: "16px",
  },

  brandSub: {
    color: "#a48649",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "3.8px",
    marginTop: "3px",
  },

  divider: {
    height: "1px",
    background: "#e6e7e3",
    marginBottom: "28px",
  },

  headingArea: {
    marginBottom: "26px",
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#a48649",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  title: {
    margin: 0,
    color: "#1c221e",
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.7px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#747b75",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "18px",
    color: "#353c36",
    fontSize: "12px",
    fontWeight: "750",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
    background: "#ffffff",
    border: "1px solid #d9ddd8",
    borderRadius: "10px",
    transition: "0.2s ease",
  },

  inputIcon: {
    width: "42px",
    textAlign: "center",
    color: "#a48649",
    fontSize: "14px",
    fontWeight: "800",
    flexShrink: 0,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 13px 13px 0",
    border: "none",
    background: "transparent",
    color: "#202620",
    fontSize: "14px",
    outline: "none",
  },

  error: {
    marginTop: "15px",
    padding: "11px 13px",
    borderRadius: "9px",
    background: "#fff1f0",
    border: "1px solid #f2d0cd",
    color: "#b13b35",
    fontSize: "12px",
    lineHeight: "1.4",
  },

  button: {
    width: "100%",
    marginTop: "25px",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #cdb473 0%, #a98d4d 100%)",
    color: "#171b17",
    fontSize: "14px",
    fontWeight: "850",
    letterSpacing: "0.2px",
    boxShadow: "0 10px 22px rgba(169, 141, 77, 0.20)",
  },

  footerText: {
    textAlign: "center",
    margin: "22px 0 0",
    color: "#929791",
    fontSize: "10px",
    letterSpacing: "0.8px",
  },
};

export default SalesLogin;


