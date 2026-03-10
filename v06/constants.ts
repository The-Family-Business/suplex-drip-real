
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
    userBubbleText: "#FFFFFF"
  },
  sizing: {
    baseFontSize: 22,
    buttonFontSize: 18,
    cardBorderRadius: 68,
    cardPadding: 24,
    borderWidth: 8,
    bubbleBorderRadius: 24,
    minButtonHeight: 80,
    containerMaxWidth: "1000px"
  },
  physics: {
    // Increased stiffness and lower damping for "Wobble/Jelly" feel
    stiffness: 300, 
    damping: 15,
    hoverScale: 1.05
  }
};

export const QUESTIONS: Question[] = [
  {
    id: "intro",
    text: "Let's set up your automated outreach profile. First, what is your website URL?",
    type: "text",
    placeholder: "example.com"
  },
  {
    id: "company_name",
    text: "Got it. What's the brand name?",
    type: "text",
    placeholder: "e.g. Acme Corp"
  },
  {
    id: "user_role",
    text: "And what is your role?",
    type: "text",
    placeholder: "e.g. Founder, Head of Growth"
  },
  {
    id: "target_audience",
    text: "Who is your ideal target audience?",
    type: "text",
    placeholder: "e.g. Busy moms, CTOs, Dentists..."
  },
  {
    id: "business_type",
    text: "What type of business structure fits best?",
    type: "choice",
    multiSelect: true,
    allowCustomInput: true,
    options: [
      {
        id: "saas",
        label: "SaaS",
        value: "saas",
        examples: [
          "Salesforce",
          "Linear",
          "Notion",
          "Slack",
          "HubSpot",
          "Zoom"
        ]
      },
      {
        id: "vibe_coder",
        label: "Vibe Coder",
        value: "vibe_coder",
        examples: [
          "Cursor",
          "Replit",
          "Windsurf",
          "v0",
          "Bolt.new",
          "Indie Hacker"
        ]
      },
      {
        id: "ecommerce",
        label: "E-Commerce",
        value: "ecommerce",
        examples: [
          "Shopify",
          "WooCommerce",
          "Magento",
          "DTC",
          "Amazon FBA"
        ]
      },
      {
        id: "digital_content",
        label: "Digital Content",
        value: "digital_content",
        examples: [
          "PDFs",
          "Music",
          "Art",
          "NFTs",
          "Gaming",
          "Templates"
        ]
      },
      {
        id: "agency",
        label: "Agency",
        value: "agency",
        examples: [
          "Marketing",
          "Dev Shop",
          "Design",
          "Consulting",
          "SEO Firm"
        ]
      },
      {
        id: "creator",
        label: "Creator / Coach",
        value: "creator",
        examples: [
          "Skool",
          "Course Creator",
          "Influencer",
          "Paid Community"
        ]
      },
      {
        id: "local",
        label: "Local Business",
        value: "local",
        examples: [
          "Gym",
          "Restaurant",
          "Spa",
          "Club",
          "Dental",
          "Real Estate"
        ]
      },
      {
        id: "freelance",
        label: "Freelancer",
        value: "freelance",
        examples: [
          "Copywriter",
          "Designer",
          "Developer",
          "Consultant"
        ]
      }
    ]
  },
  {
    id: "software_stack",
    text: "Which of these tools do you currently use?",
    type: "choice",
    multiSelect: true,
    allowCustomInput: true,
    options: [
      {
        id: "skool",
        label: "Skool",
        value: "skool",
        examples: [
          "Community",
          "Courses"
        ]
      },
      {
        id: "slack",
        label: "Slack",
        value: "slack",
        examples: [
          "Team Chat",
          "Huddles"
        ]
      },
      {
        id: "photoshop",
        label: "Photoshop",
        value: "photoshop",
        examples: [
          "Design",
          "Adobe"
        ]
      },
      {
        id: "semrush",
        label: "Semrush",
        value: "semrush",
        examples: [
          "SEO",
          "Marketing"
        ]
      },
      {
        id: "calendly",
        label: "Calendly",
        value: "calendly",
        examples: [
          "Scheduling",
          "Bookings"
        ]
      },
      {
        id: "salesforce",
        label: "Salesforce",
        value: "salesforce",
        examples: [
          "CRM",
          "Enterprise"
        ]
      },
      {
        id: "hubspot",
        label: "HubSpot",
        value: "hubspot",
        examples: [
          "CRM",
          "Marketing"
        ]
      },
      {
        id: "clickfunnels",
        label: "ClickFunnels",
        value: "clickfunnels",
        examples: [
          "Funnels",
          "Landing Pages"
        ]
      },
      {
        id: "shopify",
        label: "Shopify",
        value: "shopify",
        examples: [
          "Store",
          "E-com"
        ]
      },
      {
        id: "zapier",
        label: "Zapier",
        value: "zapier",
        examples: [
          "Automation",
          "Workflows"
        ]
      },
      {
        id: "notion",
        label: "Notion",
        value: "notion",
        examples: [
          "Docs",
          "Wiki"
        ]
      },
      {
        id: "airtable",
        label: "Airtable",
        value: "airtable",
        examples: [
          "Database",
          "Excel"
        ]
      }
    ]
  },
  {
    id: "marketing_channels",
    text: "What are your current marketing channels?",
    type: "choice",
    multiSelect: true,
    allowCustomInput: true,
    options: [
      {
        id: "meta",
        label: "Meta Ads",
        value: "meta_ads",
        examples: [
          "Facebook",
          "Instagram"
        ]
      },
      {
        id: "google",
        label: "Google Ads",
        value: "google_ads",
        examples: [
          "PPC",
          "Search",
          "Display"
        ]
      },
      {
        id: "tiktok",
        label: "TikTok Ads",
        value: "tiktok_ads",
        examples: [
          "Video",
          "Viral"
        ]
      },
      {
        id: "seo",
        label: "SEO",
        value: "seo",
        examples: [
          "Organic",
          "Blogs",
          "Backlinks"
        ]
      },
      {
        id: "cold",
        label: "Cold Outreach",
        value: "cold_outreach",
        examples: [
          "Email",
          "LinkedIn",
          "DMs"
        ]
      },
      {
        id: "affiliate",
        label: "Affiliate",
        value: "affiliate",
        examples: [
          "Partners",
          "Referrals"
        ]
      },
      {
        id: "content",
        label: "Content / YT",
        value: "content",
        examples: [
          "YouTube",
          "Podcasts",
          "Blogs"
        ]
      },
      {
        id: "x",
        label: "X / Twitter",
        value: "x_ads",
        examples: [
          "Social",
          "Text"
        ]
      },
      {
        id: "dropshipping",
        label: "Dropshipping",
        value: "dropshipping",
        examples: [
          "AliExpress",
          "Zendrop"
        ]
      },
      {
        id: "d2c",
        label: "D2C",
        value: "d2c",
        examples: [
          "Direct to Consumer"
        ]
      },
      {
        id: "none",
        label: "None / Word of Mouth",
        value: "none",
        examples: [
          "Referral",
          "Network"
        ]
      }
    ]
  },
  {
    id: "email_volume",
    text: "How many outreach emails do you want to send per day?",
    type: "choice",
    allowCustomInput: true,
    options: [
      {
        id: "starting",
        label: "Starter (40)",
        value: "40",
        examples: [
          "1 Inbox Included",
          "40 emails/day",
          "Safe Warmup"
        ]
      },
      {
        id: "connected",
        label: "Connected (250)",
        value: "250",
        examples: [
          "Add Inboxes for $10/mo",
          "250 emails/day",
          "Volume Scaling"
        ]
      },
      {
        id: "pro",
        label: "Pro (1000+)",
        value: "1000",
        examples: [
          "Multiple Connected Inboxes",
          "1000+ emails/day",
          "Agency Scale"
        ]
      }
    ]
  },
  {
    id: "setup_preference",
    text: "Do you want to get leads, pick a template, or do both right now and get it fired up pronto?",
    type: "choice",
    options: [
      {
        id: "leads",
        label: "Get Leads",
        value: "leads",
        examples: [
          "Find Prospects",
          "Build List",
          "Target Data"
        ]
      },
      {
        id: "template",
        label: "Pick Template",
        value: "template",
        examples: [
          "Draft Messaging",
          "Strategy",
          "Copywriting"
        ]
      },
      {
        id: "both",
        label: "Do Both & Fire It Up",
        value: "both_pronto",
        examples: [
          "Full Setup Pronto",
          "Leads + Templates",
          "Launch Now"
        ]
      }
    ]
  },
  {
    id: "business_description",
    text: "How would you describe the business in one sentence?",
    type: "text",
    placeholder: "We help X do Y by..."
  },
  {
    id: "contact",
    text: "Where should we send your strategy report?",
    type: "email",
    placeholder: "name@company.com"
  }
];
