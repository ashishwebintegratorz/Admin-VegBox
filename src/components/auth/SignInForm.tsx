import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useLoginWithPin } from "../../hooks/useApiHooks";

export default function SignInForm() {
  const [showPin, setShowPin] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const loginMutation = useLoginWithPin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || !pin) {
      setError("Please enter both phone and PIN.");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({ phone, pin });
      // The API returns access + refresh tokens and user info
      // We store it in localStorage for ProtectedRoute and Sidebar
      localStorage.setItem("user", JSON.stringify(response.data));
      
      // Redirect to dashboard
      navigate("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to site
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/40 p-8 shadow-2xl backdrop-blur-2xl dark:bg-slate-900/40">
           {/* Decorative blur */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-8">
              <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                Admin Portal
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in with your phone and PIN to manage VegBox.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-rose-500/10 p-3 text-center text-sm font-medium text-rose-500 ring-1 ring-rose-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  type="text"
                  placeholder="+91 9876543210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border-white/20 bg-white/50 backdrop-blur-sm focus:border-blue-500 dark:bg-slate-900/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Security PIN</Label>
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    className="rounded-xl border-white/20 bg-white/50 backdrop-blur-sm focus:border-blue-500 dark:bg-slate-900/50"
                  />
                  <span
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPin ? <EyeIcon width={20} height={20} /> : <EyeCloseIcon width={20} height={20} />}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:shadow-blue-500/50 active:scale-[0.98]" 
                  size="md"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </div>
                  ) : "Sign In to Admin"}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Forgot your PIN? Contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
