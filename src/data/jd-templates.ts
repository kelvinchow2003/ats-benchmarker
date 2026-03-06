export type JDCategory =
  | "Engineering"
  | "Product"
  | "Data"
  | "Design"
  | "Marketing";

export interface JDTemplate {
  id: string;
  title: string;
  category: JDCategory;
  description: string;
  content: string;
}

export const JD_CATEGORIES: JDCategory[] = [
  "Engineering",
  "Product",
  "Data",
  "Design",
  "Marketing",
];

export const JD_TEMPLATES: JDTemplate[] = [
  // ─── Engineering ───
  {
    id: "swe-fullstack",
    title: "Full-Stack Software Engineer",
    category: "Engineering",
    description: "General full-stack role with React, Node.js, and cloud",
    content: `About the Role
We are looking for a Full-Stack Software Engineer to design, build, and maintain scalable web applications. You will work across the entire stack—from crafting responsive front-end interfaces to building robust back-end services and APIs.

Responsibilities
- Design, develop, and deploy full-stack features using React, TypeScript, and Node.js
- Build and maintain RESTful and GraphQL APIs
- Write clean, well-tested code with unit and integration tests
- Collaborate with product managers, designers, and other engineers in an agile environment
- Participate in code reviews and contribute to engineering best practices
- Troubleshoot production issues and implement monitoring and alerting

Requirements
- 3+ years of professional experience in full-stack web development
- Strong proficiency in JavaScript/TypeScript, React, and Node.js
- Experience with relational databases (PostgreSQL, MySQL) and ORMs
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Understanding of CI/CD pipelines and version control (Git)
- Strong problem-solving skills and attention to detail

Preferred Qualifications
- Experience with Next.js or similar SSR frameworks
- Knowledge of containerization (Docker, Kubernetes)
- Experience with message queues (RabbitMQ, Kafka)
- Familiarity with microservices architecture`,
  },
  {
    id: "swe-frontend",
    title: "Frontend Engineer",
    category: "Engineering",
    description: "React/TypeScript specialist with design system experience",
    content: `About the Role
We are hiring a Frontend Engineer to build beautiful, performant user interfaces. You will own the front-end architecture and work closely with design and product to deliver world-class user experiences.

Responsibilities
- Build and maintain complex UI components using React and TypeScript
- Implement responsive designs that work across devices and browsers
- Optimize application performance (Core Web Vitals, bundle size, rendering)
- Develop and maintain a shared component library and design system
- Write comprehensive unit and end-to-end tests
- Collaborate with backend engineers to define API contracts

Requirements
- 3+ years of experience building production web applications with React
- Expert-level TypeScript and modern JavaScript (ES2020+)
- Strong CSS skills including Flexbox, Grid, animations, and responsive design
- Experience with state management solutions (Redux, Zustand, or Context API)
- Familiarity with testing frameworks (Jest, React Testing Library, Cypress)
- Understanding of web accessibility standards (WCAG 2.1)

Preferred Qualifications
- Experience with Next.js, Remix, or similar meta-frameworks
- Knowledge of design systems (Storybook, Figma tokens)
- Experience with performance monitoring tools (Lighthouse, Sentry)
- Familiarity with GraphQL and Apollo Client`,
  },
  {
    id: "swe-backend",
    title: "Backend Engineer",
    category: "Engineering",
    description: "API and infrastructure focused with distributed systems",
    content: `About the Role
We are looking for a Backend Engineer to design and build the server-side systems that power our platform. You will architect scalable APIs, optimize database performance, and ensure system reliability.

Responsibilities
- Design and implement scalable RESTful and gRPC APIs
- Build and maintain microservices in Python, Go, or Java
- Optimize database queries and schema design for high throughput
- Implement authentication, authorization, and security best practices
- Set up monitoring, logging, and alerting infrastructure
- Participate in on-call rotations and incident response

Requirements
- 4+ years of experience in backend software development
- Strong proficiency in at least one of: Python, Go, Java, or C#
- Deep understanding of relational databases (PostgreSQL) and NoSQL (Redis, MongoDB)
- Experience designing and consuming RESTful APIs
- Knowledge of distributed systems concepts (consistency, partitioning, replication)
- Familiarity with cloud infrastructure (AWS or GCP)

Preferred Qualifications
- Experience with event-driven architecture (Kafka, RabbitMQ)
- Knowledge of containerization and orchestration (Docker, Kubernetes)
- Experience with infrastructure-as-code (Terraform, Pulumi)
- Understanding of observability tools (Datadog, Grafana, Prometheus)`,
  },
  {
    id: "swe-devops",
    title: "DevOps / SRE Engineer",
    category: "Engineering",
    description: "Infrastructure, CI/CD, and reliability engineering",
    content: `About the Role
We are seeking a DevOps / Site Reliability Engineer to build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems. You will ensure our services are reliable, scalable, and secure.

Responsibilities
- Design and manage cloud infrastructure on AWS or GCP using infrastructure-as-code
- Build and maintain CI/CD pipelines for automated testing and deployment
- Implement monitoring, alerting, and incident response procedures
- Optimize system performance and reduce operational costs
- Manage container orchestration with Kubernetes
- Collaborate with development teams to improve deployment workflows

Requirements
- 3+ years of experience in DevOps, SRE, or infrastructure engineering
- Strong experience with AWS or GCP services (EC2, ECS, Lambda, S3, RDS)
- Proficiency with infrastructure-as-code tools (Terraform, CloudFormation)
- Experience with CI/CD platforms (GitHub Actions, Jenkins, GitLab CI)
- Knowledge of containerization (Docker) and orchestration (Kubernetes)
- Scripting skills in Bash, Python, or Go

Preferred Qualifications
- Experience with service mesh (Istio, Linkerd)
- Knowledge of security best practices and compliance frameworks
- Experience with observability stacks (Prometheus, Grafana, ELK)
- Familiarity with GitOps workflows (ArgoCD, Flux)`,
  },

  // ─── Product ───
  {
    id: "pm-technical",
    title: "Technical Product Manager",
    category: "Product",
    description: "API and platform product management",
    content: `About the Role
We are looking for a Technical Product Manager to own the roadmap for our developer platform. You will work at the intersection of engineering, design, and business to deliver products that developers love.

Responsibilities
- Define and prioritize the product roadmap based on user research and business goals
- Write detailed product requirements and technical specifications
- Collaborate with engineering teams to scope, plan, and deliver features
- Analyze product metrics and user feedback to inform decisions
- Conduct competitive analysis and market research
- Present product strategy to stakeholders and leadership

Requirements
- 4+ years of product management experience, ideally with technical products
- Strong understanding of APIs, SDKs, and developer tools
- Experience with agile methodologies (Scrum, Kanban)
- Excellent written and verbal communication skills
- Data-driven mindset with experience using analytics tools
- Ability to translate complex technical concepts for non-technical audiences

Preferred Qualifications
- Technical background (CS degree or prior engineering experience)
- Experience with B2B SaaS or platform products
- Familiarity with SQL and data analysis tools
- Experience with user research methodologies`,
  },
  {
    id: "pm-growth",
    title: "Product Manager, Growth",
    category: "Product",
    description: "Growth and experimentation focused PM role",
    content: `About the Role
We are hiring a Product Manager for our Growth team. You will drive user acquisition, activation, and retention through data-driven experimentation and product optimization.

Responsibilities
- Own growth metrics including user acquisition, activation, and retention
- Design and run A/B tests and experiments to optimize conversion funnels
- Analyze user behavior data to identify growth opportunities
- Collaborate with engineering, design, and marketing to ship growth features
- Build and maintain growth models and forecasts
- Define and track key performance indicators (KPIs)

Requirements
- 3+ years of product management experience with a focus on growth
- Strong analytical skills and experience with experimentation frameworks
- Proficiency in SQL and analytics tools (Amplitude, Mixpanel, or similar)
- Experience with A/B testing platforms and statistical significance
- Understanding of growth loops, viral mechanics, and retention strategies
- Excellent communication and stakeholder management skills

Preferred Qualifications
- Experience with mobile and web product growth
- Knowledge of marketing automation and lifecycle messaging
- Familiarity with machine learning for personalization
- Experience scaling products from 100K to 1M+ users`,
  },
  {
    id: "tpm",
    title: "Technical Program Manager",
    category: "Product",
    description: "Cross-functional program management for engineering",
    content: `About the Role
We are looking for a Technical Program Manager to drive complex, cross-functional engineering programs. You will coordinate across multiple teams to deliver large-scale technical initiatives on time and within scope.

Responsibilities
- Lead planning and execution of cross-team engineering programs
- Create and maintain project plans, timelines, and status reports
- Identify risks, dependencies, and blockers across workstreams
- Facilitate technical design reviews and architecture discussions
- Drive process improvements for engineering workflows
- Communicate program status to leadership and stakeholders

Requirements
- 5+ years of experience in technical program management or software engineering
- Strong understanding of software development lifecycles and agile methodologies
- Experience managing programs with 3+ engineering teams
- Excellent organizational and communication skills
- Ability to understand and discuss technical architecture at a high level
- Experience with project management tools (Jira, Asana, Linear)

Preferred Qualifications
- Prior software engineering experience
- PMP or similar program management certification
- Experience with large-scale system migrations or platform initiatives
- Knowledge of CI/CD, cloud infrastructure, and DevOps practices`,
  },

  // ─── Data ───
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Data",
    description: "ML modeling, statistical analysis, and experimentation",
    content: `About the Role
We are seeking a Data Scientist to drive data-informed decision-making through statistical analysis, machine learning, and experimentation. You will work with product and engineering teams to build models and uncover insights.

Responsibilities
- Develop and deploy machine learning models for classification, regression, and recommendation
- Design and analyze A/B tests and experiments
- Build dashboards and reports to track key business metrics
- Conduct exploratory data analysis to uncover trends and opportunities
- Collaborate with data engineers to improve data pipelines and quality
- Present findings and recommendations to stakeholders

Requirements
- 3+ years of experience in data science or machine learning
- Strong proficiency in Python and data science libraries (pandas, scikit-learn, NumPy)
- Experience with SQL and relational databases
- Solid foundation in statistics and experimental design
- Experience with machine learning frameworks (TensorFlow, PyTorch, or XGBoost)
- Strong communication skills for presenting technical findings

Preferred Qualifications
- Experience with deep learning and NLP
- Knowledge of cloud ML platforms (SageMaker, Vertex AI)
- Experience with feature engineering and model deployment (MLflow, Kubeflow)
- Advanced degree in Statistics, Computer Science, or related field`,
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    category: "Data",
    description: "ETL pipelines, data warehousing, and infrastructure",
    content: `About the Role
We are looking for a Data Engineer to build and maintain the data infrastructure that powers our analytics and machine learning systems. You will design scalable data pipelines and ensure data quality across the organization.

Responsibilities
- Design and build scalable ETL/ELT data pipelines
- Maintain and optimize data warehouse architecture (Snowflake, BigQuery, or Redshift)
- Implement data quality checks, monitoring, and alerting
- Collaborate with data scientists and analysts to provide clean, reliable datasets
- Build and maintain real-time streaming pipelines
- Document data models, schemas, and pipeline architectures

Requirements
- 3+ years of experience in data engineering
- Strong proficiency in SQL and Python
- Experience with data orchestration tools (Airflow, Dagster, or Prefect)
- Knowledge of data warehousing concepts and dimensional modeling
- Experience with cloud data platforms (AWS, GCP, or Azure)
- Understanding of data governance and privacy requirements

Preferred Qualifications
- Experience with streaming technologies (Kafka, Spark Streaming)
- Knowledge of dbt for data transformation
- Experience with data lake architectures (Delta Lake, Iceberg)
- Familiarity with infrastructure-as-code (Terraform)`,
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    category: "Data",
    description: "Production ML systems, model serving, and MLOps",
    content: `About the Role
We are hiring a Machine Learning Engineer to build and scale production ML systems. You will bridge the gap between research and production, deploying models that serve millions of users.

Responsibilities
- Design and implement ML model training and serving pipelines
- Optimize model performance for latency, throughput, and accuracy
- Build feature stores and feature engineering pipelines
- Implement model monitoring, A/B testing, and automated retraining
- Collaborate with data scientists to productionize research models
- Maintain ML infrastructure and tooling

Requirements
- 3+ years of experience in machine learning engineering
- Strong proficiency in Python and ML frameworks (PyTorch, TensorFlow)
- Experience deploying models at scale (model serving, API endpoints)
- Knowledge of MLOps practices (CI/CD for ML, experiment tracking, model registry)
- Experience with cloud ML platforms (SageMaker, Vertex AI, or Azure ML)
- Strong software engineering fundamentals

Preferred Qualifications
- Experience with LLMs and generative AI applications
- Knowledge of vector databases and embedding systems
- Experience with real-time inference optimization (ONNX, TensorRT)
- Familiarity with Kubernetes and containerized ML workloads`,
  },

  // ─── Design ───
  {
    id: "ux-designer",
    title: "UX Designer",
    category: "Design",
    description: "User research, interaction design, and prototyping",
    content: `About the Role
We are looking for a UX Designer to create intuitive, user-centered experiences. You will conduct research, design interactions, and validate solutions to ensure our products meet user needs effectively.

Responsibilities
- Conduct user research including interviews, surveys, and usability testing
- Create user flows, wireframes, and interactive prototypes
- Design intuitive interactions and information architectures
- Collaborate with product managers and engineers throughout the design process
- Maintain and contribute to our design system
- Present design rationale and research findings to stakeholders

Requirements
- 3+ years of experience in UX design for digital products
- Strong portfolio demonstrating user-centered design process
- Proficiency in Figma for wireframing and prototyping
- Experience conducting user research and usability testing
- Understanding of accessibility standards (WCAG 2.1)
- Excellent communication and presentation skills

Preferred Qualifications
- Experience designing for B2B SaaS or enterprise products
- Knowledge of design systems and component libraries
- Familiarity with front-end technologies (HTML, CSS, React)
- Experience with analytics and data-informed design decisions`,
  },
  {
    id: "ui-designer",
    title: "UI / Visual Designer",
    category: "Design",
    description: "Visual design, design systems, and brand identity",
    content: `About the Role
We are seeking a UI / Visual Designer to craft polished, visually compelling interfaces. You will define the visual language of our product and ensure consistency through our design system.

Responsibilities
- Create high-fidelity visual designs for web and mobile applications
- Define and evolve the product's visual design language and brand identity
- Build and maintain design system components in Figma
- Create icons, illustrations, and other visual assets
- Ensure visual consistency across all product surfaces
- Collaborate with UX designers and engineers to bring designs to life

Requirements
- 3+ years of experience in UI or visual design
- Strong portfolio demonstrating exceptional visual design skills
- Expert proficiency in Figma with design system experience
- Strong understanding of typography, color theory, and layout principles
- Experience designing for responsive web and mobile platforms
- Attention to detail and pixel-perfect execution

Preferred Qualifications
- Experience with motion design and micro-interactions
- Knowledge of CSS and front-end implementation constraints
- Experience with brand design and identity systems
- Familiarity with design tokens and handoff workflows`,
  },
  {
    id: "ux-researcher",
    title: "UX Researcher",
    category: "Design",
    description: "Qualitative and quantitative user research",
    content: `About the Role
We are hiring a UX Researcher to drive user understanding across our product organization. You will plan and execute research studies, synthesize findings, and influence product strategy through evidence-based insights.

Responsibilities
- Plan and conduct qualitative research (interviews, diary studies, contextual inquiry)
- Design and analyze quantitative research (surveys, analytics, A/B tests)
- Synthesize research findings into actionable insights and recommendations
- Create research reports, personas, and journey maps
- Collaborate with product and design teams to define research priorities
- Build and maintain a research repository for organizational learning

Requirements
- 3+ years of experience in UX research or related field
- Strong knowledge of qualitative and quantitative research methodologies
- Experience with research tools (UserTesting, Dovetail, Optimal Workshop)
- Excellent analytical and synthesis skills
- Strong written and verbal communication for presenting findings
- Ability to manage multiple research projects simultaneously

Preferred Qualifications
- Advanced degree in HCI, Psychology, Anthropology, or related field
- Experience with statistical analysis tools (R, SPSS, or Python)
- Knowledge of accessibility research methodologies
- Experience building research operations and processes at scale`,
  },

  // ─── Marketing ───
  {
    id: "growth-marketing",
    title: "Growth Marketing Manager",
    category: "Marketing",
    description: "Paid acquisition, funnel optimization, and analytics",
    content: `About the Role
We are looking for a Growth Marketing Manager to drive user acquisition and revenue growth. You will own paid channels, optimize conversion funnels, and scale our marketing efforts through data-driven strategies.

Responsibilities
- Plan, execute, and optimize paid acquisition campaigns (Google Ads, Meta, LinkedIn)
- Analyze marketing funnel performance and identify optimization opportunities
- Manage marketing budget allocation across channels
- Build and maintain marketing analytics dashboards
- Run growth experiments and A/B tests on landing pages and campaigns
- Collaborate with product and sales teams on go-to-market strategies

Requirements
- 4+ years of experience in growth or performance marketing
- Strong experience with paid advertising platforms (Google Ads, Meta Ads Manager)
- Proficiency in analytics tools (Google Analytics, Amplitude, or Mixpanel)
- Experience with marketing automation platforms (HubSpot, Marketo, or similar)
- Data-driven mindset with strong analytical and problem-solving skills
- Understanding of attribution modeling and marketing measurement

Preferred Qualifications
- Experience with B2B SaaS marketing
- Knowledge of SQL for advanced data analysis
- Experience with CRO tools (Optimizely, VWO)
- Familiarity with product-led growth strategies`,
  },
  {
    id: "content-marketing",
    title: "Content Marketing Manager",
    category: "Marketing",
    description: "Content strategy, SEO, and thought leadership",
    content: `About the Role
We are seeking a Content Marketing Manager to develop and execute our content strategy. You will create compelling content that educates our audience, drives organic traffic, and supports the buyer journey.

Responsibilities
- Develop and execute a comprehensive content strategy across channels
- Write and edit blog posts, whitepapers, case studies, and email campaigns
- Optimize content for SEO and organic search visibility
- Manage the content calendar and editorial workflow
- Collaborate with subject matter experts to produce thought leadership content
- Track content performance metrics and report on ROI

Requirements
- 3+ years of experience in content marketing, ideally in B2B or SaaS
- Excellent writing and editing skills with strong attention to detail
- Knowledge of SEO best practices and keyword research tools
- Experience with content management systems (WordPress, Contentful)
- Proficiency in marketing analytics (Google Analytics, Search Console)
- Strong project management and organizational skills

Preferred Qualifications
- Experience with AI-assisted content creation tools
- Knowledge of email marketing and lifecycle campaigns
- Experience with video content and webinar production
- Familiarity with marketing automation platforms`,
  },
  {
    id: "seo-specialist",
    title: "SEO Specialist",
    category: "Marketing",
    description: "Technical SEO, keyword strategy, and organic growth",
    content: `About the Role
We are hiring an SEO Specialist to drive organic search growth. You will develop and execute SEO strategies, perform technical audits, and work cross-functionally to improve our search visibility and organic traffic.

Responsibilities
- Develop and implement comprehensive SEO strategies for organic growth
- Conduct keyword research and competitive analysis
- Perform technical SEO audits and implement recommendations
- Optimize on-page elements (meta tags, content structure, internal linking)
- Monitor search rankings, traffic, and conversion metrics
- Collaborate with engineering to resolve technical SEO issues

Requirements
- 3+ years of experience in SEO with demonstrated results
- Strong knowledge of on-page, off-page, and technical SEO
- Proficiency with SEO tools (Ahrefs, SEMrush, Screaming Frog, Google Search Console)
- Experience with Google Analytics and data analysis
- Understanding of HTML, CSS, and JavaScript as they relate to SEO
- Knowledge of Core Web Vitals and page experience signals

Preferred Qualifications
- Experience with programmatic SEO and large-scale content optimization
- Knowledge of schema markup and structured data
- Experience with international SEO and hreflang implementation
- Familiarity with headless CMS and JavaScript-rendered content`,
  },
];
