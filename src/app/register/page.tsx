"use client";

import { RegisterForm } from "@/components/RegisterForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icons.arrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Register Card */}
        <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/nexus-logo.png"
                alt="Nexus Chat"
                width={64}
                height={64}
                className="rounded-xl"
              />
            </div>

            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Join Nexus Chat
            </CardTitle>
            <p className="text-gray-600 text-base">
              Create your account and start connecting
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <RegisterForm />

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-pink-600 hover:text-pink-700 hover:underline transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
