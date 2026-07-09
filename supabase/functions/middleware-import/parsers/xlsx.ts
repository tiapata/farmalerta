import * as XLSX from "npm:xlsx@0.18.5";

export function parseXlsx(bytes: Uint8Array): Record<string, string>[] {
  const workbook = XLSX.read(bytes, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
