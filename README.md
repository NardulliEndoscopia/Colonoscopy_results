# ColonScope

Herramienta educativa para entender informes de colonoscopia con IA.

## Deploy en Vercel (sin terminal)

1. Sube este ZIP a GitHub (ver instrucciones abajo)
2. Importa el repo en vercel.com
3. Añade la variable de entorno: `ANTHROPIC_API_KEY` = tu key de Anthropic
4. Copia el archivo `COLON3D-v1.glb` a `public/models/COLON3D-v1.glb`

## Variables de entorno requeridas

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Desarrollo local

```bash
npm install
# crea .env.local con ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

## Aviso legal

Esta herramienta es solo educativa y no constituye diagnóstico médico.
