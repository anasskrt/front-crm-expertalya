"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { EmailTemplate, TYPE_TEMPLATE_LABELS } from "@/lib/api/email";
import { SendResult, envoyerMaintenant } from "@/lib/api/emailListe";

interface Props {
  listeId: number;
  contactCount: number;
  activeTemplates: EmailTemplate[];
}

export default function EnvoiTab({ listeId, contactCount, activeTemplates }: Props) {
  const { toast } = useToast();
  const [templateId, setTemplateId] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const handleEnvoyer = async () => {
    if (!templateId) return;
    if (!confirm(`Envoyer maintenant à ${contactCount} contact(s) ?`)) return;
    setSending(true);
    setResult(null);
    try {
      const res = await envoyerMaintenant(listeId, Number(templateId));
      setResult(res);
      toast({ title: `Envoi terminé : ${res.envoyes}/${res.total} envoyés` });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-md bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
        <strong>{contactCount}</strong> contact{contactCount !== 1 ? "s" : ""} dans cette liste
      </div>

      <div>
        <Label className="mb-1.5 block">Template *</Label>
        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un template actif..." />
          </SelectTrigger>
          <SelectContent>
            {activeTemplates.length === 0 ? (
              <SelectItem value="_none" disabled>
                Aucun template actif
              </SelectItem>
            ) : (
              activeTemplates.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.nom} — {TYPE_TEMPLATE_LABELS[t.type]}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleEnvoyer}
        disabled={!templateId || sending || contactCount === 0}
        className="w-full"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Envoyer maintenant
      </Button>

      {result && (
        <div
          className={`rounded-md p-4 border ${
            result.echecs > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"
          }`}
        >
          <p className="font-semibold text-sm mb-3">Résultat de l&apos;envoi</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{result.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{result.envoyes}</p>
              <p className="text-xs text-gray-500">Envoyés</p>
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  result.echecs > 0 ? "text-red-600" : "text-gray-400"
                }`}
              >
                {result.echecs}
              </p>
              <p className="text-xs text-gray-500">Échecs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
