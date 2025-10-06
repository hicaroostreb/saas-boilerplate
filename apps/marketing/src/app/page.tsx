import { HeroSection } from '../components/organisms/HeroSection';
import { MarketingHeader } from '../components/organisms/MarketingHeader';

/**
 * HomePage - Single Responsibility: Compose marketing page layout
 *
 * Follows SOLID principles:
 * - SRP: Only handles page composition
 * - OCP: Extensible by adding new sections
 * - LSP: Components can be substituted by variants
 * - DIP: Depends on component abstractions
 */
export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main>
        <HeroSection />
      </main>
    </>
  );
}
