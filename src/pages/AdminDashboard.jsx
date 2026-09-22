import React, { useEffect, useState } from "react";
import {BarChart3, ShieldCheck, Sparkles, Users, Trash2, RefreshCw, ArrowUpRight, WalletCards, UserCog} from "lucide-react";

import { authApiClient, unwrap } from "../api";
import { getUser } from "../App";

export default function AdminDashboard() {
  const me = getUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // ============================
  // LOAD USERS
  // ============================
  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authApiClient.adminUsers();
      const data = unwrap(response);

      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Admin users error:", e);

      setError(
        e?.message ||
          "Unable to load users. Make sure the authentication backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ============================
  // CHANGE ROLE
  // ============================
  const changeRole = async (user) => {
    if (user.id === me?.authUserId) {
      alert("You cannot change your own administrator role.");
      return;
    }

    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";

    const confirmed = window.confirm(
      `Change ${user.name}'s role to ${newRole}?`
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      await authApiClient.adminSetRole(user.id, newRole);

      await loadUsers();
    } catch (e) {
      console.error("Role update error:", e);

      setError(
        e?.message || "Unable to change the user's role."
      );
    } finally {
      setBusy(false);
    }
  };

  // ============================
  // DELETE USER
  // ============================
  const deleteUser = async (user) => {
    if (user.id === me?.authUserId) {
      alert("You cannot delete your own administrator account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}'s authentication account?`
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      await authApiClient.adminDeleteUser(user.id);

      await loadUsers();
    } catch (e) {
      console.error("Delete user error:", e);

      setError(
        e?.message || "Unable to delete the user."
      );
    } finally {
      setBusy(false);
    }
  };

  // ============================
  // COUNTS
  // ============================
  const adminCount = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const normalUserCount = users.filter(
    (user) => user.role === "USER"
  ).length;

  return (
    <div>

      {/* ============================
          PAGE HEADER
      ============================ */}
      <div className="page-header admin-header">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>

          <h1><span className="title-with-icon"><ShieldCheck size={25}/>Control Center</span></h1>

          <p>
            Manage SpendWise accounts and roles from one secure
            administrator workspace.
          </p>
        </div>

        <button
          className="soft-btn"
          onClick={loadUsers}
          disabled={loading || busy}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>


      {/* ============================
          ERROR
      ============================ */}
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}


      {/* ============================
          STATISTICS
      ============================ */}
      <div className="stat-grid">

        <div className="stat-card teal">
          <div className="stat-top">
            <span>Registered accounts</span>

            <div className="stat-icon">
              <Users size={18} />
            </div>
          </div>

          <b>{users.length}</b>

          <span>
            Authentication accounts
          </span>
        </div>


        <div className="stat-card purple">
          <div className="stat-top">
            <span>Administrators</span>

            <div className="stat-icon">
              <ShieldCheck size={18} />
            </div>
          </div>

          <b>{adminCount}</b>

          <span>
            Accounts with ADMIN access
          </span>
        </div>


        <div className="stat-card blue">
          <div className="stat-top">
            <span>Normal users</span>

            <div className="stat-icon">
              <UserCog size={18} />
            </div>
          </div>

          <b>{normalUserCount}</b>

          <span>
            Accounts with USER access
          </span>
        </div>


        <div className="stat-card orange">
          <div className="stat-top">
            <span>Current admin</span>

            <div className="stat-icon">
              <ShieldCheck size={18} />
            </div>
          </div>

          <b>ADMIN</b>

          <span>
            Full administrator access
          </span>
        </div>

      </div>


      {/* ============================
          USERS TABLE
      ============================ */}
      <div className="admin-banner"><div><span className="eyebrow">ADMIN SPACE</span><b>Everything important, one calm view.</b><small>Manage roles, accounts and workspace health without leaving SpendWise.</small></div><div className="admin-banner-art" aria-hidden="true"><ShieldCheck size={28}/><Sparkles size={28}/><BarChart3 size={28}/></div></div>

      <div className="panel">

        <div className="panel-head">

          <div>
            <span className="eyebrow">
              ACCOUNT MANAGEMENT
            </span>

            <h2>Users & Roles</h2>
          </div>

          <span className="badge blue">
            <ShieldCheck size={12} />
            Admin only
          </span>

        </div>


        {loading ? (

          <p>Loading accounts...</p>

        ) : users.length === 0 ? (

          <div className="empty-state">
            <Users size={32} />

            <h3>No users found</h3>

            <p>
              No authentication accounts are currently
              available.
            </p>
          </div>

        ) : (

          <div className="table-card">

            <div className="table-scroll">

              <table>

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Profile</th>
                    <th>Role</th>
                    <th>Provider</th>
                    <th>Actions</th>
                  </tr>
                </thead>


                <tbody>

                  {users.map((user) => (

                    <tr key={user.id}>

                      {/* USER */}
                      <td>
                        <b>
                          {user.name}
                        </b>

                        <span className="table-sub">
                          ID #{user.id}
                        </span>
                      </td>


                      {/* EMAIL */}
                      <td>
                        {user.email}
                      </td>


                      {/* PROFILE */}
                      <td>

                        {user.profileId ? (

                          <span className="badge green">
                            Linked #{user.profileId}
                          </span>

                        ) : (

                          <span className="badge">
                            Not linked
                          </span>

                        )}

                      </td>


                      {/* ROLE */}
                      <td>

                        <span
                          className={`badge ${
                            user.role === "ADMIN"
                              ? "purple"
                              : "blue"
                          }`}
                        >
                          {user.role}
                        </span>

                      </td>


                      {/* PROVIDER */}
                      <td>
                        {user.provider || "LOCAL"}
                      </td>


                      {/* ACTIONS */}
                      <td>

                        <div className="row-actions">

                          <button
                            className="soft-btn small"
                            disabled={
                              busy ||
                              user.id === me?.authUserId
                            }
                            onClick={() =>
                              changeRole(user)
                            }
                          >
                            {user.role === "ADMIN"
                              ? "Make User"
                              : "Make Admin"}
                          </button>


                          <button
                            className="icon-btn danger"
                            disabled={
                              busy ||
                              user.id === me?.authUserId
                            }
                            onClick={() =>
                              deleteUser(user)
                            }
                            title="Delete authentication account"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>


      {/* ============================
          SECURITY INFORMATION
      ============================ */}
      <div
        className="insight-strip"
        style={{ marginTop: 18 }}
      >

        <div className="signal">

          <ShieldCheck size={17} />

          <div>

            <b>
              Role-based access is enabled
            </b>

            <small>
              Only ADMIN users can access this
              administrator dashboard and administrator
              APIs. Normal users are restricted to their
              personal account.
            </small>

          </div>

        </div>

      </div>

    </div>
  );
}