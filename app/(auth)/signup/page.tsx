import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "E-commerce Product Demand Prediction",
};

export default function Page() {
  return <SignupForm />;
}
