'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calculator, FileText, Users, Plus, DollarSign, CreditCard, Banknote, User, Clock, X, Calendar } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('cierre');

  // Estado para ventas individuales
  const [ventas, setVentas] = useState([]);
  const [montoVenta, setMontoVenta] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [nombreTransferencia, setNombreTransferencia] = useState('');
  const [cajaInicial] = useState('30000'); // No modificable

  // Estado para información de turno
  const [nombreEmpleada, setNombreEmpleada] = useState('');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaCambio, setHoraCambio] = useState('');

  // Estado para reportes diarios
  const [reportesDiarios, setReportesDiarios] = useState([]);

  // Estado para mensajes
  const [mensaje, setMensaje] = useState('');

  // Estado para filtro de turnos en historial
  const [filtroTurno, setFiltroTurno] = useState('todos');

  // Estado para personal
  const [personal, setPersonal] = useState([]);
  const [nuevoNombrePersonal, setNuevoNombrePersonal] = useState('');

  // Estado para reportes semanales
  const [reportesSemanales, setReportesSemanales] = useState([]);

  // Estado para mostrar cierre diario
  const [mostrarCierreDiario, setMostrarCierreDiario] = useState(false);
  const [cierreDiario, setCierreDiario] = useState(null);

  // Funciones para manejar ventas
  const agregarVenta = () => {
    if (!montoVenta || parseInt(montoVenta) <= 0) {
      setMensaje('Ingresa un monto valido');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    if (metodoPago === 'transferencia' && !nombreTransferencia.trim()) {
      setMensaje('Ingresa el nombre de quien transfirio');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    const ahora = new Date();
    const nuevaVenta = {
      id: Date.now(),
      monto: parseInt(montoVenta),
      metodo: metodoPago,
      hora: metodoPago === 'transferencia' ? format(ahora, 'HH:mm:ss') : format(ahora, 'HH:mm'),
      nombreTransferencia: metodoPago === 'transferencia' ? nombreTransferencia.trim() : null,
      timestamp: ahora.getTime()
    };

    setVentas([...ventas, nuevaVenta]);
    setMontoVenta('');
    if (metodoPago === 'transferencia') {
      setNombreTransferencia('');
    }
    setMensaje('Venta agregada correctamente');
    setTimeout(() => setMensaje(''), 1500);
  };

  const eliminarVenta = (id) => {
    setVentas(ventas.filter(venta => venta.id !== id));
    setMensaje('Venta eliminada');
    setTimeout(() => setMensaje(''), 2000);
  };

  // Calcular totales
  const calcularTotalEfectivo = () => {
    return ventas.filter(venta => venta.metodo === 'efectivo').reduce((total, venta) => total + venta.monto, 0);
  };

  const calcularTotalTransferencia = () => {
    return ventas.filter(venta => venta.metodo === 'transferencia').reduce((total, venta) => total + venta.monto, 0);
  };

  const calcularTotalVentas = () => {
    return ventas.reduce((total, venta) => total + venta.monto, 0);
  };

  // Función para establecer horas según el turno seleccionado
  const establecerHorasTurno = (turno) => {
    const hoy = new Date();
    const fechaFormateada = format(hoy, 'dd/MM/yyyy');

    if (turno === '8-15') {
      setHoraInicio(fechaFormateada + ' 08:00');
      setHoraCambio(fechaFormateada + ' 15:00');
    } else if (turno === '15-22') {
      setHoraInicio(fechaFormateada + ' 15:00');
      setHoraCambio(fechaFormateada + ' 22:00');
    }
    setTurnoSeleccionado(turno);
  };

  // Función para guardar reporte diario
  const guardarReporteDiario = () => {
    if (!turnoSeleccionado) {
      setMensaje('Por favor selecciona un turno');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    const ahora = new Date();
    const fechaHoy = format(ahora, 'dd/MM/yyyy');

    const reporte = {
      id: fechaHoy + '-' + turnoSeleccionado,
      fecha: fechaHoy,
      turno: turnoSeleccionado,
      horaInicio,
      horaCambio,
      empleada: nombreEmpleada,
      cajaInicial: parseInt(cajaInicial),
      ventas: [...ventas],
      ingresoEfectivo: calcularTotalEfectivo(),
      ingresoTransferencia: calcularTotalTransferencia(),
      total: parseInt(cajaInicial) + calcularTotalVentas(),
      timestamp: ahora.getTime()
    };

    // Verificar si ya existe un reporte para este turno del día
    const reporteExistenteIndex = reportesDiarios.findIndex(r => r.id === reporte.id);

    if (reporteExistenteIndex >= 0) {
      const nuevosReportes = [...reportesDiarios];
      nuevosReportes[reporteExistenteIndex] = reporte;
      setReportesDiarios(nuevosReportes);
      setMensaje('Reporte del turno ' + turnoSeleccionado + ' actualizado correctamente');
    } else {
      setReportesDiarios([...reportesDiarios, reporte]);
      setMensaje('Reporte del turno ' + turnoSeleccionado + ' guardado correctamente');
    }

    // Si es turno tarde, mostrar cierre diario
    if (turnoSeleccionado === '15-22') {
      const reporteManana = reportesDiarios.find(r => r.fecha === fechaHoy && r.turno === '8-15');
      const cierreDelDia = {
        fecha: fechaHoy,
        turnoManana: reporteManana || null,
        turnoTarde: reporte,
        totalDia: (reporteManana ? reporteManana.total : 0) + reporte.total
      };
      setCierreDiario(cierreDelDia);
      setMostrarCierreDiario(true);
    }

    // Limpiar formulario (mantener turno seleccionado)
    setVentas([]);
    setMontoVenta('');
    setMetodoPago('efectivo');
    setNombreTransferencia('');
    setNombreEmpleada('');

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setMensaje(''), 3000);
  };

  // Funciones para personal
  const agregarPersonal = () => {
    if (!nuevoNombrePersonal.trim()) {
      setMensaje('Ingresa un nombre valido');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    const nuevoPersonal = {
      id: Date.now(),
      nombre: nuevoNombrePersonal.trim(),
      activo: true
    };

    setPersonal([...personal, nuevoPersonal]);
    setNuevoNombrePersonal('');
    setMensaje('Personal agregado correctamente');
    setTimeout(() => setMensaje(''), 2000);
  };

  const eliminarPersonal = (id) => {
    setPersonal(personal.filter(p => p.id !== id));
    setMensaje('Personal eliminado');
    setTimeout(() => setMensaje(''), 2000);
  };

  const togglePersonal = (id) => {
    setPersonal(personal.map(p =>
      p.id === id ? { ...p, activo: !p.activo } : p
    ));
  };

  // Función para generar reporte semanal
  const generarReporteSemanal = () => {
    const ahora = new Date();
    const diaSemana = ahora.getDay();

    // Determinar el inicio de la semana (lunes)
    const inicioSemana = new Date(ahora);
    const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    inicioSemana.setDate(ahora.getDate() - diasHastaLunes);

    // Determinar el fin de la semana (sábado)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 5);

    // Filtrar reportes de la semana
    const reportesSemana = reportesDiarios.filter(reporte => {
      const fechaReporte = new Date(reporte.fecha.split('/').reverse().join('-'));
      return fechaReporte >= inicioSemana && fechaReporte <= finSemana;
    });

    // Calcular estadísticas semanales
    const estadisticas = {
      semana: format(inicioSemana, 'dd/MM') + ' - ' + format(finSemana, 'dd/MM/yyyy'),
      totalSemana: reportesSemana.reduce((total, r) => total + r.total, 0),
      totalManana: reportesSemana.filter(r => r.turno === '8-15').reduce((total, r) => total + r.total, 0),
      totalTarde: reportesSemana.filter(r => r.turno === '15-22').reduce((total, r) => total + r.total, 0),
      diasTrabajados: [...new Set(reportesSemana.map(r => r.fecha))].length,
      reportes: reportesSemana,
      timestamp: ahora.getTime()
    };

    setReportesSemanales([...reportesSemanales, estadisticas]);
    setMensaje('Reporte semanal generado correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-cyan-600 shadow-lg px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-white drop-shadow-sm">
          Control de Caja - Almacen
        </h1>
        <p className="text-center text-indigo-100 text-sm mt-1">
          Sistema rapido y eficiente
        </p>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Módulo de Cierre - Solo muestra cierres diarios */}
        {activeTab === 'cierre' && (
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator size={24} />
                <h2 className="text-xl font-bold text-gray-800">
                  Cierres Diarios
                </h2>
              </div>

              {/* Cierre Diario Actual */}
              {mostrarCierreDiario && cierreDiario ? (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg shadow-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-2xl">📊</div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Cierre del Día - {cierreDiario.fecha}
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Turno Mañana */}
                    {cierreDiario.turnoManana ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          Turno Mañana (8:00 - 15:00)
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Empleado:</span>
                            <span className="font-medium">{cierreDiario.turnoManana.empleada || 'No especificado'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Caja inicial:</span>
                            <span>${cierreDiario.turnoManana.cajaInicial.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Efectivo:</span>
                            <span>${cierreDiario.turnoManana.ingresoEfectivo.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transferencia:</span>
                            <span>${cierreDiario.turnoManana.ingresoTransferencia.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total turno:</span>
                            <span className="text-yellow-700">${cierreDiario.turnoManana.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          Turno Mañana
                        </h4>
                        <p className="text-gray-500 text-sm">No registrado</p>
                      </div>
                    )}

                    {/* Turno Tarde */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        Turno Tarde (15:00 - 22:00)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Empleado:</span>
                          <span className="font-medium">{cierreDiario.turnoTarde.empleada || 'No especificado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Caja inicial:</span>
                          <span>${cierreDiario.turnoTarde.cajaInicial.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efectivo:</span>
                          <span>${cierreDiario.turnoTarde.ingresoEfectivo.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transferencia:</span>
                          <span>${cierreDiario.turnoTarde.ingresoTransferencia.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total turno:</span>
                          <span className="text-orange-700">${cierreDiario.turnoTarde.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total del Día */}
                  <div className="mt-6 bg-green-100 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-800">TOTAL DEL DÍA:</span>
                      <span className="text-3xl font-bold text-green-700">${cierreDiario.totalDia.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setMostrarCierreDiario(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">🏪</div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    No hay cierre diario activo
                  </h3>
                  <p className="text-blue-600">
                    Los cierres diarios se generan automáticamente al finalizar el turno tarde.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Módulo de Reportes - Registro de ventas */}
        {activeTab === 'reportes' && (
          <div className="space-y-4">
            {/* Formulario de registro */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} />
                <h2 className="text-lg font-semibold text-gray-800">
                  Registro de Turno e Ingresos
                </h2>
              </div>

              {/* Mensaje de confirmación */}
              {mensaje && (
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300 text-emerald-800 px-6 py-4 rounded-xl mb-4 shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xl">✅</div>
                    <span className="text-sm font-medium">{mensaje}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Información de Turno */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
                    <User className="text-blue-600" size={16} />
                    Informacion de Turno
                  </h3>

                  {/* Nombre de la Empleada */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Empleada
                    </label>
                    <input
                      type="text"
                      value={nombreEmpleada}
                      onChange={(e) => setNombreEmpleada(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>

                  {/* Selector de Turno */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline mr-2 text-purple-600" size={14} />
                      Turno de Trabajo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => establecerHorasTurno('8-15')}
                        className={`px-4 py-2 border rounded-md text-center transition-colors ${
                          turnoSeleccionado === '8-15'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">8:00 - 15:00</div>
                        <div className="text-xs opacity-75">Manana</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => establecerHorasTurno('15-22')}
                        className={`px-4 py-2 border rounded-md text-center transition-colors ${
                          turnoSeleccionado === '15-22'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">15:00 - 22:00</div>
                        <div className="text-xs opacity-75">Tarde</div>
                      </button>
                    </div>
                  </div>

                  {/* Horas del Turno (solo mostrar si está seleccionado) */}
                  {turnoSeleccionado && (
                    <div className="bg-white p-3 rounded border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Inicio:</span>
                          <div className="font-medium text-green-700">{horaInicio}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Cambio:</span>
                          <div className="font-medium text-orange-700">{horaCambio}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dinero en Caja Inicial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Banknote className="inline mr-2 text-blue-600" size={16} />
                    Dinero en Caja Inicial
                  </label>
                  <input
                    type="number"
                    value={cajaInicial}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    placeholder="30000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Monto inicial de caja (generalmente $30,000)
                  </p>
                </div>

                {/* Agregar Venta Individual */}
                <div className="border-t border-indigo-200 pt-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Plus className="text-green-600" size={16} />
                    Agregar Venta
                  </h4>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Monto
                      </label>
                      <input
                        type="number"
                        value={montoVenta}
                        onChange={(e) => setMontoVenta(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Metodo
                      </label>
                      <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={agregarVenta}
                        className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                        disabled={!montoVenta}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Campo adicional para transferencias */}
                  {metodoPago === 'transferencia' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nombre de quien transfirio
                      </label>
                      <input
                        type="text"
                        value={nombreTransferencia}
                        onChange={(e) => setNombreTransferencia(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Nombre completo"
                      />
                    </div>
                  )}
                </div>

                {/* Lista de Ventas */}
                {ventas.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-800 mb-3">
                      Ventas Registradas ({ventas.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {ventas.map((venta) => (
                        <div key={venta.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              venta.metodo === 'efectivo' ? 'bg-green-500' : 'bg-purple-500'
                            }`}></div>
                            <div>
                              <div className="font-medium">${venta.monto.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">
                                {venta.metodo === 'efectivo' ? 'Efectivo' : 'Transferencia'} • {venta.hora}
                                {venta.nombreTransferencia && (
                                  <span className="ml-2 text-purple-700 font-medium">
                                    • {venta.nombreTransferencia}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarVenta(venta.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen de Turno e Ingresos */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-6">
                  <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                    📊 Resumen del Turno
                  </h3>

                  {/* Información del Turno */}
                  <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-4 rounded-xl mb-6 border border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="text-2xl mb-1">👤</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Personal</div>
                        <div className="font-bold text-indigo-800 text-sm">
                          {nombreEmpleada || 'No especificado'}
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="text-2xl mb-1">
                          {turnoSeleccionado === '8-15' ? '🌅' : turnoSeleccionado === '15-22' ? '🌆' : '⏰'}
                        </div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Turno</div>
                        <div className="font-bold text-purple-800 text-sm">
                          {turnoSeleccionado ? turnoSeleccionado + ' (' + (turnoSeleccionado === '8-15' ? 'Manana' : 'Tarde') + ')' : 'No seleccionado'}
                        </div>
                      </div>
                      {horaInicio && horaCambio && (
                        <div className="flex flex-col items-center text-center">
                          <div className="text-2xl mb-1">🕐</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">Horario</div>
                          <div className="font-bold text-gray-800 text-sm">
                            {horaInicio.split(' ')[1]} - {horaCambio.split(' ')[1]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen de Ventas */}
                  <h4 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                    💎 Resumen de Ventas
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Caja Inicial */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xl">🏦</div>
                        <div className="text-sm font-semibold text-blue-800">Caja Inicial</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        ${parseInt(cajaInicial).toLocaleString()}
                      </div>
                    </div>

                    {/* Ventas Efectivo */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xl">💵</div>
                        <div className="text-sm font-semibold text-emerald-800">Efectivo</div>
                      </div>
                      <div className="text-2xl font-bold text-emerald-700">
                        ${calcularTotalEfectivo().toLocaleString()}
                      </div>
                      <div className="text-xs text-emerald-600">
                        {ventas.filter(v => v.metodo === 'efectivo').length} ventas
                      </div>
                    </div>

                    {/* Ventas Transferencia */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border-2 border-violet-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xl">🏦</div>
                        <div className="text-sm font-semibold text-violet-800">Transferencias</div>
                      </div>
                      <div className="text-2xl font-bold text-violet-700">
                        ${calcularTotalTransferencia().toLocaleString()}
                      </div>
                      <div className="text-xs text-violet-600">
                        {ventas.filter(v => v.metodo === 'transferencia').length} ventas
                      </div>
                    </div>

                    {/* Total Ventas */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xl">🛒</div>
                        <div className="text-sm font-semibold text-amber-800">Total Ventas</div>
                      </div>
                      <div className="text-2xl font-bold text-amber-700">
                        ${calcularTotalVentas().toLocaleString()}
                      </div>
                      <div className="text-xs text-amber-600">
                        {ventas.length} transacciones
                      </div>
                    </div>
                  </div>

                  {/* Total Final */}
                  <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-xl text-white text-center">
                    <div className="text-sm font-medium mb-1">💰 TOTAL EN CAJA</div>
                    <div className="text-3xl font-bold">
                      ${(parseInt(cajaInicial) + calcularTotalVentas()).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Botón de Registrar */}
                <button
                  type="button"
                  onClick={guardarReporteDiario}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 font-bold text-lg shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={!turnoSeleccionado}
                >
                  💾 GUARDAR REPORTE DEL TURNO
                </button>
              </div>
            </div>

            {/* Historial de Reportes Diarios */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-800">
                  Historial de Reportes Diarios
                </h3>

                {/* Filtro de turnos */}
                <div className="flex gap-2">
                  <select
                    value={filtroTurno}
                    onChange={(e) => setFiltroTurno(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos los turnos</option>
                    <option value="8-15">Solo Manana (8-15)</option>
                    <option value="15-22">Solo Tarde (15-22)</option>
                  </select>
                </div>
              </div>

              {/* Resumen por turnos */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl mb-1">🌅</div>
                  <div className="text-sm text-gray-600">Turno Manana</div>
                  <div className="font-bold text-yellow-700">
                    ${reportesDiarios.filter(r => r.turno === '8-15').reduce((total, r) => total + r.total, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reportesDiarios.filter(r => r.turno === '8-15').length} reportes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🌆</div>
                  <div className="text-sm text-gray-600">Turno Tarde</div>
                  <div className="font-bold text-orange-700">
                    ${reportesDiarios.filter(r => r.turno === '15-22').reduce((total, r) => total + r.total, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reportesDiarios.filter(r => r.turno === '15-22').length} reportes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-sm text-gray-600">Total General</div>
                  <div className="font-bold text-green-700">
                    ${reportesDiarios.reduce((total, r) => total + r.total, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reportesDiarios.length} reportes totales
                  </div>
                </div>
              </div>

              {/* Historial filtrado */}
              {reportesDiarios.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No hay reportes guardados aun.
                </p>
              ) : (
                <div className="space-y-4">
                  {reportesDiarios
                    .filter(reporte => filtroTurno === 'todos' || reporte.turno === filtroTurno)
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((reporte, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                reporte.turno === '8-15' ? 'bg-yellow-400' : 'bg-orange-400'
                              }`}></div>
                              {reporte.fecha} - Turno {reporte.turno}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Empleada: {reporte.empleada || 'No especificada'}
                            </p>
                            <p className={`text-sm font-medium ${
                              reporte.turno === '8-15' ? 'text-yellow-700' : 'text-orange-700'
                            }`}>
                              {reporte.turno === '8-15' ? '☀️ Manana' : '🌅 Tarde'} ({reporte.horaInicio.split(' ')[1]} - {reporte.horaCambio.split(' ')[1]})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ${reporte.total.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-600">Caja inicial: <span className="text-blue-700 font-medium">${reporte.cajaInicial.toLocaleString()}</span></p>
                            <p className="text-gray-600">Efectivo: <span className="text-green-700 font-medium">${reporte.ingresoEfectivo.toLocaleString()}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-600">Transferencia: <span className="text-purple-700 font-medium">${reporte.ingresoTransferencia.toLocaleString()}</span></p>
                            <p className="text-gray-600">Total del turno: <span className="text-green-700 font-bold">${reporte.total.toLocaleString()}</span></p>
                          </div>
                        </div>

                        {/* Detalle de ventas separadas por método */}
                        {reporte.ventas && reporte.ventas.length > 0 && (
                          <div className="border-t pt-3 space-y-3">
                            {/* Ventas en Efectivo */}
                            {reporte.ventas.filter(v => v.metodo === 'efectivo').length > 0 && (
                              <div>
                                <p className="text-xs text-green-700 font-medium mb-2 flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Ventas en Efectivo ({reporte.ventas.filter(v => v.metodo === 'efectivo').length})
                                </p>
                                <div className="grid grid-cols-3 gap-1 text-xs">
                                  {reporte.ventas.filter(v => v.metodo === 'efectivo').map((venta, idx) => (
                                    <div key={idx} className="bg-green-50 px-2 py-1 rounded text-center">
                                      <div className="text-green-700 font-medium">${venta.monto.toLocaleString()}</div>
                                      <div className="text-gray-500">{venta.hora}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ventas por Transferencia */}
                            {reporte.ventas.filter(v => v.metodo === 'transferencia').length > 0 && (
                              <div>
                                <p className="text-xs text-purple-700 font-medium mb-2 flex items-center gap-1">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  Ventas por Transferencia ({reporte.ventas.filter(v => v.metodo === 'transferencia').length})
                                </p>
                                <div className="grid grid-cols-3 gap-1 text-xs">
                                  {reporte.ventas.filter(v => v.metodo === 'transferencia').map((venta, idx) => (
                                    <div key={idx} className="bg-purple-50 px-2 py-1 rounded text-center">
                                      <div className="text-purple-700 font-medium">${venta.monto.toLocaleString()}</div>
                                      <div className="text-gray-500">{venta.hora}</div>
                                      {venta.nombreTransferencia && (
                                        <div className="text-purple-600 text-xs truncate" title={venta.nombreTransferencia}>
                                          {venta.nombreTransferencia}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Módulo de Personal */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {/* Agregar Personal */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="text-green-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">
                  Agregar Personal
                </h2>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={nuevoNombrePersonal}
                  onChange={(e) => setNuevoNombrePersonal(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del personal"
                />
                <button
                  onClick={agregarPersonal}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
                  disabled={!nuevoNombrePersonal.trim()}
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Lista de Personal */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-md font-semibold mb-4 text-gray-800">
                Lista de Personal ({personal.length})
              </h3>

              {personal.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No hay personal registrado aun.
                </p>
              ) : (
                <div className="space-y-3">
                  {personal.map((persona) => (
                    <div key={persona.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          persona.activo ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-medium ${
                          persona.activo ? 'text-gray-800' : 'text-gray-500 line-through'
                        }`}>
                          {persona.nombre}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          persona.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {persona.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePersonal(persona.id)}
                          className={`px-3 py-1 text-xs rounded ${
                            persona.activo
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {persona.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => eliminarPersonal(persona.id)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Módulo Semanal */}
        {activeTab === 'semanal' && (
          <div className="space-y-4">
            {/* Generar Reporte Semanal */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Reporte Semanal
                  </h2>
                </div>
                <button
                  onClick={generarReporteSemanal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Generar Reporte
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Informacion del Reporte Semanal:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Lunes a Sabado:</strong> Turnos de 8:00-15:00 y 15:00-22:00</li>
                  <li>• <strong>Domingos:</strong> Turnos de 8:00-14:30 y 18:30-22:00</li>
                  <li>• Incluye estadisticas de ventas por dia y turno</li>
                  <li>• Calcula totales semanales y promedios</li>
                </ul>
              </div>
            </div>

            {/* Historial de Reportes Semanales */}
            {reportesSemanales.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-md font-semibold mb-4 text-gray-800">
                  Historial de Reportes Semanales
                </h3>

                <div className="space-y-4">
                  {reportesSemanales
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((reporte, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              Semana: {reporte.semana}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Dias trabajados: {reporte.diasTrabajados}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ${reporte.totalSemana.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total semanal
                            </p>
                          </div>
                        </div>

                        {/* Resumen por turnos */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <div className="text-xs text-yellow-700 font-medium">Mananas</div>
                            <div className="text-lg font-bold text-yellow-800">
                              ${reporte.totalManana.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded border border-orange-200">
                            <div className="text-xs text-orange-700 font-medium">Tardes</div>
                            <div className="text-lg font-bold text-orange-800">
                              ${reporte.totalTarde.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <div className="text-xs text-green-700 font-medium">Promedio diario</div>
                            <div className="text-lg font-bold text-green-800">
                              ${(reporte.totalSemana / reporte.diasTrabajados).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Detalle por días */}
                        <div className="border-t pt-4">
                          <h5 className="font-medium text-gray-800 mb-3">Detalle por dias:</h5>
                          <div className="space-y-2">
                            {Object.entries(
                              reporte.reportes.reduce((acc, r) => {
                                if (!acc[r.fecha]) acc[r.fecha] = [];
                                acc[r.fecha].push(r);
                                return acc;
                              }, {})
                            )
                              .sort(([a], [b]) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')))
                              .map(([fecha, reportesDia]) => {
                                const totalDia = reportesDia.reduce((t, r) => t + r.total, 0);
                                return (
                                  <div key={fecha} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                                    <span className="text-sm font-medium">{fecha}</span>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="text-gray-600">
                                        {reportesDia.length} turno{reportesDia.length > 1 ? 's' : ''}
                                      </span>
                                      <span className="font-medium text-green-700">
                                        ${totalDia.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-indigo-200 px-4 py-3 shadow-2xl">
        <div className="flex justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('cierre')}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              activeTab === 'cierre'
                ? 'text-white bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Calculator size={28} />
            <span className="text-xs mt-1 font-medium">Cierre</span>
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              activeTab === 'reportes'
                ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <FileText size={28} />
            <span className="text-xs mt-1 font-medium">Reportes</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              activeTab === 'personal'
                ? 'text-white bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
            }`}
          >
            <Users size={28} />
            <span className="text-xs mt-1 font-medium">Personal</span>
          </button>

          <button
            onClick={() => setActiveTab('semanal')}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              activeTab === 'semanal'
                ? 'text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Calendar size={28} />
            <span className="text-xs mt-1 font-medium">Semanal</span>
          </button>
        </div>
      </nav>
    </div>
  );
}