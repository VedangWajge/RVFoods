import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import GoogleIcon from "@/components/common/GoogleIcon";
import AuthCard from "@/components/common/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { loginSchema, type LoginFormValues } from "@/utils/validators";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/services/api";
import { BRAND } from "@/utils/constants";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      showToast("Welcome back!", "success");
      navigate(from, { replace: true });
    } catch {
      showToast("Login failed. Check your credentials.", "error");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await authService.forgotPassword({ email: forgotEmail });
      showToast("If the email exists, a reset link has been sent.", "success");
      setShowForgot(false);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Configure Google OAuth on server (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    showToast("Google sign-in is not configured yet.", "info");
  };

  return (
    <>
      <Helmet>
        <title>Sign In | {BRAND.name}</title>
      </Helmet>

      <AuthCard
        title="Welcome back"
        subtitle="Sign in to track orders and checkout faster"
        footer={
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        }
      >
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-2 text-text-muted">Or with email</span>
          </div>
        </div>

        {showForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-text-secondary">
              Enter your email and we&apos;ll send a reset link.
            </p>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send reset link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgot(false)}
              >
                Back
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}
      </AuthCard>
    </>
  );
}
