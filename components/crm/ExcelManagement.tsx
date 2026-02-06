/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Copy,
  FileSpreadsheet,
  UsersRound,
  RefreshCw,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { exportAllSociete, exportAllTask } from "@/app/api/excel";

type ExportStatus = {
  ok: boolean;
  message: string;
  details?: any;
};

export default function ExcelManagement() {
  const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL || "";

  const [loading, setLoading] = useState<null | "societes" | "tasks" | "all">(
    null
  );
  const [status, setStatus] = useState<ExportStatus | null>(null);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);

  const hasSheet = !!SHEET_URL;

  const copyLink = useCallback(async () => {
    if (!SHEET_URL) return;
    try {
      await navigator.clipboard.writeText(SHEET_URL);
      setStatus({ ok: true, message: "Lien copié dans le presse-papiers." });
    } catch {
      setStatus({
        ok: false,
        message:
          "Impossible de copier le lien. Copie manuelle nécessaire (droits navigateur).",
      });
    }
  }, [SHEET_URL]);

  const openSheet = useCallback(() => {
    if (!SHEET_URL) return;
    window.open(SHEET_URL, "_blank", "noopener,noreferrer");
  }, [SHEET_URL]);

  const runExport = useCallback(
    async (which: "societes" | "tasks" | "all") => {
      setLoading(which);
      setStatus(null);
      try {
        const datas: any[] = [];
  
        if (which === "societes" || which === "all") {
          const d = await exportAllSociete(); // <- axios renvoie directement data
          datas.push({ kind: "societes", data: d });
        }
        if (which === "tasks" || which === "all") {
          const d = await exportAllTask();
          datas.push({ kind: "tasks", data: d });
        }
  
        // Construire un message lisible selon le(s) retour(s)
        let message = "Export terminé.";
        if (which === "societes") {
          const d = datas.find(x => x.kind === "societes")?.data;
          message = `Export sociétés terminé (exported=${d?.exported ?? "?"}).`;
        } else if (which === "tasks") {
          const d = datas.find(x => x.kind === "tasks")?.data;
          message = `Export tâches terminé (collaborators=${d?.collaborators ?? "?"}, tasks=${d?.tasks ?? "?"}).`;
        } else {
          const ds = {
            s: datas.find(x => x.kind === "societes")?.data,
            t: datas.find(x => x.kind === "tasks")?.data,
          };
          message = `Régénération complète terminée (sociétés=${ds.s?.exported ?? "?"}, collaborateurs=${ds.t?.collaborators ?? "?"}, tâches=${ds.t?.tasks ?? "?"}).`;
        }
  
        setStatus({ ok: true, message, details: datas });
        setLastRunAt(new Date());
      } catch (e: any) {
        // axios -> l’erreur est levée, on peut afficher des infos utiles
        const apiMsg =
          e?.response?.data?.message ??
          e?.response?.data?.error ??
          e?.message ??
          "Erreur réseau ou serveur lors de l’export.";
        setStatus({ ok: false, message: apiMsg, details: e?.response?.data ?? String(e) });
      } finally {
        setLoading(null);
      }
    },
    []
  );
  

  const hint = useMemo(() => {
    if (!hasSheet)
      return "Aucun lien configuré. Renseigne NEXT_PUBLIC_SHEET_URL dans tes variables d’environnement.";
    return "Lien vers le tableau contenant les informations exportées vers Google Sheets. Les informations sont exportées ne sont pas modifiables uniquement en lecture. Merci de contacter un directeur de cabinet en cas de soucis.";
  }, [hasSheet]);

  return (
    <div className="space-y-6">
      {/* Card 1 — Lien Google Sheets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Lien Google Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{hint}</p>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex-1 truncate rounded-lg border p-3">
              {hasSheet ? (
                <a
                  className="truncate text-primary hover:underline"
                  href={SHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {SHEET_URL}
                </a>
              ) : (
                <span className="text-muted-foreground">— non configuré —</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={copyLink}
                disabled={!hasSheet}
                title="Copier le lien"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
              <Button onClick={openSheet} disabled={!hasSheet} title="Ouvrir">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir
              </Button>
            </div>
          </div>

          {lastRunAt && (
            <div className="text-xs text-muted-foreground">
              Dernière exécution :{" "}
              {lastRunAt.toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
          )}

          {status && (
            <div
              className={`mt-2 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                status.ok
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                  : "border-rose-300 text-rose-700 bg-rose-50"
              }`}
            >
              {status.ok ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <CircleAlert className="h-4 w-4" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2 — Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Actions Excel / Google Sheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ActionButton
              label="Exporter Sociétés"
              icon={<FileSpreadsheet className="h-4 w-4" />}
              onClick={() => runExport("societes")}
              loading={loading === "societes"}
            />
            <ActionButton
              label="Exporter Tâches (par collab.)"
              icon={<UsersRound className="h-4 w-4" />}
              onClick={() => runExport("tasks")}
              loading={loading === "tasks"}
            />
            <ActionButton
              label="Régénérer tout"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => runExport("all")}
              loading={loading === "all"}
            />
          </div>

          {/* <div className="mt-4 text-xs text-muted-foreground">
            Astuce : le design horizontal (entêtes, largeur de colonnes, formats)
            peut être défini directement dans Google Sheets — les exports ne
            remplacent que les valeurs sous l’entête.
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  loading,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <Button
      className="justify-start"
      variant="outline"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <span className="mr-2 inline-flex">{icon}</span>
      )}
      {label}
    </Button>
  );
}
