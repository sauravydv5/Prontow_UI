import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from 'lucide-react';
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import loginImage from '@/images/login-image.png'
import adminInstance from "@/adminApi/adminInstance";


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminInstance.post("/auth/login/admin",
        {
          email,
          password,
        }
      );

      if (response.data?.status && response.data?.data?.otp) {
        localStorage.setItem("isNewUser", response.data.data.isNew.toString());
        navigate("/2fa");
      } else {
        toast.error(response.data?.message || "Login failed!");
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
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
          src={loginImage}
          alt="Login Image"
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

        <motion.div
          className="relative z-10 w-full max-w-md bg-white bg-opacity-80 rounded-3xl shadow-xl p-8 md:p-10"
        >
          <h2 className="text-2xl font-semibold text-center text-[#0B8A74] mb-8">
            Log In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 mt-1 border-green-300 focus-visible:ring-[#0B8A74]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>

              {/* Relative wrapper so we can position the eye icon */}
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 border-green-300 focus-visible:ring-[#0B8A74]"
                />

                {/* Toggle button - not a submit button */}
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="keep-logged-in"
                  checked={keepLoggedIn}
                  onCheckedChange={(checked) =>
                    setKeepLoggedIn(checked as boolean)
                  }
                />
                <label
                  htmlFor="keep-logged-in"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Keep me logged in
                </label>
              </div>
              <Link
                to="/settings/forgot-password"
                className="text-sm text-[#0B8A74] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0B8A74] hover:bg-[#087060] text-white font-medium text-base rounded-full"
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
