"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, Users, Calendar, Repeat, Send } from "lucide-react";
import { EmailListe, EmailListeRegle } from "@/lib/api/emailListe";
import { EmailTemplate } from "@/lib/api/email";
import { SocieteShort } from "./types";
import ContactsTab from "./tabs/ContactsTab";
import PlanificationsTab from "./tabs/PlanificationsTab";
import ReglesTab from "./tabs/ReglesTab";
import EnvoiTab from "./tabs/EnvoiTab";

interface Props {
  liste: EmailListe;
  regles: EmailListeRegle[];
  loading: boolean;
  templates: EmailTemplate[];
  societes: SocieteShort[];
  onClose: () => void;
  onRefresh: () => void;
  onCountChange: (delta: number) => void;
  onReglesChange: (regles: EmailListeRegle[]) => void;
}

export default function EmailListeDetail({
  liste,
  regles,
  loading,
  templates,
  societes,
  onClose,
  onRefresh,
  onCountChange,
  onReglesChange,
}: Props) {
  const activeTemplates = templates.filter((t) => t.actif);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">{liste.titre}</CardTitle>
          {liste.description && (
            <p className="text-sm text-gray-500 mt-0.5">{liste.description}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <Tabs defaultValue="contacts">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="contacts" className="flex items-center gap-1 text-xs">
                <Users className="h-3.5 w-3.5" />
                Contacts ({liste._count.contacts})
              </TabsTrigger>
              <TabsTrigger value="planifications" className="flex items-center gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                Planif. ({liste.planifications.length})
              </TabsTrigger>
              <TabsTrigger value="regles" className="flex items-center gap-1 text-xs">
                <Repeat className="h-3.5 w-3.5" />
                Règles ({regles.length})
              </TabsTrigger>
              <TabsTrigger value="envoi" className="flex items-center gap-1 text-xs">
                <Send className="h-3.5 w-3.5" />
                Envoi direct
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts">
              <ContactsTab
                listeId={liste.id}
                contacts={liste.contacts}
                societes={societes}
                onRefresh={onRefresh}
                onCountChange={onCountChange}
              />
            </TabsContent>

            <TabsContent value="planifications">
              <PlanificationsTab
                listeId={liste.id}
                planifications={liste.planifications}
                activeTemplates={activeTemplates}
                onRefresh={onRefresh}
              />
            </TabsContent>

            <TabsContent value="regles">
              <ReglesTab
                listeId={liste.id}
                regles={regles}
                activeTemplates={activeTemplates}
                allTemplates={templates}
                onReglesChange={onReglesChange}
              />
            </TabsContent>

            <TabsContent value="envoi">
              <EnvoiTab
                listeId={liste.id}
                contactCount={liste._count.contacts}
                activeTemplates={activeTemplates}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
