
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password reset link is invalid or expired. Please request a new reset link."
        );
      }

      setChecking(false);
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: password,
        });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoMark}>S</div>

          <h1 style={styles.title}>
            Verifying Reset Link
          </h1>

          <p style={styles.subtitle}>
            Please wait while we verify your password reset request.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>

          <div style={styles.logoMark}>✓</div>

          <div style={styles.badge}>
            PASSWORD UPDATED
          </div>

          <h1 style={styles.title}>
            Password Changed
          </h1>

          <p style={styles.subtitle}>
            Your Admin password has been updated successfully.
          </p>

          <button
            onClick={() => navigate("/admin-login")}
            style={styles.loginButton}
          >
            Go to Admin Login
          </button>

        </div>
      </div>
    );
  }

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
          ADMIN PASSWORD RESET
        </div>

        <h1 style={styles.title}>
          Set New Password
        </h1>

        <p style={styles.subtitle}>
          Create a new secure password for your Admin account.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {!error && (
          <form onSubmit={handleResetPassword}>

            <div style={styles.field}>
              <label style={styles.label}>
                NEW PASSWORD
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                CONFIRM PASSWORD
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                required
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.loginButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Updating Password..."
                : "Update Password"}
            </button>

          </form>
        )}

        {error && (
          <button
            onClick={() => navigate("/admin-login")}
            style={styles.secondaryButton}
          >
            Back to Admin Login
          </button>
        )}

        <div style={styles.footer}>
          Secure Stratix Algo Admin Portal
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
    textAlign: "left",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
  },

  logoMark: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #d8bd7b, #a98e4e)",
    color: "#151916",
    fontSize: "21px",
    fontWeight: "900",
    flexShrink: 0,
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
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.7px",
  },

  subtitle: {
    margin: "9px 0 28px",
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

  error: {
    marginBottom: "18px",
    padding: "12px 13px",
    borderRadius: "9px",
    background: "#fff0f0",
    border: "1px solid #f0caca",
    color: "#b04444",
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

  secondaryButton: {
    width: "100%",
    border: "1px solid #d5dad5",
    borderRadius: "10px",
    padding: "13px",
    marginTop: "2px",
    background: "#ffffff",
    color: "#4d554f",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  footer: {
    textAlign: "center",
    marginTop: "25px",
    color: "#9a9f9b",
    fontSize: "10px",
    letterSpacing: "0.7px",
  },
};

export default ResetPassword;

