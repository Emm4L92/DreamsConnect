import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, t } from "@/hooks/use-language";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Redirect } from "wouter";
import { useState } from "react";
import { LanguageSelector } from "@/components/ui/language-selector";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const { language } = useLanguage();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  }
  
  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
    });
  }

  // Redirect if logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Section: Auth Forms */}
      <div className="md:w-1/2 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md card-brutal rotate-1">
          <CardHeader>
            <CardTitle className="text-2xl font-pixel flex items-center gap-2">
              <span className="text-primary">Dream</span>
              <span className="text-secondary">Connect</span>
            </CardTitle>
            <CardDescription>
              {t("Share your dreams and connect with others who had similar experiences", language)}
            </CardDescription>
            <div className="flex justify-end">
              <LanguageSelector variant="ghost" size="sm" minimal />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="font-medium">{t("Login", language)}</TabsTrigger>
                <TabsTrigger value="register" className="font-medium">{t("Register", language)}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">{t("Username", language)}</Label>
                      <Input
                        id="login-username"
                        className="input-brutal"
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-secondary">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t("Password", language)}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        className="input-brutal"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-secondary">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 btn-brutal rotate-1"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? t("Logging in...", language) : t("Login", language)}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">{t("Username", language)}</Label>
                      <Input
                        id="register-username"
                        className="input-brutal"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-secondary">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t("Password", language)}</Label>
                      <Input
                        id="register-password"
                        type="password"
                        className="input-brutal"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-secondary">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">{t("Confirm Password", language)}</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        className="input-brutal"
                        {...registerForm.register("confirmPassword")}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-secondary">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-accent text-black hover:bg-accent/90 btn-brutal rotate-neg-1"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? t("Creating account...", language) : t("Create account", language)}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t-2 border-black pt-4 justify-center">
            <p className="text-sm text-center">
              {activeTab === "login" ? (
                <>
                  {t("Don't have an account?", language)}{" "}
                  <button 
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab("register")}
                  >
                    {t("Sign up", language)}
                  </button>
                </>
              ) : (
                <>
                  {t("Already have an account?", language)}{" "}
                  <button 
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab("login")}
                  >
                    {t("Log in", language)}
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right Section: Hero */}
      <div className="md:w-1/2 bg-black text-white p-8 flex items-center justify-center">
        <div className="max-w-lg">
          <h1 className="font-pixel text-3xl mb-6 leading-relaxed">
            <span className="text-primary">Connect</span> through your 
            <span className="text-secondary"> Dreams</span>
          </h1>
          
          <p className="text-lg mb-6">
            Share your dream experiences and find others who've dreamed similar journeys. Explore the collective unconscious together.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
                ✨
              </div>
              <div>
                <h3 className="font-semibold mb-1">Dream Sharing</h3>
                <p className="text-sm text-gray-300">Share your dreams and get automatic tags using AI</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white text-2xl">
                🔮
              </div>
              <div>
                <h3 className="font-semibold mb-1">Dream Matching</h3>
                <p className="text-sm text-gray-300">Get matched with people who had similar dreams</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black text-2xl">
                💬
              </div>
              <div>
                <h3 className="font-semibold mb-1">Connect & Chat</h3>
                <p className="text-sm text-gray-300">Discuss your dreams in real-time with your matches</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>100% free and open-source. Your data belongs to you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
