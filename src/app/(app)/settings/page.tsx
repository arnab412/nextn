'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/use-admin";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User } from "lucide-react";

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
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Role Management</CardTitle>
            </div>
            <CardDescription>
              Manage user access and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Global Administrator</p>
                  <p className="text-sm text-muted-foreground">Has full access to delete transactions and manage settings.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge>Active</Badge>
                  <span className="text-xs text-muted-foreground">schoolcash@gmail.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
