type TraineeRegisterProps = {
  onBack: () => void;
};

const TraineeRegister = ({ onBack }: TraineeRegisterProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Trainee registration submitted");
  };

  return (
    <div className="auth-panel">
      <div className="auth-card">
        <div className="auth-header">
          <button type="button" className="back-link" onClick={onBack}>
            ← Back
          </button>
          <span className="auth-badge">Trainee</span>
          <h2>Create trainee account</h2>
          <p>Build your learning profile and track your outcomes.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="trainee-name">Full name</label>
              <input id="trainee-name" type="text" placeholder="Enter your full name" />
            </div>

            <div className="form-group">
              <label htmlFor="trainee-phone">Phone number</label>
              <input id="trainee-phone" type="tel" placeholder="+91 98765 43210" />
            </div>

            <div className="form-group full-width">
              <label htmlFor="trainee-email">Email address</label>
              <input id="trainee-email" type="email" placeholder="name@example.com" />
            </div>

            <div className="form-group full-width">
              <label htmlFor="trainee-qualification">Current qualification / course</label>
              <input id="trainee-qualification" type="text" placeholder="e.g. Diploma in Computer Science" />
            </div>

            <div className="form-group">
              <label htmlFor="trainee-password">Password</label>
              <input id="trainee-password" type="password" placeholder="Create a password" />
            </div>

            <div className="form-group">
              <label htmlFor="trainee-confirm-password">Confirm password</label>
              <input id="trainee-confirm-password" type="password" placeholder="Repeat your password" />
            </div>
          </div>

          <button type="submit" className="login-button auth-submit-button">
            <span>Create trainee account</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TraineeRegister;
