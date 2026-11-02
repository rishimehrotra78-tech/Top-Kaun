// ─────────────────────────────────────────────────────────────
// Your business details. Used on Contact, About, Terms, Privacy,
// Refunds and every GST invoice. Reviewers check these match your
// Razorpay KYC exactly.
// ─────────────────────────────────────────────────────────────
export const BUSINESS = {
  legalName: "Shakkar Papa",                 // Trade name (spelling confirmed)
  // GSTIN shows a proprietorship, so the GST "legal name" is the owner's name as on PAN.
  proprietorName: "Ankita Agarwal",          // Legal name as on PAN
  siteName: "eknumber.in",
  address: {
    line1: "310B, Bahadur Nagar",
    city: "Lakhimpur Kheri",
    state: "Uttar Pradesh",
    stateCode: "09",
    pin: "262701",
  },
  email: "helpline@shakkarpaapa.com",
  phone: "+91 90447 67665",
  gstin: "09BFGPA3292A1ZW",                   // check digit verified; confirm against your GST certificate
  grievanceOfficer: "Ankita Agarwal",
  supportHours: "Mon–Sat, 10am–6pm IST",
  // SAC for selling internet advertising space. Confirm with your CA and make sure it's on your GST registration.
  sac: "998365",
  serviceDescription: "Sponsored listing (internet advertising space) on eknumber.in",
  lastUpdated: "2 November 2026",
} as const;

export const fullAddress = () => {
  const a = BUSINESS.address;
  return `${a.line1}, ${a.city}, ${a.state} ${a.pin}, India`;
};
