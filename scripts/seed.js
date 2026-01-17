import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';
import Job from '../models/Job.js';

dotenv.config();

const companies = [
     {
          clerkId: 'seed_company_techcorp',
          companyName: 'TechCorp Solutions',
          email: 'hr@techcorp.com',
          website: 'https://techcorp.com',
          description: 'Leading software development company specializing in cloud-native solutions',
          industry: 'Technology',
          size: 'Large',
          verified: true
     },
     {
          clerkId: 'seed_company_aiventures',
          companyName: 'AI Ventures',
          email: 'careers@aiventures.com',
          website: 'https://aiventures.io',
          description: 'Cutting-edge AI and Machine Learning research company',
          industry: 'Artificial Intelligence',
          size: 'Medium',
          verified: true
     },
     {
          clerkId: 'seed_company_cloudops',
          companyName: 'CloudOps Inc',
          email: 'jobs@cloudops.com',
          website: 'https://cloudops.io',
          description: 'DevOps and Cloud Infrastructure experts',
          industry: 'Cloud Services',
          size: 'Medium',
          verified: true
     },
     {
          clerkId: 'seed_company_datastream',
          companyName: 'DataStream Analytics',
          email: 'talent@datastream.com',
          website: 'https://datastream.com',
          description: 'Big Data and Analytics solutions provider',
          industry: 'Data & Analytics',
          size: 'Small',
          verified: true
     }
];

const jobs = [
     // DevOps Jobs
     {
          title: 'Senior DevOps Engineer',
          description: 'We are seeking an experienced DevOps Engineer to join our team. You will be responsible for designing and implementing CI/CD pipelines, managing Kubernetes clusters, and ensuring high availability of our infrastructure.\n\nResponsibilities:\n- Design and maintain CI/CD pipelines using Jenkins, GitLab CI, or GitHub Actions\n- Manage and scale Kubernetes clusters\n- Implement infrastructure as code using Terraform\n- Monitor and optimize system performance\n- Collaborate with development teams for seamless deployments',
          requirements: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'AWS/GCP/Azure', '5+ years experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Senior',
          salary: { min: 130000, max: 180000, currency: 'USD' },
          status: 'Active',
          companyIndex: 2 // CloudOps
     },
     {
          title: 'Cloud Infrastructure Engineer',
          description: 'Join our team to build and maintain scalable cloud infrastructure. Work with cutting-edge technologies and solve complex infrastructure challenges.\n\nKey Responsibilities:\n- Design and deploy cloud infrastructure on AWS\n- Implement monitoring and alerting solutions\n- Optimize cloud costs and performance\n- Ensure security best practices',
          requirements: ['AWS', 'Terraform', 'Python', 'Linux', '3+ years experience'],
          location: 'San Francisco, CA',
          type: 'Full-time',
          experienceLevel: 'Mid',
          salary: { min: 110000, max: 150000, currency: 'USD' },
          status: 'Active',
          companyIndex: 2
     },
     {
          title: 'Site Reliability Engineer',
          description: 'Looking for an SRE to ensure the reliability and scalability of our services. You will work on automation, monitoring, and incident response.\n\nWhat you\'ll do:\n- Build and maintain monitoring dashboards\n- Automate operational tasks\n- Respond to and resolve production incidents\n- Improve system reliability and performance',
          requirements: ['Kubernetes', 'Prometheus', 'Grafana', 'Python/Go', 'Linux', '4+ years experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Senior',
          salary: { min: 140000, max: 190000, currency: 'USD' },
          status: 'Active',
          companyIndex: 0
     },
     {
          title: 'Junior DevOps Engineer',
          description: 'Entry-level DevOps position for recent graduates or those transitioning into DevOps. Learn from experienced engineers while contributing to our infrastructure.\n\nYou will:\n- Assist in maintaining CI/CD pipelines\n- Learn containerization with Docker and Kubernetes\n- Support infrastructure automation efforts\n- Participate in on-call rotations',
          requirements: ['Basic Docker knowledge', 'Linux fundamentals', 'Git', 'Python or Bash scripting'],
          location: 'Austin, TX',
          type: 'Full-time',
          experienceLevel: 'Entry',
          salary: { min: 70000, max: 95000, currency: 'USD' },
          status: 'Active',
          companyIndex: 2
     },
     {
          title: 'Platform Engineer',
          description: 'Build and maintain our internal developer platform. Enable development teams to ship faster with self-service infrastructure.\n\nResponsibilities:\n- Design internal platform tools and APIs\n- Implement GitOps workflows\n- Build developer onboarding automation\n- Support multi-cloud deployments',
          requirements: ['Kubernetes', 'Terraform', 'Go/Python', 'ArgoCD/Flux', 'Multi-cloud experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Mid',
          salary: { min: 120000, max: 160000, currency: 'USD' },
          status: 'Active',
          companyIndex: 0
     },

     // ML/AI Jobs
     {
          title: 'Senior Machine Learning Engineer',
          description: 'Join our AI team to build and deploy cutting-edge ML models at scale. Work on challenging problems in NLP, computer vision, and recommendation systems.\n\nWhat you\'ll work on:\n- Design and train deep learning models\n- Deploy ML models to production\n- Optimize model performance and latency\n- Collaborate with research team on new algorithms',
          requirements: ['Python', 'TensorFlow/PyTorch', 'MLOps', 'Kubernetes', '5+ years ML experience'],
          location: 'New York, NY',
          type: 'Full-time',
          experienceLevel: 'Senior',
          salary: { min: 160000, max: 220000, currency: 'USD' },
          status: 'Active',
          companyIndex: 1
     },
     {
          title: 'Data Scientist',
          description: 'Analyze large datasets to derive actionable insights and build predictive models. Work closely with product and engineering teams.\n\nKey Responsibilities:\n- Perform exploratory data analysis\n- Build statistical and ML models\n- Create data visualizations and dashboards\n- Present findings to stakeholders',
          requirements: ['Python', 'SQL', 'Pandas', 'Scikit-learn', 'Statistics', '3+ years experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Mid',
          salary: { min: 120000, max: 160000, currency: 'USD' },
          status: 'Active',
          companyIndex: 3
     },
     {
          title: 'ML Research Scientist',
          description: 'Conduct research in deep learning and publish papers at top-tier conferences. Push the boundaries of what\'s possible with AI.\n\nYou will:\n- Research novel ML algorithms\n- Publish research papers\n- Collaborate with engineering teams on implementation\n- Mentor junior researchers',
          requirements: ['PhD in CS/ML', 'Publications at NeurIPS/ICML/ICLR', 'PyTorch/JAX', 'Deep Learning'],
          location: 'Seattle, WA',
          type: 'Full-time',
          experienceLevel: 'Lead',
          salary: { min: 200000, max: 300000, currency: 'USD' },
          status: 'Active',
          companyIndex: 1
     },
     {
          title: 'Computer Vision Engineer',
          description: 'Build computer vision systems for object detection, segmentation, and tracking. Work on real-world applications.\n\nResponsibilities:\n- Develop CV models for production\n- Optimize inference performance\n- Work with edge deployment\n- Improve model accuracy',
          requirements: ['Computer Vision', 'PyTorch', 'OpenCV', 'CUDA', '3+ years experience'],
          location: 'San Diego, CA',
          type: 'Full-time',
          experienceLevel: 'Mid',
          salary: { min: 140000, max: 180000, currency: 'USD' },
          status: 'Active',
          companyIndex: 1
     },
     {
          title: 'NLP Engineer',
          description: 'Build natural language processing systems using transformer models. Work on chatbots, text generation, and language understanding.\n\nWhat you\'ll do:\n- Fine-tune large language models\n- Build NLP pipelines\n- Deploy models to production\n- Evaluate model performance',
          requirements: ['NLP', 'Transformers', 'HuggingFace', 'Python', 'LLMs', '4+ years experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Senior',
          salary: { min: 150000, max: 200000, currency: 'USD' },
          status: 'Active',
          companyIndex: 1
     },

     // SDE Jobs
     {
          title: 'Senior Full-Stack Engineer',
          description: 'Join our engineering team to build modern web applications. Work across the entire stack from React frontend to Node.js backend.\n\nResponsibilities:\n- Design and implement new features\n- Write clean, maintainable code\n- Review code and mentor junior engineers\n- Optimize application performance',
          requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', '5+ years experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Senior',
          salary: { min: 140000, max: 190000, currency: 'USD' },
          status: 'Active',
          companyIndex: 0
     },
     {
          title: 'Frontend Developer',
          description: 'Build beautiful and responsive user interfaces. Work with design team to create exceptional user experiences.\n\nKey Responsibilities:\n- Develop React components\n- Implement responsive designs\n- Optimize frontend performance\n- Write unit and integration tests',
          requirements: ['React', 'JavaScript/TypeScript', 'CSS/Sass', 'HTML5', '3+ years experience'],
          location: 'Boston, MA',
          type: 'Full-time',
          experienceLevel: 'Mid',
          salary: { min: 100000, max: 140000, currency: 'USD' },
          status: 'Active',
          companyIndex: 0
     },
     {
          title: 'Backend Engineer',
          description: 'Design and build scalable backend services using Go and microservices architecture. Handle millions of requests per day.\n\nWhat you\'ll do:\n- Build RESTful APIs\n- Design database schemas\n- Implement caching strategies\n- Ensure system scalability',
          requirements: ['Go', 'PostgreSQL', 'Redis', 'Microservices', 'Kafka', '4+ years experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Senior',
          salary: { min: 130000, max: 175000, currency: 'USD' },
          status: 'Active',
          companyIndex: 0
     },
     {
          title: 'Software Engineer - New Grad',
          description: 'Entry-level software engineering position for recent CS graduates. Work on real products from day one with mentorship from senior engineers.\n\nYou will:\n- Write production code\n- Participate in code reviews\n- Learn best practices\n- Rotate through different teams',
          requirements: ['CS degree or equivalent', 'Proficiency in one programming language', 'Data structures & algorithms'],
          location: 'Multiple locations',
          type: 'Full-time',
          experienceLevel: 'Entry',
          salary: { min: 90000, max: 120000, currency: 'USD' },
          status: 'Active',
          companyIndex: 0
     },
     {
          title: 'Mobile Engineer (iOS/Android)',
          description: 'Build native mobile applications for iOS and Android. Create smooth user experiences and work with cross-functional teams.\n\nResponsibilities:\n- Develop mobile features\n- Optimize app performance\n- Fix bugs and crashes\n- Implement analytics',
          requirements: ['Swift/Kotlin', 'iOS/Android SDK', 'Mobile UI/UX', '3+ years experience'],
          location: 'Los Angeles, CA',
          type: 'Full-time',
          experienceLevel: 'Mid',
          salary: { min: 120000, max: 160000, currency: 'USD' },
          status: 'Active',
          companyIndex: 0
     },
     {
          title: 'Database Engineer',
          description: 'Manage and optimize our database infrastructure. Work with PostgreSQL, MongoDB, and Redis at scale.\n\nKey Responsibilities:\n- Database performance tuning\n- Backup and recovery strategies\n- Query optimization\n- Database migrations',
          requirements: ['PostgreSQL', 'MongoDB', 'SQL', 'Database design', '4+ years experience'],
          location: 'Remote',
          type: 'Full-time',
          experienceLevel: 'Senior',
          salary: { min: 140000, max: 180000, currency: 'USD' },
          status: 'Active',
          companyIndex: 3
     }
];

async function seedDatabase() {
     try {
          // Connect to MongoDB
          console.log('Connecting to MongoDB...');
          await mongoose.connect(process.env.MONGO_URI);
          console.log('Connected to MongoDB');

          // Clear existing data
          console.log('Clearing existing data...');
          await Company.deleteMany({});
          await Job.deleteMany({});
          console.log('Existing data cleared');

          // Insert companies
          console.log('Inserting companies...');
          const insertedCompanies = await Company.insertMany(companies);
          console.log(`Inserted ${insertedCompanies.length} companies`);

          // Prepare jobs with company references
          const jobsWithCompanyRefs = jobs.map(job => ({
               ...job,
               companyId: insertedCompanies[job.companyIndex]._id,
               postedBy: insertedCompanies[job.companyIndex]._id
          }));

          // Remove companyIndex field
          jobsWithCompanyRefs.forEach(job => delete job.companyIndex);

          // Insert jobs
          console.log('Inserting jobs...');
          const insertedJobs = await Job.insertMany(jobsWithCompanyRefs);
          console.log(`Inserted ${insertedJobs.length} jobs`);

          console.log('\n=== Seeding Summary ===');
          console.log(`Companies: ${insertedCompanies.length}`);
          console.log(`Jobs: ${insertedJobs.length}`);
          console.log('- DevOps: 5 jobs');
          console.log('- ML/AI: 5 jobs');
          console.log('- SDE: 6 jobs');
          console.log('\nSeeding completed successfully!');

          // Disconnect
          await mongoose.disconnect();
          console.log('Disconnected from MongoDB');
          process.exit(0);
     } catch (error) {
          console.error('Error seeding database:', error);
          process.exit(1);
     }
}

seedDatabase();
