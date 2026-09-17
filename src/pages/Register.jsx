
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Register() {
  const [searchParams] = useSearchParams();

  // Referral code comes from URL:
  // /register?ref=SAL1001
  // This is used internally and is NOT shown to the client.
  const referralCode = searchParams.get("ref");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      // ================================================
      // FIND SALES REFERRER
      // ================================================

      let referredBy = null;

      if (referralCode) {
        const { data: referrerId, error: referrerError } =
          await supabase.rpc("get_referrer_id", {
            p_referral_code: referralCode,
          });

        if (referrerError || !referrerId) {
          setMessage("This referral link is invalid or expired.");
          setLoading(false);
          return;
        }

        referredBy = referrerId;
      }

      // ================================================
      // CREATE AUTH ACCOUNT
      // ================================================

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      if (!user) {
        setMessage("Unable to create your account. Please try again.");
        setLoading(false);
        return;
      }

      // ================================================
      // CREATE CLIENT PROFILE
      // ================================================

      const {
        data: generatedReferralCode,
        error: clientError,
      } = await supabase.rpc("create_client_profile", {
        p_name: name,
        p_email: email,
        p_phone: phone,
        p_experience: experience,
        p_referred_by: referredBy,
      });

      if (clientError) {
        setMessage(clientError.message);
        setLoading(false);
        return;
      }

      // ================================================
      // SET SALES OWNER
      // ================================================

      if (referralCode) {
        const { error: ownerError } = await supabase.rpc(
          "set_sales_owner_for_current_user",
          {
            p_referral_code: referralCode,
          }
        );

        if (ownerError) {
          setMessage(ownerError.message);
          setLoading(false);
          return;
        }
      }

      // ================================================
      // SUCCESS
      // ================================================

      setGeneratedCode(generatedReferralCode);
      setSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // ================================================
  // CLIENT REFERRAL LINK
  // ================================================

  const referralLink = generatedCode
    ? `${window.location.origin}/register?ref=${generatedCode}`
    : "";

  // ================================================
  // COPY CLIENT REFERRAL LINK
  // ================================================

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setMessage("Referral link copied successfully!");
    } catch {
      setMessage("Unable to copy the referral link.");
    }
  };

  // =========================================================
  // SUCCESS PAGE
  // =========================================================

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.backgroundGlow}></div>

        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>

          <p style={styles.smallLabel}>
            REGISTRATION COMPLETE
          </p>

          <h1 style={styles.successTitle}>
            Welcome to{" "}
            <span style={styles.titleSpan}>
              Stratix Algo
            </span>
          </h1>

          <p style={styles.successText}>
            Your account has been created successfully.
            Your personal referral code is ready.
          </p>

          <div style={styles.codeBox}>
            <p style={styles.codeLabel}>
              YOUR REFERRAL CODE
            </p>

            <h2 style={styles.generatedCode}>
              {generatedCode}
            </h2>
          </div>

          <button
            style={styles.copyButton}
            onClick={copyReferralLink}
          >
            Copy My Referral Link
          </button>

          {message && (
            <p style={styles.successMessage}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // REGISTRATION PAGE
  // =========================================================

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow}></div>

      <div style={styles.container}>

        {/* BRAND */}
        <div style={styles.brand}>
          <div style={styles.logo}>
            S
          </div>

          <div>
            <h2 style={styles.brandName}>
              STRATIX
            </h2>

            <p style={styles.brandSub}>
              ALGO
            </p>
          </div>
        </div>

        {/* CARD */}
        <div style={styles.card}>

          {/* HEADER */}
          <div style={styles.cardHeader}>

            <p style={styles.smallLabel}>
              CLIENT REGISTRATION
            </p>

            <h1 style={styles.title}>
              Start Your{" "}
              <span style={styles.titleSpan}>
                Journey
              </span>
            </h1>

            <p style={styles.subtitle}>
              Create your account and get your personal
              referral code.
            </p>

          </div>

          {/* 
            IMPORTANT:
            Sales referral code is intentionally NOT shown here.
            Example:
            /register?ref=SAL1001

            SAL1001 is captured internally and saved to Supabase.
          */}

          {/* FORM */}
          <form onSubmit={handleRegister}>

            {/* NAME */}
            <label style={styles.label}>
              FULL NAME
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />

            {/* EMAIL */}
            <label style={styles.label}>
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />

            {/* PHONE */}
            <label style={styles.label}>
              PHONE NUMBER
            </label>

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              required
            />

            {/* EXPERIENCE */}
            <label style={styles.label}>
              TRADING EXPERIENCE
            </label>

            <div style={styles.experienceGrid}>

              <button
                type="button"
                onClick={() => setExperience("Beginner")}
                style={{
                  ...styles.experienceButton,
                  ...(experience === "Beginner"
                    ? styles.experienceActive
                    : {}),
                }}
              >
                <span style={styles.number}>
                  01
                </span>

                Beginner
              </button>

              <button
                type="button"
                onClick={() => setExperience("Experienced")}
                style={{
                  ...styles.experienceButton,
                  ...(experience === "Experienced"
                    ? styles.experienceActive
                    : {}),
                }}
              >
                <span style={styles.number}>
                  02
                </span>

                Experienced
              </button>

            </div>

            {/* PASSWORD */}
            <label style={styles.label}>
              PASSWORD
            </label>

            <input
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              minLength={6}
              required
            />

            {/* ERROR */}
            {message && (
              <p style={styles.error}>
                {message}
              </p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || !experience}
              style={{
                ...styles.submitButton,
                ...(loading || !experience
                  ? styles.submitDisabled
                  : {}),
              }}
            >
              {loading
                ? "Creating Account..."
                : "Create Account  →"}
            </button>

          </form>

          {/* FOOTER */}
          <p style={styles.footerText}>
            By creating an account, you agree to continue
            with Stratix Algo.
          </p>

        </div>

        <p style={styles.bottomText}>
          © 2026 Stratix Algo · Secure Client Registration
        </p>

      </div>
    </div>
  );
}

// =========================================================
// PREMIUM STRATIX THEME
// =========================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% -10%, #30352f 0%, #171b19 35%, #080a09 75%, #050605 100%)",
    color: "#f8f7f3",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "45px 20px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  backgroundGlow: {
    position: "absolute",
    width: "620px",
    height: "620px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(214,184,112,0.12) 0%, rgba(214,184,112,0.035) 35%, transparent 70%)",
    filter: "blur(25px)",
    top: "-330px",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "540px",
    position: "relative",
    zIndex: 2,
  },

  // =====================================================
  // BRAND
  // =====================================================

  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "13px",
    marginBottom: "28px",
  },

  logo: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "900",
    letterSpacing: "1px",
    color: "#f4e4bd",
    background:
      "linear-gradient(145deg, rgba(214,184,112,0.18), rgba(255,255,255,0.035))",
    border: "1px solid rgba(214,184,112,0.42)",
    boxShadow:
      "0 0 25px rgba(214,184,112,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
  },

  brandName: {
    margin: 0,
    fontSize: "18px",
    letterSpacing: "4.5px",
    fontWeight: "850",
    color: "#ffffff",
    lineHeight: 1,
  },

  brandSub: {
    margin: "5px 0 0",
    fontSize: "8px",
    letterSpacing: "5.5px",
    color: "#cdb47a",
    fontWeight: "700",
    opacity: 0.9,
  },

  // =====================================================
  // MAIN CARD
  // =====================================================

  card: {
    background:
      "linear-gradient(145deg, rgba(29,34,31,0.98) 0%, rgba(15,18,17,0.99) 100%)",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "26px",
    padding: "40px",
    boxShadow:
      "0 35px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(214,184,112,0.025)",
    backdropFilter: "blur(22px)",
    boxSizing: "border-box",
  },

  cardHeader: {
    marginBottom: "28px",
  },

  smallLabel: {
    color: "#d8bd7b",
    fontSize: "10px",
    letterSpacing: "2.8px",
    fontWeight: "800",
    margin: "0 0 13px",
  },

  title: {
    margin: 0,
    fontSize: "37px",
    lineHeight: 1.12,
    letterSpacing: "-1.5px",
    fontWeight: "800",
    color: "#ffffff",
  },

  titleSpan: {
    color: "#d8bd7b",
  },

  subtitle: {
    color: "#aeb5b1",
    fontSize: "14px",
    lineHeight: 1.65,
    margin: "13px 0 0",
    maxWidth: "430px",
  },

  // =====================================================
  // FORM
  // =====================================================

  label: {
    display: "block",
    fontSize: "9px",
    letterSpacing: "1.9px",
    fontWeight: "800",
    color: "#c9cfcc",
    marginBottom: "9px",
    marginTop: "19px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#0b0e0d",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    padding: "15px 16px",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
    transition: "all 0.2s ease",
    boxShadow:
      "inset 0 1px 2px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.02)",
  },

  // =====================================================
  // EXPERIENCE
  // =====================================================

  experienceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "11px",
  },

  experienceButton: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0b0e0d",
    color: "#b8bfbb",
    borderRadius: "12px",
    padding: "15px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },

  experienceActive: {
    border: "1px solid rgba(216,189,123,0.7)",
    background:
      "linear-gradient(135deg, rgba(216,189,123,0.14), rgba(216,189,123,0.055))",
    color: "#e0c786",
    boxShadow:
      "0 0 20px rgba(216,189,123,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
  },

  number: {
    fontSize: "9px",
    marginRight: "10px",
    color: "#858d89",
    opacity: 0.8,
  },

  // =====================================================
  // SUBMIT BUTTON
  // =====================================================

  submitButton: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "27px",
    background:
      "linear-gradient(135deg, #e0c786 0%, #c5a967 100%)",
    color: "#11120f",
    fontSize: "13px",
    fontWeight: "850",
    letterSpacing: "0.7px",
    cursor: "pointer",
    boxShadow:
      "0 12px 30px rgba(214,184,112,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
  },

  submitDisabled: {
    opacity: 0.42,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  error: {
    color: "#f09a9a",
    fontSize: "12px",
    marginTop: "14px",
    lineHeight: 1.5,
  },

  footerText: {
    color: "#777f7b",
    textAlign: "center",
    fontSize: "10px",
    lineHeight: 1.6,
    margin: "21px 0 0",
  },

  bottomText: {
    textAlign: "center",
    color: "#626a66",
    fontSize: "10px",
    marginTop: "21px",
  },

  // =====================================================
  // SUCCESS PAGE
  // =====================================================

  successCard: {
    width: "100%",
    maxWidth: "540px",
    background:
      "linear-gradient(145deg, rgba(29,34,31,0.99), rgba(14,17,16,1))",
    border: "1px solid rgba(216,189,123,0.28)",
    borderRadius: "26px",
    padding: "52px 40px",
    textAlign: "center",
    boxShadow:
      "0 35px 100px rgba(0,0,0,0.58), 0 0 50px rgba(216,189,123,0.035)",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
  },

  successIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "50%",
    margin: "0 auto 23px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(145deg, rgba(216,189,123,0.17), rgba(216,189,123,0.05))",
    border: "1px solid rgba(216,189,123,0.42)",
    color: "#e0c786",
    fontSize: "26px",
    fontWeight: "800",
    boxShadow:
      "0 0 30px rgba(216,189,123,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
  },

  successTitle: {
    fontSize: "31px",
    lineHeight: 1.2,
    margin: 0,
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: "-0.7px",
  },

  successText: {
    color: "#aeb5b1",
    fontSize: "14px",
    lineHeight: 1.65,
    margin: "14px auto 27px",
    maxWidth: "390px",
  },

  codeBox: {
    padding: "21px",
    borderRadius: "15px",
    background: "#0a0d0c",
    border: "1px solid rgba(216,189,123,0.25)",
    marginBottom: "17px",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.025)",
  },

  codeLabel: {
    margin: "0 0 9px",
    fontSize: "9px",
    letterSpacing: "2.2px",
    color: "#8b9490",
    fontWeight: "700",
  },

  generatedCode: {
    fontSize: "31px",
    letterSpacing: "5px",
    color: "#e0c786",
    margin: 0,
    fontWeight: "800",
  },

  copyButton: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "none",
    background:
      "linear-gradient(135deg, #e0c786 0%, #c5a967 100%)",
    color: "#11120f",
    fontWeight: "850",
    fontSize: "13px",
    letterSpacing: "0.4px",
    cursor: "pointer",
    boxShadow:
      "0 12px 30px rgba(214,184,112,0.13)",
  },

  successMessage: {
    color: "#d8bd7b",
    fontSize: "12px",
    marginTop: "15px",
  },
};

export default Register;
