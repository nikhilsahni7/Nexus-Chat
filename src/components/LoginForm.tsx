// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      api.post("/auth/login", credentials),
    onSuccess: (data) => {
      setUser(data.data.user);
      setToken(data.data.accessToken);
      router.push("/chat");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-gray-50 border-gray-300 focus:border-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-gray-50 border-gray-300 focus:border-blue-500"
        />
      </div>
      {loginMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Invalid credentials</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-black text-white hover:bg-gray-800"
      >
        {loginMutation.isPending ? (
          <>
            <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <Icons.logIn className="mr-2 h-4 w-4" />
            Login
          </>
        )}
      </Button>
    </form>
  );
}
