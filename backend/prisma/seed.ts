import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Smartway NEET & JEE database...');

  // 1. Clean existing records
  await prisma.notification.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.videoFavorite.deleteMany();
  await prisma.video.deleteMany();
  await prisma.personalTask.deleteMany();
  await prisma.studyPlanTask.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.flashcardAttempt.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.flashcardFolder.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.questionAttempt.deleteMany();
  await prisma.questionExplanation.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.noteFile.deleteMany();
  await prisma.note.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('smartway123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@smartway.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      adminProfile: {
        create: {
          fullName: 'Dr. Vikram Malhotra',
          department: 'Academic Dean & Content Director',
          permissions: 'ALL',
        },
      },
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@smartway.com',
      passwordHash: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      studentProfile: {
        create: {
          fullName: 'Aarav Sharma',
          targetExam: 'NEET',
          targetClass: 'CLASS_12',
          streakDays: 7,
          totalStudyMinutes: 840,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  const studentProfile = studentUser.studentProfile!;

  // 3. Create 4 Subjects
  const biology = await prisma.subject.create({
    data: {
      code: 'BIOLOGY',
      name: 'Biology',
      description: 'Botany & Zoology comprehensive curriculum for NEET with diagrams and NCERT alignment.',
      icon: 'Dna',
      color: '#10B981',
      orderIndex: 1,
    },
  });

  const chemistry = await prisma.subject.create({
    data: {
      code: 'CHEMISTRY',
      name: 'Chemistry',
      description: 'Physical, Inorganic, and Organic Chemistry with reaction mechanisms and periodic trends.',
      icon: 'FlaskConical',
      color: '#F59E0B',
      orderIndex: 2,
    },
  });

  const physics = await prisma.subject.create({
    data: {
      code: 'PHYSICS',
      name: 'Physics',
      description: 'Mechanics, Electromagnetism, Optics, and Modern Physics with numerical problem solving.',
      icon: 'Atom',
      color: '#4F46E5',
      orderIndex: 3,
    },
  });

  const mathematics = await prisma.subject.create({
    data: {
      code: 'MATHEMATICS',
      name: 'Mathematics',
      description: 'Calculus, Algebra, Coordinate Geometry, and Vectors designed for JEE Main & Advanced.',
      icon: 'Calculator',
      color: '#EC4899',
      orderIndex: 4,
    },
  });

  // 4. Create Chapters & Topics
  // Biology Chapters
  const bioCh1 = await prisma.chapter.create({
    data: {
      subjectId: biology.id,
      title: 'Principles of Inheritance & Variation (Genetics)',
      slug: 'principles-of-inheritance-variation',
      description: 'Mendelian principles, sex determination, genetic disorders, and chromosomal aberrations.',
      targetClass: 'CLASS_12',
      orderIndex: 1,
      topics: {
        create: [
          { title: "Mendel's Laws of Inheritance", orderIndex: 1 },
          { title: 'Incomplete Dominance & Co-dominance', orderIndex: 2 },
          { title: 'Linkage & Genetic Mapping', orderIndex: 3 },
          { title: 'Mendelian & Chromosomal Disorders', orderIndex: 4 },
        ],
      },
    },
    include: { topics: true },
  });

  const bioCh2 = await prisma.chapter.create({
    data: {
      subjectId: biology.id,
      title: 'Cell Cycle and Cell Division',
      slug: 'cell-cycle-and-cell-division',
      description: 'Phases of cell cycle, Mitosis, Meiosis, and regulation checkpoints.',
      targetClass: 'CLASS_11',
      orderIndex: 2,
      topics: {
        create: [
          { title: 'Phases of Cell Cycle (G1, S, G2, M)', orderIndex: 1 },
          { title: 'Mitosis and Cytokinesis', orderIndex: 2 },
          { title: 'Meiosis I and Meiosis II Crossing Over', orderIndex: 3 },
        ],
      },
    },
    include: { topics: true },
  });

  // Physics Chapters
  const phyCh1 = await prisma.chapter.create({
    data: {
      subjectId: physics.id,
      title: 'Current Electricity',
      slug: 'current-electricity',
      description: "Ohm's law, Kirchhoff's rules, Wheatstone bridge, potentiometer, and heating effects.",
      targetClass: 'CLASS_12',
      orderIndex: 1,
      topics: {
        create: [
          { title: 'Drift Velocity and Electric Current', orderIndex: 1 },
          { title: "Kirchhoff's Laws & Network Analysis", orderIndex: 2 },
          { title: 'Wheatstone Bridge & Meter Bridge', orderIndex: 3 },
          { title: 'Potentiometer and Internal Resistance', orderIndex: 4 },
        ],
      },
    },
    include: { topics: true },
  });

  const phyCh2 = await prisma.chapter.create({
    data: {
      subjectId: physics.id,
      title: 'Laws of Motion & Friction',
      slug: 'laws-of-motion-friction',
      description: "Newton's laws, free body diagrams, static/kinetic friction, and banked tracks.",
      targetClass: 'CLASS_11',
      orderIndex: 2,
      topics: {
        create: [
          { title: 'Free Body Diagrams & Equilibrium', orderIndex: 1 },
          { title: 'Newton Third Law and Momentum Conservation', orderIndex: 2 },
          { title: 'Friction on Inclined Planes & Banking', orderIndex: 3 },
        ],
      },
    },
    include: { topics: true },
  });

  // Chemistry Chapters
  const chemCh1 = await prisma.chapter.create({
    data: {
      subjectId: chemistry.id,
      title: 'Chemical Bonding and Molecular Structure',
      slug: 'chemical-bonding-molecular-structure',
      description: 'VSEPR theory, Hybridization, Molecular Orbital Theory, and Hydrogen bonding.',
      targetClass: 'CLASS_11',
      orderIndex: 1,
      topics: {
        create: [
          { title: 'Ionic vs Covalent Bonds & Dipole Moment', orderIndex: 1 },
          { title: 'VSEPR Theory & Molecular Geometry', orderIndex: 2 },
          { title: 'Hybridization (sp, sp2, sp3, sp3d, sp3d2)', orderIndex: 3 },
          { title: 'Molecular Orbital Theory (MOT) & Bond Order', orderIndex: 4 },
        ],
      },
    },
    include: { topics: true },
  });

  const chemCh2 = await prisma.chapter.create({
    data: {
      subjectId: chemistry.id,
      title: 'Aldehydes, Ketones and Carboxylic Acids',
      slug: 'aldehydes-ketones-carboxylic-acids',
      description: 'Nucleophilic addition, Aldol condensation, Cannizzaro reaction, and acidity trends.',
      targetClass: 'CLASS_12',
      orderIndex: 2,
      topics: {
        create: [
          { title: 'Nomenclature and Carbonyl Group Structure', orderIndex: 1 },
          { title: 'Aldol & Cross-Aldol Condensation Mechanisms', orderIndex: 2 },
          { title: 'Cannizzaro Reaction & Haloform Test', orderIndex: 3 },
          { title: 'Carboxylic Acid Reactions & Decarboxylation', orderIndex: 4 },
        ],
      },
    },
    include: { topics: true },
  });

  // Mathematics Chapters
  const mathCh1 = await prisma.chapter.create({
    data: {
      subjectId: mathematics.id,
      title: 'Definite Integrals and Area Under Curves',
      slug: 'definite-integrals-area-under-curves',
      description: 'Fundamental theorem of calculus, properties of definite integrals, and area calculation.',
      targetClass: 'CLASS_12',
      orderIndex: 1,
      topics: {
        create: [
          { title: 'King Property and Symmetry in Integrals', orderIndex: 1 },
          { title: "Leibniz's Rule for Differentiation Under Integral", orderIndex: 2 },
          { title: 'Area Enclosed Between Curves and Parabolas', orderIndex: 3 },
        ],
      },
    },
    include: { topics: true },
  });

  // 5. Create Notes & Attached Documents
  await prisma.note.create({
    data: {
      chapterId: bioCh1.id,
      topicId: bioCh1.topics[0]?.id,
      title: 'High-Yield Summary: Mendelian Genetics & Cross Patterns',
      summary: 'Essential rules, monohybrid/dihybrid ratios, test cross logic, and exceptions for NEET.',
      contentMarkdown: `# Mendelian Genetics: Core Principles & Formulas

## 1. Key Terminology
- **Allele:** Alternative forms of a gene occupying the same locus on homologous chromosomes.
- **Phenotypic Ratio (Monohybrid):** 3:1 (Dominant : Recessive)
- **Genotypic Ratio (Monohybrid):** 1:2:1 (TT : Tt : tt)
- **Dihybrid Phenotypic Ratio:** 9:3:3:1

> **NCERT High-Yield Note:**
> In incomplete dominance (e.g., *Mirabilis jalapa* / 4 o'clock plant), both phenotypic and genotypic ratios are identical: **1:2:1** (Red : Pink : White).

## 2. Test Cross Quick Formula
- A cross between an individual of unknown dominant genotype with the **homozygous recessive** parent.
- If all progeny show dominant phenotype $\\rightarrow$ Parent is homozygous dominant ($TT$).
- If 1:1 ratio is observed $\\rightarrow$ Parent is heterozygous ($Tt$).
`,
      allowDownload: true,
      viewsCount: 1420,
      files: {
        create: [
          {
            title: 'Genetics_Formula_Sheet_NEET.pdf',
            fileUrl: 'http://localhost:5000/uploads/sample-ncert-handbook.pdf',
            fileSizeBytes: 2450000,
            isDownloadable: true,
          },
        ],
      },
    },
  });

  await prisma.note.create({
    data: {
      chapterId: phyCh1.id,
      topicId: phyCh1.topics[1]?.id,
      title: "Mastering Kirchhoff's Laws & Nodal Analysis for NEET/JEE",
      summary: 'Comprehensive junction rule, loop rule sign conventions, and shortcut symmetry techniques.',
      contentMarkdown: `# Current Electricity: Kirchhoff's Laws & Network Theorems

## 1. Kirchhoff's First Law (KCL - Junction Rule)
$$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$$
- Based on the principle of **Conservation of Electric Charge**.
- Applicable at any circuit node.

## 2. Kirchhoff's Second Law (KVL - Loop Rule)
$$\\sum \\Delta V = 0 \\quad \\text{around any closed loop}$$
- Based on the principle of **Conservation of Energy**.
- Sign Convention:
  - Traversing in direction of current through resistor: $\\Delta V = -IR$
  - Traversing opposite to current: $\\Delta V = +IR$
  - Going from negative to positive terminal of cell: $\\Delta V = +E$

## 3. Wheatstone Bridge Condition
For a balanced bridge:
$$\\frac{R_1}{R_2} = \\frac{R_3}{R_4}$$
No current flows through galvanometer branch $I_g = 0$.
`,
      allowDownload: true,
      viewsCount: 2310,
      files: {
        create: [
          {
            title: 'Current_Electricity_Handwritten_Notes.pdf',
            fileUrl: 'http://localhost:5000/uploads/sample-ncert-handbook.pdf',
            fileSizeBytes: 3120000,
            isDownloadable: true,
          },
        ],
      },
    },
  });

  await prisma.note.create({
    data: {
      chapterId: chemCh1.id,
      topicId: chemCh1.topics[2]?.id,
      title: 'Hybridization & Molecular Geometry Cheat Sheet',
      summary: 'Steric number rule, lone pair repulsions, isoelectronic species, and MOT bond orders.',
      contentMarkdown: `# Chemical Bonding: Hybridization & Molecular Geometry

## Steric Number Formula
$$\\text{Steric Number} (SN) = \\frac{1}{2} [V + M - C + A]$$
- $V$ = Valence electrons of central atom
- $M$ = Monovalent bonded atoms (H, F, Cl, Br, I)
- $C$ = Cation charge
- $A$ = Anion charge

| Steric No. | Hybridization | Bond Angle | Shape (0 Lone Pairs) |
| :--- | :--- | :--- | :--- |
| 2 | $sp$ | 180° | Linear |
| 3 | $sp^2$ | 120° | Trigonal Planar |
| 4 | $sp^3$ | 109.5° | Tetrahedral |
| 5 | $sp^3d$ | 90°, 120° | Trigonal Bipyramidal |
| 6 | $sp^3d^2$ | 90° | Octahedral |
`,
      allowDownload: true,
      viewsCount: 1890,
      files: {
        create: [
          {
            title: 'Chemical_Bonding_Summary_NEET_JEE.pdf',
            fileUrl: 'http://localhost:5000/uploads/sample-ncert-handbook.pdf',
            fileSizeBytes: 1890000,
            isDownloadable: true,
          },
        ],
      },
    },
  });

  // 6. Create Questions (PYQs)
  // Question 1: Biology NEET 2023
  const q1 = await prisma.question.create({
    data: {
      subjectId: biology.id,
      chapterId: bioCh1.id,
      topicId: bioCh1.topics[0]?.id,
      content:
        'In a Mendelian dihybrid cross between round yellow seeded pea plants (RRYY) and wrinkled green seeded pea plants (rryy), what is the proportion of plants in F2 generation that are recombinant (new phenotypes)?',
      questionType: 'SINGLE_CHOICE',
      examType: 'NEET',
      examYear: 2023,
      difficulty: 'MEDIUM',
      marks: 4,
      negativeMarks: 1,
      options: {
        create: [
          { label: 'A', content: '9/16', isCorrect: false },
          { label: 'B', content: '6/16', isCorrect: true },
          { label: 'C', content: '10/16', isCorrect: false },
          { label: 'D', content: '1/16', isCorrect: false },
        ],
      },
      explanation: {
        create: {
          content:
            'In the F2 generation of a classic dihybrid cross, the phenotypic ratio is 9 (Round Yellow) : 3 (Round Green) : 3 (Wrinkled Yellow) : 1 (Wrinkled Green). The parental phenotypes are Round Yellow (9/16) and Wrinkled Green (1/16), totaling 10/16. The recombinant phenotypes are Round Green (3/16) + Wrinkled Yellow (3/16) = 6/16 (or 3/8).',
          formula: 'Recombinant Fraction = (3 + 3) / 16 = 6/16',
        },
      },
    },
    include: { options: true },
  });

  // Question 2: Physics NEET 2022
  const q2 = await prisma.question.create({
    data: {
      subjectId: physics.id,
      chapterId: phyCh1.id,
      topicId: phyCh1.topics[0]?.id,
      content:
        'A copper wire of length L and cross-sectional area A has resistance R. If the wire is stretched uniformly such that its length increases by 20%, what is the new resistance of the wire assuming density remains constant?',
      questionType: 'SINGLE_CHOICE',
      examType: 'NEET',
      examYear: 2022,
      difficulty: 'MEDIUM',
      marks: 4,
      negativeMarks: 1,
      options: {
        create: [
          { label: 'A', content: '1.20 R', isCorrect: false },
          { label: 'B', content: '1.44 R', isCorrect: true },
          { label: 'C', content: '1.10 R', isCorrect: false },
          { label: 'D', content: '0.84 R', isCorrect: false },
        ],
      },
      explanation: {
        create: {
          content:
            'When a wire is stretched, its volume $V = A \\times L$ remains constant. Therefore, if length becomes $L\' = 1.2 L$, the cross-sectional area must decrease to $A\' = A / 1.2$. Since resistance $R = \\rho \\frac{L}{A}$, the new resistance $R\' = \\rho \\frac{1.2 L}{A / 1.2} = 1.2^2 \\left(\\rho \\frac{L}{A}\\right) = 1.44 R$.',
          formula: 'R\' = R (L\'/L)^2 = R (1.2)^2 = 1.44 R',
        },
      },
    },
    include: { options: true },
  });

  // Question 3: Chemistry JEE Main 2023
  const q3 = await prisma.question.create({
    data: {
      subjectId: chemistry.id,
      chapterId: chemCh1.id,
      topicId: chemCh1.topics[3]?.id,
      content:
        'According to Molecular Orbital Theory (MOT), which of the following species has the highest bond order and is diamagnetic?',
      questionType: 'SINGLE_CHOICE',
      examType: 'JEE_MAIN',
      examYear: 2023,
      difficulty: 'HARD',
      marks: 4,
      negativeMarks: 1,
      options: {
        create: [
          { label: 'A', content: 'O2+', isCorrect: false },
          { label: 'B', content: 'N2', isCorrect: true },
          { label: 'C', content: 'C2', isCorrect: false },
          { label: 'D', content: 'O2-', isCorrect: false },
        ],
      },
      explanation: {
        create: {
          content:
            'N2 has 14 electrons: $\\sigma_{1s}^2 \\sigma_{1s}^{*2} \\sigma_{2s}^2 \\sigma_{2s}^{*2} (\\pi_{2p_x}^2 = \\pi_{2p_y}^2) \\sigma_{2p_z}^2$. Bond order = (10 - 4)/2 = 3. All electrons are paired, making it completely diamagnetic. O2+ has bond order 2.5 (paramagnetic), C2 has bond order 2.0 (diamagnetic), and O2- has bond order 1.5 (paramagnetic).',
          formula: 'Bond Order = 1/2 * (N_b - N_a)',
        },
      },
    },
    include: { options: true },
  });

  // Question 4: Mathematics JEE Main 2022
  const q4 = await prisma.question.create({
    data: {
      subjectId: mathematics.id,
      chapterId: mathCh1.id,
      topicId: mathCh1.topics[0]?.id,
      content:
        'Evaluate the value of the definite integral: I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx.',
      questionType: 'SINGLE_CHOICE',
      examType: 'JEE_MAIN',
      examYear: 2022,
      difficulty: 'MEDIUM',
      marks: 4,
      negativeMarks: 1,
      options: {
        create: [
          { label: 'A', content: 'pi / 2', isCorrect: false },
          { label: 'B', content: 'pi / 4', isCorrect: true },
          { label: 'C', content: 'pi', isCorrect: false },
          { label: 'D', content: '1', isCorrect: false },
        ],
      },
      explanation: {
        create: {
          content:
            'Using the King Property: $\\int_a^b f(x) dx = \\int_a^b f(a + b - x) dx$. Here $f(\\pi/2 - x) = \\frac{\\cos^3 x}{\\cos^3 x + \\sin^3 x}$. Adding $I + I = \\int_0^{\\pi/2} 1 dx = \\pi/2$. Hence $2I = \\pi/2 \\Rightarrow I = \\pi/4$.',
          formula: 'I = (b - a)/2 = (pi/2 - 0)/2 = pi/4',
        },
      },
    },
    include: { options: true },
  });

  // 7. Seed Student Bookmarks (3 Categories: MISTAKE, REVISE_LATER, IMPORTANT)
  await prisma.bookmark.create({
    data: {
      studentId: studentProfile.id,
      questionId: q1.id,
      category: 'MISTAKE',
      notes: 'Remember to exclude parental types when question asks for recombinant frequency!',
    },
  });

  await prisma.bookmark.create({
    data: {
      studentId: studentProfile.id,
      questionId: q2.id,
      category: 'IMPORTANT',
      notes: 'Wire stretching formula: resistance scales with L^2 because volume is conserved.',
    },
  });

  await prisma.bookmark.create({
    data: {
      studentId: studentProfile.id,
      questionId: q3.id,
      category: 'REVISE_LATER',
      notes: 'Review 14-electron vs 16-electron MOT orbital ordering before mock test.',
    },
  });

  // 8. Seed Student Question Attempt
  await prisma.questionAttempt.create({
    data: {
      studentId: studentProfile.id,
      questionId: q1.id,
      selectedOptionIds: JSON.stringify([q1.options.find((o) => o.isCorrect)?.id]),
      isCorrect: true,
      timeSpentSeconds: 42,
    },
  });

  // 9. Seed Interactive Flashcards with SRS
  const folderBio = await prisma.flashcardFolder.create({
    data: {
      studentId: studentProfile.id,
      name: 'High-Yield Genetics',
      color: '#10B981',
    },
  });

  const folderPhy = await prisma.flashcardFolder.create({
    data: {
      studentId: studentProfile.id,
      name: 'Formulas: Current & Circuits',
      color: '#4F46E5',
    },
  });

  await prisma.flashcard.create({
    data: {
      studentId: studentProfile.id,
      folderId: folderBio.id,
      chapterId: bioCh1.id,
      frontContent: 'What is the phenotypic and genotypic ratio in incomplete dominance (Mirabilis jalapa)?',
      backContent: 'Phenotypic: 1 Red : 2 Pink : 1 White (1:2:1)\nGenotypic: 1 RR : 2 Rr : 1 rr (1:2:1)',
      hint: 'Both ratios are identical and non-Mendelian.',
      masteryLevel: 3,
    },
  });

  await prisma.flashcard.create({
    data: {
      studentId: studentProfile.id,
      folderId: folderPhy.id,
      chapterId: phyCh1.id,
      frontContent: 'What is the relationship between Drift Velocity (v_d) and Electric Field (E)?',
      backContent: 'v_d = (e * E * tau) / m, where e is electron charge, tau is relaxation time, and m is mass of electron.',
      hint: 'Mobility mu = v_d / E',
      masteryLevel: 2,
    },
  });

  await prisma.flashcard.create({
    data: {
      studentId: studentProfile.id,
      folderId: folderBio.id,
      chapterId: bioCh1.id,
      frontContent: 'Which genetic disorder is caused by trisomy of chromosome 21?',
      backContent: "Down's Syndrome (47, XX +21 or 47, XY +21). First described by Langdon Down in 1866.",
      hint: 'Autosomal aneuploidy.',
      masteryLevel: 4,
    },
  });

  // 10. Seed Study Plans (Platform-Curated & Personal Tasks)
  const masterPlan = await prisma.studyPlan.create({
    data: {
      title: '90-Day NEET Ultimate Sprint & Revision',
      description: 'Systematic daily roadmap covering Class 11 & 12 NCERT high-yield topics, formulas, and PYQs.',
      targetExam: 'NEET',
      durationWeeks: 12,
      isPublished: true,
      tasks: {
        create: [
          {
            dayNumber: 1,
            subjectCode: 'BIOLOGY',
            chapterName: 'Principles of Inheritance & Variation',
            taskType: 'STUDY',
            title: "Study Mendel's Laws & Dihybrid Cross Summary Notes",
            durationMin: 60,
          },
          {
            dayNumber: 1,
            subjectCode: 'PHYSICS',
            chapterName: 'Current Electricity',
            taskType: 'PYQ_PRACTICE',
            title: 'Solve 25 Previous Year Questions on Kirchhoff Laws',
            durationMin: 75,
          },
          {
            dayNumber: 2,
            subjectCode: 'CHEMISTRY',
            chapterName: 'Chemical Bonding and Molecular Structure',
            taskType: 'STUDY',
            title: 'Master MOT and Hybridization Shortcuts',
            durationMin: 60,
          },
        ],
      },
    },
  });

  // Seed Student Personal Tasks
  await prisma.personalTask.create({
    data: {
      studentId: studentProfile.id,
      title: 'Revise Genetics recombinant frequency formula',
      subjectCode: 'BIOLOGY',
      chapterName: 'Principles of Inheritance & Variation',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedMinutes: 30,
      priority: 'HIGH',
      isCompleted: false,
    },
  });

  await prisma.personalTask.create({
    data: {
      studentId: studentProfile.id,
      title: 'Practice 20 Numerical Questions on Stretched Wire Resistance',
      subjectCode: 'PHYSICS',
      chapterName: 'Current Electricity',
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      estimatedMinutes: 45,
      priority: 'MEDIUM',
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  await prisma.personalTask.create({
    data: {
      studentId: studentProfile.id,
      title: 'Flashcard Drill: 30 high-yield formulas',
      subjectCode: 'CHEMISTRY',
      chapterName: 'Chemical Bonding and Molecular Structure',
      dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
      estimatedMinutes: 20,
      priority: 'LOW',
      isCompleted: false,
    },
  });

  // 11. Seed Educational Videos (Reels / Shorts and Full Video Lectures)
  await prisma.video.create({
    data: {
      subjectId: biology.id,
      chapterId: bioCh1.id,
      title: '30-Sec Hack: Solve Dihybrid Cross Ratios Instantly',
      description: 'Quick memory mnemonic for 9:3:3:1 phenotypic ratios and recombinant calculations for NEET.',
      videoType: 'SHORT',
      durationSeconds: 34,
      videoUrl: 'https://www.youtube.com/shorts/W42bT_P6r7M',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
      viewsCount: 4820,
    },
  });

  await prisma.video.create({
    data: {
      subjectId: physics.id,
      chapterId: phyCh1.id,
      title: 'Kirchhoff Loop Sign Convention in 35 Seconds',
      description: 'Never make another sign error in KVL circuit equations with this intuitive water flow analogy.',
      videoType: 'SHORT',
      durationSeconds: 36,
      videoUrl: 'https://www.youtube.com/shorts/3O_QvWfH3x0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
      viewsCount: 6150,
    },
  });

  await prisma.video.create({
    data: {
      subjectId: chemistry.id,
      chapterId: chemCh1.id,
      title: 'MOT Bond Order Shortcut: The 14-Electron Peak',
      description: 'Draw any diatomic bond order without drawing the full molecular orbital diagram.',
      videoType: 'SHORT',
      durationSeconds: 32,
      videoUrl: 'https://www.youtube.com/shorts/qL4T44c_kFc',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
      viewsCount: 3940,
    },
  });

  // Seed Full-Length Classroom Lectures (Full Videos)
  await prisma.video.create({
    data: {
      subjectId: physics.id,
      chapterId: phyCh1.id,
      title: 'Complete Current Electricity Masterclass: Ohm to Potentiometer (Full Lecture)',
      description: 'Comprehensive 45-minute deep-dive covering Drift Velocity, Kirchhoffs Laws, Wheatstone Bridge, and NEET/JEE Advanced numericals.',
      videoType: 'FULL',
      durationSeconds: 2700, // 45 minutes
      videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
      viewsCount: 12450,
    },
  });

  await prisma.video.create({
    data: {
      subjectId: biology.id,
      chapterId: bioCh1.id,
      title: 'Principles of Inheritance & Variation: NCERT Line-by-Line Full Lecture',
      description: 'Complete 52-minute visual lecture covering Mendelian Genetics, Incomplete Dominance, Chromosomal Theory, and Pedigree Analysis for NEET 2026.',
      videoType: 'FULL',
      durationSeconds: 3120, // 52 minutes
      videoUrl: 'https://www.youtube.com/watch?v=8m6hHRlKwxY',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
      viewsCount: 18900,
    },
  });

  await prisma.video.create({
    data: {
      subjectId: mathematics.id,
      chapterId: mathCh1.id,
      title: 'Definite Integrals & Leibniz Rule Complete JEE Advanced Marathon',
      description: '60-minute intensive problem-solving session breaking down King and Queen properties with 10 past JEE Advanced derivations.',
      videoType: 'FULL',
      durationSeconds: 3600, // 60 minutes
      videoUrl: 'https://www.youtube.com/watch?v=5Vkg1Y5p83w',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      viewsCount: 15300,
    },
  });

  // 12. Seed User Telemetry
  await prisma.userActivity.create({
    data: {
      studentId: studentProfile.id,
      actionType: 'ATTEMPT_QUESTION',
      title: 'Solved NEET 2023 Genetics Question',
      metadata: JSON.stringify({ questionId: q1.id, isCorrect: true }),
    },
  });

  await prisma.userActivity.create({
    data: {
      studentId: studentProfile.id,
      actionType: 'VIEW_NOTE',
      title: 'Reviewed Mendelian Genetics Summary Note',
      metadata: JSON.stringify({ chapterId: bioCh1.id }),
    },
  });

  console.log('Database seeded successfully with authentic NEET & JEE curriculum!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

