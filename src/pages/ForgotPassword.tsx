import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import forgotImage from '@/images/forgot-password-image.png'
import adminInstance from "@/adminApi/adminInstance";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: 'success', message: '' });

    try {
      const response = await adminInstance.post(
        '/auth/admin/forgot-password',
        { email }
      );

      if (response.data.status) {
        setAlert({
          show: true,
          type: 'success',
          message: response.data.message || 'Password reset token generated successfully'
        });
        
        // Optional: Navigate to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: response.data.message || 'Failed to send reset email. Please try again.'
        });
      }
    } catch (error: any) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <motion.div
        className="hidden md:flex w-1/2 bg-gradient-to-br from-[#0D9A83] to-[#3CCF9B] items-center justify-center relative "
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <img
          src={forgotImage}
          alt="Illustration"
          className="w-5/6 max-w-lg rounded-[40px] object-cover shadow-md"
        />
      </motion.div>

      {/* Right Form Side */}
      <motion.div
        className="w-full md:w-1/2 bg-gradient-to-br from-[#F2F4E9] via-[#D9E8D5] to-[#A1D7C4] flex items-center justify-center relative"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-[#D8E7D1] to-transparent rounded-br-[100px]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-40 bg-gradient-to-l from-[#B7DFC8] to-transparent rounded-tl-[80px]" />

        {/* Form side */}
        <motion.div className="relative z-10 w-full max-w-md bg-white bg-opacity-80 rounded-3xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-center text-[#0B8A74] mb-8">
            Forgot Password?
          </h2>
          <p className="text-sm text-center text-gray-600 mb-6">
            Enter your email and we'll send you instructions to reset your
            password.
          </p>

          {/* Alert Message */}
          {alert.show && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert 
                className={`${
                  alert.type === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {alert.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription 
                  className={`${
                    alert.type === 'success' 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}
                >
                  {alert.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Enter your Recovery Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 mt-1 border-green-300 focus-visible:ring-[#0B8A74]"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#0B8A74] hover:bg-[#087060] text-white font-medium text-base rounded-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Recover Password'
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-[#0B8A74] font-medium hover:underline"
              >
                Log In
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}