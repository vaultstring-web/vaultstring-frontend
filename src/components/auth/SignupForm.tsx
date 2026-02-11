"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/src/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { signup as signupApi } from "@/src/lib/auth/auth"
import { PasswordStrengthIndicator } from "@/src/components/forms/PasswordStrengthIndicator"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Checkbox } from "@/src/components/ui/checkbox"

const signupSchema = z.object({
  accountType: z.enum(["individual", "business"]),
  email: z.string().email({ message: "Please enter a valid email address" }),
  businessName: z.string().optional(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === "business" && !data.businessName) {
    return false;
  }
  return true;
}, {
  message: "Business name is required for business accounts",
  path: ["businessName"],
});

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [globalError, setGlobalError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: "individual",
      email: "",
      businessName: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  })

  const { watch } = form
  const password = watch("password")
  const accountType = watch("accountType")

  async function onSubmit(data: SignupFormValues) {
    setGlobalError(null)
    
    try {
      const resp = await signupApi({
        email: data.email,
        password: data.password,
        accountType: data.accountType,
      })

      if (resp?.ok) {
        setIsSuccess(true)
        setTimeout(() => {
            router.push(`/verification?email=${encodeURIComponent(data.email)}`)
        }, 1500)
      } else {
        setGlobalError(resp?.message || "Signup failed. Please try again.")
      }
    } catch (error: any) {
      setGlobalError(error?.message || "An unexpected error occurred.")
    }
  }

  return (
    <div className="grid gap-6">
      {globalError && (
        <Alert variant="destructive" className="mb-6 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Signup Failed</AlertTitle>
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="mb-6 rounded-2xl border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Account created! Redirecting...</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 flex-1">
                      <FormControl>
                        <RadioGroupItem value="individual" className="peer sr-only" id="r1" />
                      </FormControl>
                      <FormLabel 
                        htmlFor="r1" 
                        className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${
                            field.value === 'individual' 
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 font-bold' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Individual
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 flex-1">
                      <FormControl>
                        <RadioGroupItem value="business" className="peer sr-only" id="r2" />
                      </FormControl>
                      <FormLabel 
                        htmlFor="r2"
                        className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${
                            field.value === 'business' 
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 font-bold' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Business
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-red-500 ml-1" />
              </FormItem>
            )}
          />

          {accountType === 'business' && (
            <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Business Name</FormLabel>
                    <FormControl>
                    <Input 
                        placeholder="Your Business Name" 
                        className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                        {...field} 
                    />
                    </FormControl>
                    <FormMessage className="text-red-500 ml-1" />
                </FormItem>
                )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="you@example.com" 
                    type="email" 
                    className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500 ml-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500 ml-1" />
                <PasswordStrengthIndicator password={field.value} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500 ml-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-slate-600 dark:text-slate-400">
                    I accept the <a href="#" className="text-green-600 hover:underline">Terms of Service</a> and <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
                  </FormLabel>
                  <FormMessage className="text-red-500 ml-1" />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            disabled={form.formState.isSubmitting || isSuccess}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
