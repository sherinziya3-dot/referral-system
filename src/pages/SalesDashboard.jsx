import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function SalesDashboard() {
  const navigate = useNavigate();

  const [salesUser, setSalesUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSalesDashboard();
  }, []);

  const loadSalesDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/sales-login");
        return;
      }

      setSalesUser(user);

      // Get sales profile
      const { data: profileData, error: profileError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Only sales users can access this dashboard
      if (profileData.role !== "sales") {
        setError("Sales access required.");
        return;
      }

      setProfile(profileData);

      // Get clients directly referred by this sales executive
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("sales_owner_id", user.id)
        .order("created_at", { ascending: false });

      if (clientError) throw clientError;

      setClients(clientData || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!profile?.referral_code) return;

    const link = `${window.location.origin}/register?ref=${profile.referral_code}`;

    await navigator.clipboard.writeText(link);
    alert("Referral link copied!");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/sales-login");
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <h2>Access Denied</h2>
        <p>{error}</p>
        <button style={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Sales Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome, {profile?.name || "Sales Executive"}
          </p>
        </div>

        <button style={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </header>

      <main style={styles.container}>
        {/* Referral Section */}
        <section style={styles.referralCard}>
          <div>
            <p style={styles.label}>YOUR REFERRAL CODE</p>

            <h2 style={styles.code}>
              {profile?.referral_code || "Not Assigned"}
            </h2>

            <p style={styles.link}>
              {window.location.origin}/register?ref=
              {profile?.referral_code}
            </p>
          </div>

          <button style={styles.copyButton} onClick={copyReferralLink}>
            Copy Referral Link
          </button>
        </section>

        {/* Stats */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>MY CLIENTS</p>
            <h2 style={styles.statNumber}>{clients.length}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>MY REFERRAL CODE</p>
            <h2 style={styles.statCode}>
              {profile?.referral_code || "-"}
            </h2>
          </div>
        </section>

        {/* Clients */}
        <section style={styles.clientsSection}>
          <div style={styles.sectionHeader}>
            <h2>My Clients</h2>
            <button onClick={loadSalesDashboard} style={styles.refreshButton}>
              Refresh
            </button>
          </div>

          {clients.length === 0 ? (
            <div style={styles.empty}>
              <h3>No clients yet</h3>
              <p>
                Share your referral link with customers to see their
                registrations here.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Experience</th>
                    <th style={styles.th}>Referral Code</th>
                    <th style={styles.th}>Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td style={styles.td}>{client.name || "-"}</td>
                      <td style={styles.td}>{client.email || "-"}</td>
                      <td style={styles.td}>{client.phone || "-"}</td>
                      <td style={styles.td}>
                        {client.experience || "-"}
                      </td>
                      <td style={styles.td}>
                        {client.referral_code || "-"}
                      </td>
                      <td style={styles.td}>
                        {client.created_at
                          ? new Date(client.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f6f4 0%, #eef0ed 50%, #e7eae6 100%)",
    color: "#20251f",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* ================= HEADER ================= */

  header: {
    background:
      "linear-gradient(135deg, #18201b 0%, #202a23 55%, #151b17 100%)",
    color: "#ffffff",
    padding: "22px 42px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(213, 190, 132, 0.25)",
    boxShadow: "0 8px 28px rgba(0, 0, 0, 0.14)",
  },

  title: {
    margin: 0,
    fontSize: "27px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    color: "#ffffff",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#c8cec9",
    fontSize: "14px",
    fontWeight: "400",
  },

  logoutButton: {
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.07)",
    color: "#ffffff",
    padding: "10px 19px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    transition: "0.2s ease",
  },

  /* ================= MAIN ================= */

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "36px 25px 50px",
  },

  /* ================= REFERRAL CARD ================= */

  referralCard: {
    background:
      "linear-gradient(135deg, #ffffff 0%, #fafbf9 100%)",
    borderRadius: "18px",
    padding: "28px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    border: "1px solid rgba(35, 42, 37, 0.08)",
    boxShadow: "0 12px 32px rgba(25, 32, 27, 0.07)",
    marginBottom: "22px",
  },

  label: {
    margin: 0,
    fontSize: "10px",
    fontWeight: "800",
    color: "#858b86",
    letterSpacing: "1.8px",
  },

  code: {
    margin: "8px 0 7px",
    fontSize: "33px",
    letterSpacing: "4px",
    fontWeight: "850",
    color: "#1d241f",
  },

  link: {
    margin: 0,
    color: "#7a817b",
    wordBreak: "break-all",
    fontSize: "13px",
  },

  copyButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #c9b06f 0%, #a98e4e 100%)",
    color: "#171b17",
    padding: "13px 20px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "13px",
    boxShadow: "0 7px 18px rgba(169, 142, 78, 0.18)",
  },

  /* ================= STATS ================= */

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "17px",
    padding: "25px 27px",
    border: "1px solid rgba(35, 42, 37, 0.07)",
    boxShadow: "0 9px 27px rgba(25, 32, 27, 0.06)",
  },

  statLabel: {
    margin: 0,
    color: "#7b827c",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.6px",
  },

  statNumber: {
    fontSize: "37px",
    margin: "8px 0 0",
    color: "#202720",
    fontWeight: "850",
  },

  statCode: {
    fontSize: "29px",
    margin: "8px 0 0",
    color: "#a3874a",
    letterSpacing: "3px",
    fontWeight: "850",
  },

  /* ================= CLIENTS ================= */

  clientsSection: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "27px",
    border: "1px solid rgba(35, 42, 37, 0.07)",
    boxShadow: "0 9px 27px rgba(25, 32, 27, 0.06)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "19px",
  },

  refreshButton: {
    border: "1px solid #d9ddd8",
    background: "#f8f9f7",
    color: "#303730",
    padding: "9px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },

  /* ================= TABLE ================= */

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "11px",
    border: "1px solid #e6e9e5",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff",
  },

  th: {
    textAlign: "left",
    padding: "14px 15px",
    borderBottom: "1px solid #e1e5e1",
    fontSize: "10px",
    color: "#69716b",
    letterSpacing: "0.7px",
    fontWeight: "800",
    background: "#f7f8f6",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 15px",
    borderBottom: "1px solid #eef0ed",
    fontSize: "13px",
    color: "#303730",
    whiteSpace: "nowrap",
  },

  empty: {
    textAlign: "center",
    padding: "55px 20px",
    color: "#727a74",
  },

  /* ================= LOADING / ERROR ================= */

  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #f5f6f4 0%, #e8ebe7 100%)",
    color: "#20251f",
  },
};

export default SalesDashboard;