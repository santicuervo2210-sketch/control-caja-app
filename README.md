#  Control de Caja - Almacén

Sistema completo y moderno de control de caja para almacén, optimizado para tablets y teléfonos móviles. ¡Reemplaza el papel por registro digital rápido!

##  Características

- * Diseño Moderno**: Interfaz atractiva con gradientes, colores vibrantes y efectos visuales
- * Optimizada para Tablets**: Botones grandes, texto legible, navegación intuitiva
- ** Registro Ultra-Rápido**: Registra ventas en segundos sin papel
- ** Transferencias con Detalles**: Hora automática y nombre de quien transfirió
- **Cierres de caja completos**: Incluye ventas por múltiples métodos de pago, gastos, conteo de billetes y monedas
- **Cálculos automáticos**: Totales de ventas, diferencias y validaciones en tiempo real
- **Reportes diarios**: Visualización de cierres por fecha con estadísticas
- **Gestión de personal**: Agregar, editar y activar/desactivar personal
- **Reportes semanales**: Estadísticas de lunes a sábado con turnos especiales para domingos
- **Datos no editables**: Una vez guardado un cierre, no puede modificarse
- **Almacenamiento local**: Los datos se guardan en el navegador del dispositivo

##  Funcionalidades por Módulo

### 1. Cierre de Caja Diario
- **Cierres por turno**: Turno mañana (8:00-15:00) y turno tarde (15:00-22:00)
- **Cierre diario completo**: Al finalizar turno tarde, muestra resumen automático de ambos turnos
- **Registro de ventas individuales**: Cada venta se registra por separado con método de pago
- **Caja inicial fija**: $30,000 (no modificable)

### 2. Registro de Ventas
- **Ventas individuales**: Registra cada venta con monto y método de pago
- **Métodos de pago**: Efectivo y transferencia bancaria
- **Eliminación de ventas**: Posibilidad de corregir errores
- **Cálculos automáticos**: Totales en tiempo real

### 3. Reportes Diarios
- **Vista por turnos**: Separación clara entre mañana y tarde
- **Filtros inteligentes**: Ver todos los turnos, solo mañana o solo tarde
- **Historial completo**: Todos los reportes guardados organizados por fecha
- **Estadísticas detalladas**: Totales por día y turno

### 4. Gestión de Personal
- **Lista neutral**: Sin distinción de género
- **Estados**: Activar/desactivar personal según necesidad
- **Nombres individuales**: Registro personalizado de cada persona

### 5. Reportes Semanales
- **Lunes a Sábado**: Turnos normales de 8:00-15:00 y 15:00-22:00
- **Domingos**: Turnos especiales de 8:00-14:30 y 18:30-22:00
- **Estadísticas completas**: Totales semanales, promedios diarios
- **Vista detallada**: Desglose por días y turnos

##  Instalación y Uso

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
npm install
```

### Ejecutar en desarrollo
```bash
npm run dev
```

### Construir para producción
```bash
npm run build
npm start
```

## 📊 Secciones de la Aplicación

### Cierre de Caja
- Formulario completo para registrar el cierre diario por turnos
- Validaciones en tiempo real
- Cálculos automáticos
- Confirmación de guardado
- Vista especial al finalizar turno tarde

### Registro de Ventas
- Interfaz intuitiva para agregar ventas
- Selección de método de pago
- Eliminación de ventas erróneas
- Totales actualizados automáticamente

### Reportes Diarios
- Navegación por fechas
- Estadísticas del día (ventas totales, efectivo, transferencias)
- Lista detallada de todos los cierres del día
- Información completa de cada cierre
- Filtros por turno

### Gestión de Personal
- Lista completa del personal
- Estados activo/inactivo
- Agregar nuevos miembros
- Eliminar personal cuando sea necesario

### Reportes Semanales
- Generación automática de reportes
- Cobertura de lunes a sábado
- Turnos especiales para domingos
- Estadísticas semanales completas
- Promedios y totales

## 💾 Almacenamiento de Datos

- **LocalStorage**: Los datos se almacenan localmente en el navegador
- **Persistencia**: Los datos permanecen entre sesiones
- **No editable**: Una vez guardado un cierre, no puede modificarse
- **Backup**: Recomendado hacer backup regular de los datos del navegador

## 🎨 Diseño y UX

- ** Colores Modernos**: Gradientes atractivos, paleta de colores vibrante
- ** Optimizado para Tablets**: Botones grandes (fácil toque), texto legible, navegación intuitiva
- ** Interfaz Ultra-Rápida**: Registra ventas en 2-3 toques
- ** Navegación Visual**: Pestañas grandes con íconos claros y efectos hover
- ** Animaciones Suaves**: Transiciones y efectos que mejoran la experiencia
- ** Tarjetas Informativas**: Resúmenes visuales con gradientes y bordes atractivos
- ** Feedback Inmediato**: Confirmaciones visuales al agregar/eliminar elementos

##  Uso en Tablets/Local

La aplicación está **especialmente diseñada** para:
- **Tablets en mostrador**: Registra ventas mientras atiendes clientes
- **Pantalla táctil optimizada**: Botones grandes, fácil navegación con dedos
- **Modo retrato/paisaje**: Se adapta automáticamente
- **Sin teclado físico**: Todo funciona con pantalla táctil

## 🔧 Tecnologías Utilizadas

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework CSS con gradientes y efectos modernos
- **Lucide React**: Iconos consistentes y expresivos
- **date-fns**: Manejo avanzado de fechas y horas
- **Context API**: Gestión de estado global
- **CSS Moderno**: Gradientes, backdrop-blur, transformaciones y animaciones

##  Uso en Móviles

La aplicación está optimizada para:
- **iOS Safari**
- **Chrome Android**
- **Firefox Mobile**
- **Edge Mobile**

### Recomendaciones:
- Agregar a pantalla de inicio para acceso rápido
- Mantener la aplicación abierta durante el uso
- Hacer backup regular de datos importantes

##  Seguridad y Privacidad

- **Datos locales**: No se envían datos a servidores externos
- **Sin autenticación**: Diseñado para uso personal en dispositivo propio
- **Validaciones**: Prevención de errores en el ingreso de datos

##  Próximas Mejoras (Opcionales)

- Exportación de reportes a PDF/Excel
- Sincronización entre dispositivos (requiere backend)
- Gráficos y estadísticas avanzadas
- Notificaciones push
- Modo oscuro
- Backup automático a la nube

##  Licencia

Este proyecto es de uso personal. Siéntete libre de modificarlo según tus necesidades.

---

##  Reemplaza el Papel por Digital

Esta aplicación está diseñada para **revolucionar** la forma de trabajar en tu almacén:

- **Antes**: Copiar manualmente cada venta en papel
- ** Ahora**: Registra cada venta con 2-3 toques en la tablet
- ** Beneficios**:
  - Registros más rápidos y precisos
  - Sin errores de copia manual
  - Reportes automáticos al instante
  - Backup digital seguro
  - Acceso desde cualquier dispositivo

**¡Tu tablet en el mostrador ahora es tu mejor aliado!**

---

**Desarrollado para modernizar el control de caja en almacenes y comercios pequeños.** 🏪✨
