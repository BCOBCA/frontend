# Vercel Expo output configuration

- Reported deployment: commit 415ae46 builds successfully, then fails STATIC_BUILD_NO_OUT_DIR because the dashboard expects `build`. Screenshot shows Preact preset; the application is Expo SDK 58 with `web.output: single`, producing `dist`.
- Added root `vercel.json`: framework null (Other), npm ci, npm run build, output dist, clean URLs and official Expo SPA rewrite. No changes to application logic, dependencies, worker counts or environment values.
- Immediate dashboard fix: select Other and output dist, then redeploy. Repository-based fix requires committing/pushing the config and deploying that new commit; no remote settings or deployment changed here.
- Validation: JSON parsing, config/output consistency, existing successful web export artifact at dist/index.html, TypeScript, ESLint and diff whitespace check. The reported Vercel error itself confirms its bundling step completed. Existing npm warnings were not the cause.
