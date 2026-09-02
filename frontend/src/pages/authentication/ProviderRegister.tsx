type ProviderRegisterProps = {
  onBack: () => void;
};

const ProviderRegister = ({ onBack }: ProviderRegisterProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Provider registration submitted");
  };

  return (
    <div className="auth-panel">
      <div className="auth-card">
        <div className="auth-header">
          <button type="button" className="back-link" onClick={onBack}>
            ← Back
          </button>
          <span className="auth-badge provider-badge">Provider</span>
          <h2>Create provider account</h2>
          <p>Manage training programs and learner outcomes.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="provider-name">Provider / institute name</label>
              <input id="provider-name" type="text" placeholder="Enter your institute name" />
            </div>

            <div className="form-group">
              <label htmlFor="provider-contact">Contact person</label>
              <input id="provider-contact" type="text" placeholder="Name of contact person" />
            </div>

            <div className="form-group">
              <label htmlFor="provider-phone">Phone number</label>
              <input id="provider-phone" type="tel" placeholder="+91 98765 43210" />
            </div>

            <div className="form-group full-width">
              <label htmlFor="provider-email">Official email</label>
              <input id="provider-email" type="email" placeholder="provider@institute.org" />
            </div>

            <div className="form-group full-width">
              <label htmlFor="provider-programs">Programs offered</label>
              <input id="provider-programs" type="text" placeholder="e.g. Digital Skills, Placement Program" />
            </div>

            <div className="form-group">
              <label htmlFor="provider-password">Password</label>
              <input id="provider-password" type="password" placeholder="Create a password" />
            </div>

            <div className="form-group">
              <label htmlFor="provider-confirm-password">Confirm password</label>
              <input id="provider-confirm-password" type="password" placeholder="Repeat your password" />
            </div>
          </div>

          <button type="submit" className="login-button auth-submit-button">
            <span>Create provider account</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProviderRegister;
