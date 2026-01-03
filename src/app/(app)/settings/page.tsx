'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/use-admin";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useAdminsList } from "@/hooks/use-admins-list";

export default function SettingsPage() {
  const { isAdmin, user } = useAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Email:</span>
            <span className="text-muted-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Role:</span>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Administrator" : "User"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle>Role Management</CardTitle>
              </div>
              <CardDescription>
                Manage user access and permissions.
              </CardDescription>
            </div>
            <AddAdminDialog />
          </CardHeader>
          <CardContent>
            <AdminList />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AddAdminDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !db) return;

    setIsLoading(true);
    try {
      await setDoc(doc(db, "admins", email), {
        email,
        addedAt: new Date().toISOString(),
      });
      toast({ title: "Success", description: "Admin role assigned successfully." });
      setOpen(false);
      setEmail("");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to assign role.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Administrator</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to grant admin privileges.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminList() {
  const { admins, isLoading } = useAdminsList();
  const db = useFirestore();
  const { toast } = useToast();

  // Always include master admin visually if not in DB, but DB list is source of truth for others.
  // We can merge them for display.
  const masterEmail = "schoolcash@gmail.com";
  const allAdmins = [
    { email: masterEmail, isMaster: true },
    ...admins.filter(a => a.email !== masterEmail).map(a => ({ ...a, isMaster: false }))
  ];

  const handleRemove = async (email: string) => {
    if (!db) return;
    if (!confirm(`Remove admin role from ${email}?`)) return;

    try {
      await deleteDoc(doc(db, "admins", email));
      toast({ title: "Role Removed", description: `${email} is no longer an admin.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove role.", variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading roles...</p>;

  return (
    <div className="space-y-2">
      {allAdmins.map((admin) => (
        <div key={admin.email} className="rounded-md border bg-card p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">{admin.isMaster ? "Global Administrator" : "Administrator"}</p>
            <p className="text-sm text-muted-foreground">{admin.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{admin.isMaster ? "Master" : "Active"}</Badge>
            {!admin.isMaster && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(admin.email)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
