'use client';

import { useState } from 'react';
import { Calculator, FileText, Users, Plus, DollarSign, CreditCard, Banknote, User, Clock, X, Calendar } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('cierre');

  // Estados básicos para evitar errores
  const [ventas, setVentas] = useState([]);
  const [montoVenta, setMontoVenta] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [cajaInicial] = useState('30000');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-cyan-600 shadow-lg px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-white drop-shadow-sm">
          Control de Caja - Almacén
        </h1>
        <p className="text-center text-indigo-100 text-sm mt-1">
          Sistema rápido y eficiente
        </p>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Módulo de Cierre */}
        {activeTab === 'cierre' && (
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator size={24} />
                <h2 className="text-xl font-bold text-gray-800">
                  Cierres Diarios
                </h2>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  No hay cierre diario activo
                </h3>
                <p className="text-blue-600">
                  Los cierres diarios se generan automáticamente al finalizar el turno tarde.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Módulo de Reportes */}
        {activeTab === 'reportes' && (
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} />
                <h2 className="text-lg font-semibold text-gray-800">
                  Registro de Ventas
                </h2>
              </div>

              <div className="space-y-4">
                {/* Información básica */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
                    <User className="text-blue-600" size={16} />
                    Información del Turno
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Empleado
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline mr-2 text-purple-600" size={14} />
                      Turno de Trabajo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="px-4 py-2 border rounded-md text-center bg-blue-600 text-white border-blue-600">
                        8:00 - 15:00
                      </button>
                      <button className="px-4 py-2 border rounded-md text-center bg-white text-gray-700 border-gray-300">
                        15:00 - 22:00
                      </button>
                    </div>
                  </div>
                </div>

                {/* Caja Inicial */}
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
                </div>

                {/* Agregar Venta */}
                <div className="border-t border-indigo-200 pt-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Plus className="text-green-600" size={16} />
                    Agregar Venta
                  </h4>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <input
                        type="number"
                        value={montoVenta}
                        onChange={(e) => setMontoVenta(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Monto"
                      />
                    </div>
                    <div>
                      <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                      </select>
                    </div>
                    <button className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 text-sm font-medium">
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Botón de Guardar */}
                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg">
                  💾 GUARDAR REPORTE DEL TURNO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Módulo de Personal */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="text-green-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">
                  Gestión de Personal
                </h2>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del personal"
                />
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Módulo Semanal */}
        {activeTab === 'semanal' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Reporte Semanal
                  </h2>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                  Generar Reporte
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Información del Reporte Semanal:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Lunes a Sábado:</strong> Turnos de 8:00-15:00 y 15:00-22:00</li>
                  <li>• <strong>Domingos:</strong> Turnos especiales disponibles</li>
                  <li>• Incluye estadísticas completas de ventas</li>
                </ul>
              </div>
            </div>
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