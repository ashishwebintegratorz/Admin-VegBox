import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SignIn | VegBox Admin"
        description="Freshness Delivered To Your Door - Admin Login"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
