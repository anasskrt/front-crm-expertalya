/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

// Ajout du type de props
interface LoginFormProps {
  onLoginSuccess: () => void;
}

// Correction du nom du composant et ajout des props
export default function LoginPage({ onLoginSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("jean.dupont@example.com");
  const [password, setPassword] = useState("motdepasseSuperSecret!");
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      await apiPost("/auth/login", { email, password });
      // Le cookie HttpOnly est défini automatiquement par le backend
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre CRM !",
      });
      onLoginSuccess();
    } catch (error: any) {
      setLoginError(error?.message || "Identifiants invalides.");
      toast({
        title: "Erreur de connexion",
        description: error?.message || "Veuillez vérifier vos identifiants.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-2xl bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            CRM Gestion Sociétés
          </CardTitle>
          <p className="text-gray-600">Connexion à votre espace</p>
        </CardHeader>

        <CardContent>
          {loginError && (
            <div className="mb-4 text-red-600 text-center font-semibold animate-fade-in">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@cabinet.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
