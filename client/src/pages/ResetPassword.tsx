import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthCard from "@/components/common/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/store/uiStore";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/utils/validators";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/services/api";
import { BRAND } from "@/utils/constants";
import { useState } from "react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.resetPassword({
        token: values.token,
        password: values.password,
      });
      showToast("Password reset successful. Please sign in.", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Invalid reset link" subtitle="Request a new password reset.">
        <Link to="/login" className="btn-primary inline-block text-center">
          Back to Sign In
        </Link>
      </AuthCard>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password | {BRAND.name}</title>
      </Helmet>

      <AuthCard title="Set new password" subtitle="Choose a strong password for your account">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register("token")} />

          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-error">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
