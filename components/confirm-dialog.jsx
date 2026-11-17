"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * In-app replacement for window.confirm().
 *
 * - `open` / `onOpenChange` control visibility.
 * - `onConfirm` may be async; the dialog stays open and shows a spinner until
 *   it settles, and closes on success. If it throws, the dialog stays open.
 * - `requireText` (e.g. "DELETE") makes the user type that word before the
 *   confirm button enables. Use it for irreversible actions.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  destructive = true,
  requireText,
  onConfirm,
}) {
  // Remount the body whenever the dialog opens so the typed text and the
  // loading state always start fresh.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ConfirmBody
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          destructive={destructive}
          requireText={requireText}
          onConfirm={onConfirm}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}

function ConfirmBody({
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  requireText,
  onConfirm,
  onClose,
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const textOk = !requireText || typed.trim() === requireText;

  const handleConfirm = async () => {
    if (!textOk || busy) return;
    setBusy(true);
    try {
      await onConfirm?.();
      onClose();
    } catch {
      // The caller shows its own error toast; keep the dialog open so the
      // user can retry or cancel.
      setBusy(false);
    }
  };

  return (
    <DialogContent
      className="sm:max-w-md"
      onInteractOutside={(e) => busy && e.preventDefault()}
      onEscapeKeyDown={(e) => busy && e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle className="text-xl tracking-tight">{title}</DialogTitle>
        {description && (
          <DialogDescription className="leading-relaxed">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      {requireText && (
        <div className="space-y-2">
          <Label htmlFor="confirm-text">
            Type <span className="font-mono font-semibold">{requireText}</span>{" "}
            to confirm
          </Label>
          <Input
            id="confirm-text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireText}
            autoComplete="off"
            className="h-11"
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
        </div>
      )}

      <DialogFooter className="gap-2 sm:gap-2">
        <Button
          variant="outline"
          className="h-11"
          onClick={onClose}
          disabled={busy}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "destructive" : "default"}
          className="h-11 gap-2"
          onClick={handleConfirm}
          disabled={!textOk || busy}
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
