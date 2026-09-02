import { useState } from "react";
import type { AuthView, RegistrationRole } from "../types/auth.types";
import LoginPage from "../pages/auth/LoginPage";
import RegisterOptionsPage from "../pages/auth/RegisterOptionsPage";
import TraineeRegisterPage from "../pages/auth/TraineeRegisterPage";
import ProviderRegisterPage from "../pages/auth/ProviderRegisterPage";
import OrganizationRegisterPage from "../pages/auth/OrganizationRegisterPage";

const App = () => {
  const [authView, setAuthView] = useState<AuthView>("login");
  const [selectedRole, setSelectedRole] = useState<RegistrationRole | null>(
    null
  );

  const handleSelectRole = (role: RegistrationRole) => {
    setSelectedRole(role);
    setAuthView("register-form");
  };

  const handleBackToOptions = () => {
    setSelectedRole(null);
    setAuthView("register-options");
  };

  const renderRegistrationForm = () => {
    switch (selectedRole) {
      case "trainee":
        return <TraineeRegisterPage onBack={handleBackToOptions} />;
      case "provider":
        return <ProviderRegisterPage onBack={handleBackToOptions} />;
      case "organization":
        return <OrganizationRegisterPage onBack={handleBackToOptions} />;
      default:
        return null;
    }
  };

  switch (authView) {
    case "login":
      return (
        <LoginPage
          onNavigateToRegister={() => setAuthView("register-options")}
        />
      );
    case "register-options":
      return (
        <RegisterOptionsPage
          onSelectRole={handleSelectRole}
          onNavigateToLogin={() => setAuthView("login")}
        />
      );
    case "register-form":
      return renderRegistrationForm();
    default:
      return null;
  }
};

export default App;
