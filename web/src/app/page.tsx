import { CertificationsCarousel } from "@/components/certifications-carousel";
import { CurriculumEngine } from "@/components/curriculum-engine";
import { DecoInfoForm } from "@/components/deco-info-form";
import { Hero } from "@/components/hero";
import { IdentityPillars } from "@/components/identity-pillars";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ModelSwitcher } from "@/components/model-switcher";
import { Nav } from "@/components/nav";
import { SchoolCards } from "@/components/school-cards";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { Ticker } from "@/components/ticker";
import { TransparencyCta } from "@/components/transparency-cta";
import { getCertifications, getSchools, getStats } from "@/lib/api";

export default async function Home() {
  const [schools, certifications, stats] = await Promise.all([
    getSchools(),
    getCertifications(),
    getStats(),
  ]);

  return (
    <div className="relative max-md:pb-16">
      <Nav />
      <Hero stats={stats} />
      <Ticker />
      <IdentityPillars />
      <SchoolCards schools={schools} />
      <CurriculumEngine />
      <CertificationsCarousel certifications={certifications} />
      <div id="informacion" className="mx-auto max-w-260 px-14 py-10 max-md:px-6">
        <DecoInfoForm schools={schools} />
      </div>
      <TransparencyCta />
      <SiteFooter />
      <ScrollToTop bg="#033E8C" />
      <MobileTabBar bg="#FFFFFF" ink="#033E8C" border="#C9CDD1" />
      <ModelSwitcher current={1} />
    </div>
  );
}
