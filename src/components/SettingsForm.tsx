// components/settings/SettingsForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

export function SettingsForm() {
  const { data: settings, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/profile/settings").then((res) => res.data),
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.notificationsEnabled);
      setDarkModeEnabled(settings.darkModeEnabled);
      setLanguage(settings.language);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: any) =>
      api.put("/profile/settings", updatedSettings),
    onSuccess: () => {
      refetch();
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      notificationsEnabled,
      darkModeEnabled,
      language,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="flex items-center">
            <Icons.bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Label>
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="darkMode" className="flex items-center">
            <Icons.moon className="mr-2 h-4 w-4" />
            Dark Mode
          </Label>
          <Switch
            id="darkMode"
            checked={darkModeEnabled}
            onCheckedChange={setDarkModeEnabled}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="language" className="flex items-center">
          <Icons.globe className="mr-2 h-4 w-4" />
          Language
        </Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {updateSettingsMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to update settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={updateSettingsMutation.isPending}
        className="w-full"
      >
        {updateSettingsMutation.isPending ? (
          <>
            <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Icons.save className="mr-2 h-4 w-4" />
            Save Settings
          </>
        )}
      </Button>
    </form>
  );
}
