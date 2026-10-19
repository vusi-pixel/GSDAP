import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  X,
  Award,
  Clock,
  LayoutGrid,
  List,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Network,
  GitBranch,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../lib/api';
import { FadeIn, FadeInStagger, StaggerItem } from '../components/motion';

const DEFAULT_COURSES = [
  // ── Coursera ──────────────────────────────────────────────────────────────────
  {
    id: 'coursera-ml-andrew-ng',
    code: 'CRS-ML-001',
    title: 'Machine Learning Specialization',
    description: 'Master machine learning fundamentals with Python, NumPy, scikit-learn, and TensorFlow. Covers supervised learning, unsupervised learning, and recommender systems. Taught by Andrew Ng — Stanford professor and AI pioneer.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'beginner',
    durationHours: 95,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Andrew Ng (Stanford / DeepLearning.AI)',
    rating: 4.9,
    enrollmentCount: 1200000,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'scikit-learn', 'NumPy'],
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
  },
  {
    id: 'coursera-deep-learning',
    code: 'CRS-DL-002',
    title: 'Deep Learning Specialization',
    description: 'Become a deep learning expert. Build CNNs, RNNs, LSTMs, and Transformers using TensorFlow. Includes speech recognition, image segmentation, and music synthesis projects.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'intermediate',
    durationHours: 130,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Andrew Ng (DeepLearning.AI)',
    rating: 4.9,
    enrollmentCount: 700000,
    skills: ['Deep Learning', 'TensorFlow', 'Neural Networks', 'CNN', 'RNN', 'LSTM'],
    url: 'https://www.coursera.org/specializations/deep-learning',
  },
  {
    id: 'coursera-ibm-data-science',
    code: 'CRS-DS-003',
    title: 'IBM Data Science Professional Certificate',
    description: 'Launch your career as a data scientist. Master Python, SQL, ML, data visualization, and big data tools. Build a rocket launch success predictor with SpaceX data as your capstone.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'beginner',
    durationHours: 300,
    cost: 0,
    certificateAvailable: true,
    instructor: 'IBM Skills Network',
    rating: 4.6,
    enrollmentCount: 600000,
    skills: ['Python', 'SQL', 'Data Science', 'Machine Learning', 'Pandas', 'Jupyter'],
    url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
  },
  {
    id: 'coursera-google-ux',
    code: 'CRS-UX-004',
    title: 'Google UX Design Professional Certificate',
    description: 'Design and prototype UX solutions end-to-end. Learn wireframing, Figma prototyping, and usability testing. Build a UX portfolio with 3 complete case studies.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'beginner',
    durationHours: 200,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Career Certificates',
    rating: 4.8,
    enrollmentCount: 850000,
    skills: ['UX Design', 'Figma', 'Prototyping', 'User Research', 'Wireframing'],
    url: 'https://www.coursera.org/professional-certificates/google-ux-design',
  },
  {
    id: 'coursera-cloud-architect',
    code: 'CRS-GCP-005',
    title: 'Google Cloud Professional Cloud Architect',
    description: 'Prepare for GCP\'s most prestigious certification. Design, build, and manage scalable GCP solutions covering Kubernetes, BigQuery, IAM, and SRE reliability practices.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'advanced',
    durationHours: 60,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Cloud Training',
    rating: 4.7,
    enrollmentCount: 200000,
    skills: ['Google Cloud', 'Kubernetes', 'Terraform', 'BigQuery', 'IAM', 'SRE'],
    url: 'https://www.coursera.org/professional-certificates/google-cloud-architect',
  },
  {
    id: 'coursera-meta-react',
    code: 'CRS-FE-006',
    title: 'Meta Front-End Developer Professional Certificate',
    description: 'Become job-ready as a front-end developer. Learn React, Redux, JavaScript, and testing with Jest. Build a fully responsive web app following Meta\'s engineering standards.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'beginner',
    durationHours: 240,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Meta (Facebook Engineering)',
    rating: 4.7,
    enrollmentCount: 430000,
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux', 'Jest', 'Git'],
    url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
  },
  {
    id: 'coursera-meta-backend',
    code: 'CRS-BE-007',
    title: 'Meta Back-End Developer Professional Certificate',
    description: 'Build server-side applications with Python, Django REST Framework, and MySQL. Covers REST API design, CI/CD pipelines, and backend security with a full-stack capstone.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'beginner',
    durationHours: 260,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Meta (Facebook Engineering)',
    rating: 4.6,
    enrollmentCount: 320000,
    skills: ['Python', 'Django', 'REST API', 'MySQL', 'Docker', 'CI/CD'],
    url: 'https://www.coursera.org/professional-certificates/meta-back-end-developer',
  },
  {
    id: 'coursera-nlp-specialization',
    code: 'CRS-NLP-008',
    title: 'Natural Language Processing Specialization',
    description: 'Master NLP with deep learning — sentiment analysis, machine translation, question answering, and text summarization. Implement attention mechanisms and BERT from scratch.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'advanced',
    durationHours: 120,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Younes Bensouda Mourri (DeepLearning.AI)',
    rating: 4.8,
    enrollmentCount: 210000,
    skills: ['NLP', 'Transformers', 'BERT', 'Python', 'TensorFlow', 'Attention'],
    url: 'https://www.coursera.org/specializations/natural-language-processing',
  },
  {
    id: 'coursera-devops-cloud-native',
    code: 'CRS-DO-009',
    title: 'DevOps, DataOps, MLOps Specialization',
    description: 'Master DevOps engineering from CI/CD pipelines (GitHub Actions, Jenkins) to container orchestration with Docker & Kubernetes, IaC with Terraform, and MLOps workflows.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'intermediate',
    durationHours: 110,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Noah Gift (Duke University)',
    rating: 4.6,
    enrollmentCount: 90000,
    skills: ['DevOps', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'MLOps'],
    url: 'https://www.coursera.org/specializations/devops-dataops-mlops-duke',
  },
  {
    id: 'coursera-cyber-ibm',
    code: 'CRS-CY-010',
    title: 'IBM Cybersecurity Analyst Professional Certificate',
    description: 'Develop practical cybersecurity skills: threat intelligence, incident response, SIEM tools, penetration testing, and compliance frameworks (NIST, ISO 27001) with a breach investigation capstone.',
    provider: { name: 'coursera', displayName: 'Coursera' },
    level: 'beginner',
    durationHours: 240,
    cost: 0,
    certificateAvailable: true,
    instructor: 'IBM Skills Network',
    rating: 4.6,
    enrollmentCount: 180000,
    skills: ['Cybersecurity', 'SIEM', 'Penetration Testing', 'Incident Response', 'NIST', 'Python'],
    url: 'https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst',
  },
  // ── Google ────────────────────────────────────────────────────────────────────
  {
    id: 'google-it-support',
    code: 'GGL-IT-001',
    title: 'Google IT Support Professional Certificate',
    description: 'Launch a career in IT support in 6 months. Learn troubleshooting, networking (TCP/IP, DNS, DHCP), Linux, Windows administration, Active Directory, and cybersecurity basics with hands-on Qwiklabs.',
    provider: { name: 'google', displayName: 'Google' },
    level: 'beginner',
    durationHours: 180,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Career Certificates',
    rating: 4.8,
    enrollmentCount: 900000,
    skills: ['IT Support', 'Networking', 'Linux', 'Windows', 'Active Directory', 'Cybersecurity'],
    url: 'https://grow.google/certificates/it-support/',
  },
  {
    id: 'google-data-analytics',
    code: 'GGL-DA-002',
    title: 'Google Data Analytics Professional Certificate',
    description: 'Become job-ready for data analytics in under 6 months. Master the full data analysis lifecycle using SQL, R, Tableau, and Google Analytics 4 with a real business capstone project.',
    provider: { name: 'google', displayName: 'Google' },
    level: 'beginner',
    durationHours: 200,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Career Certificates',
    rating: 4.8,
    enrollmentCount: 750000,
    skills: ['Data Analytics', 'SQL', 'R', 'Tableau', 'Spreadsheets', 'BigQuery'],
    url: 'https://grow.google/certificates/data-analytics/',
  },
  {
    id: 'google-project-management',
    code: 'GGL-PM-003',
    title: 'Google Project Management Professional Certificate',
    description: 'Master project management — Waterfall and Agile/Scrum. Learn stakeholder analysis, risk registers, Gantt charts, Kanban boards, and sprint retrospectives. Real-world case simulations reviewed by Google PMs.',
    provider: { name: 'google', displayName: 'Google' },
    level: 'beginner',
    durationHours: 180,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Career Certificates',
    rating: 4.8,
    enrollmentCount: 500000,
    skills: ['Project Management', 'Agile', 'Scrum', 'Kanban', 'Risk Management', 'Jira'],
    url: 'https://grow.google/certificates/project-management/',
  },
  {
    id: 'google-cybersecurity',
    code: 'GGL-CY-004',
    title: 'Google Cybersecurity Professional Certificate',
    description: 'Prepare for a cybersecurity career in 6 months. Covers NIST CSF, threat modeling, SIEM tools (Splunk, Chronicle), Wireshark/tcpdump analysis, Python scripting, and incident response playbooks.',
    provider: { name: 'google', displayName: 'Google' },
    level: 'beginner',
    durationHours: 170,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Career Certificates',
    rating: 4.8,
    enrollmentCount: 400000,
    skills: ['Cybersecurity', 'Python', 'SIEM', 'Splunk', 'Network Security', 'Wireshark'],
    url: 'https://grow.google/certificates/cybersecurity/',
  },
  {
    id: 'google-advanced-data-analytics',
    code: 'GGL-ADA-005',
    title: 'Google Advanced Data Analytics Professional Certificate',
    description: 'Advance from analyst to data scientist. Master Python EDA, statistics, regression modeling, machine learning with scikit-learn, and executive data communication with Tableau.',
    provider: { name: 'google', displayName: 'Google' },
    level: 'intermediate',
    durationHours: 150,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Career Certificates',
    rating: 4.7,
    enrollmentCount: 200000,
    skills: ['Python', 'Statistics', 'Machine Learning', 'Tableau', 'Regression', 'scikit-learn'],
    url: 'https://grow.google/certificates/advanced-data-analytics/',
  },
  {
    id: 'google-ai-essentials',
    code: 'GGL-AI-006',
    title: 'Google AI Essentials',
    description: 'Use AI tools to boost productivity — writing prompts, summarizing content, brainstorming, and evaluating AI output quality. Understand AI\'s limitations and responsible AI principles.',
    provider: { name: 'google', displayName: 'Google' },
    level: 'beginner',
    durationHours: 18,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Career Certificates',
    rating: 4.8,
    enrollmentCount: 620000,
    skills: ['Generative AI', 'Prompt Engineering', 'AI Literacy', 'Responsible AI'],
    url: 'https://grow.google/certificates/ai-essentials/',
  },
  {
    id: 'google-mlops-vertex',
    code: 'GGL-ML-007',
    title: 'Machine Learning on Google Cloud Specialization',
    description: 'Build, deploy, and scale ML models on Google Cloud using Vertex AI. Covers feature engineering, Kubeflow Pipelines, model monitoring, explainability, and responsible AI practices.',
    provider: { name: 'google', displayName: 'Google' },
    level: 'advanced',
    durationHours: 85,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Google Cloud Training',
    rating: 4.6,
    enrollmentCount: 95000,
    skills: ['Vertex AI', 'BigQuery ML', 'Kubeflow', 'MLOps', 'TensorFlow', 'Responsible AI'],
    url: 'https://www.coursera.org/specializations/machine-learning-tensorflow-gcp',
  },
  // ── Microsoft ─────────────────────────────────────────────────────────────────
  {
    id: 'microsoft-az-900',
    code: 'AZ-900',
    title: 'Microsoft Azure Fundamentals (AZ-900)',
    description: 'Build foundational Azure knowledge. Covers cloud computing (IaaS/PaaS/SaaS), Azure compute, storage, networking, Azure Active Directory, security, compliance, SLAs, and pricing models.',
    provider: { name: 'microsoft', displayName: 'Microsoft' },
    level: 'beginner',
    durationHours: 11,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Microsoft Learn',
    rating: 4.7,
    enrollmentCount: 500000,
    skills: ['Azure', 'Cloud Computing', 'Azure Security', 'Azure AD', 'Cloud Pricing'],
    url: 'https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/',
  },
  {
    id: 'microsoft-ai-900',
    code: 'AI-900',
    title: 'Microsoft Azure AI Fundamentals (AI-900)',
    description: 'Foundational AI knowledge on Azure. Covers responsible AI, computer vision (Azure Vision API), NLP (Language Service), conversational AI (Bot Service), and document intelligence.',
    provider: { name: 'microsoft', displayName: 'Microsoft' },
    level: 'beginner',
    durationHours: 10,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Microsoft Learn',
    rating: 4.6,
    enrollmentCount: 350000,
    skills: ['Azure AI', 'Machine Learning', 'Computer Vision', 'NLP', 'Azure Cognitive Services'],
    url: 'https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/',
  },
  {
    id: 'microsoft-az-204',
    code: 'AZ-204',
    title: 'Developing Solutions for Microsoft Azure (AZ-204)',
    description: 'Build cloud-native solutions on Azure: App Service, Azure Functions (serverless), Blob Storage, Cosmos DB, API Management, Azure Cache for Redis, Event Grid, and Service Bus.',
    provider: { name: 'microsoft', displayName: 'Microsoft' },
    level: 'intermediate',
    durationHours: 35,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Microsoft Learn',
    rating: 4.7,
    enrollmentCount: 150000,
    skills: ['Azure', 'C#', 'Azure Functions', 'Cosmos DB', 'API Management', 'Docker', 'Redis'],
    url: 'https://learn.microsoft.com/en-us/training/paths/create-azure-app-service-web-apps/',
  },
  {
    id: 'microsoft-az-500',
    code: 'AZ-500',
    title: 'Microsoft Azure Security Technologies (AZ-500)',
    description: 'Implement Azure security controls — identity (PIM, MFA, Conditional Access), network security (NSGs, Firewall), data security (Key Vault), and security operations with Microsoft Sentinel.',
    provider: { name: 'microsoft', displayName: 'Microsoft' },
    level: 'advanced',
    durationHours: 40,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Microsoft Learn',
    rating: 4.7,
    enrollmentCount: 95000,
    skills: ['Azure Security', 'PIM', 'Key Vault', 'Microsoft Sentinel', 'Zero Trust', 'Conditional Access'],
    url: 'https://learn.microsoft.com/en-us/training/paths/implement-resource-mgmt-security/',
  },
  {
    id: 'microsoft-az-104',
    code: 'AZ-104',
    title: 'Microsoft Azure Administrator (AZ-104)',
    description: 'Administer Azure infrastructure at scale — VMs, virtual networks, NSGs, load balancers, Azure DNS, storage, Azure Backup, Monitor, Log Analytics workspaces, and RBAC.',
    provider: { name: 'microsoft', displayName: 'Microsoft' },
    level: 'intermediate',
    durationHours: 45,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Microsoft Learn',
    rating: 4.7,
    enrollmentCount: 210000,
    skills: ['Azure Administration', 'Virtual Machines', 'Azure Networking', 'RBAC', 'Azure Monitor', 'Log Analytics'],
    url: 'https://learn.microsoft.com/en-us/training/paths/az-104-administrator-prerequisites/',
  },
  {
    id: 'microsoft-azure-openai',
    code: 'AOAI-201',
    title: 'Develop Generative AI Solutions with Azure OpenAI Service',
    description: 'Build production AI apps using GPT-4, DALL-E, and Whisper on Azure OpenAI. Covers prompt engineering, Retrieval Augmented Generation (RAG), vector search, and responsible AI deployment.',
    provider: { name: 'microsoft', displayName: 'Microsoft' },
    level: 'intermediate',
    durationHours: 22,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Microsoft Learn',
    rating: 4.8,
    enrollmentCount: 290000,
    skills: ['Azure OpenAI', 'GPT-4', 'RAG', 'Prompt Engineering', 'Azure AI Search', 'Python'],
    url: 'https://learn.microsoft.com/en-us/training/paths/develop-ai-solutions-azure-openai/',
  },
  {
    id: 'microsoft-github-copilot',
    code: 'GH-COP-101',
    title: 'GitHub Copilot Fundamentals — AI-Powered Development',
    description: 'Write code faster with GitHub Copilot. Learn AI pair programming, prompt engineering for code generation, using Copilot for documentation, test generation, debugging, and refactoring.',
    provider: { name: 'microsoft', displayName: 'Microsoft' },
    level: 'beginner',
    durationHours: 6,
    cost: 0,
    certificateAvailable: true,
    instructor: 'Microsoft Learn / GitHub',
    rating: 4.8,
    enrollmentCount: 380000,
    skills: ['GitHub Copilot', 'AI-Assisted Coding', 'Prompt Engineering', 'Python', 'Unit Testing'],
    url: 'https://learn.microsoft.com/en-us/training/paths/copilot/',
  },
  // ── NVIDIA ────────────────────────────────────────────────────────────────────
  {
    id: 'nvidia-deep-learning-fundamentals',
    code: 'NVD-DL-001',
    title: 'Fundamentals of Deep Learning',
    description: 'Master deep learning building blocks. Implement CNNs, sequence models, and text classifiers using TensorFlow and Keras with data augmentation, batch normalization, and transfer learning on NVIDIA GPUs.',
    provider: { name: 'nvidia', displayName: 'NVIDIA DLI' },
    level: 'beginner',
    durationHours: 8,
    cost: 0,
    certificateAvailable: true,
    instructor: 'NVIDIA Deep Learning Institute',
    rating: 4.8,
    enrollmentCount: 120000,
    skills: ['Deep Learning', 'TensorFlow', 'Keras', 'CNN', 'Transfer Learning', 'GPU Computing'],
    url: 'https://www.nvidia.com/en-us/training/instructor-led-workshops/fundamentals-of-deep-learning/',
  },
  {
    id: 'nvidia-accelerated-computing',
    code: 'NVD-CUDA-002',
    title: 'Fundamentals of Accelerated Computing with CUDA Python',
    description: 'Accelerate Python programs on CUDA GPUs. Learn thread/block/grid parallelism, memory coalescing, and synchronization using Numba and CuPy for 10–100x speedups in data science.',
    provider: { name: 'nvidia', displayName: 'NVIDIA DLI' },
    level: 'intermediate',
    durationHours: 8,
    cost: 0,
    certificateAvailable: true,
    instructor: 'NVIDIA Deep Learning Institute',
    rating: 4.7,
    enrollmentCount: 80000,
    skills: ['CUDA', 'Python', 'GPU Computing', 'Numba', 'CuPy', 'Parallel Programming', 'HPC'],
    url: 'https://www.nvidia.com/en-us/training/instructor-led-workshops/fundamentals-of-accelerated-computing-with-cuda-python/',
  },
  {
    id: 'nvidia-generative-ai',
    code: 'NVD-GAI-003',
    title: 'Generative AI Explained',
    description: 'Demystify generative AI. Understand LLMs, diffusion models, prompt engineering, temperature parameters, hallucinations, bias, and real-world applications across healthcare, finance, and engineering.',
    provider: { name: 'nvidia', displayName: 'NVIDIA DLI' },
    level: 'beginner',
    durationHours: 2,
    cost: 0,
    certificateAvailable: true,
    instructor: 'NVIDIA Deep Learning Institute',
    rating: 4.8,
    enrollmentCount: 250000,
    skills: ['Generative AI', 'LLM', 'Prompt Engineering', 'Diffusion Models', 'AI Ethics'],
    url: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-07+V1',
  },
  {
    id: 'nvidia-rag-llm',
    code: 'NVD-RAG-004',
    title: 'Building RAG Agents with LLMs',
    description: 'Build production-ready Retrieval Augmented Generation systems. Implement document parsing, semantic chunking, NVIDIA Embed, FAISS vector databases, and LangChain pipelines for enterprise AI assistants.',
    provider: { name: 'nvidia', displayName: 'NVIDIA DLI' },
    level: 'intermediate',
    durationHours: 4,
    cost: 0,
    certificateAvailable: true,
    instructor: 'NVIDIA Deep Learning Institute',
    rating: 4.9,
    enrollmentCount: 95000,
    skills: ['RAG', 'LangChain', 'LLM', 'Vector Databases', 'Python', 'FAISS', 'NVIDIA NIM'],
    url: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-15+V1',
  },
  {
    id: 'nvidia-transformer-nlp',
    code: 'NVD-NLP-005',
    title: 'Building Transformer-Based NLP Applications',
    description: 'Build production NLP systems with BERT transformers for classification, NER, and QA. Fine-tune HuggingFace models using NVIDIA NeMo and deploy optimized inference with TensorRT.',
    provider: { name: 'nvidia', displayName: 'NVIDIA DLI' },
    level: 'advanced',
    durationHours: 8,
    cost: 0,
    certificateAvailable: true,
    instructor: 'NVIDIA Deep Learning Institute',
    rating: 4.7,
    enrollmentCount: 55000,
    skills: ['NLP', 'Transformers', 'BERT', 'PyTorch', 'HuggingFace', 'NVIDIA NeMo', 'TensorRT'],
    url: 'https://www.nvidia.com/en-us/training/instructor-led-workshops/building-transformer-based-nlp-applications/',
  },
  {
    id: 'nvidia-llm-optimization',
    code: 'NVD-LLM-006',
    title: 'Optimizing and Deploying LLMs with TensorRT-LLM',
    description: 'Optimize LLMs for production inference. Covers INT4/INT8/FP8 quantization, KV-cache optimization, speculative decoding, tensor parallelism, and batching strategies for enterprise SLA compliance.',
    provider: { name: 'nvidia', displayName: 'NVIDIA DLI' },
    level: 'advanced',
    durationHours: 8,
    cost: 0,
    certificateAvailable: true,
    instructor: 'NVIDIA Deep Learning Institute',
    rating: 4.9,
    enrollmentCount: 38000,
    skills: ['TensorRT-LLM', 'LLM Inference', 'Quantization', 'Triton Inference Server', 'CUDA', 'Model Optimization'],
    url: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-22+V1',
  },
  // ── TVET ─────────────────────────────────────────────────────────────────────
  {
    id: 'tvet-web-development',
    code: 'TVET-WD-001',
    title: 'Web Development Fundamentals',
    description: 'Build a solid foundation in web development through hands-on projects. Learn HTML5, CSS3 (flexbox, grid, responsive), JavaScript ES6+, Git, and deploy 3 live websites to Netlify.',
    provider: { name: 'tvet', displayName: 'TVET Kenya' },
    level: 'beginner',
    durationHours: 120,
    cost: 0,
    certificateAvailable: true,
    instructor: 'TVET Kenya — ICT Faculty',
    rating: 4.5,
    enrollmentCount: 5000,
    skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Git', 'Netlify'],
    url: 'https://onemillioncoders.io/tvet/web-development',
  },
  {
    id: 'tvet-python-programming',
    code: 'TVET-PY-002',
    title: 'Python Programming for Beginners',
    description: 'Start your programming journey in Python. Covers syntax, data types, control flow, functions, file I/O, exception handling, CSV data analysis with Pandas, and basic automation scripts.',
    provider: { name: 'tvet', displayName: 'TVET Kenya' },
    level: 'beginner',
    durationHours: 90,
    cost: 0,
    certificateAvailable: true,
    instructor: 'TVET Kenya — ICT Faculty',
    rating: 4.7,
    enrollmentCount: 7000,
    skills: ['Python', 'Programming Fundamentals', 'Pandas', 'Data Analysis', 'Automation', 'Git'],
    url: 'https://onemillioncoders.io/tvet/python',
  },
  {
    id: 'tvet-computer-networking',
    code: 'TVET-NET-003',
    title: 'Computer Networking Essentials',
    description: 'Master networking from the ground up — OSI/TCP/IP models, Cisco IOS router/switch configuration, VLANs, OSPF routing, wireless networking (802.11), and security fundamentals. Prepares for CCNA.',
    provider: { name: 'tvet', displayName: 'TVET Kenya' },
    level: 'beginner',
    durationHours: 100,
    cost: 0,
    certificateAvailable: true,
    instructor: 'TVET Kenya — Networking Faculty',
    rating: 4.5,
    enrollmentCount: 3500,
    skills: ['Networking', 'TCP/IP', 'Cisco IOS', 'VLANs', 'OSPF', 'Wireless', 'CCNA'],
    url: 'https://onemillioncoders.io/tvet/networking',
  },
  {
    id: 'tvet-digital-marketing',
    code: 'TVET-DM-004',
    title: 'Digital Marketing and E-Commerce for African SMEs',
    description: 'Market businesses online in the African context. Learn social media management, WhatsApp Business API, Google My Business, SEO, Meta Ads, Mpesa integration, and Jumia/Kilimall seller setup.',
    provider: { name: 'tvet', displayName: 'TVET Kenya' },
    level: 'beginner',
    durationHours: 60,
    cost: 0,
    certificateAvailable: true,
    instructor: 'TVET Kenya — Business Faculty',
    rating: 4.6,
    enrollmentCount: 4500,
    skills: ['Digital Marketing', 'Social Media', 'SEO', 'Google Ads', 'E-Commerce', 'WhatsApp Business'],
    url: 'https://onemillioncoders.io/tvet/digital-marketing',
  },
  {
    id: 'tvet-electrical-installation',
    code: 'TVET-EL-005',
    title: 'Electrical Installation and Wiring (Artisan Grade)',
    description: 'TVET-accredited electrical installation skills. Covers DC/AC theory, IEE Wiring Regulations, domestic wiring, MCBs and RCDs, earthing systems, PAT testing, and solar PV system basics.',
    provider: { name: 'tvet', displayName: 'TVET Kenya' },
    level: 'beginner',
    durationHours: 150,
    cost: 0,
    certificateAvailable: true,
    instructor: 'TVET Kenya — Electrical Engineering Faculty',
    rating: 4.6,
    enrollmentCount: 2800,
    skills: ['Electrical Installation', 'AC/DC Circuits', 'Solar PV', 'IEE Wiring', 'Earthing Systems'],
    url: 'https://onemillioncoders.io/tvet/electrical-installation',
  },
  {
    id: 'tvet-fullstack-diploma',
    code: 'TVET-FS-006',
    title: 'National Diploma in Full Stack Web Application Development',
    description: 'Comprehensive 6-month full-stack diploma: React, Node.js, PostgreSQL, Docker, GitHub Actions CI/CD, and Railway cloud deployments. Includes team capstone, CV writing, and freelancing portfolio.',
    provider: { name: 'tvet', displayName: 'TVET Kenya' },
    level: 'intermediate',
    durationHours: 420,
    cost: 0,
    certificateAvailable: true,
    instructor: 'TVET Kenya — Software Engineering Faculty',
    rating: 4.8,
    enrollmentCount: 1500,
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'JavaScript', 'CI/CD', 'Prisma'],
    url: 'https://onemillioncoders.io/tvet/fullstack-diploma',
  },
  {
    id: 'tvet-cybersecurity-basics',
    code: 'TVET-CY-007',
    title: 'Cybersecurity Essentials for East Africa',
    description: 'Protect individuals and organizations from cyber threats — phishing awareness, secure mobile banking (Mpesa safety), VPN usage, malware identification, basic Nmap scanning, and CA Kenya cybercrime reporting.',
    provider: { name: 'tvet', displayName: 'TVET Kenya' },
    level: 'beginner',
    durationHours: 40,
    cost: 0,
    certificateAvailable: true,
    instructor: 'TVET Kenya — ICT Faculty',
    rating: 4.6,
    enrollmentCount: 2200,
    skills: ['Cybersecurity', 'Phishing Awareness', 'Mobile Security', 'VPN', 'Nmap', 'Incident Reporting'],
    url: 'https://onemillioncoders.io/tvet/cybersecurity',
  },
];

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [certOnly, setCertOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: apiData } = useQuery({
    queryKey: ['catalog', search, selectedProvider, selectedLevel, certOnly],
    queryFn: () =>
      catalogApi
        .list({
          search: search || undefined,
          provider: selectedProvider !== 'all' ? selectedProvider : undefined,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          certOnly: certOnly ? 'true' : undefined,
        })
        .then((r) => r.data)
        .catch(() => null),
  });

  const courses = apiData?.data?.length ? apiData.data : DEFAULT_COURSES;

  const filteredCourses = courses.filter((c: any) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesProvider =
      selectedProvider === 'all' ||
      c.provider?.name === selectedProvider ||
      c.provider?.displayName?.toLowerCase().includes(selectedProvider.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
    const matchesCert = !certOnly || c.certificateAvailable;
    return matchesSearch && matchesProvider && matchesLevel && matchesCert;
  });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative overflow-x-hidden">
      {/* Background Interconnected Atmospheric Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 interconnect-grid opacity-30 dark:opacity-20" />

      {/* ─── Catalogue Header ────────────────────────────────────────────── */}
      <section className="border-b border-border/80 bg-card/20 py-10 px-6 md:px-12 relative z-10">
        <FadeIn direction="up" delay={0.05} className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Network size={13} className="text-emerald-500" />
              National Educational Registry
            </span>
            <span>·</span>
            <span>Public Academic Syllabus Index</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              5 Accredited Providers Interlinked
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-foreground">
            Course & Curriculum Catalogue
          </h1>

          <p className="text-sm md:text-base text-muted-foreground font-sans max-w-3xl leading-relaxed">
            Consolidated courses and professional tracks delivered in partnership with Coursera, Google, Microsoft, NVIDIA, and TVET institutions. Filter by technical competency, accreditation status, or accredited provider.
          </p>

          {/* Precision Search & Filter Bar */}
          <div className="pt-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by topic, syllabus code, or technical domain..."
                className="w-full bg-background/80 border border-border/80 rounded pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors font-sans shadow-sm"
              />
            </div>

            {/* Provider Select */}
            <select
              aria-label="Filter courses by partner provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-card text-foreground border border-border/80 rounded px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="all">All Providers</option>
              <option value="google">Google Cloud</option>
              <option value="coursera">Coursera / Universities</option>
              <option value="microsoft">Microsoft Learn</option>
              <option value="nvidia">NVIDIA DLI</option>
              <option value="tvet">TVET National Institutes</option>
            </select>

            {/* Level Select */}
            <select
              aria-label="Filter courses by proficiency level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-card text-foreground border border-border/80 rounded px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Certificate Checkbox */}
            <label className="flex items-center gap-2 border border-border/80 rounded px-3 py-2 bg-card cursor-pointer select-none shadow-sm">
              <input
                type="checkbox"
                checked={certOnly}
                onChange={(e) => setCertOnly(e.target.checked)}
                className="rounded border-border"
              />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Certificate Only
              </span>
            </label>

            {/* View Toggle */}
            <div className="flex border border-border/80 rounded bg-card overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                title="Catalogue Table View"
                className={`p-2.5 transition-colors ${
                  viewMode === 'table' ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Index Grid View"
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── Catalogue Results Body ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-6 relative z-10">
        <FadeIn direction="up" delay={0.1}>
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border/80 pb-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SHOWING {filteredCourses.length} REGISTERED COURSE MODULES
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">CURRICULUM VERSION: 2026.4</span>
          </div>
        </FadeIn>

        {/* View Mode: Table / Ledger (Editorial Preferred) */}
        {viewMode === 'table' ? (
          <FadeIn direction="up" delay={0.15}>
            <div className="border border-border/80 rounded-md bg-card/60 glass-panel overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs font-sans">
                <thead className="border-b border-border/80 bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                  <tr>
                    <th className="py-3.5 px-4 font-medium">Code</th>
                    <th className="py-3.5 px-4 font-medium">Curriculum Title & Description</th>
                    <th className="py-3.5 px-4 font-medium">Issuing Provider</th>
                    <th className="py-3.5 px-4 font-medium">Duration</th>
                    <th className="py-3.5 px-4 font-medium">Accreditation</th>
                    <th className="py-3.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredCourses.map((c: any) => {
                    const providerName = c.provider?.displayName || 'National Partner';
                    const code = c.code || 'GSDAP-CRS';
                    const duration = c.durationHours ? `${c.durationHours} hrs` : 'Self-paced';

                    return (
                      <tr key={c.id} className="hover:bg-muted/15 transition-colors group">
                        <td className="py-4 px-4 font-mono text-muted-foreground whitespace-nowrap">
                          {code}
                        </td>
                        <td className="py-4 px-4 max-w-md">
                          <Link
                            to={`/catalog/${c.id}`}
                            className="font-medium text-sm text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 block leading-snug transition-colors"
                          >
                            {c.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {c.description}
                          </p>
                        </td>
                        <td className="py-4 px-4 font-mono text-foreground whitespace-nowrap">
                          <span className="px-2 py-0.5 border border-border/80 bg-muted/30 rounded-sm text-[11px] font-semibold">
                            {providerName}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-muted-foreground whitespace-nowrap">
                          {duration}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {c.certificateAvailable ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                              <ShieldCheck size={12} strokeWidth={1.5} />
                              Verified Cert
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-muted-foreground">
                              Audit Only
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <Link
                            to={`/catalog/${c.id}`}
                            className="font-mono text-xs uppercase px-3 py-1.5 border border-border/80 rounded bg-background hover:bg-muted text-foreground transition-all inline-flex items-center gap-1 shadow-sm active:scale-95 font-semibold"
                          >
                            <span>Syllabus</span>
                            <ArrowUpRight size={12} strokeWidth={1.5} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FadeIn>
        ) : (
          /* View Mode: Crisp Grid */
          <FadeInStagger staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c: any) => {
              const providerName = c.provider?.displayName || 'National Partner';
              const duration = c.durationHours ? `${c.durationHours} hrs` : 'Self-paced';

              return (
                <StaggerItem key={c.id}>
                  <div className="border border-border/80 rounded-md bg-card/60 glass-panel p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 group h-full">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border/60 pb-3">
                        <span className="uppercase font-semibold text-foreground/80">{providerName}</span>
                        <span className="uppercase text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-muted/30">
                          {c.level}
                        </span>
                      </div>

                      <h2 className="font-serif text-lg font-medium text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <Link to={`/catalog/${c.id}`}>{c.title}</Link>
                      </h2>

                      <p className="text-xs text-muted-foreground font-sans line-clamp-3 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">{duration}</span>
                      <Link
                        to={`/catalog/${c.id}`}
                        className="inline-flex items-center gap-1 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors"
                      >
                        <span>Examine Syllabus</span>
                        <ChevronRight size={13} strokeWidth={1.5} />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </FadeInStagger>
        )}
      </section>
    </div>
  );
}
