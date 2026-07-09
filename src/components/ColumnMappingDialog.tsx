import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ERP_COLUMN_FIELDS, suggestColumnMapping } from "@/lib/erp-column-fields";
import { previewErpFile } from "@/lib/erp-file-preview";

const NONE_VALUE = "__none__";

interface ColumnMappingDialogProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (columnMapping: Record<string, string>) => void | Promise<void>;
  importing: boolean;
}

export function ColumnMappingDialog({ file, open, onOpenChange, onConfirm, importing }: ColumnMappingDialogProps) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file) return;

    setLoadingPreview(true);
    setError(null);
    previewErpFile(file)
      .then(({ headers, sampleRows }) => {
        setHeaders(headers);
        setSampleRows(sampleRows);
        setMapping(suggestColumnMapping(headers));
      })
      .catch((err) => {
        console.error("Erro ao ler arquivo:", err);
        setError("Não foi possível ler o arquivo. Verifique se é um CSV/XLSX válido.");
      })
      .finally(() => setLoadingPreview(false));
  }, [open, file]);

  const missingRequired = useMemo(
    () => ERP_COLUMN_FIELDS.filter((field) => field.required && !mapping[field.key]),
    [mapping],
  );

  const handleConfirm = () => {
    if (missingRequired.length > 0) return;
    onConfirm(mapping);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mapear colunas do arquivo</DialogTitle>
          <DialogDescription>
            Ligue cada coluna do seu arquivo ao campo correspondente. Isso só precisa ser feito uma vez — nas
            próximas importações, o mesmo mapeamento é reaplicado automaticamente.
          </DialogDescription>
        </DialogHeader>

        {loadingPreview ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ERP_COLUMN_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  <Select
                    value={mapping[field.key] ?? NONE_VALUE}
                    onValueChange={(value) =>
                      setMapping((prev) => {
                        const next = { ...prev };
                        if (value === NONE_VALUE) delete next[field.key];
                        else next[field.key] = value;
                        return next;
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Não informar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Não informar</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {sampleRows.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Prévia das primeiras linhas
                </Label>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        {headers.map((header) => (
                          <th key={header} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleRows.map((row, i) => (
                        <tr key={i} className="border-t">
                          {headers.map((header) => (
                            <td key={header} className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {missingRequired.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Falta mapear: {missingRequired.map((f) => f.label).join(", ")}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loadingPreview || !!error || missingRequired.length > 0 || importing}>
            {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar e Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
