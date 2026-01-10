import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import adminInstance from "@/adminApi/adminInstance";

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    if (/^\d{0,10}$/.test(value)) {
      setMobileNumber(value);
      setErrorMsg("");
    }
  };

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) {
      setErrorMsg("Please enter a mobile number");
      return;
    }
    if (mobileNumber.length !== 10) {
      setErrorMsg("Mobile number must be exactly 10 digits");
      return;
    }

    setErrorMsg("");
    
    // Show toast for OTP sent
    toast.success("OTP sent successfully!", { duration: 2000 });
    
    // Move to OTP step
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      setErrorMsg("Please enter complete 4-digit OTP");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await adminInstance.post(
        "/auth/otp/verify",
        {
          phoneNumber: mobileNumber,
          otp: Number(otp),
        }
      );

      console.log("Verify OTP Response:", response.data);

      // Check response structure according to your API
      if (response.data?.status === true && response.data?.data?.token) {
        const token = response.data.data.token;
        const user = response.data.data.user;

        // Store token in localStorage
        localStorage.setItem("token", token);
        
        // Optional: Store user info
        localStorage.setItem("user", JSON.stringify(user));

        console.log("✅ Token saved:", token);
        console.log("✅ User info:", user);
        
        // Show toast for OTP verified
        toast.success("OTP verified successfully!", { duration: 2000 });
        
        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        setErrorMsg(response.data?.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("OTP Verify Error:", error.response?.data || error);
      setErrorMsg(error.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#F2F4E9] via-[#D9E8D5] to-[#A1D7C4]">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-[#D8E7D1] to-transparent rounded-br-[100px]" />
      <div className="absolute bottom-0 right-0 w-1/2 h-40 bg-gradient-to-l from-[#B7DFC8] to-transparent rounded-tl-[80px]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white bg-opacity-80 rounded-3xl p-8 md:p-12 shadow-xl">
          <h2 className="text-2xl font-bold mb-2 text-center text-[#0B8A74]">
            2 Step Authentication
          </h2>

          {step === "mobile" ? (
            <form onSubmit={handleMobileSubmit} className="space-y-6">
              <p className="text-sm text-center text-muted-foreground mb-6">
                We have sent a verification code to the mobile number whenever
                you Login in your account.
              </p>
              <div className="space-y-2">
                <label
                  htmlFor="mobile"
                  className="text-sm font-medium text-foreground"
                >
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  className="h-12 border-green-300 focus-visible:ring-[#0B8A74]"
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d{10}"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {mobileNumber.length}/10 digits
                </p>
              </div>
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm text-center">
                    {errorMsg}
                  </p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-[#0B8A74] hover:bg-[#087060] text-white font-medium text-base rounded-full"
              >
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn't receive the OTP SMS?
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("mobile")}
                    className="text-xs text-[#0B8A74] hover:underline"
                  >
                    Change mobile number
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground">
                    Enter the verification code we have sent to
                    <br />
                    <span className="font-medium text-foreground">+91 {mobileNumber}</span>
                  </p>
                  <div className="flex justify-center">
                    <InputOTP 
                      maxLength={4} 
                      value={otp} 
                      onChange={setOtp}
                      disabled={loading}
                    >
                      <InputOTPGroup>
                        {[...Array(4)].map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-14 h-14 text-xl border-green-300 focus-visible:ring-[#0B8A74]"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </div>
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm text-center">
                    {errorMsg}
                  </p>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading || otp.length !== 4}
                className="w-full h-12 bg-[#0B8A74] hover:bg-[#087060] text-white font-medium text-base rounded-full disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}