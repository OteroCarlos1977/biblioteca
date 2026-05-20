# Biblioteca

Proyecto modular React + Vite + Node.js + Express con datos hardcodeados de biblioteca.

Ver [flujoDelProyecto.md](./flujoDelProyecto.md) para estructura, puertos, endpoints y flujo completo.

## GitHub Pages

El workflow `.github/workflows/github-pages.yml` publica solamente el frontend en GitHub Pages.

GitHub Pages no ejecuta servidores Node/Express. Para que la app publicada funcione contra datos reales, el backend debe estar desplegado en otro servicio y la URL debe configurarse como variable del repositorio:

```txt
VITE_API_URL=https://url-publica-del-backend/api
```

En local, el frontend usa por defecto:

```txt
http://localhost:5010/api
```
