// The npm-registry xlsx@0.18.5 build has known unpatched ReDoS/prototype-pollution
// advisories; SheetJS ships fixes only from their own CDN, and Deno can import
// arbitrary HTTPS module URLs directly, so we pull the patched build from there.
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

export function parseXlsx(bytes: Uint8Array): Record<string, string>[] {
  const workbook = XLSX.read(bytes, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
