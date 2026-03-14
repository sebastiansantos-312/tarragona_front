import { useEffect, useState } from "react";
import type { ClienteResponse } from "../types";
import { listarClientes, buscarCliente, crearCliente } from "../services/api";
import { toast } from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [cedula, setCedula] = useState("");
    const [nombre, setNombre] = useState("");

    const cargar = async () => {
        setLoading(true);
        try {
            const data = await listarClientes();
            setClientes(data);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Error al cargar clientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void cargar(); }, []);

    const handleBuscar = async () => {
        if (!busqueda.trim()) { void cargar(); return; }
        setLoading(true);
        try {
            const data = await buscarCliente(busqueda.trim());
            setClientes([data]);
        } catch (e) {
            setClientes([]);
            toast.error(e instanceof Error ? e.message : "Cliente no encontrado");
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = await crearCliente({ cedula, nombre });
            toast.success(`Cliente "${data.nombre}" creado exitosamente`);
            setCedula("");
            setNombre("");
            setShowModal(false);
            void cargar();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Error al crear cliente");
        } finally {
            setSaving(false);
        }
    };

    const filtered = busqueda
        ? clientes.filter(c =>
            c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.cedula.includes(busqueda)
        )
        : clientes;

    const initials = (name: string) =>
        name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const avatarColor = (ced: string) => {
        const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#22c55e", "#3b82f6", "#ef4444"];
        const idx = ced.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
        return colors[idx];
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">
                        {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <span>+</span> Nuevo Cliente
                </button>
            </div>

            <div className="filter-bar">
                <label className="form-label" style={{ flex: 1 }}>
                    Buscar cliente
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Nombre o cédula…"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") void handleBuscar(); }}
                    />
                </label>
                <button className="btn btn-secondary" style={{ alignSelf: "flex-end" }} onClick={() => void handleBuscar()}>
                    Buscar
                </button>
                {busqueda && (
                    <button
                        className="btn btn-ghost"
                        style={{ alignSelf: "flex-end" }}
                        onClick={() => { setBusqueda(""); void cargar(); }}
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {loading ? (
                <TableSkeleton rows={6} cols={3} />
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <div className="empty-title">{busqueda ? "Sin resultados" : "Sin clientes"}</div>
                        <div className="empty-sub">
                            {busqueda ? `No se encontró "${busqueda}"` : "Registra tu primer cliente"}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="card table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Cédula</th>
                                    <th>ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: avatarColor(c.cedula),
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.72rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                                                }}>
                                                    {initials(c.nombre)}
                                                </div>
                                                <span className="td-primary">{c.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="mono">{c.cedula}</td>
                                        <td>
                                            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                                                {c.id.slice(0, 8)}…
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mobile-card-list">
                        {filtered.map(c => (
                            <div key={c.id} className="card card-padded animate-in" style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "50%",
                                        background: avatarColor(c.cedula),
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "1rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                                    }}>
                                        {initials(c.nombre)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{c.nombre}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontFamily: "'DM Mono',monospace" }}>
                                            {c.cedula}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showModal && (
                <div
                    className="modal-backdrop"
                    onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div className="modal" style={{ maxWidth: 440 }}>
                        <div className="modal-title">Nuevo Cliente</div>
                        <div className="modal-sub">Completa los datos para registrar el cliente</div>
                        <form onSubmit={e => void handleCrear(e)}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <label className="form-label">
                                    Cédula
                                    <input
                                        className="form-input"
                                        type="text"
                                        required
                                        maxLength={20}
                                        placeholder="Ej: 12345678"
                                        value={cedula}
                                        onChange={e => setCedula(e.target.value)}
                                    />
                                </label>
                                <label className="form-label">
                                    Nombre completo
                                    <input
                                        className="form-input"
                                        type="text"
                                        maxLength={100}
                                        placeholder="Nombre y apellidos"
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Creando…" : "Crear Cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}