import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  registerSchema,
  verifyOtpSchema,
  type RegisterFormValues,
  type VerifyOtpFormValues,
} from "@/utils/validators";
import { BRAND } from "@/utils/constants";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/services/api";

type Step = "register" | "verify";

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, verifyEmail, isLoading, isAuthenticated } =
    useAuth();
  const showToast = useUIStore((s) => s.showToast);

  const [step, setStep] = useState<Step>("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", otp: "" },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      });

      setRegisteredEmail(result.email);
      otpForm.setValue("email", result.email);
      setDevOtpHint(result.devOtp ?? null);
      setStep("verify");
      showToast("Check your email for the verification code.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const onVerifySubmit = async (values: VerifyOtpFormValues) => {
    try {
      await verifyEmail({
        email: registeredEmail,
        otp: values.otp.trim(),
      });
      showToast("Email verified! Welcome to RV Foods.", "success");
      navigate("/", { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleResendOtp = async () => {
    if (!registeredEmail) return;
    try {
      const response = await authService.resendOtp(registeredEmail);
      if (response.data?.devOtp) {
        setDevOtpHint(response.data.devOtp);
      }
      showToast("A new verification code has been sent.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Configure Google OAuth on server
    showToast("Google sign-up is not configured yet.", "info");
  };

  return (
    <>
      <Helmet>
        <title>Create Account | {BRAND.name}</title>
      </Helmet>

      <AuthCard
        title={step === "register" ? "Create your account" : "Verify your email"}
        subtitle={
          step === "register"
            ? "Join RV Foods for authentic homemade flavours"
            : `We sent a 6-digit code to ${registeredEmail}`
        }
        footer={
          <p>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        {step === "register" ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleSignup}
            >
              <GoogleIcon className="h-4 w-4" />
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-text-muted">Or with email</span>
              </div>
            </div>

            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Your name"
                  {...registerForm.register("name")}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-error">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-error">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
                  {...registerForm.register("phone")}
                />
                {registerForm.formState.errors.phone && (
                  <p className="text-sm text-error">
                    {registerForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...registerForm.register("password")}
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
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-error">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...registerForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-error">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(onVerifySubmit)}
            className="space-y-4"
            noValidate
          >
            {devOtpHint && (
              <p className="rounded-lg bg-accent/20 px-3 py-2 text-sm text-text-secondary">
                Dev mode OTP: <strong className="text-primary">{devOtpHint}</strong>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">6-digit verification code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="text-center text-lg tracking-[0.5em]"
                {...otpForm.register("otp")}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-sm text-error">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => void handleResendOtp()}
            >
              Resend code
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("register")}
            >
              Back to registration
            </Button>
          </form>
        )}
      </AuthCard>
    </>
  );
}
