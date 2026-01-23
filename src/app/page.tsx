'use client';

import { useState, useEffect, useRef } from 'react';
import { Calculator, FileText, Users, Plus, Banknote, User, Clock, X, Calendar, Settings } from 'lucide-react';

// Interfaces para tipos TypeScript
interface Venta {
  id: number;
  monto: number;
  metodo: string;
  hora: string;
  nombreTransferencia: string | null;
  timestamp: number;
}

interface ReporteDiario {
  id: string;
  fecha: string;
  turno: string;
  horaInicio: string;
  horaCambio: string;
  empleada: string;
  cajaInicial: number;
  ventas: Venta[];
  ingresoEfectivo: number;
  ingresoTransferencia: number;
  total: number;
  timestamp: number;
}

interface Personal {
  id: number;
  nombre: string;
  activo: boolean;
}

interface ReporteSemanal {
  semana: string;
  totalSemana: number;
  totalManana: number;
  totalTarde: number;
  diasTrabajados: number;
  reportes: ReporteDiario[];
  timestamp: number;
}

interface CierreDiario {
  fecha: string;
  turnoManana: ReporteDiario | null;
  turnoTarde: ReporteDiario;
  totalDia: number;
}

// Funciones para localStorage con backup
const STORAGE_KEYS = {
  REPORTES_DIARIOS: 'control-caja-reportes-diarios',
  PERSONAL: 'control-caja-personal',
  REPORTES_SEMANALES: 'control-caja-reportes-semanales',
  BACKUP_TIMESTAMP: 'control-caja-backup-timestamp'
};

// Función para verificar si localStorage está disponible
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Función para guardar con backup
const guardarConBackup = (key: string, data: any) => {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage no disponible');
    return false;
  }

  try {
    const backupKey = `${key}_backup_${Date.now()}`;
    const timestamp = Date.now();

    // Guardar datos principales
    localStorage.setItem(key, JSON.stringify(data));

    // Crear backup
    localStorage.setItem(backupKey, JSON.stringify({
      data,
      timestamp,
      version: '1.0'
    }));

    // Actualizar timestamp del último backup
    localStorage.setItem(STORAGE_KEYS.BACKUP_TIMESTAMP, timestamp.toString());

    // Limpiar backups antiguos (mantener solo los últimos 5)
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(k => k.startsWith(`${key}_backup_`))
      .sort((a, b) => {
        const aTime = parseInt(a.split('_').pop() || '0');
        const bTime = parseInt(b.split('_').pop() || '0');
        return bTime - aTime;
      });

    if (backupKeys.length > 5) {
      backupKeys.slice(5).forEach(oldKey => {
        localStorage.removeItem(oldKey);
      });
    }

    return true;
  } catch (error) {
    console.error('Error guardando con backup:', error);
    return false;
  }
};

// Función para cargar con recuperación automática
const cargarConRecuperacion = (key: string, defaultValue: any = []): any => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage no disponible, usando valores por defecto');
    return defaultValue;
  }

  try {
    // Intentar cargar datos principales
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`Datos cargados correctamente de ${key}:`, parsed.length || 'objeto');
      return parsed;
    }

    // Si no hay datos principales, intentar recuperar del backup más reciente
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(k => k.startsWith(`${key}_backup_`))
      .sort((a, b) => {
        const aTime = parseInt(a.split('_').pop() || '0');
        const bTime = parseInt(b.split('_').pop() || '0');
        return bTime - aTime;
      });

    if (backupKeys.length > 0) {
      const latestBackup = localStorage.getItem(backupKeys[0]);
      if (latestBackup) {
        const backupData = JSON.parse(latestBackup);
        console.log(`Datos recuperados del backup para ${key}:`, backupData.data.length || 'objeto');
        // Restaurar datos del backup
        localStorage.setItem(key, JSON.stringify(backupData.data));
        return backupData.data;
      }
    }

    console.log(`No se encontraron datos para ${key}, usando valores por defecto`);
    return defaultValue;
  } catch (error) {
    console.error(`Error cargando datos de ${key}:`, error);
    return defaultValue;
  }
};

const guardarReportesDiarios = (reportes: ReporteDiario[]) => {
  return guardarConBackup(STORAGE_KEYS.REPORTES_DIARIOS, reportes);
};

const cargarReportesDiarios = (): ReporteDiario[] => {
  return cargarConRecuperacion(STORAGE_KEYS.REPORTES_DIARIOS, []);
};

const guardarPersonal = (personal: Personal[]) => {
  return guardarConBackup(STORAGE_KEYS.PERSONAL, personal);
};

const cargarPersonal = (): Personal[] => {
  return cargarConRecuperacion(STORAGE_KEYS.PERSONAL, []);
};

const guardarReportesSemanales = (reportes: ReporteSemanal[]) => {
  return guardarConBackup(STORAGE_KEYS.REPORTES_SEMANALES, reportes);
};

const cargarReportesSemanales = (): ReporteSemanal[] => {
  return cargarConRecuperacion(STORAGE_KEYS.REPORTES_SEMANALES, []);
};

// Función para verificar integridad de datos
const verificarIntegridadDatos = () => {
  const reportes = cargarReportesDiarios();
  const personal = cargarPersonal();
  const reportesSemanales = cargarReportesSemanales();

  console.log('=== VERIFICACIÓN DE INTEGRIDAD ===');
  console.log('Reportes diarios:', reportes.length);
  console.log('Personal:', personal.length);
  console.log('Reportes semanales:', reportesSemanales.length);

  // Verificar si hay datos
  const hayDatos = reportes.length > 0 || personal.length > 0 || reportesSemanales.length > 0;
  console.log('¿Hay datos guardados?:', hayDatos ? '✅ SÍ' : '❌ NO');

  return { reportes, personal, reportesSemanales, hayDatos };
};

// Función para exportar todos los datos (backup manual)
const exportarDatos = () => {
  const datos = {
    reportesDiarios: cargarReportesDiarios(),
    personal: cargarPersonal(),
    reportesSemanales: cargarReportesSemanales(),
    timestamp: Date.now(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-control-caja-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Función para importar datos desde backup
const importarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target?.result as string);

      if (datos.reportesDiarios) guardarReportesDiarios(datos.reportesDiarios);
      if (datos.personal) guardarPersonal(datos.personal);
      if (datos.reportesSemanales) guardarReportesSemanales(datos.reportesSemanales);

      // Recargar la página para aplicar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error importando datos:', error);
      alert('Error al importar el archivo. Verifica que sea un archivo de backup válido.');
    }
  };
  reader.readAsText(file);
};

// Función para limpiar todos los datos (con confirmación)
const limpiarTodosLosDatos = () => {
  if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
    localStorage.clear();
    window.location.reload();
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('reportes');

  // Estados para ventas
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [montoVenta, setMontoVenta] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [nombreTransferencia, setNombreTransferencia] = useState('');
  const [cajaInicial] = useState('30000');

  // Estados para turno
  const [nombreEmpleada, setNombreEmpleada] = useState('');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaCambio, setHoraCambio] = useState('');

  // Estados para reportes y cierres
  const [reportesDiarios, setReportesDiarios] = useState<ReporteDiario[]>([]);
  const [mostrarCierreDiario, setMostrarCierreDiario] = useState(false);
  const [cierreDiario, setCierreDiario] = useState<CierreDiario | null>(null);

  // Estados para personal
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [nuevoNombrePersonal, setNuevoNombrePersonal] = useState('');

  // Estados para reportes semanales
  const [reportesSemanales, setReportesSemanales] = useState<ReporteSemanal[]>([]);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  // Funciones helper para actualizar estado con localStorage
  const actualizarReportesDiarios = (nuevosReportes: ReporteDiario[]) => {
    setReportesDiarios(nuevosReportes);
    guardarReportesDiarios(nuevosReportes);
  };

  const actualizarPersonal = (nuevoPersonal: Personal[]) => {
    setPersonal(nuevoPersonal);
    guardarPersonal(nuevoPersonal);
  };

  const actualizarReportesSemanales = (nuevosReportes: ReporteSemanal[]) => {
    setReportesSemanales(nuevosReportes);
    guardarReportesSemanales(nuevosReportes);
  };

  // Función para calcular cierres diarios disponibles
  const calcularCierresDisponibles = () => {
    const cierres: CierreDiario[] = [];
    const fechasUnicas = Array.from(new Set(reportesDiarios.map(r => r.fecha)));

    fechasUnicas.forEach(fecha => {
      const reportesDia = reportesDiarios.filter(r => r.fecha === fecha);
      const turnoManana = reportesDia.find(r => r.turno === '8-15');
      const turnoTarde = reportesDia.find(r => r.turno === '15-22');

      // Solo crear cierre si hay turno tarde (que es cuando se genera el cierre)
      if (turnoTarde) {
        cierres.push({
          fecha,
          turnoManana: turnoManana || null,
          turnoTarde,
          totalDia: (turnoManana ? turnoManana.total : 0) + turnoTarde.total
        });
      }
    });

    return cierres.sort((a, b) => new Date(b.fecha.split('/').reverse().join('-')).getTime() - new Date(a.fecha.split('/').reverse().join('-')).getTime());
  };

  // Cargar datos del localStorage al iniciar con verificación
  useEffect(() => {
    console.log('=== INICIANDO CARGA DE DATOS ===');

    // Verificar disponibilidad de localStorage
    if (!isLocalStorageAvailable()) {
      console.error('localStorage no está disponible. Los datos no se guardarán.');
      alert('Advertencia: localStorage no está disponible. Los datos no se guardarán entre sesiones.');
    }

    // Cargar datos con verificación
    const datosCargados = verificarIntegridadDatos();

    setReportesDiarios(datosCargados.reportes);
    setPersonal(datosCargados.personal);
    setReportesSemanales(datosCargados.reportesSemanales);

    console.log('=== CARGA DE DATOS COMPLETADA ===');
  }, []);

  // Guardar automáticamente antes de que se recargue la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Guardar el estado actual antes de recargar
      guardarReportesDiarios(reportesDiarios);
      guardarPersonal(personal);
      guardarReportesSemanales(reportesSemanales);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [reportesDiarios, personal, reportesSemanales]);

  // Guardado automático periódico (cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      guardarReportesDiarios(reportesDiarios);
      guardarPersonal(personal);
      guardarReportesSemanales(reportesSemanales);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [reportesDiarios, personal, reportesSemanales]);

  // Guardar cuando se cambia de pestaña
  useEffect(() => {
    guardarReportesDiarios(reportesDiarios);
    guardarPersonal(personal);
    guardarReportesSemanales(reportesSemanales);
  }, [activeTab]); // Se ejecuta cada vez que cambia la pestaña

  // Guardar cuando se pierde el foco de la ventana
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        guardarReportesDiarios(reportesDiarios);
        guardarPersonal(personal);
        guardarReportesSemanales(reportesSemanales);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reportesDiarios, personal, reportesSemanales]);

  // Estados para filtros
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [mensaje, setMensaje] = useState('');

  // Refs para inputs
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const montoInputRef = useRef<HTMLInputElement>(null);

  // Función para agregar venta
  const agregarVenta = () => {
    if (!montoVenta || parseInt(montoVenta) <= 0) {
      setMensaje('⚠️ Ingresa un monto válido');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    if (metodoPago === 'transferencia' && !nombreTransferencia.trim()) {
      setMensaje('⚠️ Ingresa el nombre de quien transfirió');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    const ahora = new Date();
    const nuevaVenta = {
      id: Date.now(),
      monto: parseInt(montoVenta),
      metodo: metodoPago,
      hora: metodoPago === 'transferencia' ? ahora.toLocaleTimeString('es-ES', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) : ahora.toLocaleTimeString('es-ES', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      nombreTransferencia: metodoPago === 'transferencia' ? nombreTransferencia.trim() : null,
      timestamp: ahora.getTime()
    };

    setVentas([...ventas, nuevaVenta]);
    setMontoVenta('');
    if (metodoPago === 'transferencia') {
      setNombreTransferencia('');
    }
    setMensaje('Venta registrada correctamente');

    // Focus en el input de monto para la siguiente venta
    setTimeout(() => {
      setMensaje('');
      if (montoInputRef.current) {
        montoInputRef.current.focus();
      }
    }, 1500);
  };

  // Función para eliminar venta
  const eliminarVenta = (id: number) => {
    setVentas(ventas.filter(venta => venta.id !== id));
    setMensaje('Venta eliminada');
    setTimeout(() => setMensaje(''), 2000);
  };

  // Función para establecer horas del turno
  const establecerHorasTurno = (turno: string) => {
    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleDateString('es-ES');

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
      setMensaje('⚠️ Selecciona un turno');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    if (!nombreEmpleada.trim()) {
      setMensaje('⚠️ Ingresa el nombre del empleado');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    const ahora = new Date();
    const fechaHoy = ahora.toLocaleDateString('es-ES');

    const reporte = {
      id: fechaHoy + '-' + turnoSeleccionado,
      fecha: fechaHoy,
      turno: turnoSeleccionado,
      horaInicio,
      horaCambio,
      empleada: nombreEmpleada.trim(),
      cajaInicial: parseInt(cajaInicial),
      ventas: [...ventas],
      ingresoEfectivo: ventas.filter(v => v.metodo === 'efectivo').reduce((total, v) => total + v.monto, 0),
      ingresoTransferencia: ventas.filter(v => v.metodo === 'transferencia').reduce((total, v) => total + v.monto, 0),
      total: parseInt(cajaInicial) + ventas.reduce((total, v) => total + v.monto, 0),
      timestamp: ahora.getTime()
    };

    // Verificar si ya existe un reporte para este turno del día
    const reporteExistenteIndex = reportesDiarios.findIndex(r => r.id === reporte.id);

    if (reporteExistenteIndex >= 0) {
      const nuevosReportes = [...reportesDiarios];
      nuevosReportes[reporteExistenteIndex] = reporte;
      actualizarReportesDiarios(nuevosReportes);
      setMensaje('Reporte actualizado');
    } else {
      actualizarReportesDiarios([...reportesDiarios, reporte]);
      setMensaje(`Reporte guardado`);
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

    // Limpiar formulario pero mantener turno y empleado
    setVentas([]);
    setMontoVenta('');
    setMetodoPago('efectivo');
    setNombreTransferencia('');

    setTimeout(() => setMensaje(''), 3000);
  };

  // Función para agregar personal
  const agregarPersonal = () => {
    if (!nuevoNombrePersonal.trim()) {
      setMensaje('⚠️ Ingresa un nombre válido');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    const nuevoPersonal = {
      id: Date.now(),
      nombre: nuevoNombrePersonal.trim(),
      activo: true
    };

    actualizarPersonal([...personal, nuevoPersonal]);
    setNuevoNombrePersonal('');
    setMensaje('✅ Personal agregado');
    setTimeout(() => setMensaje(''), 2000);
  };

  // Función para toggle personal
  const togglePersonal = (id: number) => {
    actualizarPersonal(personal.map(p =>
      p.id === id ? { ...p, activo: !p.activo } : p
    ));
  };

  // Función para eliminar personal
  const eliminarPersonal = (id: number) => {
    actualizarPersonal(personal.filter(p => p.id !== id));
    setMensaje('Personal eliminado');
    setTimeout(() => setMensaje(''), 2000);
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

    const estadisticas = {
      semana: inicioSemana.toLocaleDateString('es-ES') + ' - ' + finSemana.toLocaleDateString('es-ES'),
      totalSemana: reportesSemana.reduce((total, r) => total + r.total, 0),
      totalManana: reportesSemana.filter(r => r.turno === '8-15').reduce((total, r) => total + r.total, 0),
      totalTarde: reportesSemana.filter(r => r.turno === '15-22').reduce((total, r) => total + r.total, 0),
      diasTrabajados: Array.from(new Set(reportesSemana.map(r => r.fecha))).length,
      reportes: reportesSemana,
      timestamp: ahora.getTime()
    };

    actualizarReportesSemanales([...reportesSemanales, estadisticas]);
    setMensaje('📊 Reporte semanal generado');
    setTimeout(() => setMensaje(''), 3000);
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

  // Handlers para teclado
  const handleNombreKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (montoInputRef.current) {
        montoInputRef.current.focus();
      }
    }
  };

  const handleMontoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarVenta();
    }
  };

  const handleTransferenciaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarVenta();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
          Control de Caja - Almacén
        </h1>
        <p className="text-center text-gray-600 text-sm mt-1">
          Sistema profesional de gestión • {new Date().toLocaleDateString('es-ES')}
        </p>
      </header>

      {/* Mensaje Global */}
      {mensaje && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-white border-2 rounded-xl shadow-2xl p-4 text-center animate-pulse">
          <div className="text-lg font-medium text-gray-800">{mensaje}</div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {/* Módulo de Cierre */}
        {activeTab === 'cierre' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator size={28} className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Cierres Diarios
                </h2>
              </div>

              {/* Lista de Cierres Disponibles */}
              {(() => {
                const cierresDisponibles = calcularCierresDisponibles();
                return cierresDisponibles.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    <p className="text-gray-600 mb-4">Cierres diarios disponibles:</p>
                    {cierresDisponibles.map((cierre, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                           onClick={() => {
                             setCierreDiario(cierre);
                             setMostrarCierreDiario(true);
                           }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-800">Cierre del {cierre.fecha}</h3>
                            <p className="text-sm text-gray-600">
                              Total: ${cierre.totalDia.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {cierre.turnoManana ? 'Ambos turnos' : 'Solo tarde'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Cierre Diario Detallado */}
              {mostrarCierreDiario && cierreDiario ? (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-3xl">📊</div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Cierre del Día - {cierreDiario.fecha}
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Turno Mañana */}
                    {cierreDiario.turnoManana ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2 text-lg">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                          🌅 Turno Mañana (8:00 - 15:00)
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>👤 Empleado:</span>
                            <span className="font-medium">{cierreDiario.turnoManana.empleada || 'No especificado'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>💰 Caja inicial:</span>
                            <span>${cierreDiario.turnoManana.cajaInicial.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>💵 Efectivo:</span>
                            <span>${cierreDiario.turnoManana.ingresoEfectivo.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🏦 Transferencia:</span>
                            <span>${cierreDiario.turnoManana.ingresoTransferencia.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-2 text-base">
                            <span>💰 Total turno:</span>
                            <span className="text-yellow-700">${cierreDiario.turnoManana.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-600 mb-3 flex items-center gap-2 text-lg">
                          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                          🌅 Turno Mañana
                        </h4>
                        <p className="text-gray-500 text-sm">No registrado</p>
                      </div>
                    )}

                    {/* Turno Tarde */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2 text-lg">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        🌆 Turno Tarde (15:00 - 22:00)
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>👤 Empleado:</span>
                          <span className="font-medium">{cierreDiario.turnoTarde.empleada || 'No especificado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💰 Caja inicial:</span>
                          <span>${cierreDiario.turnoTarde.cajaInicial.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💵 Efectivo:</span>
                          <span>${cierreDiario.turnoTarde.ingresoEfectivo.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🏦 Transferencia:</span>
                          <span>${cierreDiario.turnoTarde.ingresoTransferencia.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 text-base">
                          <span>💰 Total turno:</span>
                          <span className="text-orange-700">${cierreDiario.turnoTarde.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total del Día */}
                  <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-xl text-white text-center">
                    <div className="text-sm font-medium mb-1">💰 TOTAL DEL DÍA COMPLETO</div>
                    <div className="text-4xl font-bold">
                      ${cierreDiario.totalDia.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        setMostrarCierreDiario(false);
                        setCierreDiario(null);
                      }}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                  <div className="text-5xl mb-4">🏪</div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">
                    No hay cierres diarios disponibles
                  </h3>
                  <p className="text-blue-600 text-lg">
                    Los cierres diarios se generan automáticamente al guardar reportes del turno tarde en la sección de Reportes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Módulo de Reportes (Ventas) */}
        {activeTab === 'reportes' && (
          <div className="space-y-6">
            {/* Formulario de registro */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText size={28} className="text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Registro de Ventas - Turno {turnoSeleccionado || 'No seleccionado'}
                </h2>
              </div>

              <div className="space-y-6">
                {/* Información de Turno */}
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    👤 Información del Empleado
                  </h3>

                  {/* Nombre de la Empleada */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Empleado
                    </label>
                    <input
                      ref={nombreInputRef}
                      type="text"
                      value={nombreEmpleada}
                      onChange={(e) => setNombreEmpleada(e.target.value)}
                      onKeyPress={handleNombreKeyPress}
                      className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xl font-bold bg-white"
                      placeholder="Ingresa tu nombre y presiona Enter"
                      autoFocus
                    />
                  </div>

                  {/* Selector de Turno */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Clock className="inline mr-2 text-purple-600" size={16} />
                      🕐 Turno de Trabajo
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => establecerHorasTurno('8-15')}
                        className={`px-6 py-4 rounded-xl text-center transition-all font-bold text-lg ${
                          turnoSeleccionado === '8-15'
                            ? 'bg-yellow-500 text-white border-4 border-yellow-600 shadow-lg transform scale-105'
                            : 'bg-white text-gray-700 border-4 border-gray-300 hover:bg-yellow-50 hover:scale-102'
                        }`}
                      >
                        🌅 8:00 - 15:00
                        <div className="text-sm opacity-90">Mañana</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => establecerHorasTurno('15-22')}
                        className={`px-6 py-4 rounded-xl text-center transition-all font-bold text-lg ${
                          turnoSeleccionado === '15-22'
                            ? 'bg-orange-500 text-white border-4 border-orange-600 shadow-lg transform scale-105'
                            : 'bg-white text-gray-700 border-4 border-gray-300 hover:bg-orange-50 hover:scale-102'
                        }`}
                      >
                        🌆 15:00 - 22:00
                        <div className="text-sm opacity-90">Tarde</div>
                      </button>
                    </div>
                  </div>

                  {/* Horas del Turno */}
                  {turnoSeleccionado && (
                    <div className="bg-white p-4 rounded-xl border-2 border-indigo-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Inicio:</span>
                          <div className="font-medium text-green-700 text-lg">{horaInicio}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Cambio:</span>
                          <div className="font-medium text-orange-700 text-lg">{horaCambio}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Caja Inicial */}
                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    <Banknote className="inline mr-3 text-blue-600" size={24} />
                    💰 Dinero en Caja Inicial
                  </label>
                  <input
                    type="number"
                    value={cajaInicial}
                    readOnly
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-700 text-2xl font-bold"
                    placeholder="30000"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Monto inicial de caja (generalmente $30,000) - No modificable
                  </p>
                </div>

                {/* Agregar Venta Individual */}
                <div className="border-t border-indigo-200 pt-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <Plus className="text-green-600" size={24} />
                    ➕ Agregar Nueva Venta
                  </h4>

                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-100 shadow-lg">
                    {/* Monto y Método en fila */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          💵 Monto de la Venta
                        </label>
                        <input
                          ref={montoInputRef}
                          type="number"
                          value={montoVenta}
                          onChange={(e) => setMontoVenta(e.target.value)}
                          onKeyPress={handleMontoKeyPress}
                          className="w-full px-6 py-5 border-4 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 text-3xl font-bold bg-white"
                          placeholder="0"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          💳 Método de Pago
                        </label>
                        <select
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value)}
                          className="w-full px-6 py-5 border-4 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 text-2xl font-bold bg-white"
                        >
                          <option value="efectivo">💵 Efectivo</option>
                          <option value="transferencia">🏦 Transferencia</option>
                        </select>
                      </div>
                    </div>

                    {/* Campo adicional para transferencias */}
                    {metodoPago === 'transferencia' && (
                      <div className="mb-6">
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          👤 Nombre de quien transfirió
                        </label>
                        <input
                          type="text"
                          value={nombreTransferencia}
                          onChange={(e) => setNombreTransferencia(e.target.value)}
                          onKeyPress={handleTransferenciaKeyPress}
                          className="w-full px-6 py-5 border-4 border-violet-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500 focus:border-violet-500 text-2xl bg-white"
                          placeholder="Nombre completo"
                        />
                      </div>
                    )}

                    {/* Botón grande y atractivo */}
                    <button
                      type="button"
                      onClick={agregarVenta}
                      className="w-full bg-blue-600 text-white py-6 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-semibold text-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!montoVenta || (metodoPago === 'transferencia' && !nombreTransferencia.trim())}
                    >
                      ➕ AGREGAR VENTA
                    </button>
                  </div>
                </div>

                {/* Lista de Ventas */}
                {ventas.length > 0 && (
                  <div className="border-t border-indigo-200 pt-6">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      📋 Ventas Registradas ({ventas.length})
                    </h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {ventas
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((venta) => (
                        <div key={venta.id} className={`flex items-center justify-between p-5 rounded-2xl shadow-lg border-4 ${
                          venta.metodo === 'efectivo'
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-violet-50 border-violet-300'
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              venta.metodo === 'efectivo' ? 'bg-emerald-500' : 'bg-violet-500'
                            }`}>
                              {venta.metodo === 'efectivo' ? '💵' : '🏦'}
                            </div>
                            <div>
                              <div className="font-bold text-2xl text-gray-800">
                                ${venta.monto.toLocaleString()}
                              </div>
                              <div className="text-lg text-gray-600">
                                {venta.metodo === 'efectivo' ? 'Efectivo' : 'Transferencia'} • {venta.hora}
                                {venta.nombreTransferencia && (
                                  <span className="ml-3 text-violet-700 font-medium">
                                    • {venta.nombreTransferencia}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarVenta(venta.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-colors shadow-lg"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen de Turno e Ingresos */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-6">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                    📊 Resumen del Turno
                  </h3>

                  {/* Información del Turno */}
                  <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 rounded-xl mb-6 border border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="text-3xl mb-2">👤</div>
                        <div className="text-sm text-gray-600 uppercase tracking-wide">Personal</div>
                        <div className="font-bold text-indigo-800 text-lg">
                          {nombreEmpleada || 'No especificado'}
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="text-3xl mb-2">
                          {turnoSeleccionado === '8-15' ? '🌅' : turnoSeleccionado === '15-22' ? '🌆' : '⏰'}
                        </div>
                        <div className="text-sm text-gray-600 uppercase tracking-wide">Turno</div>
                        <div className="font-bold text-purple-800 text-lg">
                          {turnoSeleccionado ? `${turnoSeleccionado} (${turnoSeleccionado === '8-15' ? 'Mañana' : 'Tarde'})` : 'No seleccionado'}
                        </div>
                      </div>
                      {horaInicio && horaCambio && (
                        <div className="flex flex-col items-center text-center">
                          <div className="text-3xl mb-2">🕐</div>
                          <div className="text-sm text-gray-600 uppercase tracking-wide">Horario</div>
                          <div className="font-bold text-gray-800 text-lg">
                            {horaInicio.split(' ')[1]} - {horaCambio.split(' ')[1]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen de Ventas */}
                  <h4 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                    💎 Resumen de Ventas
                  </h4>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Caja Inicial */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-4 border-blue-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">🏦</div>
                        <div className="text-lg font-semibold text-blue-800">Caja Inicial</div>
                      </div>
                      <div className="text-4xl font-bold text-blue-700">
                        ${parseInt(cajaInicial).toLocaleString()}
                      </div>
                    </div>

                    {/* Ventas Efectivo */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-4 border-emerald-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">💵</div>
                        <div className="text-lg font-semibold text-emerald-800">Efectivo</div>
                      </div>
                      <div className="text-4xl font-bold text-emerald-700">
                        ${calcularTotalEfectivo().toLocaleString()}
                      </div>
                      <div className="text-sm text-emerald-600">
                        {ventas.filter(v => v.metodo === 'efectivo').length} ventas
                      </div>
                    </div>

                    {/* Ventas Transferencia */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-2xl border-4 border-violet-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">🏦</div>
                        <div className="text-lg font-semibold text-violet-800">Transferencias</div>
                      </div>
                      <div className="text-4xl font-bold text-violet-700">
                        ${calcularTotalTransferencia().toLocaleString()}
                      </div>
                      <div className="text-sm text-violet-600">
                        {ventas.filter(v => v.metodo === 'transferencia').length} ventas
                      </div>
                    </div>

                    {/* Total Ventas */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-4 border-amber-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">🛒</div>
                        <div className="text-lg font-semibold text-amber-800">Total Ventas</div>
                      </div>
                      <div className="text-4xl font-bold text-amber-700">
                        ${calcularTotalVentas().toLocaleString()}
                      </div>
                      <div className="text-sm text-amber-600">
                        {ventas.length} transacciones
                      </div>
                    </div>
                  </div>

                  {/* Total Final */}
                  <div className="mt-8 bg-gray-800 p-8 rounded-lg text-white text-center shadow-sm">
                    <div className="text-lg font-medium mb-2">TOTAL EN CAJA</div>
                    <div className="text-6xl font-bold">
                      ${(parseInt(cajaInicial) + calcularTotalVentas()).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Botón de Registrar */}
                <button
                  type="button"
                  onClick={guardarReporteDiario}
                  className="w-full bg-green-600 text-white py-6 px-8 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-semibold text-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!turnoSeleccionado || !nombreEmpleada.trim()}
                >
                  💾 GUARDAR REPORTE DEL TURNO
                </button>
              </div>
            </div>

            {/* Historial de Reportes Diarios */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  📈 Historial de Reportes Diarios
                </h3>

                {/* Filtro de turnos */}
                <div className="flex gap-2">
                  <select
                    value={filtroTurno}
                    onChange={(e) => setFiltroTurno(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos los turnos</option>
                    <option value="8-15">🌅 Solo Mañana (8-15)</option>
                    <option value="15-22">🌆 Solo Tarde (15-22)</option>
                  </select>
                </div>
              </div>

              {/* Resumen por turnos */}
              <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-3xl mb-2">🌅</div>
                  <div className="text-lg text-gray-600">Turno Mañana</div>
                  <div className="font-bold text-yellow-700 text-2xl">
                    ${reportesDiarios.filter(r => r.turno === '8-15').reduce((total, r) => total + r.total, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reportesDiarios.filter(r => r.turno === '8-15').length} reportes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🌆</div>
                  <div className="text-lg text-gray-600">Turno Tarde</div>
                  <div className="font-bold text-orange-700 text-2xl">
                    ${reportesDiarios.filter(r => r.turno === '15-22').reduce((total, r) => total + r.total, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reportesDiarios.filter(r => r.turno === '15-22').length} reportes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-lg text-gray-600">Total General</div>
                  <div className="font-bold text-green-700 text-2xl">
                    ${reportesDiarios.reduce((total, r) => total + r.total, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reportesDiarios.length} reportes totales
                  </div>
                </div>
              </div>

              {/* Historial filtrado */}
              {reportesDiarios.length === 0 ? (
                <p className="text-gray-600 text-center py-8 text-lg">
                  No hay reportes guardados aún.
                </p>
              ) : (
                <div className="space-y-6">
                  {reportesDiarios
                    .filter(reporte => filtroTurno === 'todos' || reporte.turno === filtroTurno)
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((reporte, index) => (
                      <div key={index} className="border border-gray-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 flex items-center gap-3 text-xl">
                              <div className={`w-4 h-4 rounded-full ${
                                reporte.turno === '8-15' ? 'bg-yellow-400' : 'bg-orange-400'
                              }`}></div>
                              {reporte.fecha} - Turno {reporte.turno}
                            </h4>
                            <p className="text-gray-600 text-lg">
                              👤 Empleada: {reporte.empleada || 'No especificada'}
                            </p>
                            <p className={`text-lg font-medium ${
                              reporte.turno === '8-15' ? 'text-yellow-700' : 'text-orange-700'
                            }`}>
                              {reporte.turno === '8-15' ? '☀️ Mañana' : '🌅 Tarde'} ({reporte.horaInicio.split(' ')[1]} - {reporte.horaCambio.split(' ')[1]})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-green-600">
                              ${reporte.total.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-lg mb-4">
                          <div>
                            <p className="text-gray-600">💰 Caja inicial: <span className="text-blue-700 font-medium">${reporte.cajaInicial.toLocaleString()}</span></p>
                            <p className="text-gray-600">💵 Efectivo: <span className="text-green-700 font-medium">${reporte.ingresoEfectivo.toLocaleString()}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-600">🏦 Transferencia: <span className="text-purple-700 font-medium">${reporte.ingresoTransferencia.toLocaleString()}</span></p>
                            <p className="text-gray-600">💰 Total del turno: <span className="text-green-700 font-bold">${reporte.total.toLocaleString()}</span></p>
                          </div>
                        </div>

                        {/* Detalle de ventas separadas por método */}
                        {reporte.ventas && reporte.ventas.length > 0 && (
                          <div className="border-t pt-4 space-y-4">
                            {/* Ventas en Efectivo */}
                            {reporte.ventas.filter(v => v.metodo === 'efectivo').length > 0 && (
                              <div>
                                <p className="text-lg text-green-700 font-medium mb-3 flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  💵 Ventas en Efectivo ({reporte.ventas.filter(v => v.metodo === 'efectivo').length})
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  {reporte.ventas.filter(v => v.metodo === 'efectivo').map((venta, idx) => (
                                    <div key={idx} className="bg-green-50 px-3 py-2 rounded-lg text-center">
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
                                <p className="text-lg text-purple-700 font-medium mb-3 flex items-center gap-2">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  🏦 Ventas por Transferencia ({reporte.ventas.filter(v => v.metodo === 'transferencia').length})
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  {reporte.ventas.filter(v => v.metodo === 'transferencia').map((venta, idx) => (
                                    <div key={idx} className="bg-purple-50 px-3 py-2 rounded-lg text-center">
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
          <div className="space-y-6">
            {/* Agregar Personal */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">
                  👥 Agregar Personal
                </h2>
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={nuevoNombrePersonal}
                  onChange={(e) => setNuevoNombrePersonal(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Nombre del personal"
                />
                <button
                  onClick={agregarPersonal}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium text-lg"
                  disabled={!nuevoNombrePersonal.trim()}
                >
                  ➕ Agregar
                </button>
              </div>
            </div>

            {/* Lista de Personal */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                📋 Lista de Personal ({personal.length})
              </h3>

              {personal.length === 0 ? (
                <p className="text-gray-600 text-center py-8 text-lg">
                  No hay personal registrado aún.
                </p>
              ) : (
                <div className="space-y-4">
                  {personal.map((persona) => (
                    <div key={persona.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          persona.activo ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-medium text-lg ${
                          persona.activo ? 'text-gray-800' : 'text-gray-500 line-through'
                        }`}>
                          {persona.nombre}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-lg ${
                          persona.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {persona.activo ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => togglePersonal(persona.id)}
                          className={`px-4 py-2 text-sm rounded-lg ${
                            persona.activo
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {persona.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => eliminarPersonal(persona.id)}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          🗑️ Eliminar
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
          <div className="space-y-6">
            {/* Generar Reporte Semanal */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">
                    📅 Reporte Semanal
                  </h2>
                </div>
                <button
                  onClick={generarReporteSemanal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg"
                >
                  📊 Generar Reporte
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-medium text-blue-800 mb-3 text-lg">📋 Información del Reporte Semanal:</h3>
                <ul className="text-blue-700 space-y-2 text-lg">
                  <li>• <strong>📅 Lunes a Sábado:</strong> Turnos de 8:00-15:00 y 15:00-22:00</li>
                  <li>• <strong>🌞 Domingos:</strong> Turnos especiales disponibles</li>
                  <li>• <strong>📊 Incluye estadísticas completas</strong> de ventas por día y turno</li>
                  <li>• <strong>💰 Calcula totales semanales</strong> y promedios</li>
                </ul>
              </div>
            </div>

            {/* Historial de Reportes Semanales */}
            {reportesSemanales.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                  📈 Historial de Reportes Semanales
                </h3>

                <div className="space-y-6">
                  {reportesSemanales
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((reporte, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-xl">
                              📅 Semana: {reporte.semana}
                            </h4>
                            <p className="text-gray-600 text-lg">
                              📊 Días trabajados: {reporte.diasTrabajados}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-green-600">
                              💰 ${reporte.totalSemana.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Total semanal
                            </p>
                          </div>
                        </div>

                        {/* Resumen por turnos */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                            <div className="text-sm text-yellow-700 font-medium">🌅 Mañanas</div>
                            <div className="text-2xl font-bold text-yellow-800">
                              ${reporte.totalManana.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                            <div className="text-sm text-orange-700 font-medium">🌆 Tardes</div>
                            <div className="text-2xl font-bold text-orange-800">
                              ${reporte.totalTarde.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                            <div className="text-sm text-green-700 font-medium">📈 Promedio diario</div>
                            <div className="text-xl font-bold text-green-800">
                              ${reporte.diasTrabajados > 0 ? (reporte.totalSemana / reporte.diasTrabajados).toLocaleString() : '0'}
                            </div>
                          </div>
                        </div>

                        {/* Detalle por días */}
                        <div className="border-t pt-6">
                          <h5 className="font-medium text-gray-800 mb-4 text-lg">📅 Detalle por días:</h5>
                          <div className="space-y-3">
                            {Object.entries(
                              reporte.reportes.reduce((acc: {[key: string]: ReporteDiario[]}, r) => {
                                if (!acc[r.fecha]) acc[r.fecha] = [];
                                acc[r.fecha].push(r);
                                return acc;
                              }, {} as {[key: string]: ReporteDiario[]})
                            )
                              .sort(([a]: [string, ReporteDiario[]], [b]: [string, ReporteDiario[]]) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime())
                              .map(([fecha, reportesDia]) => {
                                const totalDia = reportesDia.reduce((t, r) => t + r.total, 0);
                                return (
                                  <div key={fecha} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                                    <span className="text-lg font-medium">{fecha}</span>
                                    <div className="flex items-center gap-6 text-lg">
                                      <span className="text-gray-600">
                                        {reportesDia.length} turno{reportesDia.length > 1 ? 's' : ''}
                                      </span>
                                      <span className="font-medium text-green-700">
                                        💰 ${totalDia.toLocaleString()}
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

        {/* Módulo de Configuración */}
        {activeTab === 'configuracion' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="text-2xl">⚙️</div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Configuración y Backup
                </h2>
              </div>

              {/* Estado de los datos */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de los Datos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <div className="text-sm text-gray-600">Reportes Diarios</div>
                      <div className="text-2xl font-bold text-blue-600">{reportesDiarios.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-sm text-gray-600">Personal</div>
                      <div className="text-2xl font-bold text-green-600">{personal.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-sm text-gray-600">Reportes Semanales</div>
                      <div className="text-2xl font-bold text-purple-600">{reportesSemanales.length}</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>Último backup automático:</strong> {localStorage.getItem(STORAGE_KEYS.BACKUP_TIMESTAMP) ?
                        new Date(parseInt(localStorage.getItem(STORAGE_KEYS.BACKUP_TIMESTAMP)!)).toLocaleString('es-ES') :
                        'Nunca'}
                    </div>
                  </div>
                </div>

                {/* Backup y Restauración */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Backup y Restauración</h3>
                  <div className="space-y-4">
                    <div>
                      <button
                        onClick={exportarDatos}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        📥 Exportar Backup (Descargar)
                      </button>
                      <p className="text-sm text-gray-600 mt-2">
                        Descarga un archivo con todos tus datos para guardarlo como respaldo.
                      </p>
                    </div>

                    <div>
                      <label className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center font-medium">
                        📤 Importar Backup
                        <input
                          type="file"
                          accept=".json"
                          onChange={importarDatos}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-600 mt-2">
                        Carga un archivo de backup previamente descargado.
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <button
                        onClick={limpiarTodosLosDatos}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        🗑️ Limpiar Todos los Datos
                      </button>
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Esta acción eliminará permanentemente todos los datos guardados.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del sistema */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Sistema</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><strong>localStorage disponible:</strong> {isLocalStorageAvailable() ? '✅ Sí' : '❌ No'}</div>
                    <div><strong>Versión de la app:</strong> 1.0</div>
                    <div><strong>Última actualización:</strong> {new Date().toLocaleString('es-ES')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-4 border-indigo-200 px-6 py-4 shadow-2xl">
        <div className="flex justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('cierre')}
            className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
              activeTab === 'cierre'
                ? 'text-white bg-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Calculator size={32} />
            <span className="text-sm mt-2 font-medium">Cierre</span>
          </button>

          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
              activeTab === 'reportes'
                ? 'text-white bg-green-600 shadow-sm'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <FileText size={32} />
            <span className="text-sm mt-2 font-medium">Reportes</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
              activeTab === 'personal'
                ? 'text-white bg-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
            }`}
          >
            <Users size={32} />
            <span className="text-sm mt-2 font-medium">Personal</span>
          </button>

          <button
            onClick={() => setActiveTab('semanal')}
            className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
              activeTab === 'semanal'
                ? 'text-white bg-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Calendar size={32} />
            <span className="text-sm mt-2 font-medium">Semanal</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracion')}
            className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-200 ${
              activeTab === 'configuracion'
                ? 'text-white bg-gray-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings size={32} />
            <span className="text-sm mt-2 font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}