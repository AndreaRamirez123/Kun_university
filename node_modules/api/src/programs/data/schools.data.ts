export interface Course {
  code: string;
  title: string;
  credits: number;
}

export interface Semester {
  number: number;
  courses: Course[];
}

export interface Program {
  name: string;
  degree: string;
  totalCredits: number;
  semesters?: Semester[];
}

export interface Localized {
  es: string;
  en: string;
}

export interface School {
  slug: string;
  name: Localized;
  tagline: Localized;
  programs: Program[];
}

export const schools: School[] = [
  {
    slug: 'ingenieria',
    name: { es: 'Escuela de Ingeniería', en: 'School of Engineering' },
    tagline: {
      es: 'Donde se construye la infraestructura del mundo digital: datos, inteligencia artificial y ciberseguridad.',
      en: 'Where the infrastructure of the digital world is built: data, artificial intelligence and cybersecurity.',
    },
    programs: [
      {
        name: 'Cybersecurity',
        degree: 'BS',
        totalCredits: 120,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'GEN124', title: 'English Composition', credits: 4 },
              { code: 'MGF130', title: 'Mathematical Thinking', credits: 4 },
              { code: 'MTH122', title: 'Programming introduction', credits: 4 },
              { code: 'GEN110', title: 'Universe; Land and Life', credits: 4 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'MTH123', title: 'College Algebra', credits: 4 },
              { code: 'GEN112', title: 'Universe Environmental Science and Social Impact', credits: 4 },
              { code: 'SOC122', title: 'Introduction of Sociology', credits: 4 },
              { code: 'GEN201', title: 'Human to Human Relationship', credits: 4 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'GE203', title: 'Human to Machine', credits: 4 },
              { code: 'CTS110', title: 'Digital Literacy and Productivity', credits: 3 },
              { code: 'COP100', title: 'Programming Fundamentals', credits: 3 },
              { code: 'MAD214', title: 'Discrete Mathematics', credits: 3 },
              { code: 'CNT200', title: 'Networking Fundamentals', credits: 3 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'CDA201', title: 'Computer Systems and Architecture', credits: 3 },
              { code: 'COP233', title: 'Object-Oriented Programming', credits: 3 },
              { code: 'CIS325', title: 'Cybersecurity Foundations', credits: 3 },
              { code: 'CIS336', title: 'Linux and Systems Administration', credits: 3 },
              { code: 'COP371', title: 'Database Systems', credits: 3 },
            ],
          },
          {
            number: 5,
            courses: [
              { code: 'CIS321', title: 'Technical and Ethical Hacking', credits: 3 },
              { code: 'CIS338', title: 'Network Defense', credits: 3 },
              { code: 'CIS434', title: 'Secure Scripting and Automation', credits: 3 },
              { code: 'CIS435', title: 'Applied Cryptography', credits: 3 },
              { code: 'CIS423', title: 'Governance and Policy', credits: 3 },
            ],
          },
          {
            number: 6,
            courses: [
              { code: 'CIS322', title: 'Digital Forensics & Investigation', credits: 3 },
              { code: 'CIS421', title: 'Ethical Hacking and Penetration Testing', credits: 3 },
              { code: 'CIS426', title: 'Cloud Security', credits: 3 },
              { code: 'CIS432', title: 'Identity and Access Management', credits: 3 },
              { code: 'CIS430', title: 'Governance, Risk, and Compliance', credits: 3 },
            ],
          },
          {
            number: 7,
            courses: [
              { code: 'CIS442', title: 'Security Architecture', credits: 3 },
              { code: 'CIS445', title: 'Development, Security, and Operations (DevSecOps)', credits: 3 },
              { code: 'CIS422', title: 'AI & Advanced Technology', credits: 3 },
              { code: 'CIS425', title: 'Security Operations and Incident Response', credits: 3 },
              { code: 'CIS491', title: 'Cybersecurity Capstone I', credits: 3 },
            ],
          },
          {
            number: 8,
            courses: [
              { code: 'CIS437', title: 'Digital Forensics', credits: 3 },
              { code: 'CIS447', title: 'Industrial and IoT Security', credits: 3 },
              { code: 'CIS424', title: 'Cybersecurity Industry Specialized', credits: 3 },
              { code: 'CIS492', title: 'Cybersecurity Capstone II', credits: 3 },
            ],
          },
        ],
      },
      {
        name: 'Data Science & Applied AI',
        degree: 'BS',
        totalCredits: 120,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'ENC101', title: 'English Composition', credits: 4 },
              { code: 'MGF130', title: 'Mathematical Thinking', credits: 4 },
              { code: 'MTH122', title: 'Programming introduction', credits: 4 },
              { code: 'GEN110', title: 'Universe; Land and Life', credits: 4 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'MTH123', title: 'College Algebra', credits: 4 },
              { code: 'GEN112', title: 'Universe Environmental Science and Social Impact', credits: 4 },
              { code: 'SOC122', title: 'Introduction of Sociology', credits: 4 },
              { code: 'GEN201', title: 'Human to Human Relationship', credits: 4 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'GEN203', title: 'Human to Machine', credits: 4 },
              { code: 'CTS110', title: 'Digital Literacy and Productivity', credits: 3 },
              { code: 'COP100', title: 'Programming Fundamentals', credits: 3 },
              { code: 'MAD210', title: 'Discrete Mathematics', credits: 3 },
              { code: 'MAP230', title: 'Calculus I for Data Science', credits: 3 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'COP233', title: 'Object-Oriented Programming', credits: 3 },
              { code: 'COP280', title: 'Data Structures', credits: 3 },
              { code: 'STA302', title: 'Applied Probability', credits: 3 },
              { code: 'DSC300', title: 'Data Management and SQL', credits: 3 },
              { code: 'DSC302', title: 'Exploratory Data Analysis', credits: 3 },
            ],
          },
          {
            number: 5,
            courses: [
              { code: 'DSC301', title: 'Data Visualization', credits: 3 },
              { code: 'TBD303', title: 'Data Mining & Statistical Learning', credits: 3 },
              { code: 'DSC410', title: 'Machine Learning I', credits: 3 },
              { code: 'DSC411', title: 'Data Mining', credits: 3 },
              { code: 'DSC413', title: 'Business Intelligence Systems', credits: 3 },
            ],
          },
          {
            number: 6,
            courses: [
              { code: 'DSC420', title: 'Machine Learning II', credits: 3 },
              { code: 'DSC422', title: 'Cloud Data Engineering', credits: 3 },
              { code: 'DSC423', title: 'Optimization for Analytics', credits: 3 },
              { code: 'DSC412', title: 'Responsible AI and Data Ethics', credits: 3 },
              { code: 'TBD305', title: 'Explainable AI & Ethics (XAI)', credits: 3 },
            ],
          },
          {
            number: 7,
            courses: [
              { code: 'TBD404', title: 'Deep Learning', credits: 3 },
              { code: 'DSC421', title: 'Natural Language Processing (NLP)', credits: 3 },
              { code: 'DSC432', title: 'Applied Research Methods', credits: 3 },
              { code: 'DSC424', title: 'Natural Language Processing II', credits: 3 },
              { code: 'DSC491', title: 'Data Science Capstone I', credits: 3 },
            ],
          },
          {
            number: 8,
            courses: [
              { code: 'DSC430', title: 'Applied Deep Learning', credits: 3 },
              { code: 'TBD406', title: 'Machine Learning Operations (MLOps)', credits: 3 },
              { code: 'DSC431', title: 'MLOps and Model Deployment', credits: 3 },
              { code: 'DSC492', title: 'Data Science Capstone II', credits: 3 },
            ],
          },
        ],
      },
      {
        name: 'Artificial Intelligence Engineering',
        degree: 'MSAIE',
        totalCredits: 45,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'MSAIE500', title: 'Applied Artificial Intelligence and Machine Learning', credits: 3 },
              { code: 'MSAIE501', title: 'Statistical Learning and Data-Driven Decision Making', credits: 3 },
              { code: 'MSAIE502', title: 'Cloud, Network and Edge Infrastructure Engineering', credits: 3 },
              {
                code: 'MSAIE504',
                title: 'Graduate Engineering Technology Studio I: Industry Challenge',
                credits: 2,
              },
            ],
          },
          {
            number: 2,
            courses: [
              {
                code: 'MSAIE503',
                title: 'Cybersecurity Governance, Risk and Compliance for AI Systems',
                credits: 3,
              },
              { code: 'RES601', title: 'Quantitative and Qualitative Research Methods', credits: 3 },
              { code: 'MSAIE600', title: 'Generative AI, MLOps and Responsible AI Engineering', credits: 3 },
              {
                code: 'MSAIE602',
                title: 'Enterprise Data Architecture, DataOps and Knowledge Graphs',
                credits: 3,
              },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'MSAIE601', title: 'AI-Enabled Cyber Defense and Threat Intelligence', credits: 3 },
              {
                code: 'MSAIE603',
                title: 'Digital Transformation Strategy and Technology Portfolio Management',
                credits: 3,
              },
              { code: 'MSAIE610', title: 'Advanced Software Architecture for AI-Driven Systems', credits: 3 },
              {
                code: 'MSAIE604',
                title: 'Graduate Engineering Technology Studio II: Prototype and Validation',
                credits: 2,
              },
            ],
          },
          {
            number: 4,
            courses: [
              {
                code: 'MSAIE611',
                title: 'Systems Engineering, Innovation and Technology Commercialization',
                credits: 3,
              },
              {
                code: 'MSAIE612',
                title: 'Special Topics: AI Policy, Privacy, Ethics and Assurance',
                credits: 3,
              },
              { code: 'MSAIE620', title: 'Capstone: AI-Secured Digital Transformation Project', credits: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'transformacion-de-negocios',
    name: { es: 'Escuela de Transformación de Negocios', en: 'School of Business Transformation' },
    tagline: {
      es: 'Para quienes quieren liderar organizaciones, no solo administrarlas.',
      en: 'For those who want to lead organizations, not just manage them.',
    },
    programs: [
      {
        name: 'Business Management and Entrepreneurship',
        degree: 'BS',
        totalCredits: 120,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'ENC101', title: 'English Composition', credits: 4 },
              { code: 'MTH120', title: 'Mathematical Thinking', credits: 4 },
              { code: 'MTH122', title: 'Programming Introduction', credits: 4 },
              { code: 'GEN110', title: 'Universe; Land and Life', credits: 4 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'MTH123', title: 'College Algebra', credits: 4 },
              { code: 'GEN112', title: 'Universe Environmental Science and Social Impact', credits: 4 },
              { code: 'SOC122', title: 'Introduction of Sociology', credits: 4 },
              { code: 'GEN201', title: 'Human to Human Relationship', credits: 4 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'GEN203', title: 'Human to Machine', credits: 4 },
              { code: 'MAN201', title: 'Management and Organizational Behavior', credits: 3 },
              { code: 'ECO221', title: 'Microeconomics', credits: 3 },
              { code: 'STA231', title: 'Statistical Methods', credits: 3 },
              { code: 'LDR210', title: 'Self-Management and Introspective Leadership', credits: 3 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'ACC211', title: 'Financial Accounting for Decision Making', credits: 3 },
              { code: 'ECO222', title: 'Macroeconomics', credits: 3 },
              { code: 'MKT311', title: 'Digital Marketing and Consumer Analytics', credits: 3 },
              { code: 'BIS312', title: 'Business Intelligence and Data Visualization', credits: 3 },
              { code: 'INN351', title: 'Agile Methodologies and Disruptive Innovation', credits: 3 },
            ],
          },
          {
            number: 5,
            courses: [
              { code: 'FIN321', title: 'Corporate Financial Management', credits: 3 },
              { code: 'BUL331', title: 'Legal Environment and Business Ethics', credits: 3 },
              { code: 'OPS341', title: 'Operations and Supply Chain Management', credits: 3 },
              { code: 'ENT352', title: 'Business Model Design and Validation (Lean Startup)', credits: 3 },
              { code: 'MKT470', title: 'Selling and Advanced Sales Strategy', credits: 3 },
            ],
          },
          {
            number: 6,
            courses: [
              { code: 'FIN422', title: 'Startup Finance: Venture Capital and Fundraising', credits: 3 },
              { code: 'BIS423', title: 'Artificial Intelligence for Business', credits: 3 },
              {
                code: 'LDR424',
                title: 'Organizational Culture and High-Performance Team Management',
                credits: 3,
              },
              { code: 'MKT425', title: 'Growth Strategies (Growth Hacking) and Branding', credits: 3 },
              { code: 'COM461', title: 'Critical Thinking, Negotiation, and Conflict Resolution', credits: 3 },
            ],
          },
          {
            number: 7,
            courses: [
              { code: 'LDR411', title: 'Change Management and Transformational Leadership', credits: 3 },
              { code: 'BIS451', title: 'Digital Strategy and Technological Transformation', credits: 3 },
              { code: 'BUS453', title: 'Global Business and Emerging Markets', credits: 3 },
              { code: 'PRC471', title: 'Professional Internship or Consulting Project', credits: 3 },
              { code: 'CAP481', title: 'Capstone I: Transformation Plan or Startup Development', credits: 6 },
            ],
          },
          {
            number: 8,
            courses: [
              { code: 'ENT452', title: 'Entrepreneurship Ecosystems and Social Innovation', credits: 3 },
              { code: 'CAP482', title: 'Capstone II: Implementation, Investor Pitch, and Defense', credits: 6 },
            ],
          },
        ],
      },
      {
        name: 'Management and Entrepreneurship',
        degree: 'MSME',
        totalCredits: 45,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'MSME500', title: 'Managerial Accounting and Financial Intelligence', credits: 3 },
              { code: 'MSME501', title: 'Managerial Economics & Market Strategy', credits: 3 },
              { code: 'MSME502', title: 'Marketing strategy, sales & Customer Discovery', credits: 3 },
              { code: 'MSME503', title: 'Operations, Systems and Automation', credits: 3 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'MSME504', title: 'Business Analytics & AI Decision Support', credits: 3 },
              { code: 'RES601', title: 'Quantitative and Qualitative Research Methods', credits: 3 },
              { code: 'MSME600', title: 'Self-Knowledge & Leadership Operating System', credits: 3 },
              { code: 'MSME610', title: 'Opportunity Design & Innovation', credits: 3 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'MSME611', title: 'Financial Modeling', credits: 3 },
              { code: 'MSME612', title: 'Venture Finance, Risk & Funding Strategy', credits: 3 },
              { code: 'MSME601', title: 'Organizational Behavior, Hiring and Culture', credits: 2 },
              { code: 'MSME602', title: 'Strategic Management & Global Dynamics', credits: 2 },
              { code: 'MSME603', title: 'Communication, Negotiation and Influence', credits: 2 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'MSME613', title: 'Scaling, Sales Systems & Growth Execution', credits: 3 },
              { code: 'MSME620', title: 'Capstone Project', credits: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'bienestar-y-desarrollo-humano',
    name: { es: 'Escuela de Bienestar y Desarrollo Humano', en: 'School of Wellness and Human Development' },
    tagline: {
      es: 'La ciencia de vivir más y mejor, convertida en una industria de miles de millones de dólares.',
      en: 'The science of living longer and better, turned into a multi-billion dollar industry.',
    },
    programs: [
      {
        name: 'Integrative Wellness and Human Performance',
        degree: 'AAS',
        totalCredits: 60,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'ENGL101', title: 'English Composition I', credits: 3 },
              { code: 'MATH115', title: 'Quantitative Reasoning & Problem Solving', credits: 3 },
              { code: 'WELL101', title: 'Foundations of Integrative Wellness & Spa', credits: 3 },
              { code: 'BIOL110', title: 'Applied Anatomy & Physiology for Wellness', credits: 3 },
              { code: 'SAFE105', title: 'Safety, First Aid, & Biosecurity Standards', credits: 3 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'PSYC101', title: 'Introduction to Psychology', credits: 3 },
              { code: 'COMM120', title: 'Public Speaking & Professional Comm.', credits: 3 },
              { code: 'STAT200', title: 'Introduction to Statistical Analysis', credits: 3 },
              { code: 'WELL120', title: 'Epigenetic Nutrition & Metabolic Health', credits: 3 },
              { code: 'WELL140', title: 'Mind-Body Health & Stress Physiology', credits: 3 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'KINE150', title: 'Kinesiology & Functional Biomechanics', credits: 3 },
              { code: 'WELL210', title: 'Applied Neuroscience of Comfort & Sleep', credits: 3 },
              { code: 'WELL240', title: 'Integrative Bodywork & Thermal Modalities', credits: 3 },
              { code: 'CORP210', title: 'Ergonomics & Corporate Wellbeing Design', credits: 3 },
              { code: 'ETHC200', title: 'Ethics & Professional Wellness Standards', credits: 2 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'KINE220', title: 'Postural Analysis & Movement Optimization', credits: 3 },
              { code: 'WELL230', title: 'Biohacking & Digital Health Technology', credits: 3 },
              { code: 'BUSN220', title: 'Wellness Business Management & Marketing', credits: 3 },
              { code: 'TOUR250', title: 'Global Wellness Tourism & Hospitality', credits: 3 },
              { code: 'CAPS299', title: 'Wellness Residency (Capstone Project)', credits: 4 },
            ],
          },
        ],
      },
      {
        name: 'Aging Sciences and Health Management',
        degree: 'BS',
        totalCredits: 120,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'GEN124', title: 'English Composition', credits: 4 },
              { code: 'MGF130', title: 'Mathematical Thinking', credits: 4 },
              { code: 'MATH122', title: 'Programming introduction', credits: 4 },
              { code: 'GEN110', title: 'Universe; Land and Life', credits: 4 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'MTH123', title: 'College Algebra', credits: 4 },
              { code: 'GEN112', title: 'Universe Environmental Science and Social Impact', credits: 4 },
              { code: 'SOC122', title: 'Introduction of Sociology', credits: 4 },
              { code: 'GEN201', title: 'Human to Human Relationship', credits: 4 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'GEN203', title: 'Human to Machine', credits: 4 },
              { code: 'GEY200', title: 'Introduction to Social Gerontology', credits: 3 },
              { code: 'BSC208', title: 'Biology of Aging for Non-Clinicians', credits: 3 },
              { code: 'DEP200', title: 'Psychology of Aging & Mental Wellness', credits: 3 },
              { code: 'SYG201', title: 'Diversity and Aging in the 21st Century', credits: 3 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'HSA311', title: 'US Health Care Systems & Policy', credits: 3 },
              { code: 'HSC240', title: 'Physical Wellness & Active Aging Programs', credits: 3 },
              { code: 'PHI263', title: 'Legal and Ethical Issues in Gerontology', credits: 3 },
              { code: 'STA202', title: 'Research Methods in Aging Studies', credits: 3 },
              { code: 'HUN301', title: 'Nutrition and Dietetics for Older Adults', credits: 3 },
            ],
          },
          {
            number: 5,
            courses: [
              { code: 'PHC410', title: 'Public Health Indicators in Aging Populations', credits: 3 },
              { code: 'HSA320', title: 'Health Care Leadership and Human Resources', credits: 3 },
              { code: 'HSA315', title: 'Financial Management for Health Care Organizations', credits: 3 },
              { code: 'GEY350', title: 'Technology and Aging (Gerontechnology)', credits: 3 },
              { code: 'HSC310', title: 'Chronic Disease Management & Health Coaching', credits: 3 },
            ],
          },
          {
            number: 6,
            courses: [
              { code: 'HSC450', title: 'Epidemiology and Prevention in Older Adults', credits: 3 },
              { code: 'ECP300', title: 'Longevity and the "Silver Economy"', credits: 3 },
              { code: 'MAR302', title: 'Marketing Wellness Programs for the 50+ Demographic', credits: 3 },
              { code: 'COM320', title: 'Communication Disorders in Aging', credits: 3 },
              { code: 'PHC430', title: 'Global Perspectives on Aging Populations', credits: 3 },
            ],
          },
          {
            number: 7,
            courses: [
              { code: 'HSA417', title: 'Management of Long-Term Care Facilities', credits: 3 },
              { code: 'HSA413', title: 'Health Law and Compliance for Aging Centers', credits: 3 },
              { code: 'HSA419', title: 'Health Care Risk Management', credits: 3 },
              { code: 'SOW410', title: 'Grief, Loss, and Bereavement Counseling', credits: 3 },
              { code: 'HSA494', title: 'Virtual Internship', credits: 3 },
            ],
          },
          {
            number: 8,
            courses: [
              { code: 'HSA425', title: 'Quality Improvement in Senior Housing', credits: 3 },
              { code: 'GEY415', title: 'Public Policy and Advocacy for Seniors', credits: 3 },
              { code: 'HSA485', title: 'Capstone: Planning for Geriatric Centers', credits: 6 },
            ],
          },
        ],
      },
      {
        name: 'Applied Neuroscience',
        degree: 'MS',
        totalCredits: 39,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'ANHW501', title: 'Neuro-Strategy & Organizational Foundations', credits: 3 },
              { code: 'ANHW502', title: 'Neurobiology of Emotional Intelligence', credits: 3 },
              { code: 'ANHW503', title: 'Neuroeconomics & Strategic Decision-Making', credits: 3 },
              { code: 'RES601', title: 'Quantitative and Qualitative Research Methods', credits: 3 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'ANHW601', title: 'Executive Brain: Agility & Complex Problem Solving', credits: 3 },
              { code: 'ANHW602', title: 'Neuroplasticity & Cultural Transformation', credits: 3 },
              { code: 'ANHW603', title: 'Neuroscience of Peak Performance & Flow', credits: 3 },
              { code: 'ANHW610', title: 'Neurotechnology & AI for Executive Optimization', credits: 3 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'ANHW611', title: 'Predictive Behavioral Data Analytics', credits: 3 },
              { code: 'ANHW612', title: 'Neuro-Marketing & Digital Influence Dynamics', credits: 3 },
              { code: 'ANHW620', title: 'Neuro-Leadership & High-Performance Teams', credits: 3 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'ANHW621', title: 'Biohacking for CEOs & Human Optimization', credits: 3 },
              { code: 'ANHW699', title: 'Strategic Capstone: Neuro-Innovation Lab', credits: 3 },
            ],
          },
        ],
      },
      {
        name: 'Strategic Leadership for Aging Services & Vitality Stewardship',
        degree: 'MS',
        totalCredits: 39,
        semesters: [
          {
            number: 1,
            courses: [
              { code: 'SLVS501', title: 'Strategic Management in the Longevity Economy', credits: 3 },
              { code: 'SLVS502', title: 'Digital Vitality & Wellness Tech Strategy', credits: 3 },
              { code: 'SLVS505', title: 'Vitality Policy, Wellness Regulations & Law', credits: 3 },
              { code: 'SLVS510', title: 'Financial Stewardship of Integrative Wellness Systems', credits: 3 },
            ],
          },
          {
            number: 2,
            courses: [
              { code: 'SLVS515', title: 'Holistic Flourishing & Integrative Well-being Models', credits: 3 },
              { code: 'RES601', title: 'Quantitative and Qualitative Research Methods', credits: 3 },
              { code: 'SLVS601', title: 'Wellness Stewardship & Social Impact Leadership', credits: 3 },
              { code: 'SLVS602', title: 'Ethics & Inclusion in Longevity Services', credits: 3 },
            ],
          },
          {
            number: 3,
            courses: [
              { code: 'SLVS605', title: 'Social Entrepreneurship for Flourishing Communities', credits: 3 },
              { code: 'SLVS610', title: 'Wellness Branding for the Silver Economy', credits: 3 },
              { code: 'SLVS615', title: 'Biophilic Design & Age-Friendly Wellness Spaces', credits: 3 },
            ],
          },
          {
            number: 4,
            courses: [
              { code: 'SLVS620', title: 'Leading Multigenerational Cultures of Well-being', credits: 3 },
              { code: 'SLVS625', title: 'Strategic Vitality Capstone Project', credits: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'diseno-y-tecnologias-de-comunicacion',
    name: { es: 'Escuela de Diseño y Tecnologías de Comunicación', en: 'School of Design and Communication Technologies' },
    tagline: {
      es: 'Storytelling, diseño y tecnología para las industrias creativas del futuro.',
      en: 'Storytelling, design and technology for the creative industries of the future.',
    },
    programs: [
      { name: 'Digital Media', degree: 'BS', totalCredits: 120 },
      { name: 'Digital Media, Film & Visual Design', degree: 'MFA', totalCredits: 60 },
    ],
  },
];
