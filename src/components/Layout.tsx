import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "./Toast";

const NAV = [
    { to: "/", label: "Fiestas", icon: "🎉", end: true },
    { to: "/clientes", label: "Clientes", icon: "👤", end: false },
    { to: "/reportes", label: "Reportes", icon: "📊", end: false },
];

export default function Layout() {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => { setOpen(false); }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <div className="layout">
            {/* Mobile top bar */}
            <div className="topbar">
                <button className="hburg" onClick={() => setOpen(v => !v)} aria-label="Menú">
                    <span /><span /><span />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="brand-dot" style={{ width: 24, height: 24, borderRadius: 7, fontSize: 12 }}>🎉</div>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>Tarragona</span>
                </div>
                <div style={{ width: 28 }} />
            </div>

            {/* Overlay */}
            <div className={`mob-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />

            {/* Sidebar */}
            <aside className={`sidebar${open ? " open" : ""}`}>
                <div className="sidebar-inner">
                    <div className="sidebar-brand">
                        <div className="brand-dot">🎉</div>
                        <div>
                            <div className="brand-name">Tarragona</div>
                            <div className="brand-sub">Eventos</div>
                        </div>
                    </div>

                    <div className="nav-section-label">Menú</div>
                    <nav>
                        {NAV.map(l => (
                            <NavLink
                                key={l.to} to={l.to} end={l.end}
                                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                            >
                                <div className="nav-dot" />
                                <span className="nav-icon">{l.icon}</span>
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <p className="sidebar-version">v1.0 · 2026</p>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>

            <Toaster />
        </div>
    );
}
