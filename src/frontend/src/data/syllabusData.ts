import type { ClassMap } from "../types";

export const SUBJECTS = ["Physics", "Chemistry", "Maths"] as const;

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

export function buildInitialChapterData(): ClassMap {
  const makeEmpty = (chapters: Record<string, string[]>) => {
    const subjectMap: Record<
      string,
      Record<
        string,
        {
          done: boolean;
          notesDone: boolean;
          moduleDone: boolean;
          revisions: number;
        }
      >
    > = {};
    for (const [subject, chList] of Object.entries(chapters)) {
      subjectMap[subject] = {};
      for (const ch of chList) {
        subjectMap[subject][ch] = {
          done: false,
          notesDone: false,
          moduleDone: false,
          revisions: 0,
        };
      }
    }
    return subjectMap;
  };
  return {
    class11: makeEmpty(CLASS_11_CHAPTERS),
    class12: makeEmpty(CLASS_12_CHAPTERS),
  };
}
