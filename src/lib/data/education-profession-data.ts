export interface EducationLevelOption {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const EDUCATION_LEVELS: EducationLevelOption[] = [
  {
    id: "bachelors",
    label: "Bachelor's Degree",
    shortLabel: "Bachelor's",
    description: "B.Tech, B.Sc, B.Com, B.A, BCA, MBBS, BBA, etc.",
  },
  {
    id: "masters",
    label: "Master's Degree",
    shortLabel: "Master's",
    description: "M.Tech, M.Sc, M.Com, M.A, MCA, MBA, MS, etc.",
  },
  {
    id: "doctorate",
    label: "Doctorate / PhD",
    shortLabel: "PhD / Doctorate",
    description: "Doctorate, Post-Doctoral, DM, M.Ch, etc.",
  },
  {
    id: "professional",
    label: "Professional Qualification",
    shortLabel: "Professional",
    description: "CA, CS, CMA/ICWA, CFA, Civil Services, Pilot, etc.",
  },
  {
    id: "diploma",
    label: "Diploma",
    shortLabel: "Diploma",
    description: "Polytechnic, Engineering Diploma, D.Pharm, etc.",
  },
  {
    id: "iti",
    label: "ITI",
    shortLabel: "ITI",
    description: "Electrician, Fitter, Mechanic, COPA, etc.",
  },
  {
    id: "higher_secondary",
    label: "Higher Secondary / Plus Two",
    shortLabel: "Plus Two / 12th",
    description: "Class 12th, CBSE, State Board, ISC, etc.",
  },
  {
    id: "sslc",
    label: "SSLC / 10th",
    shortLabel: "SSLC / 10th",
    description: "Secondary School, Class 10th, Matriculation.",
  },
  {
    id: "other",
    label: "Other",
    shortLabel: "Other",
    description: "Other educational background or trade certificate.",
  },
];

export const EDUCATION_QUALIFICATIONS_BY_LEVEL: Record<string, string[]> = {
  bachelors: [
    "B.Tech / B.E. (Computer Science & Engineering)",
    "B.Tech / B.E. (Information Technology)",
    "B.Tech / B.E. (Mechanical Engineering)",
    "B.Tech / B.E. (Civil Engineering)",
    "B.Tech / B.E. (Electrical & Electronics)",
    "B.Tech / B.E. (Electronics & Communication)",
    "B.Tech / B.E. (Other Engineering)",
    "BCA (Bachelor of Computer Applications)",
    "B.Sc. Computer Science",
    "B.Sc. Information Technology",
    "B.Sc. Mathematics",
    "B.Sc. Physics",
    "B.Sc. Chemistry",
    "B.Sc. Biotechnology / Microbiology",
    "B.Sc. Nursing",
    "B.Sc. Agriculture",
    "B.Sc. Other",
    "B.Com (Bachelor of Commerce)",
    "B.Com (Computer Applications / Taxation / Finance)",
    "BBA / BBM (Bachelor of Business Administration)",
    "B.A. English / Literature",
    "B.A. Economics",
    "B.A. Journalism & Mass Communication",
    "B.A. Other",
    "MBBS (Medicine)",
    "BDS (Dental Surgery)",
    "BAMS / BHMS (Ayurveda / Homeopathy)",
    "B.Pharm (Pharmacy)",
    "B.Arch (Architecture)",
    "LLB / B.A. LLB / BBA LLB (Law)",
    "B.Ed (Bachelor of Education)",
    "B.Des (Design / Fashion / Interior)",
    "BHM / B.Sc. Hotel Management",
    "B.Voc (Vocational Studies)",
    "Other bachelor's degree",
  ],
  masters: [
    "M.Tech / M.E. (Computer Science)",
    "M.Tech / M.E. (Other Engineering)",
    "MCA (Master of Computer Applications)",
    "M.Sc. Computer Science / Data Science",
    "M.Sc. Information Technology",
    "M.Sc. Mathematics / Statistics",
    "M.Sc. Physics / Chemistry",
    "M.Sc. Biotechnology / Life Sciences",
    "M.Sc. Nursing",
    "M.Sc. Other",
    "MBA (Finance)",
    "MBA (Marketing)",
    "MBA (Human Resources / HR)",
    "MBA (Operations / Supply Chain)",
    "MBA (General Management)",
    "M.Com (Master of Commerce)",
    "M.A. English / Literature",
    "M.A. Economics",
    "M.A. Sociology / Psychology",
    "M.A. Other",
    "MS (Master of Science - Foreign University / Research)",
    "MD / MS (Medical Specialty)",
    "MDS (Master of Dental Surgery)",
    "M.Pharm (Master of Pharmacy)",
    "M.Arch (Master of Architecture)",
    "LLM (Master of Laws)",
    "M.Ed (Master of Education)",
    "M.Des (Master of Design)",
    "Other master's degree",
  ],
  doctorate: [
    "PhD (Computer Science / Engineering)",
    "PhD (Science & Mathematics)",
    "PhD (Humanities & Social Sciences)",
    "PhD (Commerce & Management)",
    "DM / M.Ch (Super Specialty Medicine)",
    "Post-Doctoral Fellow (PDF)",
    "Other Doctorate / PhD",
  ],
  professional: [
    "Chartered Accountant (CA)",
    "Cost & Management Accountant (CMA / ICWA)",
    "Company Secretary (CS)",
    "CFA (Chartered Financial Analyst)",
    "CPA (Certified Public Accountant)",
    "Civil Services (IAS / IPS / IFS / IRS)",
    "Commercial Pilot (CPL / ATPL)",
    "Merchant Navy Officer / Marine Engineer",
    "Other Professional Qualification",
  ],
  diploma: [
    "Diploma in Computer Engineering",
    "Diploma in Mechanical Engineering",
    "Diploma in Civil Engineering",
    "Diploma in Electrical & Electronics (EEE)",
    "Diploma in Electronics & Communication (ECE)",
    "Diploma in Automobile Engineering",
    "Diploma in Pharmacy (D.Pharm)",
    "Diploma in General Nursing & Midwifery (GNM)",
    "Diploma in Hotel Management & Catering",
    "Diploma in Interior Design / Graphic Design",
    "Other Polytechnic / Diploma",
  ],
  iti: [
    "ITI - Electrician",
    "ITI - Fitter",
    "ITI - Draughtsman (Civil / Mech)",
    "ITI - Mechanic (Motor Vehicle / Diesel)",
    "ITI - Computer Operator (COPA)",
    "ITI - Welder / Machinist",
    "Other ITI Trade",
  ],
  higher_secondary: [
    "Plus Two / Higher Secondary (Science)",
    "Plus Two / Higher Secondary (Commerce)",
    "Plus Two / Higher Secondary (Humanities / Arts)",
    "CBSE Class 12 (Science)",
    "CBSE Class 12 (Commerce)",
    "CBSE Class 12 (Humanities)",
    "ISC Class 12",
    "Other Plus Two / 12th",
  ],
  sslc: [
    "SSLC / 10th Standard (State Board)",
    "CBSE Class 10 (AISSE)",
    "ICSE Class 10",
    "Other 10th / Secondary School",
  ],
  other: [
    "Other Qualification",
  ],
};

export const PROFESSION_OPTIONS: string[] = [
  "Software Engineer / IT Professional",
  "Frontend / Full Stack Developer",
  "Backend / Cloud Engineer",
  "Data Scientist / AI Engineer",
  "QA / Test Automation Engineer",
  "Product Manager / Project Manager",
  "UI/UX Designer / Graphic Designer",
  "Doctor / Medical Professional",
  "Surgeon / Specialist Doctor",
  "Dentist / Dental Surgeon",
  "Nurse / Healthcare Professional",
  "Pharmacist / Clinical Researcher",
  "Chartered Accountant (CA)",
  "Accountant / Finance Professional",
  "Banking Professional",
  "Investment Banker / Financial Analyst",
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical / Electronics Engineer",
  "Architect / Urban Planner",
  "Teacher / School Educator",
  "Lecturer / Professor",
  "Lawyer / Legal Professional / Advocate",
  "Government Employee / PSU Officer",
  "Civil Service / IAS / IPS / IFS / IRS",
  "Defence Personnel (Army / Navy / Air Force)",
  "Police / Law Enforcement Officer",
  "Commercial Pilot / Airline Crew",
  "Merchant Navy Officer / Sailor",
  "Business Owner / Entrepreneur",
  "Self-employed / Freelancer",
  "Marketing / Advertising Professional",
  "HR / Talent Acquisition Professional",
  "Content Creator / Media Professional",
  "Sales / Business Development Executive",
  "Researcher / Scientist",
  "Student",
  "Homemaker",
  "Retired",
  "Other",
];

export const EMPLOYMENT_STATUS_OPTIONS: { id: string; label: string; description: string }[] = [
  {
    id: "employed_private",
    label: "Employed (Private / Corporate)",
    description: "Working in an IT firm, MNC, or private company",
  },
  {
    id: "employed_gov",
    label: "Employed (Government / PSU)",
    description: "Central, State govt, or Public Sector Undertaking",
  },
  {
    id: "business_owner",
    label: "Business Owner / Entrepreneur",
    description: "Running a registered business or enterprise",
  },
  {
    id: "self_employed",
    label: "Self-employed / Freelancer",
    description: "Independent professional or consultant",
  },
  {
    id: "student",
    label: "Student",
    description: "Currently pursuing higher studies or research",
  },
  {
    id: "unemployed",
    label: "Unemployed / Looking for Job",
    description: "Currently seeking new opportunities",
  },
  {
    id: "homemaker",
    label: "Homemaker",
    description: "Managing household and family",
  },
  {
    id: "retired",
    label: "Retired",
    description: "Retired from active employment",
  },
  {
    id: "other",
    label: "Other",
    description: "Other occupational situation",
  },
];

/**
 * Normalizes and parses previously saved free-text education strings into structured parts.
 */
export function parseStoredEducation(storedVal?: string | null): {
  levelId: string;
  qualification: string;
  customText: string;
} {
  if (!storedVal || typeof storedVal !== "string") {
    return { levelId: "", qualification: "", customText: "" };
  }

  const trimmed = storedVal.trim();
  if (!trimmed) {
    return { levelId: "", qualification: "", customText: "" };
  }

  // 1. Check if exactly matches a known qualification
  for (const [levelKey, quals] of Object.entries(EDUCATION_QUALIFICATIONS_BY_LEVEL)) {
    const matched = quals.find((q) => q.toLowerCase() === trimmed.toLowerCase());
    if (matched) {
      return {
        levelId: levelKey,
        qualification: matched,
        customText: "",
      };
    }
  }

  // 2. Check if formatted with level prefix: e.g. "Bachelor's Degree: B.Tech / B.E. ..."
  if (trimmed.includes(":")) {
    const [prefix, suffix] = trimmed.split(":").map((s) => s.trim());
    const matchedLevel = EDUCATION_LEVELS.find(
      (l) =>
        l.label.toLowerCase() === prefix.toLowerCase() ||
        l.shortLabel.toLowerCase() === prefix.toLowerCase()
    );
    if (matchedLevel) {
      const quals = EDUCATION_QUALIFICATIONS_BY_LEVEL[matchedLevel.id] || [];
      const matchedQual = quals.find((q) => q.toLowerCase() === suffix.toLowerCase());
      if (matchedQual) {
        return {
          levelId: matchedLevel.id,
          qualification: matchedQual,
          customText: "",
        };
      }
      return {
        levelId: matchedLevel.id,
        qualification: "Other",
        customText: suffix,
      };
    }
  }

  // 3. Heuristic matching based on keywords
  const lower = trimmed.toLowerCase();
  let guessedLevel = "bachelors";
  if (lower.includes("phd") || lower.includes("doctorate")) guessedLevel = "doctorate";
  else if (lower.includes("m.") || lower.includes("master") || lower.includes("mba") || lower.includes("mca") || lower.includes("mtech") || lower.includes("msc")) guessedLevel = "masters";
  else if (lower.includes("b.") || lower.includes("bachelor") || lower.includes("btech") || lower.includes("bsc") || lower.includes("bcom") || lower.includes("bba") || lower.includes("bca") || lower.includes("mbbs")) guessedLevel = "bachelors";
  else if (lower.includes("diploma") || lower.includes("polytechnic")) guessedLevel = "diploma";
  else if (lower.includes("iti")) guessedLevel = "iti";
  else if (lower.includes("ca") || lower.includes("chartered") || lower.includes("pilot") || lower.includes("civil service")) guessedLevel = "professional";
  else if (lower.includes("plus two") || lower.includes("12th") || lower.includes("hsc")) guessedLevel = "higher_secondary";
  else if (lower.includes("10th") || lower.includes("sslc") || lower.includes("matric")) guessedLevel = "sslc";
  else guessedLevel = "other";

  const quals = EDUCATION_QUALIFICATIONS_BY_LEVEL[guessedLevel] || [];
  const partialMatch = quals.find((q) => lower.includes(q.toLowerCase().slice(0, 10)));

  if (partialMatch) {
    return {
      levelId: guessedLevel,
      qualification: partialMatch,
      customText: "",
    };
  }

  return {
    levelId: guessedLevel,
    qualification: "Other",
    customText: trimmed,
  };
}

/**
 * Formats level, qualification and optional custom text into a clean stored string.
 */
export function formatStoredEducation(
  levelId: string,
  qualification: string,
  customText?: string
): string {
  const levelObj = EDUCATION_LEVELS.find((l) => l.id === levelId);
  const levelName = levelObj ? levelObj.label : "";

  if (qualification.toLowerCase().startsWith("other") && customText?.trim()) {
    return customText.trim();
  }

  if (qualification && qualification !== "Other Qualification") {
    return qualification;
  }

  if (customText?.trim()) {
    return customText.trim();
  }

  return levelName || "";
}

/**
 * Normalizes previously saved profession strings into structured components.
 */
export function parseStoredProfession(storedVal?: string | null): {
  matchedOption: string;
  customText: string;
} {
  if (!storedVal || typeof storedVal !== "string") {
    return { matchedOption: "", customText: "" };
  }

  const trimmed = storedVal.trim();
  if (!trimmed) {
    return { matchedOption: "", customText: "" };
  }

  const direct = PROFESSION_OPTIONS.find(
    (p) => p.toLowerCase() === trimmed.toLowerCase()
  );
  if (direct) {
    return { matchedOption: direct, customText: "" };
  }

  // Check partial match
  const partial = PROFESSION_OPTIONS.find(
    (p) =>
      p !== "Other" &&
      (trimmed.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(trimmed.toLowerCase()))
  );
  if (partial) {
    return { matchedOption: partial, customText: "" };
  }

  return { matchedOption: "Other", customText: trimmed };
}
