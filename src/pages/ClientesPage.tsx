import { useEffect, useState } from "react";
import type { ClienteResponse } from "../types";
import { listarClientes, buscarCliente, crearCliente, actualizarCliente, eliminarCliente } from "../services/api";
import { toast } from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";

const COLORS = ["#5b5ef4", "#8b5cf6", "#ec4899", "#14b8a6", "#e8a020", "#1fcc6a", "#3b82f6", "#f04060"];
const initials = (n: string) => (n ?? "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const avatarColor = (c: string) => COLORS[c.split("").reduce((a, x) => a + x.charCodeAt(0), 0) % COLORS.length];

interface FormState { cedula: string; nombre: string; telefono: string; }
const EMPTY_FORM: FormState = { cedula: "", nombre: "", telefono: "" };

export default function ClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [confirmDel, setConfirmDel] = useState<ClienteResponse | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    const cargar = async () => {
        setLoading(true);
        try { setClientes(await listarClientes()); }
        catch (e) { toast.err(e instanceof Error ? e.message : "Error al cargar"); }
        finally { setLoading(false); }
    };

    useEffect(() => { void cargar(); }, []);

    const handleBuscar = async () => {
        if (!busqueda.trim()) { void cargar(); return; }
        setLoading(true);
        try { setClientes([await buscarCliente(busqueda.trim())]); }
        catch (e) { setClientes([]); toast.err(e instanceof Error ? e.message : "No encontrado"); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditId(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (c: ClienteResponse) => {
        setEditId(c.id);
        setForm({ cedula: c.cedula, nombre: c.nombre ?? "", telefono: c.telefono ?? "" });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY_FORM); };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                cedula: form.cedula,
                nombre: form.nombre,
                telefono: form.telefono.trim() || undefined,
            };
            if (editId !== null) {
                await actualizarCliente(editId, payload);
                toast.ok("Cliente actualizado");
            } else {
                const data = await crearCliente(payload);
                toast.ok(`Cliente "${data.nombre}" creado`);
            }
            closeModal();
            void cargar();
        } catch (e) {
            toast.err(e instanceof Error ? e.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (c: ClienteResponse) => {
        setDeleting(c.id);
        try {
            await eliminarCliente(c.id);
            toast.ok("Cliente eliminado");
            setConfirmDel(null);
            void cargar();
        } catch (e) {
            toast.err(e instanceof Error ? e.message : "Error al eliminar");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = busqueda
        ? clientes.filter(c =>
            (c.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
            c.cedula.includes(busqueda))
        : clientes;

    const field = (k: keyof FormState) => ({
        value: form[k],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value })),
    });

    return (
        <div className="ani">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-sub">{clientes.length} registrado{clientes.length !== 1 ? "s" : ""}</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Nuevo</button>
            </div>

            {/* Buscador */}
            <div className="filter-bar">
                <label className="field" style={{ flex: 1 }}>
                    Buscar
                    <input className="input" type="text" placeholder="Nombre o cédula…"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && void handleBuscar()} />
                </label>
                <button className="btn btn-outline" style={{ alignSelf: "flex-end" }} onClick={() => void handleBuscar()}>
                    Buscar
                </button>
                {busqueda && (
                    <button className="btn btn-ghost" style={{ alignSelf: "flex-end" }}
                        onClick={() => { setBusqueda(""); void cargar(); }}>
                        Limpiar
                    </button>
                )}
            </div>

            {/* Contenido */}
            {loading ? (
                <TableSkeleton rows={6} cols={4} />
            ) : filtered.length === 0 ? (
                <div className="card card-p">
                    <div className="empty">
                        <div className="empty-ico">👤</div>
                        <div className="empty-title">{busqueda ? "Sin resultados" : "Sin clientes"}</div>
                        <div className="empty-sub">{busqueda ? `No se encontró "${busqueda}"` : "Registra el primer cliente"}</div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Tabla desktop */}
                    <div className="card tbl-wrap">
                        <table>
                            <thead>
                                <tr><th>Cliente</th><th>Cédula</th><th>Teléfono</th><th></th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: "50%",
                                                    background: avatarColor(c.cedula),
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.68rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                                                }}>{initials(c.nombre)}</div>
                                                <span className="hi">{c.nombre ?? "—"}</span>
                                            </div>
                                        </td>
                                        <td className="mono">{c.cedula}</td>
                                        <td className="mono" style={{ color: c.telefono ? "var(--text-2)" : "var(--text-3)" }}>
                                            {c.telefono ?? "—"}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                                                <button className="icon-btn" title="Editar" onClick={() => openEdit(c)}>✏️</button>
                                                <button className="icon-btn del" title="Eliminar" onClick={() => setConfirmDel(c)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cards mobile */}
                    <div className="mob-cards">
                        {filtered.map(c => (
                            <div key={c.id} className="card card-p ani" style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: "50%",
                                        background: avatarColor(c.cedula),
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.85rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                                    }}>{initials(c.nombre)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{c.nombre ?? "—"}</div>
                                        <div className="mono" style={{ color: "var(--text-3)", marginTop: 1 }}>{c.cedula}</div>
                                        {c.telefono && <div style={{ fontSize: "0.78rem", color: "var(--text-2)", marginTop: 1 }}>{c.telefono}</div>}
                                    </div>
                                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                        <button className="icon-btn" onClick={() => openEdit(c)}>✏️</button>
                                        <button className="icon-btn del" onClick={() => setConfirmDel(c)}>🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modal crear / editar */}
            {showModal && (
                <div className="backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="modal-title">{editId !== null ? "Editar cliente" : "Nuevo cliente"}</div>
                        <div className="modal-sub">{editId !== null ? "Modifica los datos del cliente" : "Completa los datos del contratante"}</div>
                        <form onSubmit={e => void handleGuardar(e)}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <label className="field">
                                    Cédula *
                                    <input className="input" type="text" required maxLength={20}
                                        placeholder="Ej: 1001234567" {...field("cedula")}
                                        disabled={editId !== null} />
                                </label>
                                <label className="field">
                                    Nombre
                                    <input className="input" type="text" maxLength={100}
                                        placeholder="Nombre completo" {...field("nombre")} />
                                </label>
                                <label className="field">
                                    Teléfono
                                    <input className="input" type="tel" maxLength={20}
                                        placeholder="Ej: 3001234567" {...field("telefono")} />
                                </label>
                            </div>
                            <div className="modal-foot">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Guardando…" : editId !== null ? "Actualizar" : "Crear cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmar eliminación */}
            {confirmDel !== null && (
                <div className="backdrop" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
                    <div className="modal" style={{ maxWidth: 400 }}>
                        <div className="modal-title">¿Eliminar cliente?</div>
                        <div className="modal-sub">
                            <strong>{confirmDel.nombre ?? confirmDel.cedula}</strong><br />
                            Si tiene fiestas registradas no se podrá eliminar.
                        </div>
                        <div className="modal-foot">
                            <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                            <button className="btn btn-danger" disabled={deleting !== null}
                                onClick={() => void handleEliminar(confirmDel)}>
                                {deleting === confirmDel.id ? "Eliminando…" : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
