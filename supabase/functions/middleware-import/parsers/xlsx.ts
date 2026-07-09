// The npm-registry xlsx@0.18.5 build has known unpatched ReDoS/prototype-pollution
// advisories; SheetJS ships fixes only from their own CDN (cdn.sheetjs.com), which
// Supabase's Edge Function bundler refuses to fetch from at deploy time ("Cannot
// import from cdn.sheetjs.com"). Vendored locally instead — see ../../_shared/vendor/README.md.
import * as XLSX from "../../_shared/vendor/xlsx-0.20.3.mjs";

export function parseXlsx(bytes: Uint8Array): Record<string, string>[] {
  const workbook = XLSX.read(bytes, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
