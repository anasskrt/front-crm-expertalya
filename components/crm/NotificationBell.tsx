"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import {
  Notification,
  getNotifications,
  marquerCommeLue,
  marquerToutCommeLu,
} from "@/lib/api/notification";

// Intervalle de polling (60s). Le panel s'ouvre sans requête supplémentaire
// car la liste complète est déjà mise en cache à chaque poll.
const POLL_INTERVAL = 60_000;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  // true uniquement au tout premier chargement (avant le 1er poll)
  const [initialLoading, setInitialLoading] = useState(true);
  const lastFetchRef = useRef<number>(0);

  const unreadNotifications = notifications.filter((n) => !n.lu);
  const count = unreadNotifications.length;

  // Fetche la liste complète et met à jour le cache local
  const fetchAll = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      lastFetchRef.current = Date.now();
    } catch {
      // silencieux — l'utilisateur peut ne pas être connecté
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Polling uniquement quand l'onglet est visible
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      fetchAll();
      interval = setInterval(fetchAll, POLL_INTERVAL);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Si l'onglet revient visible et que les données ont plus de 60s, on rafraîchit
        const stale = Date.now() - lastFetchRef.current > POLL_INTERVAL;
        if (stale) fetchAll();
        interval = setInterval(fetchAll, POLL_INTERVAL);
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") {
      start();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAll]);

  // À l'ouverture du panel : on utilise le cache, pas de requête supplémentaire.
  // Si les données ont plus de 30s, on rafraîchit discrètement en arrière-plan.
  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) return;
    const stale = Date.now() - lastFetchRef.current > 30_000;
    if (stale) fetchAll();
  };

  const handleMarquerLue = async (notif: Notification) => {
    try {
      await marquerCommeLue(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, lu: true } : n))
      );
    } catch {
      // silencieux
    }
  };

  const handleMarquerTout = async () => {
    try {
      await marquerToutCommeLu();
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    } catch {
      // silencieux
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          <Bell className="h-5 w-5 text-gray-700" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">
            Notifications {count > 0 && <span className="text-red-500">({count})</span>}
          </span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-blue-600 hover:text-blue-700"
              onClick={handleMarquerTout}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Liste */}
        <div className="max-h-80 overflow-y-auto">
          {initialLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : unreadNotifications.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-10">
              Aucune nouvelle notification
            </p>
          ) : (
            unreadNotifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleMarquerLue(notif)}
                className="w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors bg-blue-50"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(notif.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer — lien historique */}
        <div className="border-t px-4 py-2">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline"
          >
            <History className="h-3.5 w-3.5" />
            Voir tout l&apos;historique
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
