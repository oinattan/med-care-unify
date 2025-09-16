import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import LoginPage from "@/components/LoginPage";

const Login = () => {
  const [user, setUser] = useState<{ role: "attendant" | "manager" } | null>(null);

  const handleLogin = (role: "attendant" | "manager") => {
    setUser({ role });
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard userRole={user.role} onLogout={() => setUser(null)} />;
};

export default Login;