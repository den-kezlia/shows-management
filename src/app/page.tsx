"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// No header on homepage

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result?.success) {
          router.push("/admin/dashboard");
        } else {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setIsCheckingAuth(false);
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result?.success) {
        localStorage.setItem("adminToken", result.data.token);
        localStorage.setItem("adminUser", JSON.stringify(result.data.admin));
        setSuccessMessage("Login successful! Redirecting to dashboard...");
        setTimeout(() => router.push("/admin/dashboard"), 800);
      } else {
        setError(result?.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.02_251)] to-[oklch(0.95_0.04_265)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ring mx-auto" />
              <p className="mt-2 text-muted-foreground">Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.02_251)] to-[oklch(0.95_0.04_265)]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Login card only */}
          <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-neutral-900 shadow-md border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">🔐 Admin Login</CardTitle>
              <CardDescription>Sign in to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username or email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                {error && <div className="text-destructive text-sm text-center">{error}</div>}
                {successMessage && (
                  <div className="text-green-600 text-sm text-center font-medium">{successMessage}</div>
                )}
                <Button
                  type="submit"
                  className="w-full gap-2 font-semibold shadow-sm hover:shadow-md active:shadow [&>svg]:size-4 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || !!successMessage}
                >
                  {successMessage ? (
                    "Redirecting..."
                  ) : isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      {/* lock icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25V9A3.75 3.75 0 003 12.75v4.5A3.75 3.75 0 006.75 21h10.5A3.75 3.75 0 0021 17.25v-4.5A3.75 3.75 0 0017.25 9V6.75A5.25 5.25 0 0012 1.5zm3.75 7.5V6.75a3.75 3.75 0 10-7.5 0V9h7.5z" clipRule="evenodd" />
                      </svg>
                      Sign In
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
