import { loginAction } from "@/app/actions/account";
import { ui } from "@/src/ui/styles";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <div className={ui.surface.panelLg}>
        <h1 className={ui.text.pageTitle}>Sign in</h1>
        <p className={ui.text.subtitle + " mt-2"}>Authenticate against Magento customer account.</p>
        <form action={loginAction} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Email</span>
            <input name="email" type="email" required className={ui.form.input} />
          </label>
          <label className="block text-sm">
            <span className={ui.text.label + " mb-1 block"}>Password</span>
            <input name="password" type="password" required className={ui.form.input} />
          </label>
          <button type="submit" className={ui.action.buttonPrimary + " w-full"}>
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}
