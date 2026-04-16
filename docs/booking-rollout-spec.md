# Booking Rollout Spec

> Current product decision: public checkout/deposit is paused. The live flow should collect event details, recommend an experience, and lead to inquiry/review. Payment links can be sent manually after fit/date confirmation. Stripe/deposit sections below are retained as future-phase planning, not active implementation.


## Purpose

Build a high-end guided booking flow that feels like a premium recommendation conversation, not a pricing page or entertainer checkout.

The public booking experience should communicate:
- taste
- confidence
- structure
- guidance without pressure

The system should feel like:
- "Tell me about your event, and I'll guide you to the right experience."

The system should not feel like:
- a package grid
- an hourly rate sheet
- a transactional booking funnel

## Current State

Current public flow:
- inquiry only

Current role of inquiry flow:
- custom / bespoke request path
- fallback for anything not suited to direct booking

Current internal foundation already exists for:
- inquiries
- availability
- bookings
- booking records via API routes

## Product Model

Core public flow:
1. intake
2. recommendation
3. experience detail
4. secure date
5. deposit
6. confirmation

Separate elevated path:
1. designed experience explanation
2. inquiry

This is not:
1. packages
2. prices
3. checkout

## Offer Structure

### Standard Bookable Experiences

1. Close-Up
- strolling / circulating close-up performance
- best for receptions, mixers, cocktail-style events, ambient social energy

2. Table
- stationary / tabled performance
- best when a dedicated table creates a destination within the event

3. Cabaret
- shared room performance for the full group
- best when a single collective moment is the right fit

### Elevated Inquiry-Only Experience

4. Designed Experience
- integrated evening structure
- not a package bundle
- not directly comparable to the standard experiences
- inquiry only

Strategic distinction:
- standard experiences are self-contained performance formats
- designed experience is event structure

## Positioning Rules

1. Recommendation first, pricing second.
- Recommendation screen does not show price.
- Pricing appears only on the selected experience detail page.

2. Standard experiences and Designed Experience must not be presented as one comparison table.
- Standard experiences are bookable.
- Designed Experience is elevated and structurally separate.

3. Time is framed as depth, not labor.
- Users should feel they are choosing the depth of guest experience.
- Duration may be shown quietly, but not as the headline category.

4. The interface should guide.
- It should feel like informed recommendation, not self-service shopping.

5. The inquiry path remains alive at all times.
- Users who do not fit the standard flow must always have a graceful path to inquiry.

## Naming

### Booking World
- Close-Up
- Table
- Cabaret

### Elevated World
- Designed Experience

### Depth Options
For Close-Up and Table:
- Focused
- Extended
- Full

Cabaret may use simpler pricing/selection if that is more natural.

## Target Audience Outcomes

The flow should make a user feel:
- this is tailored
- this is premium
- this person understands my event
- I am being guided, not sold to

## Public Flow By Screen

### Screen 1: Entry

Purpose:
- invite the user into a guided process

Primary CTA:
- Design Your Experience

Behavior:
- launches the intake screen or section

Notes:
- no pricing
- no package grid
- no heavy explanation

### Screen 2: Intake

Purpose:
- gather just enough signal to make a recommendation feel informed

Fields:
- Event Date
- Guest Count
- Event Type (optional)
- Event Details (optional)

Design rules:
- should feel like a discreet consultation intake
- should not feel like a long operational form

Primary CTA:
- Continue

### Screen 3: Recommendation

Purpose:
- convert intake into authority and direction

Working header:
- Your Event, Thoughtfully Considered

Working subtext:
- Based on what you shared, here is what I would recommend to create the strongest experience for your guests.

Layout rules:
1. one dominant recommendation
2. two quieter alternative recommendations
3. Designed Experience visually separated

Each standard recommendation includes:
- experience name
- why it fits
- what it feels like
- action: View Experience

Designed Experience includes:
- short elevated explanation
- pricing language only as a starting point if needed
- action: Explore This Experience

Restrictions:
- no pricing shown for standard recommendations on this screen
- no flat comparison table

### Screen 4A: Standard Experience Detail

Applies to:
- Close-Up
- Table
- Cabaret

Purpose:
- explain the selected experience
- reveal pricing and depth choices
- prepare for booking

Structure:
1. title
2. opening paragraph
3. why it works
4. what it feels like
5. depth options / pricing
6. supporting duration philosophy line
7. Secure Your Date CTA

#### Close-Up and Table Depth Structure

Each depth option includes:
- label
- short descriptor
- actual duration in smaller secondary text
- price

Working structure:

Focused
- best for larger or faster-moving events
- 60 minutes
- test pricing first, real pricing later

Extended
- balanced coverage with deeper guest interaction
- 90 minutes
- test pricing first, real pricing later

Full
- maximum immersion and more time for meaningful moments
- 120 minutes
- test pricing first, real pricing later

Supporting line:
- Duration determines how deeply the experience can unfold — whether through shorter, high-impact moments across the room or longer, more personal interactions with each group.

#### Cabaret Structure

Cabaret should remain simpler.

Working structure:
- one main offer
- optional secondary variant later if needed
- shorter runtime shown quietly
- priced as a self-contained shared-room performance

### Screen 4B: Designed Experience Detail

Purpose:
- explain the elevated category
- justify why it is different from standard performance formats
- lead into inquiry, not checkout

Structure:
1. title: Designed Experience
2. opening paragraph
3. explanation of integrated event structure
4. why it costs more
5. starting price language
6. Design Your Experience CTA

Rules:
- no direct checkout
- ends in inquiry form

Working pricing language:
- Designed experiences typically begin at $2,500 and scale based on timing, structure, and level of integration.

## Booking and Payment Flow

### Screen 5: Secure Your Date

Purpose:
- confirm the selected experience and depth
- collect remaining booking details needed before deposit

Should include:
- selected experience
- selected depth
- date
- guest count
- event type
- event details
- contact information
- deposit amount

CTA:
- Continue to Deposit

### Screen 6: Deposit

Provider:
- Stripe

Model:
- 50% deposit for standard experiences

Rules:
- no monthly subscription required
- test with tiny pricing first
- production pricing later

### Screen 7: Confirmation

Purpose:
- confirm the date hold / request state
- tell the user what happens next

Working direction:
- Your date has been held.
- A confirmation and next steps will follow.

Should also trigger:
- internal notification
- booking record creation
- calendar event creation later in rollout

## Recommendation Logic

Recommendation logic should be simple and defensible, not fake-intelligent.

Inputs considered:
- guest count
- event type
- event details
- likely room flow

Initial recommendation rules:

Recommend Close-Up when:
- event is social, mixed, cocktail-style, reception-like, or large enough to benefit from circulation

Recommend Table when:
- event can support a dedicated interaction point
- guest flow suggests a destination-based experience is appropriate

Recommend Cabaret when:
- the event benefits from a shared group moment
- the event appears more seated, scheduled, or room-focused

Designed Experience should remain available when:
- the event appears high-touch, milestone-based, or structurally significant
- the user wants something more integrated

Important:
- recommendation logic should feel curated, not algorithmically theatrical
- do not pretend the system is doing deep bespoke reasoning it cannot support

## Copy Principles

1. Shorter is stronger.
- recommendation screens should not overexplain

2. Outcome language over feature language.
- describe how the room feels, not just what format is used

3. Premium tone over performance hype.
- no entertainer clichés
- no theme-park naming

4. Authority without pressure.
- the site guides and recommends
- it does not hard-sell

## Visual / UX Rules

1. One dominant recommendation card.
- should feel like the natural choice for the event

2. Two quieter alternatives.
- available, but visually secondary

3. Designed Experience separated from the standard recommendation set.
- visually distinct
- not directly comparable

4. No dense pricing tables.
- standard pricing is revealed only on detail pages

5. Deposit flow should remain clean and spare.
- minimal friction
- no checkout clutter leaking into the recommendation experience

## Test Pricing Rules

Before production pricing is enabled, use tiny live prices for end-to-end testing.

Example test pricing:
- Focused: $0.01
- Extended: $0.03
- Full: $0.05
- Cabaret: $0.07

Purpose:
- validate the full Stripe flow safely
- validate booking creation and confirmation logic
- validate deposit behavior

Rule:
- keep all pricing constants centralized so test pricing can be swapped for production pricing without rewriting the flow

## Data / Systems Requirements

### Existing or Planned Systems

1. Site frontend
- Next.js public flow

2. Internal booking foundation
- existing studio routes
- existing booking API routes

3. Payment
- Stripe

4. Calendar
- Google Calendar API later in rollout

5. Storage
- existing storage path / Supabase-ready foundation if needed

### Data Entities Needed

Minimum:
- intake submission
- recommendation result
- selected experience
- selected depth
- booking record
- payment status
- inquiry record for Designed Experience

## Rollout Phases

### Phase 1: Guided Recommendation Prototype

Goal:
- prove the intake and recommendation experience

Build:
- entry CTA
- intake form
- recommendation results screen
- static recommendation logic
- no payment yet

Success criteria:
- flow feels premium
- recommendation hierarchy feels right
- copy feels on-brand

### Phase 2: Experience Detail Pages

Goal:
- make each standard recommendation explorable and priceable

Build:
- Close-Up detail page
- Table detail page
- Cabaret detail page
- Focused / Extended / Full options where applicable
- test pricing constants

Success criteria:
- pricing reveal feels controlled
- durations feel like depth, not labor billing

### Phase 3: Secure Your Date + Deposit

Goal:
- make standard experiences actually bookable

Build:
- secure date screen
- Stripe deposit flow
- confirmation screen
- booking record creation
- notification trigger

Success criteria:
- user can complete a booking path end to end
- test pricing works safely
- internal records are created correctly

### Phase 4: Designed Experience Path

Goal:
- add the elevated custom world without diluting the standard flow

Build:
- Designed Experience detail page
- designed experience inquiry path
- inquiry capture and notification

Success criteria:
- standard and elevated worlds feel clearly distinct
- designed experience feels premium rather than “miscellaneous custom"

### Phase 5: Calendar and Operational Automation

Goal:
- reduce manual admin after booking

Build:
- Google Calendar integration
- event creation
- availability checks if desired
- notification refinement

Success criteria:
- bookings generate operational follow-through with minimal manual handling

## Open Decisions

1. Final recommendation header copy
- keep "Your Event, Thoughtfully Considered" or refine later

2. Final CTA labels
- "View Experience" may be refined after UI is built

3. Cabaret pricing structure
- single offer vs variant ladder

4. Whether Designed Experience should show starting price on recommendation screen

5. Whether recommendation logic should remain simple rules or become editable via admin configuration later

## Non-Goals For Initial Rollout

Do not do these first:
- public availability calendar UI
- complex AI recommendation theater
- full CRM complexity
- custom domain migration for infrastructure reasons unrelated to booking
- overbuilt admin before public flow proves itself

## Summary

This rollout builds a boutique guided booking system, not a package page.

The standard world:
- Close-Up
- Table
- Cabaret
- recommendation -> detail -> deposit

The elevated world:
- Designed Experience
- explanation -> inquiry

The user should feel guided toward the right experience, then allowed to secure it cleanly.
