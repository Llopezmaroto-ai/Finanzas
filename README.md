# Finanzas personales locales

Aplicación web privada para gestionar finanzas, ahorro e inversiones personales mes a mes. Está pensada para una persona particular, no para contabilidad profesional.

## Características principales

- **React + Vite + TypeScript** con estructura por componentes, servicios, tipos y utilidades.
- **Datos locales en IndexedDB**: la información queda guardada en el navegador.
- **Sin backend y sin envíos externos**: no hay API remota ni servidor de datos.
- **Dashboard visual** con tarjetas, comparativas y gráficos CSS/SVG sencillos.
- **Movimientos mensuales**: ingresos, gastos, ahorro, aportaciones a inversión y traspasos.
- **Categorías editables** con subcategorías.
- **Productos financieros** con entidad, tipo, riesgo, objetivo, ISIN/identificador y capital inicial.
- **Seguimiento mensual de productos** con aportaciones, retiradas, capital aportado, valor de mercado y rentabilidad calculada.
- **Agrupaciones personalizadas** por categorías o productos.
- **Objetivos** de ahorro, inversión, límites por categoría, fondo de emergencia y patrimonio.
- **Alertas informativas** sobre gastos, ahorro, límites, peso de producto, bajadas de valor y fondo de emergencia.
- **Informes mensuales y anuales**.
- **Exportación e importación JSON** para copias de seguridad.
- **Exportación CSV** para hoja de cálculo.
- **Datos de ejemplo realistas** que se pueden borrar o restaurar desde Configuración.

## Fórmulas incluidas

- **Ahorro neto** = ingresos reales - gastos reales.
- **Porcentaje de ahorro** = ahorro neto / ingresos reales × 100.
- **Rentabilidad en euros** = valor de mercado - capital aportado neto.
- **Rentabilidad en porcentaje** = rentabilidad en euros / capital aportado neto × 100.
- **Patrimonio total estimado** = efectivo + ahorro conservador + valor de inversiones, representado por el último valor registrado de productos financieros.
- **Peso de producto** = valor del producto / valor total de productos × 100.

Las **aportaciones a inversión** no se computan como gasto real. Los **traspasos** se muestran y validan como movimientos internos para evitar duplicar patrimonio o alterar el ahorro real.

## Instalación

Requisitos recomendados:

- Node.js 20 o superior.
- npm 10 o superior.

Instala dependencias:

```bash
npm install
```

## Ejecutar en local

```bash
npm run dev
```

Abre la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Crear una versión final

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`.

Para previsualizar la build:

```bash
npm run preview
```

## Exportar e importar copia de seguridad

1. Entra en **Importar/exportar datos**.
2. Pulsa **Exportar copia JSON** para descargar un archivo con todos tus datos.
3. Guarda ese archivo en un lugar privado y seguro.
4. Para restaurarlo, pulsa **Importar JSON** y selecciona el archivo exportado.

## Exportar CSV

1. Entra en **Importar/exportar datos**.
2. Pulsa **Exportar CSV**.
3. El archivo incluye secciones para movimientos, productos, seguimiento mensual y objetivos.

## Borrar datos de ejemplo

1. Entra en **Configuración**.
2. Pulsa **Borrar datos de ejemplo y registros**.
3. Se conservarán las categorías y productos base, pero se eliminarán movimientos, seguimientos, agrupaciones y objetivos.

## Privacidad

La app usa IndexedDB del navegador. Esto significa que los datos viven en el dispositivo y perfil de navegador donde se usan. Si limpias los datos del navegador, cambias de perfil o usas otro dispositivo, necesitarás restaurar una copia JSON.

## Notas de auditoría de producto

### Cálculos y duplicidades

- El **ahorro neto** se calcula solo con ingresos reales menos gastos reales.
- Las **aportaciones a inversión** se informan por separado y no se restan como gasto.
- Los movimientos de tipo **ahorro** y **traspaso** se consideran asignaciones internas: sirven para registrar intención o movimiento entre productos, pero no suman patrimonio por sí mismos.
- El **patrimonio estimado** se obtiene del último valor de mercado registrado de cada producto financiero. Si un producto aún no tiene seguimiento mensual, se usa su capital inicial como estimación y la app muestra una validación.
- Al importar una copia JSON, los registros mensuales duplicados por producto/mes/año se deduplican conservando el último registro leído y recalculando rentabilidad.

### Privacidad

- La app no incluye llamadas `fetch`, endpoints remotos ni analítica.
- `index.html` incluye una política CSP restrictiva para limitar conexiones, scripts, formularios y objetos externos.
- Los datos se guardan en IndexedDB del navegador; exporta copias JSON periódicas si vas a limpiar datos del navegador o cambiar de equipo.

### Prevención de pérdida de datos

- Antes de importar, borrar o restaurar datos de ejemplo, la app pide confirmación y descarga una copia JSON de recuperación.
- No se permite eliminar categorías o productos que estén en uso por movimientos, seguimientos o agrupaciones para evitar dejar datos huérfanos.
