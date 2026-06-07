# Finanzas personales locales

Aplicación web privada para gestionar finanzas, ahorro e inversiones personales mes a mes. Está pensada para una persona particular, no para contabilidad profesional. El repositorio solo incluye datos ficticios de demostración.

## Características principales

> Nota de privacidad del repositorio: los datos semilla usan entidades, identificadores, productos, importes y objetivos ficticios. Sustitúyelos por tus propios datos únicamente en tu navegador o en copias privadas que no subas al repositorio.


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
- **Datos de ejemplo ficticios** que se pueden borrar o restaurar desde Configuración; no representan importes, entidades, productos ni estrategias reales.

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
http://localhost:5173/Finanzas/
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


## Publicar en GitHub Pages

La app está preparada para publicarse desde este repositorio con Vite usando `base: '/Finanzas/'`. El workflow usa `npm ci`, ejecuta `npm run build` y publica la carpeta `dist/` en GitHub Pages.

### Activar GitHub Pages

1. Sube los cambios a GitHub.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Source: GitHub Actions**.
4. Ejecuta el workflow **Deploy to GitHub Pages** manualmente desde **Actions**, o espera a que se ejecute al hacer push a `main`.

### Abrir la app publicada

Cuando termine el workflow, la app estará disponible en:

```text
https://llopezmaroto-ai.github.io/Finanzas/
```

> Importante: GitHub Pages sirve archivos estáticos. Los datos seguirán siendo privados y locales porque se guardan en IndexedDB del navegador con el que abras esa URL. Si abres la app desde otro navegador, perfil o dispositivo, importa tu copia JSON.


## Persistencia de datos

- Todos los datos financieros de la app se guardan exclusivamente en **IndexedDB** del navegador, dentro de la base local `finanzas-personales-db` y el almacén `app-state`.
- Esto incluye movimientos, categorías, subcategorías, productos financieros, seguimientos mensuales, agrupaciones, objetivos y configuración financiera.
- La app **no usa `localStorage` ni `sessionStorage`** para datos financieros. Si en el futuro se añaden preferencias visuales no sensibles, como tema claro/oscuro o filtros temporales, podrían guardarse fuera de IndexedDB, pero nunca importes, productos, movimientos ni objetivos.
- IndexedDB pertenece al navegador, perfil y dispositivo desde el que abras la app. Si borras datos del navegador, cambias de perfil o usas otro dispositivo, necesitarás una copia JSON para restaurar tu información.

### Copia de seguridad

Para guardar una copia manual:

1. Abre **Importar/exportar datos**.
2. Pulsa **Exportar copia JSON**.
3. Guarda el archivo en un lugar privado y seguro.
4. Para restaurarlo, vuelve a **Importar/exportar datos**, pulsa **Importar JSON** y selecciona el archivo.

También puedes usar **Exportar CSV** para analizar los datos en una hoja de cálculo, pero el CSV no sustituye a la copia JSON completa.

## Exportar e importar copia de seguridad

1. Entra en **Importar/exportar datos**.
2. Pulsa **Exportar copia JSON** para descargar un archivo con todos tus datos.
3. Guarda ese archivo en un lugar privado y seguro.
4. Para restaurarlo, pulsa **Importar JSON** y selecciona el archivo exportado.

## Exportar CSV

1. Entra en **Importar/exportar datos**.
2. Pulsa **Exportar CSV**.
3. El archivo incluye secciones para movimientos, productos, seguimiento mensual y objetivos.

## Borrar datos de ejemplo ficticios

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

- El repositorio no contiene entidades financieras reales, ISIN reales, importes personales ni estrategias financieras personales en los datos semilla.
- La app no incluye llamadas `fetch`, endpoints remotos ni analítica.
- `index.html` incluye una política CSP restrictiva para limitar conexiones, scripts, formularios y objetos externos.
- Los datos se guardan en IndexedDB del navegador; exporta copias JSON periódicas si vas a limpiar datos del navegador o cambiar de equipo.

### Prevención de pérdida de datos

- Antes de importar, borrar o restaurar datos de ejemplo, la app pide confirmación y descarga una copia JSON de recuperación.
- No se permite eliminar categorías o productos que estén en uso por movimientos, seguimientos o agrupaciones para evitar dejar datos huérfanos.
