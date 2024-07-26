"use client";

import { RegisterForm } from "@/components/RegisterForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2 flex items-center justify-center">
              Register
              <Icons.userPlus className="h-6 w-6 ml-4 text-blue-600 " />
            </CardTitle>
            <p className="text-gray-600">Join Nexus Chat today</p>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:underline flex items-center justify-center"
              >
                Already have an account?
                <Icons.logIn className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
