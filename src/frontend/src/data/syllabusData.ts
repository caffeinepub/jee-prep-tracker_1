import type { ChapterData, ClassMap } from "../types";

export const SUBJECTS = ["Physics", "Chemistry", "Maths"] as const;
export const SCHOOL_SUBJECTS = [
  "Physics",
  "Chemistry",
  "Maths",
  "English",
  "Physical Education",
] as const;

export const CLASS_11_CHAPTERS: Record<string, string[]> = {
  Physics: [
    "Units & Measurement",
    "Motion in a Straight Line",
    "Motion in a Plane",
    "Laws of Motion",
    "Work Energy Power",
    "System of Particles",
    "Gravitation",
    "Mechanical Properties of Solids",
    "Mechanical Properties of Fluids",
    "Thermal Properties",
    "Thermodynamics",
    "Kinetic Theory",
    "Oscillations",
    "Waves",
  ],
  Chemistry: [
    "Basic Concepts",
    "Structure of Atom",
    "Classification of Elements",
    "Chemical Bonding",
    "States of Matter",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
    "Hydrogen",
    "s-Block Elements",
    "p-Block Elements",
    "Organic Chemistry Basics",
    "Hydrocarbons",
    "Environmental Chemistry",
  ],
  Maths: [
    "Sets",
    "Relations and Functions",
    "Trigonometric Functions",
    "Mathematical Induction",
    "Complex Numbers",
    "Linear Inequalities",
    "Permutations and Combinations",
    "Binomial Theorem",
    "Sequences and Series",
    "Straight Lines",
    "Conic Sections",
    "Introduction to 3D",
    "Limits and Derivatives",
    "Mathematical Reasoning",
    "Statistics",
    "Probability",
  ],
};

export const CLASS_12_CHAPTERS: Record<string, string[]> = {
  Physics: [
    "Electric Charges",
    "Electrostatic Potential",
    "Current Electricity",
    "Moving Charges",
    "Magnetism",
    "Electromagnetic Induction",
    "Alternating Current",
    "EM Waves",
    "Ray Optics",
    "Wave Optics",
    "Dual Nature",
    "Atoms",
    "Nuclei",
    "Semiconductor Electronics",
  ],
  Chemistry: [
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "General Principles",
    "p-Block Elements",
    "d and f Block",
    "Coordination Compounds",
    "Haloalkanes",
    "Haloarenes",
    "Alcohols Phenols Ethers",
    "Aldehydes Ketones",
    "Carboxylic Acids",
    "Amines",
    "Biomolecules",
  ],
  Maths: [
    "Relations and Functions",
    "Inverse Trigonometry",
    "Matrices",
    "Determinants",
    "Continuity and Differentiability",
    "Applications of Derivatives",
    "Integrals",
    "Applications of Integrals",
    "Differential Equations",
    "Vector Algebra",
    "3D Geometry",
    "Linear Programming",
    "Probability",
  ],
};

export const CHEMISTRY_SECTIONS_11: Record<string, string[]> = {
  Physical: [
    "Basic Concepts",
    "States of Matter",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
  ],
  Inorganic: [
    "Structure of Atom",
    "Classification of Elements",
    "Chemical Bonding",
    "Hydrogen",
    "s-Block Elements",
    "p-Block Elements",
    "Environmental Chemistry",
  ],
  Organic: ["Organic Chemistry Basics", "Hydrocarbons"],
};

export const CHEMISTRY_SECTIONS_12: Record<string, string[]> = {
  Physical: [
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
  ],
  Inorganic: [
    "General Principles",
    "p-Block Elements",
    "d and f Block",
    "Coordination Compounds",
  ],
  Organic: [
    "Haloalkanes",
    "Haloarenes",
    "Alcohols Phenols Ethers",
    "Aldehydes Ketones",
    "Carboxylic Acids",
    "Amines",
    "Biomolecules",
  ],
};

export const SCHOOL_CLASS_11_CHAPTERS: Record<string, string[]> = {
  Physics: [
    "Units & Measurement",
    "Motion in a Straight Line",
    "Motion in a Plane",
    "Laws of Motion",
    "Work Energy Power",
    "System of Particles",
    "Gravitation",
    "Mechanical Properties of Solids",
    "Mechanical Properties of Fluids",
    "Thermal Properties",
    "Thermodynamics",
    "Kinetic Theory",
    "Oscillations",
    "Waves",
  ],
  Chemistry: [
    "Basic Concepts",
    "Structure of Atom",
    "Classification of Elements",
    "Chemical Bonding",
    "States of Matter",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
    "Hydrogen",
    "s-Block Elements",
    "p-Block Elements",
    "Organic Chemistry Basics",
    "Hydrocarbons",
    "Environmental Chemistry",
  ],
  Maths: [
    "Sets",
    "Relations and Functions",
    "Trigonometric Functions",
    "Mathematical Induction",
    "Complex Numbers",
    "Linear Inequalities",
    "Permutations and Combinations",
    "Binomial Theorem",
    "Sequences and Series",
    "Straight Lines",
    "Conic Sections",
    "Introduction to 3D",
    "Limits and Derivatives",
    "Mathematical Reasoning",
    "Statistics",
    "Probability",
  ],
  English: [
    // Reading
    "Reading Comprehension – Unseen Passages",
    // Writing
    "Note Making & Summary Writing",
    "Letter Writing (Formal & Informal)",
    "Essay & Paragraph Writing",
    // Literature – Hornbill (Prose)
    "The Portrait of a Lady",
    "We're Not Afraid to Die",
    "Discovering Tut: The Saga Continues",
    "Landscape of the Soul",
    "The Ailing Planet: The Green Movement's Role",
    "The Browning Version",
    "The Adventure",
    "Silk Road",
    // Literature – Hornbill (Poetry)
    "A Photograph",
    "The Laburnum Top",
    "The Voice of the Rain",
    "Childhood",
    "Father to Son",
    // Literature – Snapshots (Supplementary)
    "The Summer of the Beautiful White Horse",
    "The Address",
    "Ranga's Marriage",
    "Albert Einstein at School",
    "Mother's Day",
    "The Ghat of the Only World",
    "Birth",
    "The Tale of Melon City",
  ],
  "Physical Education": [
    // Unit 1
    "Changing Trends & Career in Physical Education",
    // Unit 2
    "Olympic Movement",
    // Unit 3
    "Physical Fitness, Wellness & Lifestyle",
    // Unit 4
    "Physical Education & Sports for CWSN",
    // Unit 5
    "Yoga",
    // Unit 6
    "Physical Activity & Leadership Training",
    // Unit 7
    "Test & Measurement in Sports",
    // Unit 8
    "Fundamentals of Anatomy & Physiology in Sports",
    // Unit 9
    "Biomechanics & Sports",
    // Unit 10
    "Psychology & Sports",
    // Unit 11
    "Training in Sports",
    // Unit 12
    "Doping",
  ],
};

export const SCHOOL_CLASS_12_CHAPTERS: Record<string, string[]> = {
  Physics: [
    "Electric Charges",
    "Electrostatic Potential",
    "Current Electricity",
    "Moving Charges",
    "Magnetism",
    "Electromagnetic Induction",
    "Alternating Current",
    "EM Waves",
    "Ray Optics",
    "Wave Optics",
    "Dual Nature",
    "Atoms",
    "Nuclei",
    "Semiconductor Electronics",
  ],
  Chemistry: [
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "General Principles",
    "p-Block Elements",
    "d and f Block",
    "Coordination Compounds",
    "Haloalkanes",
    "Haloarenes",
    "Alcohols Phenols Ethers",
    "Aldehydes Ketones",
    "Carboxylic Acids",
    "Amines",
    "Biomolecules",
  ],
  Maths: [
    "Relations and Functions",
    "Inverse Trigonometry",
    "Matrices",
    "Determinants",
    "Continuity and Differentiability",
    "Applications of Derivatives",
    "Integrals",
    "Applications of Integrals",
    "Differential Equations",
    "Vector Algebra",
    "3D Geometry",
    "Linear Programming",
    "Probability",
  ],
  English: [
    // Reading
    "Reading Comprehension – Unseen Passages",
    // Writing
    "Letter Writing (Formal Letters, Applications)",
    "Article / Report Writing",
    "Speech / Debate Writing",
    // Literature – Flamingo (Prose)
    "The Last Lesson",
    "Lost Spring",
    "Deep Water",
    "The Rattrap",
    "Indigo",
    "Poets and Pancakes",
    "The Interview",
    "Going Places",
    // Literature – Flamingo (Poetry)
    "My Mother at Sixty-Six",
    "An Elementary School Classroom in a Slum",
    "Keeping Quiet",
    "A Thing of Beauty",
    "A Roadside Stand",
    "Aunt Jennifer's Tigers",
    // Literature – Vistas (Supplementary)
    "The Third Level",
    "The Tiger King",
    "Journey to the End of the Earth",
    "The Enemy",
    "Should Wizard Hit Mommy",
    "On the Face of It",
    "Evans Tries an O-Level",
    "Memories of Childhood",
  ],
  "Physical Education": [
    // Unit 1
    "Planning in Sports",
    // Unit 2
    "Sports & Nutrition",
    // Unit 3
    "Yoga & Lifestyle",
    // Unit 4
    "Physical Education & Sports for CWSN",
    // Unit 5
    "Children & Women in Sports",
    // Unit 6
    "Test & Measurement in Sports",
    // Unit 7
    "Physiology & Sports",
    // Unit 8
    "Biomechanics & Sports",
    // Unit 9
    "Psychology & Sports",
    // Unit 10
    "Training in Sports",
    // Unit 11
    "Sports Medicine",
    // Unit 12
    "Organising Sporting Events",
  ],
};

export const SCHOOL_CHEMISTRY_SECTIONS_11: Record<string, string[]> = {
  Physical: [
    "Basic Concepts",
    "States of Matter",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
  ],
  Inorganic: [
    "Structure of Atom",
    "Classification of Elements",
    "Chemical Bonding",
    "Hydrogen",
    "s-Block Elements",
    "p-Block Elements",
    "Environmental Chemistry",
  ],
  Organic: ["Organic Chemistry Basics", "Hydrocarbons"],
};

export const SCHOOL_CHEMISTRY_SECTIONS_12: Record<string, string[]> = {
  Physical: [
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
  ],
  Inorganic: [
    "General Principles",
    "p-Block Elements",
    "d and f Block",
    "Coordination Compounds",
  ],
  Organic: [
    "Haloalkanes",
    "Haloarenes",
    "Alcohols Phenols Ethers",
    "Aldehydes Ketones",
    "Carboxylic Acids",
    "Amines",
    "Biomolecules",
  ],
};

export function buildInitialChapterData(): ClassMap {
  const makeEmpty = (chapters: Record<string, string[]>) => {
    const subjectMap: Record<string, Record<string, ChapterData>> = {};
    for (const [subject, chList] of Object.entries(chapters)) {
      subjectMap[subject] = {};
      for (const ch of chList) {
        subjectMap[subject][ch] = {
          done: false,
          notesDone: false,
          moduleDone: false,
          ncertDone: false,
          revisions: 0,
          questionsSolved: 0,
        };
      }
    }
    return subjectMap;
  };
  return {
    class11: makeEmpty(CLASS_11_CHAPTERS),
    class12: makeEmpty(CLASS_12_CHAPTERS),
    school11: makeEmpty(SCHOOL_CLASS_11_CHAPTERS),
    school12: makeEmpty(SCHOOL_CLASS_12_CHAPTERS),
  };
}
