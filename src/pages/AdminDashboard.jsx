import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    setIsAdmin(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(`Authentication error: ${userError.message}`);
        setLoading(false);
        return;
      }

      if (!user) {
        setError("No logged-in user found. Please login first.");
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      const { data: adminUsers, error: adminError } =
        await supabase
          .from("clients")
          .select("user_id, email, role")
          .eq("user_id", user.id)
          .limit(1);

      if (adminError) {
        setError(`Admin check failed: ${adminError.message}`);
        setLoading(false);
        return;
      }

      const adminUser = adminUsers?.[0];

      if (!adminUser) {
        setError(
          "Your logged-in account does not have a client profile in the database."
        );
        setLoading(false);
        return;
      }

      if (adminUser.role !== "admin") {
        setError(
          `Access denied. Your current role is "${adminUser.role || "not set"}".`
        );
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const {
        data: clientData,
        error: clientsError,
      } = await supabase
        .from("clients")
        .select(
          "user_id, name, email, phone, experience, referral_code, referred_by, role"
        )
        .order("name", { ascending: true });

      if (clientsError) {
        setError(
          `Unable to load clients: ${clientsError.message}`
        );
        setLoading(false);
        return;
      }

      setClients(clientData || []);
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong while loading the dashboard."
      );
    }

    setLoading(false);
  };

  const totalClients = clients.length;

  const totalReferrals = clients.filter(
    (client) => client.referred_by
  ).length;

  const getReferralCount = (userId) => {
    return clients.filter(
      (client) => client.referred_by === userId
    ).length;
  };

  const getReferrerName = (userId) => {
    const referrer = clients.find(
      (client) => client.user_id === userId
    );

    if (!referrer) {
      return "Unknown";
    }

    return (
      referrer.name ||
      referrer.email ||
      referrer.referral_code ||
      "Unknown"
    );
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.loadingTitle}>
            Loading Admin Dashboard...
          </div>

          <div style={styles.loadingText}>
            Connecting to Supabase
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={styles.page}>
        <div style={styles.accessCard}>
          <div style={styles.accessIcon}>
            🔒
          </div>

          <h2 style={styles.accessTitle}>
            Admin Access Required
          </h2>

          <p style={styles.accessText}>
            {error}
          </p>

          {currentUser && (
            <div style={styles.debugBox}>
              <p style={styles.debugLabel}>
                CURRENT LOGIN
              </p>

              <p style={styles.debugText}>
                Email: {currentUser.email || "-"}
              </p>

              <p style={styles.debugText}>
                User ID: {currentUser.id}
              </p>
            </div>
          )}

          <button
            onClick={loadDashboard}
            style={styles.refreshButton}
          >
            ↻ Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <p style={styles.label}>
              STRATIX ALGO
            </p>

            <h1 style={styles.title}>
              Admin Dashboard
            </h1>

            <p style={styles.subtitle}>
              Manage clients and referrals
            </p>
          </div>

          <div style={styles.adminBadge}>
            ADMIN
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <div style={styles.statsGrid}>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              TOTAL CLIENTS
            </p>

            <h2 style={styles.statNumber}>
              {totalClients}
            </h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              TOTAL REFERRALS
            </p>

            <h2 style={styles.statNumber}>
              {totalReferrals}
            </h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              REGISTERED CLIENTS
            </p>

            <h2 style={styles.statNumber}>
              {totalClients}
            </h2>
          </div>

        </div>

        <div style={styles.tableCard}>

          <div style={styles.tableHeader}>

            <div>
              <p style={styles.label}>
                CLIENT MANAGEMENT
              </p>

              <h2 style={styles.tableTitle}>
                All Clients
              </h2>
            </div>

            <button
              onClick={loadDashboard}
              style={styles.refreshButton}
            >
              ↻ Refresh
            </button>

          </div>

          {clients.length === 0 ? (
            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                👥
              </div>

              <h3 style={styles.emptyTitle}>
                No clients found
              </h3>

              <p style={styles.emptyText}>
                Registered clients will appear here.
              </p>

            </div>
          ) : (
            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr>

                    <th style={styles.th}>
                      #
                    </th>

                    <th style={styles.th}>
                      NAME
                    </th>

                    <th style={styles.th}>
                      EMAIL
                    </th>

                    <th style={styles.th}>
                      PHONE
                    </th>

                    <th style={styles.th}>
                      EXPERIENCE
                    </th>

                    <th style={styles.th}>
                      REFERRAL CODE
                    </th>

                    <th style={styles.th}>
                      REFERRED BY
                    </th>

                    <th style={styles.th}>
                      REFERRALS
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {clients.map((client, index) => (
                    <tr
                      key={client.user_id || index}
                      style={styles.tr}
                    >

                      <td style={styles.td}>
                        {index + 1}
                      </td>

                      <td style={styles.nameCell}>
                        {client.name || "-"}
                      </td>

                      <td style={styles.td}>
                        {client.email || "-"}
                      </td>

                      <td style={styles.td}>
                        {client.phone || "-"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={styles.experienceBadge}
                        >
                          {client.experience || "-"}
                        </span>
                      </td>

                      <td style={styles.codeCell}>
                        {client.referral_code || "-"}
                      </td>

                      <td style={styles.td}>
                        {client.referred_by
                          ? getReferrerName(
                              client.referred_by
                            )
                          : "Direct"}
                      </td>

                      <td style={styles.referralCount}>
                        {getReferralCount(
                          client.user_id
                        )}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% 0%, #18221f 0%, #0b0f0e 45%, #050706 100%)",
    color: "#ffffff",
    fontFamily: "Inter, Arial, sans-serif",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
  },

  label: {
    color: "#c8ae6a",
    fontSize: "10px",
    letterSpacing: "2.5px",
    fontWeight: "700",
    margin: "0 0 8px",
  },

  title: {
    margin: "0",
    fontSize: "34px",
    fontWeight: "700",
  },

  subtitle: {
    color: "#89918e",
    margin: "8px 0 0",
    fontSize: "14px",
  },

  adminBadge: {
    padding: "10px 18px",
    borderRadius: "20px",
    background:
      "rgba(200,174,106,0.1)",
    border:
      "1px solid rgba(200,174,106,0.3)",
    color: "#c8ae6a",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "25px",
  },

  statCard: {
    background:
      "rgba(16,20,19,0.88)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "25px",
  },

  statLabel: {
    color: "#89918e",
    fontSize: "10px",
    letterSpacing: "1.8px",
    margin: "0",
  },

  statNumber: {
    color: "#c8ae6a",
    fontSize: "34px",
    margin: "10px 0 0",
  },

  tableCard: {
    background:
      "rgba(16,20,19,0.88)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "28px",
    minHeight: "400px",
    overflow: "hidden",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
    paddingBottom: "20px",
    marginBottom: "20px",
  },

  tableTitle: {
    margin: "0",
    fontSize: "22px",
  },

  refreshButton: {
    background:
      "rgba(200,174,106,0.1)",
    border:
      "1px solid rgba(200,174,106,0.3)",
    color: "#c8ae6a",
    borderRadius: "10px",
    padding: "9px 15px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1000px",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "15px 12px",
    color: "#89918e",
    fontSize: "10px",
    letterSpacing: "1.3px",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom:
      "1px solid rgba(255,255,255,0.05)",
  },

  td: {
    padding: "16px 12px",
    color: "#c5cbc8",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  nameCell: {
    padding: "16px 12px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  codeCell: {
    padding: "16px 12px",
    color: "#c8ae6a",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  referralCount: {
    padding: "16px 12px",
    color: "#c8ae6a",
    fontSize: "14px",
    fontWeight: "700",
  },

  experienceBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "8px",
    background:
      "rgba(200,174,106,0.08)",
    border:
      "1px solid rgba(200,174,106,0.2)",
    color: "#c8ae6a",
    fontSize: "11px",
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    color: "#89918e",
  },

  emptyIcon: {
    fontSize: "35px",
    marginBottom: "15px",
  },

  emptyTitle: {
    color: "#ffffff",
    margin: "0 0 10px",
  },

  emptyText: {
    color: "#89918e",
    fontSize: "13px",
    margin: "0 auto",
  },

  loading: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingTitle: {
    color: "#c8ae6a",
    fontSize: "20px",
    fontWeight: "600",
  },

  loadingText: {
    color: "#89918e",
    fontSize: "13px",
    marginTop: "8px",
  },

  accessCard: {
    maxWidth: "600px",
    margin: "100px auto",
    textAlign: "center",
    background:
      "rgba(16,20,19,0.9)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "45px 30px",
  },

  accessIcon: {
    fontSize: "40px",
    marginBottom: "15px",
  },

  accessTitle: {
    margin: "0 0 10px",
    color: "#ffffff",
  },

  accessText: {
    color: "#ff9b9b",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  debugBox: {
    marginTop: "25px",
    padding: "15px",
    textAlign: "left",
    background:
      "rgba(255,255,255,0.04)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
  },

  debugLabel: {
    color: "#c8ae6a",
    fontSize: "10px",
    letterSpacing: "1.5px",
    margin: "0 0 8px",
  },

  debugText: {
    color: "#89918e",
    fontSize: "12px",
    wordBreak: "break-all",
    margin: "5px 0",
  },

  errorBox: {
    background:
      "rgba(180,60,60,0.1)",
    border:
      "1px solid rgba(180,60,60,0.3)",
    color: "#ff9b9b",
    padding: "12px 15px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "13px",
  },
};

export default AdminDashboard;