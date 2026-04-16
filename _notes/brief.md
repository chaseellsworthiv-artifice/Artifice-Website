# Artifice Site v2

This folder is the active Next.js version of the Artifice site.

Current direction:
- Dark, cinematic, immersive editorial atmosphere.
- Luxury-focused motion: restrained, intentional, and never SaaS-like.
- Mobile gets its own reduced composition instead of forced desktop effects.
- The hero video is hosted externally so Vercel is not serving the heavy loop.
- The public site is built from `app/` and `components/`; old static files were removed.

Active areas:
- Homepage experience: `components/HeroExperience.jsx`
- Hero/client/section styling: `components/hero-experience.module.css`
- Guided experience flow: `components/DesignFlow.jsx`
- Inquiry capture: `app/api/invitation/route.js`
- Internal inquiry review: `/studio/inquiries`

Product notes:
- The public booking path currently leads to inquiry/review rather than checkout.
- Manual confirmation and manually sent Stripe payment links are the preferred payment direction for now.
