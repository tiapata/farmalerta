import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ErpFilePreview {
  headers: string[];
  sampleRows: Record<string, string>[];
}

/** Lê só o cabeçalho e algumas linhas de amostra, no navegador, para a tela de mapeamento. */
export async function previewErpFile(file: File): Promise<ErpFilePreview> {
  if (file.name.toLowerCase().endsWith(".csv")) {
    const text = await file.text();
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
    });
    return { headers: result.meta.fields ?? [], sampleRows: result.data };
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, sampleRows: rows.slice(0, 5) };
}
