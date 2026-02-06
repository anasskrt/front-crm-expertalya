/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download } from "lucide-react";
import { apiGet, apiPostFormData, apiGetBlob } from "@/lib/api";

type BackendDocument = {
  id: number;
  societeId: number;
  uploadedAt: string;   // ISO
  url: string | null;
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

type UiDocument = {
  id: number;
  nom: string;
  type: string;
  taille: string;
  dateUpload: string; // ISO
  url?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return "📄";
  if (type.includes("image")) return "🖼️";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
  return "📎";
}

function mapBackendDocToUI(d: BackendDocument): UiDocument {
  return {
    id: d.id,
    nom: d.name ?? `Document #${d.id}`,
    type: d.mimeType ?? "application/octet-stream",
    taille: d.size != null ? formatFileSize(d.size) : "—",
    dateUpload: d.uploadedAt,
    url: d.url ?? undefined,
  };
}

export default function SocieteDocuments({
  societeId,
  className,
  onCountChange,
}: {
  societeId: number;
  className?: string;
  /** Optionnel : remonte le nombre de documents au parent si besoin */
  onCountChange?: (count: number) => void;
}) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data: BackendDocument[] = await apiGet(`/document/societe/${societeId}`);
        const mapped = Array.isArray(data) ? data.map(mapBackendDocToUI) : [];
        if (mounted) {
          setDocuments(mapped);
          onCountChange?.(mapped.length);
        }
      } catch {
        if (mounted) {
          setDocuments([]);
          onCountChange?.(0);
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [societeId, onCountChange]);
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || (files as any).length === 0) return;
    const arr = Array.from(files);

    // optimistic UI
    const temps: UiDocument[] = arr.map((f) => ({
      id: Number(Date.now() + Math.random()),
      nom: f.name,
      type: f.type || "application/octet-stream",
      taille: formatFileSize(f.size),
      dateUpload: new Date().toISOString(),
      url: undefined,
    }));
    setDocuments((prev) => [...temps, ...prev]);
    onCountChange?.(documents.length + temps.length);

    try {
      const created = await Promise.all(arr.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiPostFormData<BackendDocument>(`/document/${societeId}`, formData);
      }));
      const mapped = created.map(mapBackendDocToUI);

      setDocuments((prev) => {
        const tempIds = new Set(temps.map((t) => t.id));
        const withoutTemps = prev.filter((p) => !tempIds.has(p.id));
        const next = [...mapped, ...withoutTemps];
        onCountChange?.(next.length);
        return next;
      });

      toast({
        title: "Upload réussi",
        description: `${arr.length} document${arr.length > 1 ? "s" : ""} ajouté${arr.length > 1 ? "s" : ""}.`,
      });
    } catch (e: any) {
      // rollback
      setDocuments((prev) => {
        const tempIds = new Set(temps.map((t) => t.id));
        const next = prev.filter((p) => !tempIds.has(p.id));
        onCountChange?.(next.length);
        return next;
      });
      toast({
        title: "Erreur d'upload",
        description: e?.message || "Impossible d'ajouter le(s) document(s).",
        variant: "destructive",
      });
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    void handleUploadFiles(files);
    event.target.value = "";
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setIsDragging(false);
  };
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      void handleUploadFiles(e.dataTransfer.files);
    }
  };

  const badge = useMemo(() => {
    if (loading) return <Badge className="bg-muted text-muted-foreground">Chargement…</Badge>;
    return documents.length > 0 ? (
      <Badge className="bg-green-100 text-green-800">
        {documents.length} document{documents.length > 1 ? "s" : ""} disponible{documents.length > 1 ? "s" : ""}
      </Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800">Aucun document</Badge>
    );
  }, [documents.length, loading]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </div>

          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Dropzone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-sm text-muted-foreground">
            Glissez-déposez vos fichiers ici ou cliquez pour sélectionner.
          </p>
        </div>

        {/* Badge compteur */}
        <div className="mb-4">{badge}</div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Chargement des documents…</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun document téléchargé</p>
            <p className="text-sm mt-1">Ajoutez ou glissez-déposez des documents</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getFileIcon(doc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.taille} • {new Date(doc.dateUpload).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={async () => {
                    try {
                      const blob = await apiGetBlob(`/document/${doc.id}`);
                      const url = URL.createObjectURL(blob);
                      window.open(url, "_blank");
                    } catch {
                      toast({
                        title: "Erreur",
                        description: "Impossible d'ouvrir le document.",
                        variant: "destructive",
                      });
                    }
                  }}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
