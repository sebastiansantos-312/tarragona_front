import { NavLink, Outlet } from "react-router-dom";

const links = [
    { to: "/", label: "Fiestas", icon: "🎉" },
    { to: "/clientes", label: "Clientes", icon: "👤" },
    { to: "/reportes", label: "Reportes", icon: "📊" },
];

export default function Layout() {
    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-brand">Tarragona</div>
                <nav className="sidebar-nav">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === "/"}
                            className={({ isActive }) =>
                                `nav-link${isActive ? " active" : ""}`
                            }
                        >
                            <span className="nav-icon">{l.icon}</span>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
