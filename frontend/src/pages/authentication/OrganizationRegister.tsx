type OrganizationRegisterProps = {
  onBack: () => void;
};

const OrganizationRegister = ({ onBack }: OrganizationRegisterProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Organization registration submitted");
  };

  return (
    <div className="auth-panel">
      <div className="auth-card">
        <div className="auth-header">
          <button type="button" className="back-link" onClick={onBack}>
            ← Back
          </button>
          <span className="auth-badge organization-badge">Organization / Admin</span>
          <h2>Create organization account</h2>
          <p>Set up your organization dashboard and governance controls.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="org-name">Organization name</label>
              <input id="org-name" type="text" placeholder="Enter organization name" />
            </div>

            <div className="form-group">
              <label htmlFor="org-admin">Admin name</label>
              <input id="org-admin" type="text" placeholder="Name of admin" />
            </div>

            <div className="form-group">
              <label htmlFor="org-dept">Department</label>
              <input id="org-dept" type="text" placeholder="e.g. Skill Development" />
            </div>

            <div className="form-group full-width">
              <label htmlFor="org-email">Official email</label>
              <input id="org-email" type="email" placeholder="admin@organization.gov.in" />
            </div>

            <div className="form-group full-width">
              <label htmlFor="org-website">Organization website</label>
              <input id="org-website" type="text" placeholder="https://your-organization.org" />
            </div>

            <div className="form-group">
              <label htmlFor="org-password">Password</label>
              <input id="org-password" type="password" placeholder="Create a password" />
            </div>

            <div className="form-group">
              <label htmlFor="org-confirm-password">Confirm password</label>
              <input id="org-confirm-password" type="password" placeholder="Repeat your password" />
            </div>
          </div>

          <button type="submit" className="login-button auth-submit-button">
            <span>Create organization account</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrganizationRegister;
