export const site = {
  name: "Serenade Singers",
  tagline: "One Thing. One Voice.",
  description:
    "Serenade Singers is a non-profit musical organization focused on choir music, harmony, and vocal artistry.",

  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_LINK || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_LINK || "",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_LINK || "",
  appsScriptUrl: process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "",

  signupForm: "/signup",
};
