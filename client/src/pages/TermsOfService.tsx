import { APP_TITLE } from "@/const";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using {APP_TITLE}, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these Terms of Service, please do not use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p>
              {APP_TITLE} is a platform management and tracking tool that helps you organize and monitor your technology stack,
              subscriptions, and related costs. We provide both free and paid subscription tiers with varying features.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept
              responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Subscription and Billing</h2>
            <h3 className="text-xl font-semibold mt-4">4.1 Subscription Plans</h3>
            <p>We offer the following subscription plans:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Free:</strong> Limited access to platform tracking features</li>
              <li><strong>Essentials ($15/month):</strong> Full platform tracking with AI upload capabilities</li>
              <li><strong>Pro ($30/month):</strong> All features including GTM Framework, Playbook Builder, and ICP Assessment</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">4.2 Payment</h3>
            <p>
              Subscription fees are billed in advance on a monthly basis. Payment is processed through Stripe.
              By providing payment information, you authorize us to charge the applicable fees to your payment method.
            </p>

            <h3 className="text-xl font-semibold mt-4">4.3 Cancellation and Refunds</h3>
            <p>
              You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period.
              We do not provide refunds for partial months of service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. User Content</h2>
            <p>
              You retain all rights to the data and content you upload to {APP_TITLE}. By using our service, you grant us
              permission to store and process your content solely for the purpose of providing the service to you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or viruses</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by GTM Planetary and are protected
              by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
            <p>
              {APP_TITLE} is provided "as is" without warranties of any kind. We shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Data Security</h2>
            <p>
              While we implement reasonable security measures to protect your data, no method of transmission over the
              internet is 100% secure. You acknowledge that you provide your information at your own risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct
              that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes.
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:{" "}
              <a href="mailto:support@gtmplanetary.com" className="text-primary hover:underline">
                support@gtmplanetary.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

