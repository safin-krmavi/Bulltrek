import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-number-input";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { RegisterInput, registerSchema } from "../schema";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const { register } = useAuth();

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  async function onSubmit(values: RegisterInput) {
    try {
      await register.mutateAsync(values);
      setShowSuccess(true);
      toast.success("Registration successful!");
      setTimeout(() => {
        toast.custom((t) => (
          <div className="flex items-center gap-2 bg-white rounded shadow p-3 pr-4 border border-gray-200" style={{ minWidth: 260 }}>
            <span className="text-green-500"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg></span>
            <span className="text-sm text-black">validation mail has been sent to your registered email</span>
            <button onClick={() => toast.dismiss(t.id)} className="ml-auto p-1 text-gray-400 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
        ), { duration: Infinity });
      }, 1000);
    } catch (error: any) {
      // Log the error response for debugging
      console.log("Registration error:", error?.response);

      // Extract message
      const message = error?.response?.data?.message;

      // Check for user already exists error
      const isDuplicate =
        error?.response?.status === 422 &&
        message &&
        typeof message === "object" &&
        Object.values(message)
          .flat()
          .some(
            (msg) =>
              typeof msg === "string" &&
              (msg.toLowerCase().includes("already taken") ||
                msg.toLowerCase().includes("already exists") ||
                msg.toLowerCase().includes("duplicate") ||
                msg.toLowerCase().includes("taken") ||
                msg.toLowerCase().includes("user exists") ||
                msg.toLowerCase().includes("email exists"))
          );

      // Improved error display: show all error messages from API
      if (isDuplicate) {
        toast.error("User already exists. Please login or use a different email/mobile.");
      } else if (typeof message === "string") {
        toast.error(message);
      } else if (typeof message === "object") {
        // Show all error messages from object
        const allMsgs = Object.values(message).flat().filter((msg) => typeof msg === "string");
        if (allMsgs.length > 0) {
          allMsgs.forEach((msg) => toast.error(msg));
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center h-full w-full">
        <h1 className="font-medium text-[32px] text-center">
          Registration Successful!
        </h1>
        <p className="text-center text-[#525252]">
          Please check your email to activate your account.
        </p>
        <p className="text-center text-[#8F8F8F]">
          Redirecting to login page in 5 seconds...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white py-2 text-black">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>
      <h1 className="font-medium text-[28px] text-center mb-3">Register</h1>
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6 animate-fadeIn text-black">
        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter First Name"
                        className="rounded-lg px-4 w-full py-2 text-[16px] text-greyText"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Last Name"
                        className="rounded-lg px-4 w-full py-2 text-[16px] text-greyText"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
            </div>
            {/* Email and Mobile fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Email"
                        className="rounded-lg px-4 w-full py-2 text-[16px] text-greyText"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="IN"
                        placeholder="Enter Mobile Number"
                        className="rounded-lg w-full h-full py-2 text-[16px] text-greyText"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
            </div>
            {/* Password fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter Password"
                        className="rounded-lg px-4 w-full py-2 text-[16px] text-greyText"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Re-Enter password"
                        className="rounded-lg px-4 w-full py-2 text-[16px] text-greyText"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full border-none text-[18px] shadow-none bg-secondary-50 text-white py-3 mt-1 rounded-lg transition-transform duration-200 hover:scale-105 active:scale-100"
              disabled={register.isPending}
            >
              {register.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </div>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </div>
      <div className="flex flex-col gap-2 items-center mt-3 text-black">
        <p className="text-[#525252] text-[12px]">Or continue with</p>
        <div className="flex gap-4 mt-1">
          <button className="border-none rounded-full shadow-md p-2 bg-white hover:bg-gray-100 transition-transform duration-200 hover:scale-110 active:scale-100">
            <img src="/icons/google.svg" alt="Google login" className="w-8 h-8" />
          </button>
          <button className="border-none rounded-full shadow-md p-2 bg-white hover:bg-gray-100 transition-transform duration-200 hover:scale-110 active:scale-100">
            <img src="/icons/facebook.svg" alt="Facebook login" className="w-8 h-8" />
          </button>
        </div>
        <Link to="/login" className="text-[#8F8F8F] text-[14px] underline mt-1">
          Already a User?
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
