"use client";

import { useState, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { apiPost } from "@/lib/api";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2 — OTP 6 chiffres
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- Étape 1 : envoyer le code ---
  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/auth/forgot-password", { email });
      setStep("code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // --- Gestion OTP ---
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  // --- Étape 2 : vérifier le code ---
  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { setError("Le code doit contenir 6 chiffres."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await apiPost<{ valid: boolean }>("/auth/verify-reset-code", { email, code });
      if (!res.valid) {
        setError("Code invalide ou expiré. Vérifiez et réessayez.");
        return;
      }
      setStep("password");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // --- Étape 3 : réinitialiser le mot de passe ---
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    setError("");
    setLoading(true);
    try {
      await apiPost("/auth/reset-password", { email, code, newPassword });
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl bg-white">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Building className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {step === "success" ? "Mot de passe réinitialisé" : "Mot de passe oublié"}
        </CardTitle>
        <p className="text-gray-500 text-sm">
          {step === "email" && "Entrez votre email pour recevoir un code de réinitialisation."}
          {step === "code" && `Code envoyé à ${email}. Valable 10 minutes.`}
          {step === "password" && "Choisissez un nouveau mot de passe."}
          {step === "success" && "Votre mot de passe a été mis à jour avec succès."}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Indicateur d'étapes */}
        {step !== "success" && (
          <div className="flex items-center gap-2 mb-2">
            {(["email", "code", "password"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    step === s
                      ? "bg-blue-600 text-white"
                      : (["email", "code", "password"] as Step[]).indexOf(step) > i
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {(["email", "code", "password"] as Step[]).indexOf(step) > i ? "✓" : i + 1}
                </div>
                {i < 2 && <div className={`h-px flex-1 transition-colors ${(["email", "code", "password"] as Step[]).indexOf(step) > i ? "bg-green-400" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Étape 1 — Email */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@cabinet.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer le code"}
            </Button>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour à la connexion
            </button>
          </form>
        )}

        {/* Étape 2 — Code OTP */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-3">
              <Label>Code de vérification (6 chiffres)</Label>
              <div className="flex gap-2 justify-center">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onPaste={i === 0 ? handleDigitPaste : undefined}
                    className={`w-11 h-14 text-center text-xl font-bold rounded-lg border-2 outline-none transition-colors ${
                      digit ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    } focus:border-blue-500`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? "Vérification..." : "Vérifier le code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => { setDigits(["", "", "", "", "", ""]); setError(""); setStep("email"); }}
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Changer d&apos;email
              </Button>
            </div>
          </form>
        )}

        {/* Étape 3 — Nouveau mot de passe */}
        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="text-xs text-orange-500">Il manque {8 - newPassword.length} caractère{8 - newPassword.length > 1 ? "s" : ""}.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Répéter le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={confirmPassword && confirmPassword !== newPassword ? "border-red-400" : ""}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        )}

        {/* Succès */}
        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Aller à la connexion
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
