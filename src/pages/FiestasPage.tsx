import { useEffect, useState } from "react";
import type { FiestaResponse, FiestaRequest } from "../types";
import { listarFiestas, crearFiesta, actualizarFiesta, eliminarFiesta } from "../services/api";
import { toast } from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const;
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const fmt = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) => {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
};

const hoursBadge = (h: number) => {
    if (h <= 3) return <span className="badge badge-green">{h}h · Corta</span>;
    if (h <= 6) return <span className="badge badge-indigo">{h}h · Media</span>;
    return <span className="badge badge-amber">{h}h · Larga</span>;
};

const getPricingLabel = (inv: number, hrs: number) => ({
    invLabel: inv <= 100 ? "$8,000/inv" : inv <= 500 ? "$6,000/inv" : "$4,000/inv",
    hrsLabel: hrs <= 3 ? "$100,000" : hrs <= 6 ? "$200,000" : "$300,000",
});

const EMPTY_FORM: FiestaRequest = { cedula: "", numInvitados: 50, horasDuracion: 3, fechaFiesta: "" };

export default function FiestasPage() {
    const [fiestas, setFiestas] = useState<FiestaResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FiestaRequest>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [filtroAnio, setFiltroAnio] = useState<number | "">("");
    const [filtroMes, setFiltroMes] = useState<number | "">("");
    const [confirmDelete, setConfirmDelete] = useState<FiestaResponse | null>(null);

    const cargar = async (anio?: number | "", mes?: number | "") => {
        setLoading(true);
        try {
            const data = await listarFiestas(
                anio !== "" ? (anio as number) : undefined,
                mes !== "" ? (mes as number) : undefined,
            );
            setFiestas(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al cargar fiestas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void cargar(); }, []);

    const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); };

    const openEdit = (f: FiestaResponse) => {
        setEditId(f.id);
        setForm({ cedula: f.cedulaContratante, numInvitados: f.numInvitados, horasDuracion: f.horasDuracion, fechaFiesta: f.fechaFiesta });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId !== null) {
                await actualizarFiesta(editId, form);
                toast.success("Fiesta actualizada correctamente");
            } else {
                await crearFiesta(form);
                toast.success("Fiesta registrada correctamente");
            }
            setShowModal(false);
            setEditId(null);
            setTimeout(() => { void cargar(filtroAnio, filtroMes); }, 150);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (f: FiestaResponse) => {
        setDeleting(f.id);
        try {
            await eliminarFiesta(f.id);
            toast.success("Fiesta eliminada");
            setConfirmDelete(null);
            void cargar(filtroAnio, filtroMes);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al eliminar");
        } finally {
            setDeleting(null);
        }
    };

    const totalIngresos = fiestas.reduce((s, f) => s + f.montoTotal, 0);
    const { invLabel, hrsLabel } = getPricingLabel(form.numInvitados, form.horasDuracion);

    return (
        <div className="animate-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fiestas</h1>
                    <p className="page-subtitle">
                        {fiestas.length} registro{fiestas.length !== 1 ? "s" : ""} · {fmt(totalIngresos)} en ingresos
                    </p>
                </div>
                <button className="btn btn-primary" type="button" onClick={openCreate}>
                    <span>+</span> Nueva Fiesta
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <label className="form-label" style={{ flex: 1, minWidth: 120 }}>
                    Año
                    <select
                        className="form-input"
                        value={filtroAnio}
                        onChange={e => setFiltroAnio(e.target.value ? Number(e.target.value) : "")}
                    >
                        <option value="">Todos los años</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </label>
                <label className="form-label" style={{ flex: 1, minWidth: 140 }}>
                    Mes
                    <select
                        className="form-input"
                        value={filtroMes}
                        onChange={e => setFiltroMes(e.target.value ? Number(e.target.value) : "")}
                    >
                        <option value="">Todos los meses</option>
                        {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                </label>
                <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ alignSelf: "flex-end" }}
                    onClick={() => void cargar(filtroAnio, filtroMes)}
                >
                    Filtrar
                </button>
                {(filtroAnio !== "" || filtroMes !== "") && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ alignSelf: "flex-end" }}
                        onClick={() => { setFiltroAnio(""); setFiltroMes(""); void cargar(); }}
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <TableSkeleton rows={6} cols={8} />
            ) : fiestas.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">🎉</div>
                        <div className="empty-title">Sin fiestas registradas</div>
                        <div className="empty-sub">Registra tu primera fiesta con el botón de arriba</div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="card table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Contratante</th>
                                    <th>Cédula</th>
                                    <th>Fecha</th>
                                    <th className="text-right">Invitados</th>
                                    <th>Duración</th>
                                    <th className="text-right">Monto Inv.</th>
                                    <th className="text-right">Monto Hrs.</th>
                                    <th className="text-right">Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fiestas.map(f => (
                                    <tr key={f.id}>
                                        <td className="td-primary">{f.nombreContratante}</td>
                                        <td className="mono">{f.cedulaContratante}</td>
                                        <td>{fmtDate(f.fechaFiesta)}</td>
                                        <td className="text-right">{f.numInvitados.toLocaleString()}</td>
                                        <td>{hoursBadge(f.horasDuracion)}</td>
                                        <td className="text-right mono" style={{ color: "var(--text-secondary)" }}>{fmt(f.montoInvitados)}</td>
                                        <td className="text-right mono" style={{ color: "var(--text-secondary)" }}>{fmt(f.montoHoras)}</td>
                                        <td className="text-right mono td-primary">{fmt(f.montoTotal)}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                <button type="button" className="btn-icon-only" title="Editar" onClick={() => openEdit(f)}>✏️</button>
                                                <button type="button" className="btn-icon-only danger" title="Eliminar" onClick={() => setConfirmDelete(f)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="mobile-card-list">
                        {fiestas.map(f => (
                            <div key={f.id} className="card card-padded animate-in" style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)" }}>{f.nombreContratante}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontFamily: "'DM Mono',monospace" }}>{f.cedulaContratante}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button type="button" className="btn-icon-only" onClick={() => openEdit(f)}>✏️</button>
                                        <button type="button" className="btn-icon-only danger" onClick={() => setConfirmDelete(f)}>🗑️</button>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.82rem" }}>
                                    <div>
                                        <span style={{ color: "var(--text-tertiary)" }}>Fecha</span>
                                        <div style={{ color: "var(--text)", fontWeight: 500 }}>{fmtDate(f.fechaFiesta)}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-tertiary)" }}>Invitados</span>
                                        <div style={{ color: "var(--text)", fontWeight: 500 }}>{f.numInvitados.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-tertiary)" }}>Duración</span>
                                        <div style={{ marginTop: 2 }}>{hoursBadge(f.horasDuracion)}</div>
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-tertiary)" }}>Total</span>
                                        <div style={{ color: "var(--accent-hover)", fontWeight: 700, fontSize: "1rem", fontFamily: "'DM Mono',monospace" }}>{fmt(f.montoTotal)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div
                    className="modal-backdrop"
                    onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div className="modal">
                        <div className="modal-title">{editId !== null ? "Editar Fiesta" : "Nueva Fiesta"}</div>
                        <div className="modal-sub">
                            {editId !== null ? "Modifica los datos de la fiesta" : "Completa los datos para registrar la fiesta"}
                        </div>
                        <form onSubmit={e => void handleSubmit(e)}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
                                <label className="form-label" style={{ gridColumn: "1 / -1" }}>
                                    Cédula del contratante
                                    <input
                                        className="form-input"
                                        type="text"
                                        required
                                        maxLength={20}
                                        placeholder="Ej: 12345678"
                                        value={form.cedula}
                                        onChange={e => setForm({ ...form, cedula: e.target.value })}
                                        disabled={editId !== null}
                                    />
                                </label>
                                <label className="form-label">
                                    Nº invitados
                                    <input
                                        className="form-input"
                                        type="number"
                                        required
                                        min={1}
                                        value={form.numInvitados}
                                        onChange={e => setForm({ ...form, numInvitados: Number(e.target.value) })}
                                    />
                                </label>
                                <label className="form-label">
                                    Horas de duración
                                    <input
                                        className="form-input"
                                        type="number"
                                        required
                                        min={0.5}
                                        step={0.5}
                                        value={form.horasDuracion}
                                        onChange={e => setForm({ ...form, horasDuracion: Number(e.target.value) })}
                                    />
                                </label>
                                <label className="form-label" style={{ gridColumn: "1 / -1" }}>
                                    Fecha de la fiesta
                                    <input
                                        className="form-input"
                                        type="date"
                                        required
                                        value={form.fechaFiesta}
                                        onChange={e => setForm({ ...form, fechaFiesta: e.target.value })}
                                    />
                                </label>
                            </div>

                            {form.numInvitados > 0 && (
                                <div style={{
                                    marginTop: 16, padding: "12px 14px",
                                    background: "var(--surface-2)", border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--text-secondary)",
                                }}>
                                    <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Vista previa del costo</div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Tarifa invitados:</span>
                                        <span style={{ fontFamily: "'DM Mono',monospace" }}>{invLabel}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Tarifa horas:</span>
                                        <span style={{ fontFamily: "'DM Mono',monospace" }}>{hrsLabel}</span>
                                    </div>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Guardando…" : editId !== null ? "Actualizar" : "Registrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm delete modal */}
            {confirmDelete !== null && (
                <div
                    className="modal-backdrop"
                    onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
                >
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>⚠️</div>
                        <div className="modal-title">¿Eliminar esta fiesta?</div>
                        <div className="modal-sub">
                            Fiesta de <strong>{confirmDelete.nombreContratante}</strong> del{" "}
                            {fmtDate(confirmDelete.fechaFiesta)}. Esta acción no se puede deshacer.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                disabled={deleting !== null}
                                onClick={() => void handleDelete(confirmDelete)}
                            >
                                {deleting === confirmDelete.id ? "Eliminando…" : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}