import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import {
    LandingHeader,
    LandingHero,
    LandingFeatures,
    LandingHowItWorks,
    LandingTestimonials,
    LandingComparison,
    LandingCta,
    LandingFooter,
} from "@/widgets/landing"

export function LandingPage() {
    usePageTitle("Univa — Студентський workspace")

    return (
        <div style={{ background: "#fafbfc", minHeight: "100vh", color: "#111827", overflowX: "hidden" }}>
            <style>{`@import url('${GOOGLE_FONTS_URL}');`}</style>
            <LandingHeader />
            <LandingHero />
            <LandingFeatures />
            <LandingHowItWorks />
            <LandingTestimonials />
            <LandingComparison />
            <LandingCta />
            <LandingFooter />
        </div>
    )
}
