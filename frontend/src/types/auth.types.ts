export type RegistrationRole = "trainee" | "provider" | "organization";

export type AuthView = "login" | "register-options" | "register-form";

export type RegisterOption = {
  key: RegistrationRole;
  title: string;
  description: string;
  icon: string;
};

export type RegistrationFormProps = {
  onBack: () => void;
};
