import Papa from "npm:papaparse@5.4.1";

export function parseCsv(bytes: Uint8Array): Record<string, string>[] {
  const text = new TextDecoder("utf-8").decode(bytes);
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}
