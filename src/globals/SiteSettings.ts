import type { GlobalConfig } from "payload";
import type { Field } from 'payload'

const widthOptions = [
  { label: "Content", value: "content" },
  { label: "Full Width", value: "full" },
];

const displayTypeOptions = [
  { label: "Ticker", value: "ticker" },
  { label: "List", value: "list" },
  { label: "Card", value: "card" },
  { label: "Gallery", value: "gallery" },
];

const colorPicker = (defaultColor: string) => ({
  afterInput: [
    {
      path: "@/components/ColorPicker#ColorPickerAfterInput",
      clientProps: { defaultColor },
    },
  ],
});

const colorField = ({
  name,
  label,
  defaultValue,
  description,
}: {
  name: string;
  label: string;
  defaultValue: string;
  description?: string;
}) => ({
  name,
  type: "text" as const,
  label,
  defaultValue,
  admin: {
    description,
    components: colorPicker(defaultValue),
  },
});

const smtpReadonlyField = ({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) => ({
  name,
  type: "text" as const,
  label,
  defaultValue,
  admin: { readOnly: true },
});

const socialProviderGroup = ({
  name,
  label,
  buttonLabel,
}: {
  name: string;
  label: string;
  buttonLabel: string;
}) => ({
  name,
  type: "group" as const,
  label,
  fields: [
    {
      name: "enabled",
      type: "checkbox" as const,
      label: `Enable ${label}`,
      defaultValue: false,
    },
    {
      name: "buttonLabel",
      type: "text" as const,
      label: "Button Label",
      defaultValue: buttonLabel,
    },
  ],
});

const heroSettingsFields: Field[] = [
  {
    name: "enabled",
    type: "checkbox" as const,
    label: "Enable Global Hero Slider",
    defaultValue: false,
  },
  
  {
    name: "sliderSettings",
    type: "group" as const,
    label: "Slider Basic Settings",
    admin: {
      condition: (_: any, siblingData: any) => siblingData?.enabled,
    },
    fields: [
      {
        name: "autoPlay",
        type: "checkbox" as const,
        label: "Auto Play",
        defaultValue: true,
      },
      {
        name: "autoPlayInterval",
        type: "number" as const,
        label: "Auto Play Interval (ms)",
        defaultValue: 4000,
        min: 1000,
        max: 10000,
      },
      {
        name: "showDots",
        type: "checkbox" as const,
        label: "Dots Display",
        defaultValue: true,
      },
      {
        name: "showArrows",
        type: "checkbox" as const,
        label: "Arrows Display",
        defaultValue: true,
      },
      {
        name: "width",
        dbName: "hero_width",
        type: "select" as const,
        label: "Hero Width",
        defaultValue: "content",
        options: widthOptions,
      },
      {
        name: "heightType",
        dbName: "hero_height_type",
        type: "select" as const,
        label: "Hero Height",
        defaultValue: "medium",
        options: [
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" },
          { label: "Full Screen", value: "full" },
          { label: "Custom", value: "custom" },
        ],
      },
      {
        name: "customHeight",
        type: "text" as const,
        label: "Custom Height",
        admin: {
          condition: (_: any, siblingData: any) =>
            siblingData?.enabled && siblingData?.heightType === "custom",
          description: "ex: 420px, 60vh",
        },
      },
    ],
  },
  {
    name: "slides",
    dbName: "hero_slides",
    type: "array" as const,
    label: "Slides",
    admin: {
      condition: (_: any, siblingData: any) => siblingData?.enabled,
    },
    fields: [
      {
        name: "image",
        type: "upload" as const,
        label: "Image",
        relationTo: "media" as const,
        required: true,
      },
      { name: "title", type: "text" as const, label: "Title" },
      { name: "subtitle", type: "textarea" as const, label: "Subtitle" },
      { name: "linkUrl", type: "text" as const, label: "Link URL" },
      {
        name: "linkLabel",
        type: "text" as const,
        label: "Button Label",
        defaultValue: "Learn More",
      },
      {
        name: "linkTarget",
        dbName: "hero_link_target",
        type: "select" as const,
        label: "Link Target",
        defaultValue: "_self",
        options: [
          { label: "Current Tab", value: "_self" },
          { label: "New Tab", value: "_blank" },
        ],
      },
      {
        name: "order",
        type: "number" as const,
        label: "Order",
        defaultValue: 0,
      },
      {
        name: "isActive",
        type: "checkbox" as const,
        label: "Active",
        defaultValue: true,
      },
    ],
  },
];

const globalBoardSettingsFields: Field[] = [
  {
    name: "enabled",
    type: "checkbox" as const,
    label: "Enable Global Board Sections",
    defaultValue: true,
    admin: {
      description: "Show global board sections in the site sidebar.",
    },
  },
  {
    name: 'visibility',
    type: 'group',
    label: 'Sidebar Visibility',
    admin: {
      condition: (_, siblingData) => siblingData?.enabled !== false,
    },
    fields: [
      {
        name: 'showOnHome',
        type: 'checkbox',
        label: 'Show on Home Page',
        defaultValue: true,
      },
      {
        name: 'showOnBoard',
        type: 'checkbox',
        label: 'Show on Board List Pages',
        defaultValue: true,
      },
      {
        name: 'showOnPost',
        type: 'checkbox',
        label: 'Show on Post Detail Pages',
        defaultValue: true,
      },
      {
        name: 'showOnSearch',
        type: 'checkbox',
        label: 'Show on Search Page',
        defaultValue: true,
      },
      {
        name: 'showOnTag',
        type: 'checkbox',
        label: 'Show on Tag Pages',
        defaultValue: true,
      },
      {
        name: 'showOnUser',
        type: 'checkbox',
        label: 'Show on User Pages',
        defaultValue: true,
      },
      {
        name: 'showOnMyPage',
        type: 'checkbox',
        label: 'Show on My Page',
        defaultValue: false,
      },
      {
        name: 'showOnLogin',
        type: 'checkbox',
        label: 'Show on Login/Register Pages',
        defaultValue: false,
      }
    ],
  },
  {
    name: "enableSidebarAds",
    type: "checkbox" as const,
    label: "Enable Sidebar Advertisements",
    defaultValue: true,
    admin: {
      description: "Show sidebar advertisements below the global board sections.",
    },
  },
  {
    name: "position",
    type: "select" as const,
    label: "Sidebar Position",
    defaultValue: "right",
    options: [
      { label: "Left Sidebar", value: "left" },
      { label: "Right Sidebar", value: "right" },
    ],
    admin: {
      condition: (_: any, siblingData: any) => siblingData?.enabled,
    },
  },
  {
    name: "boardSections",
    dbName: "gb_sections",
    type: "array" as const,
    label: "Board Sections",
    admin: {
      condition: (_: any, siblingData: any) =>
        siblingData?.enabled,
      description: "Global board sections and post counts",
      components: {
        RowLabel: '@/components/admin/BoardSectionRowLabel#default',
      },
    },
    fields: [
      {
        name: 'sectionType',
        type: 'select',
        label: 'Section Type',
        defaultValue: 'board',
        options: [
          { label: 'Board', value: 'board' },
          { label: 'Latest Posts', value: 'latest' },
          { label: 'Trending Posts', value: 'trending' },
          { label: 'Popular Posts', value: 'popular' },
          { label: 'Recent Comments', value: 'recentComments' },
          { label: 'Page Link', value: 'page' },
          { label: 'Custom Link', value: 'custom' },
          { label: 'Advertisement', value: 'advertisement' },
        ],
      },
      {
        name: 'advertisement',
        type: 'relationship',
        label: 'Advertisement',
        relationTo: 'advertisements',
        required: false,
        admin: {
          condition: (_: any, siblingData: any) =>
            siblingData?.sectionType === 'advertisement',
        },
      },
      {
        name: 'boards',
        type: 'relationship',
        label: 'Boards for Latest Posts',
        relationTo: 'boards',
        hasMany: true,
        admin: {
          description: 'Select boards to include in Latest Posts. Leave empty to include all boards.',
          condition: (_: any, siblingData: any) =>
            siblingData?.sectionType === 'latest',
        },
      },
      {
        name: 'board',
        type: 'relationship',
        label: 'Board',
        relationTo: 'boards',
        required: false,
        admin: {
          condition: (_: any, siblingData: any) =>
            !siblingData?.sectionType || siblingData.sectionType === 'board',
        },
      },
      {
        name: "sectionTitle",
        type: "text" as const,
        label: "Section Title",
        admin: { description: "If empty, board name will be used." },
      },
      {
        name: "postCount",
        type: "number" as const,
        label: "Posts to Display",
        defaultValue: 5,
        min: 1,
        max: 20,
      },
      {
        name: "displayType",
        dbName: "gb_display_type",
        type: "select" as const,
        label: "Display Type",
        defaultValue: "ticker",
        options: displayTypeOptions,
      },
      {
        name: 'gridColumns',
        type: 'select',
        label: 'Grid Columns',
        defaultValue: '3',
        options: [
          { label: '1 Column', value: '1' },
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ],
        admin: {
          description: 'Used for Card, Gallery, and Compact display types.',
          condition: (_, siblingData) =>
            ['card', 'gallery', 'compact'].includes(siblingData?.displayType),
        },
      },
      {
        name: "order",
        type: "number" as const,
        label: "Section Order",
        defaultValue: 0,
      },
    ],
  },
];

const generalTabFields: Field[] = [
  {
    name: "siteName",
    type: "text" as const,
    label: "Site Name",
    defaultValue: "Mod-B",
  },
  {
    name: "siteDescription",
    type: "textarea" as const,
    label: "Site Description",
  },
  {
    name: "siteLogo",
    type: "upload" as const,
    label: "Site Logo",
    relationTo: "media" as const,
  },
  {
    name: "favicon",
    type: "upload" as const,
    label: "Favicon",
    relationTo: "media",
  },
  {
    name: "homeSettings",
    type: "group" as const,
    label: "Homepage Settings",
    fields: [
      {
        type: "collapsible" as const,
        label: "Global Hero Slider",
        admin: { initCollapsed: false },
        fields: [
          {
            name: "heroSettings",
            type: "group" as const,
            label: false as const,
            fields: heroSettingsFields,
          },
        ],
      },
      {
        type: "collapsible" as const,
        label: "Global Board Sidebar",
        admin: { initCollapsed: false },
        fields: [
          {
            name: "globalBoardSettings",
            type: "group" as const,
            label: false as const,
            fields: globalBoardSettingsFields,
          },
        ],
      },
    ],
  },
];

const authTabFields: Field[] = [
  {
    name: "email",
    type: "group" as const,
    label: "Email Settings (SMTP)",
    admin: {
      description:
        "SMTP settings are configured via .env file. Shown here for reference only.",
    },
    fields: [
      smtpReadonlyField({
        name: "smtpHost",
        label: "SMTP Host",
        defaultValue: process.env.SMTP_HOST || "Not configured",
      }),
      smtpReadonlyField({
        name: "smtpPort",
        label: "SMTP Port",
        defaultValue: process.env.SMTP_PORT || "587",
      }),
      smtpReadonlyField({
        name: "smtpUser",
        label: "SMTP User",
        defaultValue: process.env.SMTP_USER || "Not configured",
      }),
      smtpReadonlyField({
        name: "fromName",
        label: "From Name",
        defaultValue: process.env.SMTP_FROM_NAME || "Not configured",
      }),
      smtpReadonlyField({
        name: "fromEmail",
        label: "From Email",
        defaultValue: process.env.SMTP_FROM_EMAIL || "Not configured",
      }),
      {
        name: "requireEmailVerification",
        type: "checkbox" as const,
        label: "Require Email Verification on Register",
        defaultValue: false,
      },
    ],
  },
  {
    name: "socialLogin",
    type: "group" as const,
    label: "Social Login Settings",
    fields: [
      socialProviderGroup({
        name: "google",
        label: "Google Login",
        buttonLabel: "Continue with Google",
      }),
      socialProviderGroup({
        name: "naver",
        label: "Naver Login",
        buttonLabel: "네이버로 로그인",
      }),
      socialProviderGroup({
        name: "kakao",
        label: "Kakao Login",
        buttonLabel: "카카오로 로그인",
      }),
      socialProviderGroup({
        name: "facebook",
        label: "Facebook Login",
        buttonLabel: "Continue with Facebook",
      }),
      {
        name: "dividerText",
        type: "text" as const,
        label: "Divider Text",
        defaultValue: "or",
      },
    ],
  },
];

const designTabFields: Field[] = [
  {
    name: "design",
    type: "group" as const,
    label: "Design Settings",
    admin: {
      description: "Customize colors, fonts, and layout for your site.",
    },
    fields: [
      {
        name: "colors",
        type: "group" as const,
        label: "Colors",
        fields: [
          colorField({
            name: "primary",
            label: "Primary Color",
            defaultValue: "#111827",
            description: "Main brand color (hex). e.g. #111827",
          }),
          colorField({
            name: "primaryForeground",
            label: "Primary Foreground",
            defaultValue: "#ffffff",
            description: "Text color on primary background",
          }),
          colorField({
            name: "secondary",
            label: "Secondary Color",
            defaultValue: "#f3f4f6",
            description: "Secondary/accent color",
          }),
          colorField({
            name: "secondaryForeground",
            label: "Secondary Foreground",
            defaultValue: "#111827",
            description: "Text color on secondary background",
          }),
          colorField({
            name: "background",
            label: "Page Background",
            defaultValue: "#f9fafb",
            description: "Background color for the entire page",
          }),
          colorField({
            name: "foreground",
            label: "Page Text Color",
            defaultValue: "#111827",
            description: "Text color for the entire page",
          }),
          colorField({
            name: "headerBg",
            label: "Header Background",
            defaultValue: "#ffffff",
          }),
          colorField({
            name: "navBg",
            label: "Navigation Background",
            defaultValue: "#f3f4f6",
          }),
          colorField({
            name: "footerBg",
            label: "Footer Background",
            defaultValue: "#111827",
          }),
          colorField({
            name: "footerFg",
            label: "Footer Text Color",
            defaultValue: "#9ca3af",
          }),
          colorField({
            name: "link",
            label: "Link Color",
            defaultValue: "#2563eb",
          }),
        ],
      },
      {
        name: "resetAllColors",
        type: "ui" as const,
        admin: {
          components: {
            Field: "@/components/ColorPicker#ResetAllColorsButton",
          },
        },
      },
      {
        name: "typography",
        type: "group" as const,
        label: "Typography",
        fields: [
          {
            name: "fontFamily",
            type: "select" as const,
            label: "Font Family",
            defaultValue: "system",
            options: [
              { label: "System Default", value: "system" },
              { label: "Inter", value: "inter" },
              { label: "Noto Sans KR (Korean)", value: "noto-sans-kr" },
              { label: "Pretendard (Korean)", value: "pretendard" },
              { label: "Roboto", value: "roboto" },
              { label: "Open Sans", value: "open-sans" },
              { label: "Custom Google Font", value: "custom" },
            ],
          },
          {
            name: "baseFontSize",
            type: "select" as const,
            label: "Base Font Size",
            defaultValue: "16px",
            options: [
              { label: "14px (Small)", value: "14px" },
              { label: "15px", value: "15px" },
              { label: "16px (Default)", value: "16px" },
              { label: "17px", value: "17px" },
              { label: "18px (Large)", value: "18px" },
            ],
          },
          {
            name: "headingWeight",
            type: "select" as const,
            label: "Heading Font Weight",
            defaultValue: "700",
            options: [
              { label: "Normal (400)", value: "400" },
              { label: "Medium (500)", value: "500" },
              { label: "Semi Bold (600)", value: "600" },
              { label: "Bold (700)", value: "700" },
              { label: "Extra Bold (800)", value: "800" },
            ],
          },
        ],
      },
      {
        name: "layout",
        type: "group" as const,
        label: "Layout",
        fields: [
          {
            name: "maxWidth",
            type: "select" as const,
            label: "Content Max Width",
            defaultValue: "1280px",
            options: [
              { label: "Narrow (1024px)", value: "1024px" },
              { label: "Default (1280px)", value: "1280px" },
              { label: "Wide (1440px)", value: "1440px" },
              { label: "Full Width", value: "100%" },
            ],
          },
          {
            name: "borderRadius",
            type: "select" as const,
            label: "Border Radius",
            defaultValue: "8px",
            options: [
              { label: "None (0px)", value: "0px" },
              { label: "Small (4px)", value: "4px" },
              { label: "Default (8px)", value: "8px" },
              { label: "Large (12px)", value: "12px" },
              { label: "Extra Large (16px)", value: "16px" },
            ],
          },
          {
            name: "headerHeight",
            type: "select" as const,
            label: "Header Height",
            defaultValue: "64px",
            options: [
              { label: "Small (56px)", value: "56px" },
              { label: "Default (64px)", value: "64px" },
              { label: "Large (72px)", value: "72px" },
              { label: "Extra Large (80px)", value: "80px" },
            ],
          },
          {
            name: "headerWidth",
            type: "select" as const,
            label: "Header Width",
            defaultValue: "full",
            options: widthOptions,
          },
          {
            name: "navWidth",
            type: "select" as const,
            label: "Navigation Width",
            defaultValue: "full",
            options: widthOptions,
          },
          {
            name: "announcementWidth",
            type: "select" as const,
            label: "Announcement Width",
            defaultValue: "content",
            options: widthOptions,
          },
          {
            name: "mainWidth",
            type: "select" as const,
            label: "Main Content Width",
            defaultValue: "content",
            options: widthOptions,
          },
          {
            name: "footerWidth",
            type: "select" as const,
            label: "Footer Width",
            defaultValue: "content",
            options: widthOptions,
          },
        ],
      },
      {
        name: "customCss",
        type: "textarea" as const,
        label: "Custom CSS",
        admin: {
          description: "Add custom CSS rules. Applied globally to all pages.",
        },
      },
    ],
  },
];

const seoAdsTabFields: Field[] = [
  {
    name: "seo",
    type: "group" as const,
    label: "SEO Basic Settings",
    fields: [
      {
        name: "defaultTitle",
        type: "text" as const,
        label: "Default Page Title",
      },
      {
        name: "defaultDescription",
        type: "textarea" as const,
        label: "Default Meta Description",
      },
      {
        name: "ogImage",
        type: "upload" as const,
        label: "OG Image (Social Sharing)",
        relationTo: "media" as const,
      },
      {
        name: "googleAnalyticsId",
        type: "text" as const,
        label: "Google Analytics ID",
        admin: { description: "예: G-XXXXXXXXXX" },
      },
      {
        name: "naverVerification",
        type: "text" as const,
        label: "Naver Site Verification Code",
      },
      {
        name: "googleVerification",
        type: "text" as const,
        label: "Google Site Verification Code",
      },
    ],
  },
  {
    name: "googleAds",
    type: "group" as const,
    label: "Google Ads Settings",
    fields: [
      {
        name: "enabled",
        type: "checkbox" as const,
        label: "Enable Google Ads",
        defaultValue: false,
      },
      {
        name: "publisherId",
        type: "text" as const,
        label: "Publisher ID",
        admin: {
          description: "e.g., ca-pub-XXXXXXXXXXXXXXXX",
          condition: (data: any) => data?.googleAds?.enabled,
        },
      },
      {
        name: "autoAds",
        type: "checkbox" as const,
        label: "Use Auto Ads",
        defaultValue: false,
        admin: {
          condition: (data: any) => data?.googleAds?.enabled,
          description: "Google will automatically determine ad placements",
        },
      },
    ],
  },
];

const advancedTabFields: Field[] = [
  {
    name: "customScripts",
    type: "group" as const,
    label: "Custom Scripts",
    fields: [
      {
        name: "headScript",
        type: "textarea" as const,
        label: "Script to Insert in <head>",
        admin: {
          description: "All pages <head> will have this script inserted",
        },
      },
      {
        name: "bodyScript",
        type: "textarea" as const,
        label: "Script to Insert in <body>",
        admin: {
          description: "All pages </body> will have this script inserted",
        },
      },
    ],
  },
  {
    name: "forbiddenWords",
    type: "group" as const,
    label: "Forbidden Words",
    fields: [
      {
        name: "registration",
        type: "textarea" as const,
        label: "Name/Nickname",
        admin: {
          description:
            "Forbidden words for name and nickname (ex: admin, manager, operator)",
        },
      },
      {
        name: "content",
        type: "textarea" as const,
        label: "Posts/Comments",
        admin: {
          description:
            "Forbidden words for posts and comments (ex: spam, scam, fake)",
        },
      },
    ],
  },
  {
    name: "maintenance",
    type: "group" as const,
    label: "Maintenance Mode",
    admin: {
      description:
        "If enabled, access for all regular visitors will be blocked except for administrators.",
    },
    fields: [
      {
        name: "enabled",
        type: "checkbox" as const,
        label: "Enable Maintenance Mode",
        defaultValue: false,
      },
      {
        name: "title",
        type: "text" as const,
        label: "Page Title",
        defaultValue: "Under Construction",
        admin: { condition: (data: any) => data?.maintenance?.enabled },
      },
      {
        name: "message",
        type: "textarea" as const,
        label: "Message",
        defaultValue:
          "We are currently working on something awesome. Please check back soon.",
        admin: { condition: (data: any) => data?.maintenance?.enabled },
      },
      {
        name: "estimatedDate",
        type: "date" as const,
        label: "Estimated Launch Date (optional)",
        admin: {
          condition: (data: any) => data?.maintenance?.enabled,
          date: {
            pickerAppearance: "dayAndTime" as const,
            displayFormat: "yyyy-MM-dd HH:mm '(admin local time)'",
          },
        },
      },
      {
        name: "backgroundImage",
        type: "upload" as const,
        relationTo: "media",
        label: "Background Image (optional)",
        admin: { condition: (data: any) => data?.maintenance?.enabled },
      },
    ],
  },
];

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: { group: "Settings" },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        { label: "General", fields: generalTabFields },
        { label: "Auth & Login", fields: authTabFields },
        { label: "Design", fields: designTabFields },
        { label: "SEO & Ads", fields: seoAdsTabFields },
        { label: "Advanced", fields: advancedTabFields },
      ],
    },
  ],
};
