// All portfolio content lives here. Edit this file to change what the panels say.

export const PROFILE = {
  name: 'Sampad Patra',
  role: 'Data Analyst',
  location: 'London, United Kingdom',
  email: 'sampadpatra11@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sampad-patra/',
  cv: 'Sampad-Patra-CV.pdf', // file in the public folder
}

// Pitch is 60 x 40 units: x from -30 to 30 (goal to goal), z from -20 to 20.
export const ZONES = [
  {
    id: 'about',
    label: 'About Me',
    hint: 'Centre circle',
    color: '#ffd23f',
    position: [0, 0],
    radius: 4,
  },
  {
    id: 'projects',
    label: 'Projects',
    hint: 'West goal',
    color: '#ff6b6b',
    position: [-21, 0],
    radius: 3.6,
  },
  {
    id: 'experience',
    label: 'Experience',
    hint: 'East goal',
    color: '#4dabf7',
    position: [21, 0],
    radius: 3.6,
  },
  {
    id: 'skills',
    label: 'Skills',
    hint: 'The dugout',
    color: '#b197fc',
    position: [-11, -17],
    radius: 3.2,
  },
  {
    id: 'highlights',
    label: 'Education & Highlights',
    hint: 'The scoreboard',
    color: '#ffa94d',
    position: [11, -17],
    radius: 3.2,
  },
  {
    id: 'contact',
    label: 'Contact',
    hint: 'Corner flag',
    color: '#63e6be',
    position: [26, 16],
    radius: 3.2,
  },
]

export const CONTENT = {
  about: {
    kicker: 'Centre circle',
    title: 'Hi, I’m Sampad',
    intro:
      'I’m a Data Analyst at Tesco in the UK. I turn messy retail data into tools and dashboards that leadership can act on. Before that I studied MSc Management at Imperial College Business School (Distinction) and spent two years at Capgemini.',
    stats: [
      { value: '~£400K', label: 'quarterly savings from a clearance tool at Tesco' },
      { value: '£15M', label: 'of product range tracked for senior leadership' },
      { value: '60%', label: 'less manual work through automation at Capgemini' },
    ],
    body: [
      'Off the pitch I work in Python, SQL and Tableau. On it, I captained the NIT Rourkela football team and played for Imperial.',
      'Run around the pitch to explore. Each glowing ring is a section. Shoot the ball into either goal to open what’s behind it.',
    ],
  },
  experience: {
    kicker: 'East goal',
    title: 'Experience',
    items: [
      {
        title: 'Data Analyst',
        org: 'Tesco',
        meta: 'Welwyn, UK · Sep 2025 – Present',
        points: [
          'Generated ~£400K in quarterly savings and faster sell-through by building a tool that identifies slow-selling and overstocked products for clearance.',
          'Helped senior leadership optimise inventory allocation across £15M of Clipstrip and In-Queue products by tracking delisted and underperforming stock.',
          'Consolidated multiple Excel reports into a single Tableau dashboard on one data cube, cutting server load and duplicate processing.',
        ],
      },
      {
        title: 'Research Assistant, Finance Department',
        org: 'Imperial College London',
        meta: 'London, UK · Mar 2025 – Jul 2025',
        points: [
          'Built the evidence base for faculty research on interest rate risk across insurance companies.',
          'Quantified the impact of interest rate fluctuations on life insurance product portfolios over 10 years.',
          'Delivered structured reports on how financial intermediaries respond to interest rate risk.',
        ],
      },
      {
        title: 'Consultant (Part Time)',
        org: 'Blackmont Consulting',
        meta: 'London, UK · Feb 2025 – Jun 2025',
        points: [
          'Ran market research to identify high-potential startups and nonprofits for strategic partnership.',
          'Reduced wastage by 5% for a food catering provider through better inventory management and demand forecasting.',
        ],
      },
      {
        title: 'Senior Analyst',
        org: 'Capgemini',
        meta: 'Bangalore, India · Aug 2022 – Jul 2024',
        points: [
          'Led a team of 5 through the Blue Yonder functional bootcamp and earned the Blue Yonder Analyst certificate.',
          'Worked with the third-party logistics team to set up the client’s Warehouse Management Operating System.',
          'Automated workflows that cut manual work by 60%, saving 2 hours per analyst per day.',
        ],
      },
    ],
  },
  projects: {
    kicker: 'West goal',
    title: 'Projects & Certifications',
    items: [
      {
        title: 'Winner — ClearRoute x Le Mans 24h Hackathon',
        org: 'Hackathon',
        meta: 'London · Jun 2025',
        link: { label: 'Read the blog', href: 'https://shape-of-code.com/2025/06/15/clearroute-x-le-mans-24h-hackathon-2025/' },
        points: [
          'Built an LLM-powered rule-checking tool for Le Mans racing events that automates violation detection with Gemini Flash, with 100% accuracy on the test cases.',
        ],
      },
      {
        title: 'AI-Driven Outreach Automation',
        org: 'RINGFIN',
        meta: 'London · Jul 2025 – Aug 2025',
        link: { label: 'Website', href: 'https://www.ringfin.com/' },
        points: [
          'Designed a Python and AI-based system that scaled prospecting 5x (150 to 750 clients a week).',
          'Used Clay.ai to build targeted lead pipelines, lifting client response rates by 20%.',
        ],
      },
      {
        title: 'ESG Data & Outreach Automation',
        org: 'GCX',
        meta: 'London · May 2025 – Jun 2025',
        link: { label: 'Website', href: 'https://globalclimatex.com/' },
        points: [
          'Automated client outreach in Python, making engagement 3x more efficient.',
          'Designed data-driven ESG solutions with clients, aligning carbon-offset reporting with CSRD standards.',
        ],
      },
      {
        title: 'Lean Six Sigma Green Belt',
        org: 'Certification',
        meta: 'Feb 2026',
        link: {
          label: 'View certificate',
          href: 'https://www.virtualbadge.io/certificate-validator?credential=94b0ad19-1e61-44a9-93e6-8c57c7940b9b',
        },
        points: [],
      },
    ],
  },
  skills: {
    kicker: 'The dugout',
    title: 'Skills — the squad',
    groups: [
      { name: 'Data Analytics & BI', tags: ['Tableau (Advanced)', 'MS Excel (Expert)', 'Power BI', 'Think-Cell'] },
      { name: 'Programming & Databases', tags: ['Python', 'SQL (MySQL, Teradata)', 'C++', 'JavaScript', 'R (learning)'] },
      {
        name: 'Frameworks & Methodology',
        tags: ['Lean Six Sigma (Green Belt)', 'Strategic & Operations Management', 'Risk Management'],
      },
      { name: 'Tools', tags: ['Git', 'Jira', 'Confluence', 'SpringBoot', 'SAP Basics'] },
    ],
  },
  highlights: {
    kicker: 'The scoreboard',
    title: 'Education & Highlights',
    items: [
      {
        title: 'MSc in Management (Distinction)',
        org: 'Imperial College Business School',
        meta: 'London, UK · Sep 2024 – Sep 2025',
        points: [
          'Modules: Corporate Finance, Risk Management for Corporations, Strategic & Operations Management, Business Economics.',
          'Member of the Consulting club and the Institute Football team.',
        ],
      },
      {
        title: 'B.Tech, Mechanical Engineering (Minor in Computer Science)',
        org: 'NIT Rourkela',
        meta: 'Rourkela, India · Jul 2018 – Jun 2022 · CGPA 8.49/10',
        points: [
          'Modules: Data Structures and Algorithms, Machine Learning, Database Management Systems, Mechatronics.',
          'Captain of the Institute Football team (2021 – 2022).',
        ],
      },
      {
        title: 'Beyond work',
        org: 'Extra-curriculars',
        meta: '',
        link: { label: 'AEC Library', href: 'https://aec-library-wbsite.netlify.app/' },
        points: [
          'Runners-up in the Odisha state-level football championship, with 28 districts taking part (Jan 2024).',
          'Co-created AEC Library, a collection of essential books for undergraduates, MIT licensed (2019 – 2020).',
          'Taught maths and science to ten children in a nearby village under the National Service Scheme (2018).',
        ],
      },
    ],
  },
  contact: {
    kicker: 'Corner flag',
    title: 'Let’s talk',
    intro: 'Open to conversations about data, analytics and a good game of five-a-side.',
    contact: true,
  },
}
