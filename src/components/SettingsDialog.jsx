import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, User, Shield, Heart } from "lucide-react";

export default function SettingsDialog({ open, onClose }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.auth.updateMe({ _deleted: true });
      toast({ title: "Account scheduled for deletion" });
      await base44.auth.logout();
      window.location.href = "/login";
    } catch (e) {
      toast({ title: "Could not delete account", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="text-white/50">Manage your VitalKin AI account & data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <User className="w-5 h-5 text-[#418E66]" />
              <div className="text-sm">Profile & Medical ID</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Shield className="w-5 h-5 text-[#8fb347]" />
              <div className="text-sm">Privacy & data</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Heart className="w-5 h-5 text-[#c4793f]" />
              <div className="text-sm">Household members & pets</div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button variant="destructive" className="w-full" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
            <Button variant="ghost" className="w-full text-white/70" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-neutral-950 border-neutral-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This permanently removes your VitalKin AI profile and health records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-neutral-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 text-white">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
