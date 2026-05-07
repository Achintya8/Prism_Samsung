import { NavBar } from "@/components/navbar/navbar";
import { OnboardingTour } from "@/components/tour/OnboardingTour";

// Shared layout wraps every logged-in page with navigation and the onboarding tour.
export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
      <NavBar />
      <OnboardingTour />
      {children}
    </div>
  );
}
