import { useEffect, useState } from "react";
import type { FiestaResponse, FiestaRequest } from "../types";
import {
    listarFiestas,
    crearFiesta,
    actualizarFiesta,
    eliminarFiesta,
} from "../services/api";

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const currentYear = new Date().getFullYear();

export default function FiestasPage() {
    const [fiestas, setFiestas] = useState<FiestaResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // filtros
    const [filtroAnio, setFiltroAnio] = useState<number | "">("");
    const [filtroMes, setFiltroMes] = useState<number | "">("");

    // formulario
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FiestaRequest>({
        cedula: "",
        numInvitados: 1,
        horasDuracion: 1,
        fechaFiesta: "",
    });

    const cargar = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listarFiestas(
                filtroAnio !== "" ? filtroAnio : undefined,
                filtroMes !== "" ? filtroMes : undefined
            );
            setFiestas(data);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al cargar fiestas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    const handleFiltrar = () => cargar();

    const resetForm = () => {
        setForm({ cedula: "", numInvitados: 1, horasDuracion: 1, fechaFiesta: "" });
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (editId) {
                await actualizarFiesta(editId, form);
            } else {
                await crearFiesta(form);
            }
            resetForm();
            cargar();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al guardar");
        }
    };

    const handleEdit = (f: FiestaResponse) => {
        setEditId(f.id);
        setForm({
            cedula: f.cedulaContratante,
            numInvitados: f.numInvitados,
            horasDuracion: f.horasDuracion,
            fechaFiesta: f.fechaFiesta,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta fiesta?")) return;
        try {
            await eliminarFiesta(id);
            cargar();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al eliminar");
        }
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

    return (
        <div className="page">
            <div className="page-header">
                <h1>Fiestas</h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    + Nueva Fiesta
                </button>
            </div>

            {/* Filtros */}
            <div className="card filter-bar">
                <label>
                    Año
                    <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value ? Number(e.target.value) : "")}>
                        <option value="">Todos</option>
                        {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Mes
                    <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value ? Number(e.target.value) : "")}>
                        <option value="">Todos</option>
                        {MESES.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </label>
                <button className="btn btn-secondary" onClick={handleFiltrar}>Filtrar</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Form */}
            {showForm && (
                <div className="card form-card">
                    <h2>{editId ? "Editar Fiesta" : "Nueva Fiesta"}</h2>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <label>
                            Cédula del contratante
                            <input
                                type="text"
                                required
                                maxLength={20}
                                value={form.cedula}
                                onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                                disabled={!!editId}
                            />
                        </label>
                        <label>
                            Nº de invitados
                            <input
                                type="number"
                                required
                                min={1}
                                value={form.numInvitados}
                                onChange={(e) => setForm({ ...form, numInvitados: Number(e.target.value) })}
                            />
                        </label>
                        <label>
                            Horas de duración
                            <input
                                type="number"
                                required
                                min={0.5}
                                step={0.5}
                                value={form.horasDuracion}
                                onChange={(e) => setForm({ ...form, horasDuracion: Number(e.target.value) })}
                            />
                        </label>
                        <label>
                            Fecha de la fiesta
                            <input
                                type="date"
                                required
                                value={form.fechaFiesta}
                                onChange={(e) => setForm({ ...form, fechaFiesta: e.target.value })}
                            />
                        </label>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editId ? "Actualizar" : "Registrar"}
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla */}
            {loading ? (
                <p className="text-center">Cargando…</p>
            ) : (
                <div className="card table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Contratante</th>
                                <th>Cédula</th>
                                <th>Invitados</th>
                                <th>Horas</th>
                                <th>Fecha</th>
                                <th>Monto Inv.</th>
                                <th>Monto Hrs.</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fiestas.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center">No hay fiestas registradas</td>
                                </tr>
                            ) : (
                                fiestas.map((f) => (
                                    <tr key={f.id}>
                                        <td>{f.nombreContratante}</td>
                                        <td>{f.cedulaContratante}</td>
                                        <td className="text-right">{f.numInvitados}</td>
                                        <td className="text-right">{f.horasDuracion}</td>
                                        <td>{f.fechaFiesta}</td>
                                        <td className="text-right">{fmt(f.montoInvitados)}</td>
                                        <td className="text-right">{fmt(f.montoHoras)}</td>
                                        <td className="text-right font-bold">{fmt(f.montoTotal)}</td>
                                        <td className="actions-cell">
                                            <button className="btn-icon" title="Editar" onClick={() => handleEdit(f)}>✏️</button>
                                            <button className="btn-icon" title="Eliminar" onClick={() => handleDelete(f.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
