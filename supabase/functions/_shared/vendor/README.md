# Vendored dependencies

## xlsx-0.20.3.mjs

Patched SheetJS build, downloaded from `https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs`.

**Why vendored instead of imported directly:** the npm-registry `xlsx` package is stuck
at 0.18.5 forever (SheetJS stopped publishing newer builds to npm), and 0.18.5 has
unpatched ReDoS / prototype-pollution advisories. SheetJS's own CDN has the fix, but
Supabase's Edge Function bundler rejects imports from arbitrary hosts (`Cannot import
from cdn.sheetjs.com`), so the file is committed here and imported by relative path
instead.

**To update:** download a newer version from `https://cdn.sheetjs.com/xlsx-<version>/package/xlsx.mjs`,
replace this file (rename to match the new version), and update the relative import in
`supabase/functions/middleware-import/parsers/xlsx.ts`.
