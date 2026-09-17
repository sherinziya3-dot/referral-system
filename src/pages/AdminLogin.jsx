
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

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

      if (!user) {
        throw new Error("Login failed. Please try again.");
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("clients")
          .select("role")
          .eq("user_id", user.id)
          .single();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error("Admin profile not found.");
      }

      if (profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("This account does not have Admin access.");
      }

      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your admin email address first.");
      return;
    }

    setResetLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: resetError } =
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5174/reset-password",
  });

      if (resetError) {
        throw resetError;
      }

      setMessage(
        "Password reset link has been sent to your email. Please check your inbox."
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.brand}>
          <div style={styles.logoMark}>S</div>

          <div>
            <div style={styles.brandName}>
              STRATIX
            </div>

            <div style={styles.brandSub}>
              ALGO
            </div>
          </div>
        </div>

        <div style={styles.badge}>
          ADMIN PORTAL
        </div>

        <h1 style={styles.title}>
          Welcome Back
        </h1>

        <p style={styles.subtitle}>
          Sign in to access your Admin Dashboard
        </p>

        <form onSubmit={handleLogin}>

          <div style={styles.field}>
            <label style={styles.label}>
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              PASSWORD
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.forgotWrapper}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              style={styles.forgotButton}
            >
              {resetLoading
                ? "Sending..."
                : "Forgot Password?"}
            </button>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <div style={styles.footer}>
          Authorized Administrators Only
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at top, #26322d 0%, #111614 45%, #070908 100%)",
    fontFamily: "Inter, Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    background:
      "linear-gradient(145deg, #fdfdfb 0%, #f3f4f0 100%)",
    borderRadius: "24px",
    padding: "42px 38px",
    boxSizing: "border-box",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.35)",
    border:
      "1px solid rgba(216,189,123,0.25)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
  },

  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #d8bd7b, #a98e4e)",
    color: "#151916",
    fontSize: "21px",
    fontWeight: "900",
  },

  brandName: {
    color: "#20251f",
    fontSize: "16px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  brandSub: {
    color: "#a98e4e",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "3px",
    marginTop: "2px",
  },

  badge: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "7px",
    background: "#eeece4",
    color: "#9a8045",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginBottom: "18px",
  },

  title: {
    margin: "0",
    color: "#1d241f",
    fontSize: "31px",
    fontWeight: "800",
    letterSpacing: "-0.7px",
  },

  subtitle: {
    margin: "9px 0 30px",
    color: "#747b75",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  field: {
    marginBottom: "19px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#666e68",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.4px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    borderRadius: "10px",
    border: "1px solid #d8ddd8",
    background: "#ffffff",
    color: "#20251f",
    fontSize: "13px",
    outline: "none",
  },

  forgotWrapper: {
    textAlign: "right",
    marginTop: "-8px",
    marginBottom: "18px",
  },

  forgotButton: {
    border: "none",
    background: "transparent",
    color: "#a98e4e",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    padding: "4px 0",
  },

  error: {
    marginBottom: "17px",
    padding: "11px 13px",
    borderRadius: "9px",
    background: "#fff0f0",
    border: "1px solid #f0caca",
    color: "#b04444",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  success: {
    marginBottom: "17px",
    padding: "11px 13px",
    borderRadius: "9px",
    background: "#eef8f0",
    border: "1px solid #c8e3cc",
    color: "#347346",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    background:
      "linear-gradient(135deg, #d8bd7b 0%, #aa8f4e 100%)",
    color: "#171b17",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 10px 24px rgba(169,142,78,0.22)",
  },

  footer: {
    textAlign: "center",
    marginTop: "25px",
    color: "#9a9f9b",
    fontSize: "10px",
    letterSpacing: "0.7px",
  },
};

export default AdminLogin;

