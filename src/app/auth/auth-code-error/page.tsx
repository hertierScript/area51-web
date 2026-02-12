"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold">Authentication Issue</h1>

          <p className="text-muted-foreground">
            There was an issue confirming your email. This could be because:
          </p>

          <ul className="text-sm text-muted-foreground text-left space-y-2 px-4">
            <li>• The confirmation link has expired</li>
            <li>• The link has already been used</li>
            <li>• There was a technical issue during confirmation</li>
          </ul>

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => router.push("/login")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Login
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/signup")}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Create New Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
