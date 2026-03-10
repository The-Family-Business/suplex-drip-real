
import { Question, ThemeConfig } from './types';

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    background: "#ffdd33",
    primary: "#1E4620",
    secondary: "#fff047",
    accent: "#4A2721",
    text: "#1A1A1A",
    cardBg: "#FFFFFF",
    botBubbleBg: "#FFFFFF",
    botBubbleText: "#1A1A1A",
    userBubbleBg: "#1E4620",
    userBubbleText: "#FFFFFF",
    // AI Suggestion Defaults
    aiSuggestionBg: "#f0f9ff", // Sky-50
    aiSuggestionText: "#72C3EE", // Updated to custom blue
    aiSuggestionBorder: "#bae6fd" // Sky-200
  },
  sizing: {
    baseFontSize: 24,
    buttonFontSize: 17, // Updated from 19 to 17 to prevent wrapping
    cardBorderRadius: 40,
    cardPadding: 24,
    borderWidth: 8,
    bubbleBorderRadius: 24,
    minButtonHeight: 45,
    containerMaxWidth: "1020px", // Updated from 1000px to give more breathing room
    aiSuggestionFontSize: 29
  },
  physics: {
    stiffness: 300, 
    damping: 15,
    hoverScale: 1.05
  }
};

export const QUESTIONS: Question[] = [
  // 1. URL
  {
    id: "intro",
    text: "Let's set up your automated outreach profile. First, what is your website URL?",
    type: "text",
    placeholder: "example.com"
  },
  // 2. Sending Email
  {
    id: "sender_email",
    text: "Which email account will you be sending from?",
    type: "email",
    placeholder: "name@company.com"
  },
  // 3. Brand Name
  {
    id: "company_name",
    text: "What's the official brand name?",
    type: "text",
    placeholder: "e.g. Acme Corp"
  },
  // 4. Role
  {
    id: "user_role",
    text: "And what is your role there?",
    type: "text",
    placeholder: "e.g. Founder, Head of Growth"
  },
  // 5. Business Structure
  {
    id: "business_type",
    text: "What type of company fits best? (select all that apply)",
    type: "choice",
    multiSelect: true,
    allowCustomInput: true,
    options: [
      { id: "saas", label: "SaaS", value: "saas", examples: ["Salesforce", "Linear", "Notion", "Slack"] },
      { id: "ecommerce", label: "Ecommerce", value: "ecommerce", examples: ["Shopify", "WooCommerce", "Amazon FBA", "DTC"] },
      { id: "creator", label: "Creator", value: "creator", examples: ["YouTube", "Newsletter", "Influencer", "Course"] },
      { id: "agency", label: "Agency", value: "agency", examples: ["Marketing", "Dev Shop", "Design", "SEO"] },
      { id: "freelancer", label: "Freelancer", value: "freelancer", examples: ["Copywriter", "Designer", "Developer"] },
      { id: "vibe_coder", label: "Vibe Coder", value: "vibe_coder", examples: ["Cursor", "Replit", "Windsurf", "v0"] },
      { id: "local_biz", label: "Local Business", value: "local_business", examples: ["Gym", "Restaurant", "Retail", "Club"] },
      { id: "local_svc", label: "Local Service", value: "local_service", examples: ["Plumber", "HVAC", "Landscaping", "Cleaning"] },
      { id: "coach", label: "Coach", value: "coach", examples: ["Fitness", "Life Coach", "Business Coach"] },
      { id: "dropshipping", label: "Dropshipping", value: "dropshipping", examples: ["AliExpress", "Print on Demand"] },
      { id: "digital", label: "Digital Goods", value: "digital_goods", examples: ["E-books", "Templates", "Presets"] },
      { id: "consultant", label: "Consultant", value: "consultant", examples: ["Strategy", "Financial", "IT", "Legal"] }
    ]
  },
  // 6. Tools
  {
    id: "software_stack",
    text: "Which of these tools do you currently use?",
    type: "choice",
    multiSelect: true,
    allowCustomInput: true,
    options: [
      { id: "slack", label: "Slack", value: "slack", examples: ["Team Chat", "Huddles"] },
      { id: "hubspot", label: "HubSpot", value: "hubspot", examples: ["CRM", "Marketing"] },
      { id: "salesforce", label: "Salesforce", value: "salesforce", examples: ["CRM", "Enterprise"] },
      { id: "calendly", label: "Calendly", value: "calendly", examples: ["Scheduling", "Bookings"] },
      { id: "notion", label: "Notion", value: "notion", examples: ["Docs", "Wiki"] },
      { id: "shopify", label: "Shopify", value: "shopify", examples: ["Store", "E-com"] },
      { id: "clickfunnels", label: "ClickFunnels", value: "clickfunnels", examples: ["Funnels", "Landing Pages"] },
      { id: "zapier", label: "Zapier", value: "zapier", examples: ["Automation", "Workflows"] }
    ]
  },
  // 7. Channels
  {
    id: "marketing_channels",
    text: "What are your current marketing channels?",
    type: "choice",
    multiSelect: true,
    allowCustomInput: true,
    options: [
      { id: "meta", label: "Meta Ads", value: "meta_ads", examples: ["Facebook", "Instagram"] },
      { id: "google", label: "Google Ads", value: "google_ads", examples: ["PPC", "Search", "Display"] },
      { id: "cold", label: "Cold Outreach", value: "cold_outreach", examples: ["Email", "LinkedIn", "DMs"] },
      { id: "content", label: "Content", value: "content", examples: ["YouTube", "Podcasts", "Blogs"] },
      { id: "seo", label: "SEO", value: "seo", examples: ["Organic", "Blogs", "Backlinks"] },
      { id: "tiktok", label: "TikTok Ads", value: "tiktok_ads", examples: ["Video", "Viral"] },
      { id: "x", label: "X / Twitter", value: "x_ads", examples: ["Social", "Text"] }
    ]
  },
  // 8. Volume (Simple Input)
  {
    id: "email_volume",
    text: "How many emails do you plan to send daily?",
    type: "text",
    placeholder: "e.g. 250"
  },
  // 9. Business Description (AI)
  {
    id: "business_description",
    text: "How would you describe the business in one sentence?",
    type: "text",
    placeholder: "We help X do Y by..."
  },
  // 10. Target Audience (AI)
  {
    id: "target_audience",
    text: "Who is your ideal target audience?",
    type: "text",
    placeholder: "e.g. Busy moms, CTOs, Dentists..."
  },
  // 11. Customer Value (ROI Calculation) - NEW
  {
    id: "customer_value",
    text: "Quick math: What is the average Lifetime Value (LTV) of a single new customer?",
    type: "text",
    placeholder: "e.g. $5,000"
  },
  // 12. Research Time - NEW
  {
    id: "research_hours",
    text: "How many hours per week do you (or your team) spend researching leads?",
    type: "choice",
    options: [
        { id: "none", label: "None", value: "0", examples: ["I rely on inbound", "No research"] },
        { id: "1-3", label: "1-3 hrs", value: "1-3", examples: ["Quick checks", "Ad-hoc"] },
        { id: "3-5", label: "3-5 hrs", value: "3-5", examples: ["Weekly sourcing", "Light prospecting"] },
        { id: "5-10", label: "5-10 hrs", value: "5-10", examples: ["Daily habit", "Steady flow"] },
        { id: "10-20", label: "10-20 hrs", value: "10-20", examples: ["Part-time role", "Deep dives"] },
        { id: "20+", label: "20+ hrs", value: "20+", examples: ["Full-time research", "SDR Team"] }
    ]
  },
  // 13. Outreach Time - NEW
  {
    id: "outreach_hours",
    text: "And how much time on manual outreach (writing, sending, follow-ups)?",
    type: "choice",
    options: [
        { id: "none", label: "None", value: "0", examples: ["Fully automated", "I don't send emails"] },
        { id: "1-3", label: "1-3 hrs", value: "1-3", examples: ["Just replying", "Low volume"] },
        { id: "3-5", label: "3-5 hrs", value: "3-5", examples: ["Personalized intros", "Follow-ups"] },
        { id: "5-10", label: "5-10 hrs", value: "5-10", examples: ["Daily sending", "Active pipeline"] },
        { id: "10-20", label: "10-20 hrs", value: "10-20", examples: ["Half the week", "High volume manual"] },
        { id: "20+", label: "20+ hrs", value: "20+", examples: ["Manual grinder", "Full sales day"] }
    ]
  },
  // 14. Preference
  {
    id: "setup_preference",
    text: "Oh yeah! Suplex™ time! Shall we begin?",
    type: "choice",
    options: [
      { id: "both", label: "Let's go!", value: "both", examples: ["Full Setup", "Launch Now"] },
      { id: "leads", label: "Leads only", value: "leads", examples: ["Find Prospects", "Build List"] },
      { id: "template", label: "Email Campaign only", value: "template", examples: ["Strategy", "Messaging"] }
    ]
  },
  // 15. Plan Selection (Pricing Card)
  {
    id: "select_plan",
    text: "Select a launch plan to unlock your bonuses.",
    type: "choice",
    allowCustomInput: true,
    options: [
      { id: "starter", label: "Starter", value: "40", examples: ["$49/mo", "40 emails/day", "Basic Support"] },
      { id: "standard", label: "Standard", value: "250", examples: ["$97/mo", "250 emails/day", "Everything Included"] },
      { id: "pro", label: "Pro", value: "1000", examples: ["$297/mo", "Unlimited", "White Glove"] }
    ]
  },
  // 16. Location (Conditional)
  {
    id: "target_locations",
    text: "Where should we look for these leads?",
    type: "text",
    placeholder: "e.g. Austin, TX or Global",
    allowCustomInput: true
  },
  // 17. Lead Count (Conditional)
  {
    id: "lead_count",
    text: "How many leads do you want to mine for this campaign?",
    type: "text",
    placeholder: "e.g. 500"
  },
  // 18. Campaign Name
  {
    id: "campaign_name",
    text: "Let's name this campaign.",
    type: "text",
    placeholder: "e.g. Q4 Growth Sprint"
  },
  // 19. Templates
  {
    id: "campaign_template",
    text: "Choose a campaign structure to start with:",
    type: "choice",
    options: [
      { id: "1_email", label: "1-Step Email", value: "1_step", examples: ["Direct offer", "Simple"] },
      { id: "2_drip", label: "2-Step Drip", value: "2_step_drip", examples: ["Intro + Follow-up"] },
      { id: "2_bump", label: "2-Step (B)", value: "2_step_bump", examples: ["Quick bump"] },
      { id: "3_seq", label: "3-Step Seq", value: "3_step", examples: ["Value -> Offer -> Close"] },
      { id: "3_soft", label: "3-Step (B)", value: "3_step_soft", examples: ["Soft touch"] },
      { id: "4_long", label: "4-Step Long", value: "4_step", examples: ["Nurture sequence"] },
      { id: "4_edu", label: "4-Step Edu", value: "4_step_edu", examples: ["Educational drip"] },
      { id: "5_plus", label: "5+ Enterprise", value: "5_step", examples: ["Long sales cycle"] },
      { id: "event", label: "Event Invite", value: "event", examples: ["Webinar", "Launch"] },
      { id: "re-engage", label: "Re-engage", value: "reengage", examples: ["Lost leads"] },
      { id: "referral", label: "Referral", value: "referral", examples: ["Partner network"] },
      { id: "newsletter", label: "Newsletter", value: "newsletter", examples: ["Weekly content"] }
    ]
  }
];
