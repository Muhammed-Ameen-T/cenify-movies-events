import { z } from "zod";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaPhone } from "react-icons/fa";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastContainer, toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { startLoading, stopLoading } from "../../store/slices/loadingSlice";
import { vendorRegisterSchema, otpSchema } from "../../validation/schema";
import { registerVendor, verifyVendorOtp, resendVendorOtp } from "../../services/Vendor/authApi";

type VendorRegisterFormData = z.infer<typeof vendorRegisterSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
interface RootState {
  loading: {
    isLoading: boolean;
  };
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1,
    }
  },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const VendorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.loading);
  const [step, setStep] = useState<"register" | "verify">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [registerFormData, setRegisterFormData] = useState<VendorRegisterFormData | null>(null);
  const isSubmittingRef = useRef(false);

  // Register Form
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<VendorRegisterFormData>({
    resolver: zodResolver(vendorRegisterSchema),
    defaultValues: {
      accountType: "theater",
    },
  });

  // OTP Form
  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
    reset: resetOtpForm,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: registerVendor,
    onMutate: () => {
      dispatch(startLoading());
    },
    onSuccess: (data, variables) => {
      setEmail(variables.email);
      setVendorId(data.id || "");
      setStep("verify");
      setResendTimer(30);
      toast.success("OTP sent to your email!");
      dispatch(stopLoading());
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      toast.error(message);
      dispatch(stopLoading());
    },
  });

  // Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: verifyVendorOtp,
    onMutate: () => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      dispatch(startLoading());
    },
    onSuccess: (data) => {
      isSubmittingRef.current = false;
      toast.success("Email verified successfully!");
      resetOtpForm();
      resetRegisterForm();
      setRegisterFormData(null);
      setEmail("");
      console.log(data)    
        setTimeout(() => {
          navigate('/vendor/dashboard'); 
        }, 3000);  
  
      dispatch(stopLoading());
    },
    onError: (error: any) => {
      isSubmittingRef.current = false;
      const message = error.response?.data?.message || error.message || "OTP verification failed. Please try again.";
      toast.error(message);
      dispatch(stopLoading());
    },
  });

  // Resend OTP Mutation
  const resendOtpMutation = useMutation({
    mutationFn: resendVendorOtp,
    onMutate: () => {
      dispatch(startLoading());
    },
    onSuccess: () => {
      setResendTimer(30);
      toast.success("OTP resent to your email!");
      dispatch(stopLoading());
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to resend OTP.";
      toast.error(message);
      dispatch(stopLoading());
    },
  });

  // Handle Register Form Submission
  const onRegisterSubmitHandler = useCallback(
    (data: VendorRegisterFormData) => {
      setRegisterFormData(data);
      registerMutation.mutate({ email: data.email });
    },
    [registerMutation]
  );

  // Handle OTP Form Submission
  const onOtpSubmitHandler = useCallback(
    (data: OtpFormData) => {
      if (!registerFormData) {
        toast.error("Registration data not found. Please start over.");
        setStep("register");
        dispatch(stopLoading());
        return;
      }

      verifyOtpMutation.mutate({
        name: registerFormData.name,
        email: registerFormData.email,
        password: registerFormData.password,
        phone: registerFormData.phone || "",
        accountType: registerFormData.accountType,
        otp: data.otp,
      });
    },
    [registerFormData, verifyOtpMutation, dispatch]
  );

  // Handle OTP Input Change
  const handleOtpChange = useCallback(
    (index: number, value: string, onChange: (value: string) => void) => {
      if (/^\d?$/.test(value)) {
        const currentOtp = otpControl._formValues.otp || "";
        const newOtp = currentOtp.padEnd(6, " ").split("");
        newOtp[index] = value;
        const otpString = newOtp.join("").trim();
        setOtpValue("otp", otpString);
        onChange(otpString);

        if (value && index < 5) {
          const nextInput = document.getElementById(`otp-${index + 1}`);
          nextInput?.focus();
        }
      }
    },
    [otpControl, setOtpValue]
  );

  // Handle OTP Paste
  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      const pastedData = e.clipboardData.getText().replace(/\D/g, "");
      if (pastedData.length === 6) {
        setOtpValue("otp", pastedData);
        const lastInput = document.getElementById("otp-5");
        lastInput?.focus();
      }
    },
    [setOtpValue]
  );

  // Handle OTP Key Down (for Backspace)
  const handleOtpKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace") {
        const currentOtp = otpControl._formValues.otp || "";
        if (!currentOtp[index] && index > 0) {
          const prevInput = document.getElementById(`otp-${index - 1}`);
          prevInput?.focus();
        } else if (currentOtp[index] && index > 0) {
          const newOtp = currentOtp.split("");
          newOtp[index] = "";
          setOtpValue("otp", newOtp.join("").trim());
          const prevInput = document.getElementById(`otp-${index - 1}`);
          prevInput?.focus();
        }
      }
    },
    [otpControl, setOtpValue]
  );

  // Resend OTP Handler
  const handleResendOtp = useCallback(() => {
    if (resendTimer === 0 && email) {
      resendOtpMutation.mutate({ email });
    }
  }, [resendTimer, email, resendOtpMutation]);

  // Resend Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900 py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer />
      <AnimatePresence mode="wait">
        {step === "register" ? (
          <motion.div 
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              variants={itemVariants}
            >
              <div className="p-8">
                <motion.h1 
                  className="text-3xl font-bold text-center mb-2 text-white"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Join as a Vendor
                </motion.h1>
                <motion.p 
                  className="text-gray-400 text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Create your vendor account to start managing your business
                </motion.p>

                <form
                  onSubmit={handleRegisterSubmit(onRegisterSubmitHandler)}
                  method="POST"
                  className="space-y-5"
                >
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="name" className="text-sm font-medium text-gray-300">
                      Vendor Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        {...registerForm("name")}
                        id="name"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          registerErrors.name ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your vendor name"
                      />
                    </div>
                      {registerErrors.name && (
                        <p className="text-red-400 text-sm mt-1">{registerErrors.name.message}</p>
                      )}
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        {...registerForm("email")}
                        id="email"
                        type="email"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          registerErrors.email ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {registerErrors.email && (
                      <p className="text-red-400 text-sm mt-1">{registerErrors.email.message}</p>
                    )}
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="phone" className="text-sm font-medium text-gray-300">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        {...registerForm("phone")}
                        id="phone"
                        type="tel"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          registerErrors.phone ? "border-red-500" : ""
                        }`}
                        placeholder="Enter phone number"
                      />
                    </div>
                      {registerErrors.phone && (
                        <p className="text-red-400 text-sm mt-1">{registerErrors.phone.message}</p>
                      )}
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        {...registerForm("password")}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          registerErrors.password ? "border-red-500" : ""
                        }`}
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                      {registerErrors.password && (
                        <p className="text-red-400 text-sm mt-1">{registerErrors.password.message}</p>
                      )}
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        {...registerForm("confirmPassword")}
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          registerErrors.confirmPassword ? "border-red-500" : ""
                        }`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                      {registerErrors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">
                          {registerErrors.confirmPassword.message}
                        </p>
                      )}
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label className="text-sm font-medium text-gray-300">
                      Account Type <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3 bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-650 transition-colors border border-transparent hover:border-blue-500">
                        <input
                          type="radio"
                          {...registerForm("accountType")}
                          value="theater"
                          className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-gray-700"
                        />
                        <span className="text-gray-200">Theater</span>
                      </label>
                      <label className="flex items-center space-x-3 bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-650 transition-colors border border-transparent hover:border-blue-500">
                        <input
                          type="radio"
                          {...registerForm("accountType")}
                          value="event"
                          className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-gray-700"
                        />
                        <span className="text-gray-200">Event</span>
                      </label>
                    </div>
                    {registerErrors.accountType && (
                      <p className="text-red-400 text-sm mt-1">{registerErrors.accountType.message}</p>
                    )}
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full py-4 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                    disabled={isLoading || registerMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading || registerMutation.isPending ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Registering...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </form>

                <motion.div className="mt-6 text-center" variants={itemVariants}>
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <Link
                      to="/vendor/login"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Login
                    </Link>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="w-full max-w-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              variants={itemVariants}
            >
              <div className="p-8">
                <motion.h1
                  className="text-2xl font-bold text-center mb-2 text-white"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Verify Your Email
                </motion.h1>
                <motion.p
                  className="text-gray-400 text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  We've sent a verification code to
                  <br />
                  <span className="font-medium text-blue-400">{email}</span>
                </motion.p>

                <form onSubmit={handleOtpSubmit(onOtpSubmitHandler)} className="space-y-8">
                  <motion.div className="flex justify-center space-x-3" variants={itemVariants}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Controller
                        key={index}
                        name="otp"
                        control={otpControl}
                        render={({ field }) => (
                          <motion.input
                            whileFocus={{ scale: 1.05 }}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={field.value[index] || ""}
                            onChange={(e) => handleOtpChange(index, e.target.value, field.onChange)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={(e) => handleOtpPaste(e, index)}
                            className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-transform"
                          />
                        )}
                      />
                    ))}
                  </motion.div>

                  {otpErrors.otp && (
                    <p className="text-red-400 text-sm text-center">{otpErrors.otp.message}</p>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full py-4 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                    disabled={isLoading || verifyOtpMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading || verifyOtpMutation.isPending ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </motion.button>
                </form>

                <motion.div className="mt-6 text-center" variants={itemVariants}>
                  <p className="text-gray-400">
                    Didn't receive the code?{" "}
                    <motion.button
                      onClick={handleResendOtp}
                      className={`font-medium ${
                        resendTimer > 0 || isLoading || !email
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-blue-400 hover:text-blue-300"
                      }`}
                      disabled={resendTimer > 0 || isLoading || !email}
                      whileHover={
                        resendTimer > 0 || isLoading || !email ? {} : { scale: 1.05 }
                      }
                      whileTap={
                        resendTimer > 0 || isLoading || !email ? {} : { scale: 0.95 }
                      }
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                    </motion.button>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VendorRegisterPage;