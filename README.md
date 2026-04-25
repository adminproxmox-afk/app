# Skill Play Web App

The project now ships as a single React/Vite foundation from `react-app`.
GitHub Pages builds and deploys only `react-app/dist`.

## Run locally

```sh
cd react-app
npm install
npm run typecheck
npm run dev
```

## Build

```sh
cd react-app
npm run build
```

## Deployment

- GitHub Pages is published from `.github/workflows/deploy-react.yml`
- Vite uses `base: './'`, so the generated build works correctly from Pages artifacts
- The app now includes the home flow, shop, avatar, settings, games, and local browser auth inside the React foundation
