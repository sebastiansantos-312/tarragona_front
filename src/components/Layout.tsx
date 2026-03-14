import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Toaster } from "./Toast";

const links = [
    { to: "/", label: "Fiestas", icon: "🎉", end: true },
    { to: "/clientes", label: "Clientes", icon: "👤", end: false },
    { to: "/reportes", label: "Reportes", icon: "📊", end: false },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    return (
        <div className="layout">
            {/* Mobile top bar */}
            <div className="mobile-topbar">
                <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
                    <span />
                    <span />
                    <span />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="brand-icon" style={{ width: 28, height: 28, borderRadius: 8, fontSize: 14 }}>🎉</div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>Tarragona</span>
                </div>
                <div style={{ width: 32 }} />
            </div>

            {/* Mobile overlay */}
            <div
                className={`mobile-overlay ${sidebarOpen ? "open" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-inner">
                    <div className="sidebar-brand">
                        <div className="brand-icon">🎉</div>
                        <div>
                            <div className="brand-name">Tarragona</div>
                            <div className="brand-tag">Gestión de Eventos</div>
                        </div>
                    </div>

                    <div className="sidebar-section-label">Navegación</div>
                    <nav className="sidebar-section">
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.end}
                                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="nav-icon">{l.icon}</span>
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <p className="sidebar-footer-text">
                            v1.0 · Fiestas y Eventos
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">
                <Outlet />
            </main>

            <Toaster />
        </div>
    );
}