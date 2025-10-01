// packages/auth/src/gateways/email.gateway.ts - EMAIL GATEWAY

/**
 * ✅ ENTERPRISE: Email Gateway
 * Single Responsibility: Email service integration and templating
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  variables?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

export interface EmailTemplate {
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
}

/**
 * ✅ ENTERPRISE: Email Gateway
 * Single Responsibility: Email operations for auth workflows
 */
export class EmailGateway {
  private baseUrl: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3001';
    this.fromEmail = process.env.EMAIL_FROM ?? 'noreply@company.com';
    this.fromName = process.env.EMAIL_FROM_NAME ?? 'Your App';
  }

  /**
   * ✅ SEND: Generic email with template
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      console.warn('📧 EmailGateway: Sending email to:', options.to);

      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        return this.mockEmailSend(options);
      }

      // TODO: Implement real email service (Resend, SendGrid, etc.)
      return await this.sendWithProvider(options);
    } catch (error) {
      console.error('❌ EmailGateway sendEmail error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
        provider: 'unknown',
      };
    }
  }

  /**
   * ✅ PASSWORD: Reset password email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string
  ): Promise<EmailResult> {
    const resetUrl = `${this.baseUrl}/auth/reset-password?token=${resetToken}`;

    const template = this.getPasswordResetTemplate();
    const variables = {
      userName: userName ?? 'there',
      resetUrl,
      resetToken,
      baseUrl: this.baseUrl,
      validityHours: 24,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      template: 'password-reset',
      variables,
      priority: 'high',
    });
  }

  /**
   * ✅ VERIFICATION: Account verification email
   */
  async sendAccountVerificationEmail(
    email: string,
    verificationToken: string,
    userName?: string
  ): Promise<EmailResult> {
    const verificationUrl = `${this.baseUrl}/auth/verify?token=${verificationToken}`;

    const template = this.getAccountVerificationTemplate();
    const variables = {
      userName: userName ?? 'there',
      verificationUrl,
      verificationToken,
      baseUrl: this.baseUrl,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      template: 'account-verification',
      variables,
      priority: 'high',
    });
  }

  /**
   * ✅ SECURITY: Security alert email
   */
  async sendSecurityAlertEmail(
    email: string,
    alertType: string,
    context: {
      userName?: string;
      deviceInfo?: string;
      location?: string;
      timestamp?: Date;
      ipAddress?: string;
      actionRequired?: boolean;
    }
  ): Promise<EmailResult> {
    const template = this.getSecurityAlertTemplate(alertType);
    const variables = {
      userName: context.userName ?? 'there',
      alertType: this.formatAlertType(alertType),
      deviceInfo: context.deviceInfo ?? 'Unknown device',
      location: context.location ?? 'Unknown location',
      timestamp:
        context.timestamp?.toLocaleString() ?? new Date().toLocaleString(),
      ipAddress: context.ipAddress ?? 'Unknown IP',
      actionRequired: context.actionRequired ?? false,
      baseUrl: this.baseUrl,
      securityUrl: `${this.baseUrl}/settings/security`,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      template: 'security-alert',
      variables,
      priority: context.actionRequired ? 'high' : 'normal',
    });
  }

  /**
   * ✅ MFA: Two-factor authentication code email
   */
  async sendMfaCodeEmail(
    email: string,
    code: string,
    userName?: string,
    expiryMinutes: number = 10
  ): Promise<EmailResult> {
    const template = this.getMfaCodeTemplate();
    const variables = {
      userName: userName ?? 'there',
      mfaCode: code,
      expiryMinutes,
      baseUrl: this.baseUrl,
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      template: 'mfa-code',
      variables,
      priority: 'high',
    });
  }

  /**
   * ✅ WELCOME: Welcome email for new users
   */
  async sendWelcomeEmail(
    email: string,
    userName: string,
    organizationName?: string
  ): Promise<EmailResult> {
    const template = this.getWelcomeTemplate();
    const variables = {
      userName,
      organizationName: organizationName ?? 'our platform',
      baseUrl: this.baseUrl,
      dashboardUrl: `${this.baseUrl}/organizations`,
      supportEmail: process.env.SUPPORT_EMAIL ?? 'support@company.com',
    };

    return this.sendEmail({
      to: email,
      subject: template.subject,
      template: 'welcome',
      variables,
      priority: 'normal',
    });
  }

  /**
   * ✅ PRIVATE: Mock email sending for development
   */
  private mockEmailSend(options: EmailOptions): EmailResult {
    console.warn('\n📧 [DEV MODE] Email would be sent:');
    console.warn(
      `  📨 To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`
    );
    console.warn(`  📋 Subject: ${options.subject}`);
    console.warn(`  📄 Template: ${options.template}`);
    console.warn(`  ⚡ Priority: ${options.priority ?? 'normal'}`);

    if (options.variables) {
      console.warn('  🔧 Variables:');
      Object.entries(options.variables).forEach(([key, value]) => {
        console.warn(
          `    ${key}: ${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}`
        );
      });
    }
    console.warn('');

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider: 'mock-dev',
    };
  }

  /**
   * ✅ PRIVATE: Send with real email provider
   */
  private async sendWithProvider(options: EmailOptions): Promise<EmailResult> {
    // TODO: Implement with your preferred email service
    // Examples:
    // - Resend: https://resend.com/docs
    // - SendGrid: https://docs.sendgrid.com/
    // - AWS SES: https://docs.aws.amazon.com/ses/
    // - Postmark: https://postmarkapp.com/developer

    console.warn(
      '📧 EmailGateway: Real email provider not configured, using mock'
    );
    return this.mockEmailSend(options);
  }

  // ============================================
  // EMAIL TEMPLATES
  // ============================================

  private getPasswordResetTemplate(): EmailTemplate {
    return {
      subject: 'Reset Your Password',
      htmlTemplate: `
        <h2>Password Reset Request</h2>
        <p>Hi {{userName}},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="{{resetUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in {{validityHours}} hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      textTemplate: `
        Password Reset Request
        
        Hi {{userName}},
        
        You requested to reset your password. Visit this link to set a new password:
        {{resetUrl}}
        
        This link will expire in {{validityHours}} hours.
        
        If you didn't request this, please ignore this email.
      `,
    };
  }

  private getAccountVerificationTemplate(): EmailTemplate {
    return {
      subject: 'Verify Your Account',
      htmlTemplate: `
        <h2>Welcome! Please verify your account</h2>
        <p>Hi {{userName}},</p>
        <p>Thanks for signing up! Please click the link below to verify your email address:</p>
        <p><a href="{{verificationUrl}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Account</a></p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
      textTemplate: `
        Welcome! Please verify your account
        
        Hi {{userName}},
        
        Thanks for signing up! Please visit this link to verify your email address:
        {{verificationUrl}}
        
        If you didn't create an account, please ignore this email.
      `,
    };
  }

  private getSecurityAlertTemplate(alertType: string): EmailTemplate {
    return {
      subject: `Security Alert: ${this.formatAlertType(alertType)}`,
      htmlTemplate: `
        <h2>🔒 Security Alert</h2>
        <p>Hi {{userName}},</p>
        <p>We detected a security event on your account:</p>
        <ul>
          <li><strong>Alert:</strong> {{alertType}}</li>
          <li><strong>Device:</strong> {{deviceInfo}}</li>
          <li><strong>Location:</strong> {{location}}</li>
          <li><strong>Time:</strong> {{timestamp}}</li>
          <li><strong>IP Address:</strong> {{ipAddress}}</li>
        </ul>
        {{#if actionRequired}}
        <p><a href="{{securityUrl}}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Security Settings</a></p>
        {{/if}}
        <p>If this was you, no action is needed. Otherwise, please secure your account immediately.</p>
      `,
      textTemplate: `
        🔒 Security Alert
        
        Hi {{userName}},
        
        We detected a security event on your account:
        
        Alert: {{alertType}}
        Device: {{deviceInfo}}
        Location: {{location}}
        Time: {{timestamp}}
        IP Address: {{ipAddress}}
        
        {{#if actionRequired}}
        Please review your security settings: {{securityUrl}}
        {{/if}}
        
        If this was you, no action is needed. Otherwise, please secure your account immediately.
      `,
    };
  }

  private getMfaCodeTemplate(): EmailTemplate {
    return {
      subject: 'Your Verification Code',
      htmlTemplate: `
        <h2>Your Verification Code</h2>
        <p>Hi {{userName}},</p>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; background: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px;">{{mfaCode}}</p>
        <p>This code will expire in {{expiryMinutes}} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `,
      textTemplate: `
        Your Verification Code
        
        Hi {{userName}},
        
        Your verification code is: {{mfaCode}}
        
        This code will expire in {{expiryMinutes}} minutes.
        
        If you didn't request this code, please ignore this email.
      `,
    };
  }

  private getWelcomeTemplate(): EmailTemplate {
    return {
      subject: 'Welcome to Our Platform!',
      htmlTemplate: `
        <h2>Welcome {{userName}}! 🎉</h2>
        <p>We're excited to have you join {{organizationName}}!</p>
        <p>Here are some quick next steps:</p>
        <ul>
          <li>Complete your profile setup</li>
          <li>Explore the dashboard</li>
          <li>Invite team members</li>
        </ul>
        <p><a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
        <p>Need help? Contact us at {{supportEmail}}</p>
      `,
      textTemplate: `
        Welcome {{userName}}! 🎉
        
        We're excited to have you join {{organizationName}}!
        
        Here are some quick next steps:
        - Complete your profile setup
        - Explore the dashboard  
        - Invite team members
        
        Go to Dashboard: {{dashboardUrl}}
        
        Need help? Contact us at {{supportEmail}}
      `,
    };
  }

  private formatAlertType(alertType: string): string {
    return alertType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export default EmailGateway;
