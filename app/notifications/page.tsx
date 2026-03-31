"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/crm/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Notification,
  getNotifications,
  marquerCommeLue,
  marquerToutCommeLu,
} from "@/lib/api/notification";
import { logout } from "@/lib/api/auth";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarquerLue = async (notif: Notification) => {
    if (notif.lu) return;
    try {
      await marquerCommeLue(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, lu: true } : n))
      );
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification",
        variant: "destructive",
      });
    }
  };

  const handleMarquerTout = async () => {
    setSaving(true);
    try {
      await marquerToutCommeLu();
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
      toast({ title: "Succès", description: "Toutes les notifications ont été marquées comme lues" });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignorer les erreurs de logout
    }
    window.location.href = "/login";
  };

  const nonLues = notifications.filter((n) => !n.lu).length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600">
              Historique de toutes vos notifications
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <Navigation />

        <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Toutes les notifications
              {nonLues > 0 && (
                <Badge className="bg-red-500 text-white ml-1">
                  {nonLues} non lue{nonLues > 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
            {nonLues > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarquerTout}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                Tout marquer comme lu
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-16">
                Aucune notification
              </p>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleMarquerLue(notif)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                      !notif.lu ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 flex-shrink-0 h-2.5 w-2.5 rounded-full ${
                          !notif.lu ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            !notif.lu
                              ? "font-semibold text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.lu && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs flex-shrink-0">
                          Non lue
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
