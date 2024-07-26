"use client";

import { LoginForm } from "@/components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2 flex items-center justify-center">
              Login
              <Icons.logIn className="h-6 w-6 ml-2 text-blue-600" />
            </CardTitle>
            <p className="text-gray-600">Welcome back to Nexus Chat</p>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 text-center">
              <Link href="/register" className="text-blue-600 hover:underline">
                Don&apos;t have an account? Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
