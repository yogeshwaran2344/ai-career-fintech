from typing import List, Dict, Tuple, Any, Optional
from models import (
    StudentProfile, SkillItem, SkillGapItem, CareerMatch,
    LearningRoadmap, RoadmapMonth, RoadmapMilestone, RecommendedProject
)

# Comprehensive Industry skill benchmarks across diverse degree domains (Proficiency scale 0-10)
ROLE_BENCHMARKS: Dict[str, Dict[str, Dict[str, Any]]] = {
    # 1. AI & Machine Learning
    "AI Engineer": {
        "Python": {"required": 8.0, "importance": "HIGH", "category": "Languages"},
        "SQL": {"required": 7.0, "importance": "MEDIUM", "category": "Databases"},
        "Machine Learning": {"required": 7.5, "importance": "HIGH", "category": "AI/ML"},
        "Deep Learning": {"required": 8.0, "importance": "HIGH", "category": "AI/ML"},
        "DSA": {"required": 6.5, "importance": "HIGH", "category": "Core CS"},
        "FastAPI": {"required": 7.0, "importance": "HIGH", "category": "Web/Backend"},
        "Docker": {"required": 6.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Cloud (AWS/GCP)": {"required": 6.0, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Statistics & Math": {"required": 6.5, "importance": "MEDIUM", "category": "AI/ML"},
        "Git/GitHub": {"required": 6.0, "importance": "MEDIUM", "category": "Tools"},
        "LLMs & RAG": {"required": 7.5, "importance": "HIGH", "category": "AI/ML"},
    },
    "ML Engineer": {
        "Python": {"required": 8.5, "importance": "HIGH", "category": "Languages"},
        "Machine Learning": {"required": 8.5, "importance": "HIGH", "category": "AI/ML"},
        "Deep Learning": {"required": 7.5, "importance": "HIGH", "category": "AI/ML"},
        "DSA": {"required": 7.0, "importance": "HIGH", "category": "Core CS"},
        "Docker": {"required": 7.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Cloud (AWS/GCP)": {"required": 7.0, "importance": "HIGH", "category": "DevOps/Cloud"},
        "FastAPI": {"required": 6.5, "importance": "MEDIUM", "category": "Web/Backend"},
        "SQL": {"required": 7.0, "importance": "MEDIUM", "category": "Databases"},
        "MLOps (MLflow/CI-CD)": {"required": 7.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Statistics & Math": {"required": 8.0, "importance": "HIGH", "category": "AI/ML"},
        "Git/GitHub": {"required": 6.5, "importance": "MEDIUM", "category": "Tools"},
    },
    "Generative AI & LLM Engineer": {
        "Python": {"required": 8.5, "importance": "HIGH", "category": "Languages"},
        "LLMs & Transformers": {"required": 8.5, "importance": "HIGH", "category": "AI/ML"},
        "LangChain / LlamaIndex": {"required": 8.0, "importance": "HIGH", "category": "AI/ML"},
        "Vector DBs (Pinecone/Chroma)": {"required": 7.5, "importance": "HIGH", "category": "Databases"},
        "FastAPI": {"required": 7.5, "importance": "HIGH", "category": "Web/Backend"},
        "Docker": {"required": 7.0, "importance": "HIGH", "category": "DevOps/Cloud"},
        "DSA": {"required": 6.0, "importance": "MEDIUM", "category": "Core CS"},
        "Fine-tuning & LoRA": {"required": 7.0, "importance": "HIGH", "category": "AI/ML"},
        "Git/GitHub": {"required": 6.5, "importance": "MEDIUM", "category": "Tools"},
    },
    "Data Scientist": {
        "Python": {"required": 8.0, "importance": "HIGH", "category": "Languages"},
        "SQL": {"required": 8.5, "importance": "HIGH", "category": "Databases"},
        "Statistics & Math": {"required": 8.5, "importance": "HIGH", "category": "AI/ML"},
        "Machine Learning": {"required": 8.0, "importance": "HIGH", "category": "AI/ML"},
        "Data Visualization (Tableau/Seaborn)": {"required": 7.5, "importance": "HIGH", "category": "Analytics"},
        "Deep Learning": {"required": 6.0, "importance": "MEDIUM", "category": "AI/ML"},
        "DSA": {"required": 5.0, "importance": "LOW", "category": "Core CS"},
        "Pandas & NumPy": {"required": 8.5, "importance": "HIGH", "category": "Analytics"},
        "Cloud (AWS/GCP)": {"required": 5.5, "importance": "LOW", "category": "DevOps/Cloud"},
        "Git/GitHub": {"required": 6.0, "importance": "MEDIUM", "category": "Tools"},
    },
    # 2. Software Engineering, Web & Cloud
    "Full Stack Developer": {
        "JavaScript/TypeScript": {"required": 8.5, "importance": "HIGH", "category": "Languages"},
        "React / Next.js": {"required": 8.0, "importance": "HIGH", "category": "Frontend"},
        "Node.js / Python": {"required": 7.5, "importance": "HIGH", "category": "Backend"},
        "SQL & PostgreSQL": {"required": 7.5, "importance": "HIGH", "category": "Databases"},
        "REST & GraphQL APIs": {"required": 7.5, "importance": "HIGH", "category": "Backend"},
        "DSA": {"required": 7.0, "importance": "HIGH", "category": "Core CS"},
        "Docker": {"required": 6.0, "importance": "MEDIUM", "category": "DevOps/Cloud"},
        "Git/GitHub": {"required": 7.0, "importance": "MEDIUM", "category": "Tools"},
        "Cloud (AWS/Vercel)": {"required": 6.0, "importance": "MEDIUM", "category": "DevOps/Cloud"},
    },
    "Backend Systems Engineer": {
        "Java / Go / Python": {"required": 8.5, "importance": "HIGH", "category": "Languages"},
        "System Design & Microservices": {"required": 8.0, "importance": "HIGH", "category": "Architecture"},
        "SQL & NoSQL (Redis/MongoDB)": {"required": 8.0, "importance": "HIGH", "category": "Databases"},
        "DSA": {"required": 8.0, "importance": "HIGH", "category": "Core CS"},
        "Docker & Kubernetes": {"required": 7.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Message Queues (Kafka/RabbitMQ)": {"required": 7.0, "importance": "HIGH", "category": "Backend"},
        "Git/GitHub": {"required": 7.0, "importance": "MEDIUM", "category": "Tools"},
    },
    "Cloud & DevOps Engineer": {
        "Linux & Shell Scripting": {"required": 8.5, "importance": "HIGH", "category": "Systems"},
        "Cloud (AWS / Azure / GCP)": {"required": 8.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Docker & Kubernetes": {"required": 8.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "CI/CD Pipelines (GitHub Actions/Jenkins)": {"required": 8.0, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Terraform & IaC": {"required": 7.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "Python / Go": {"required": 6.5, "importance": "MEDIUM", "category": "Languages"},
        "Networking & Security": {"required": 7.5, "importance": "HIGH", "category": "Systems"},
    },
    "Cybersecurity Analyst": {
        "Network Security & Protocols": {"required": 8.5, "importance": "HIGH", "category": "Security"},
        "Linux & OS Internals": {"required": 8.0, "importance": "HIGH", "category": "Systems"},
        "Ethical Hacking & Penetration Testing": {"required": 7.5, "importance": "HIGH", "category": "Security"},
        "SIEM & Threat Analysis": {"required": 7.5, "importance": "HIGH", "category": "Security"},
        "Python / Bash Scripting": {"required": 7.0, "importance": "HIGH", "category": "Languages"},
        "Cryptography & Access Control": {"required": 7.0, "importance": "HIGH", "category": "Security"},
    },
    "Data Engineer": {
        "Python": {"required": 8.0, "importance": "HIGH", "category": "Languages"},
        "SQL & Relational Tuning": {"required": 9.0, "importance": "HIGH", "category": "Databases"},
        "PySpark & Distributed Compute": {"required": 8.0, "importance": "HIGH", "category": "Big Data"},
        "Data Warehousing (BigQuery/Snowflake)": {"required": 8.0, "importance": "HIGH", "category": "Databases"},
        "ETL Orchestration (Airflow)": {"required": 7.5, "importance": "HIGH", "category": "Big Data"},
        "Docker & Cloud (AWS/GCP)": {"required": 7.5, "importance": "HIGH", "category": "DevOps/Cloud"},
        "DSA": {"required": 6.5, "importance": "HIGH", "category": "Core CS"},
    },
    "Mobile App Developer (Flutter/React Native)": {
        "Dart (Flutter) / JavaScript (React Native)": {"required": 8.5, "importance": "HIGH", "category": "Mobile"},
        "State Management (Riverpod/Redux)": {"required": 8.0, "importance": "HIGH", "category": "Mobile"},
        "REST API Integration & WebSockets": {"required": 7.5, "importance": "HIGH", "category": "Backend"},
        "UI/UX Design & Responsive Layouts": {"required": 7.5, "importance": "HIGH", "category": "Frontend"},
        "Firebase & Local Databases (SQLite)": {"required": 7.0, "importance": "HIGH", "category": "Databases"},
        "Git/GitHub": {"required": 6.5, "importance": "MEDIUM", "category": "Tools"},
    },
    # 3. Electronics, Hardware & Robotics
    "Embedded Systems & IoT Engineer": {
        "C / C++": {"required": 8.5, "importance": "HIGH", "category": "Languages"},
        "Microcontrollers (ARM, ESP32, STM32)": {"required": 8.5, "importance": "HIGH", "category": "Hardware"},
        "RTOS (FreeRTOS) & Embedded Linux": {"required": 7.5, "importance": "HIGH", "category": "Systems"},
        "Protocols (I2C, SPI, UART, MQTT)": {"required": 8.0, "importance": "HIGH", "category": "Hardware"},
        "PCB Design Basics & Oscilloscope Debugging": {"required": 6.5, "importance": "MEDIUM", "category": "Hardware"},
        "Python Scripting": {"required": 6.0, "importance": "MEDIUM", "category": "Languages"},
    },
    "VLSI & Chip Design Engineer": {
        "Verilog / SystemVerilog": {"required": 8.5, "importance": "HIGH", "category": "Hardware"},
        "Digital System Design": {"required": 8.5, "importance": "HIGH", "category": "Hardware"},
        "CMOS & ASIC Design Flow": {"required": 8.0, "importance": "HIGH", "category": "Hardware"},
        "EDA Tools (Cadence / Synopsys)": {"required": 7.5, "importance": "HIGH", "category": "Hardware"},
        "Static Timing Analysis (STA)": {"required": 7.5, "importance": "HIGH", "category": "Hardware"},
        "Python / Tcl Scripting": {"required": 6.5, "importance": "MEDIUM", "category": "Languages"},
    },
    "Robotics & Automation Engineer": {
        "ROS / ROS 2 (Robot Operating System)": {"required": 8.5, "importance": "HIGH", "category": "Robotics"},
        "C++ / Python": {"required": 8.0, "importance": "HIGH", "category": "Languages"},
        "Kinematics & Motion Planning": {"required": 8.0, "importance": "HIGH", "category": "Robotics"},
        "Sensors & Computer Vision (OpenCV)": {"required": 7.5, "importance": "HIGH", "category": "AI/ML"},
        "Control Systems (PID, State Space)": {"required": 7.5, "importance": "HIGH", "category": "Robotics"},
    },
    # 4. Core Mechanical & Civil Engineering
    "CAD / CAE Simulation Engineer": {
        "3D CAD (SolidWorks / CATIA / Fusion 360)": {"required": 8.5, "importance": "HIGH", "category": "Design"},
        "FEA (Finite Element Analysis / ANSYS)": {"required": 8.0, "importance": "HIGH", "category": "Simulation"},
        "Engineering Mechanics & Strength of Materials": {"required": 8.0, "importance": "HIGH", "category": "Core Engg"},
        "GD&T (Geometric Dimensioning & Tolerancing)": {"required": 7.5, "importance": "HIGH", "category": "Design"},
        "Python / MATLAB for Engg Computation": {"required": 6.5, "importance": "MEDIUM", "category": "Languages"},
    },
    "BIM & Smart Infrastructure Engineer": {
        "BIM Software (Autodesk Revit / Navisworks)": {"required": 8.5, "importance": "HIGH", "category": "Design"},
        "Structural Analysis (ETABS / STAAD Pro)": {"required": 8.0, "importance": "HIGH", "category": "Civil"},
        "Construction Project Management (Primavera/MS Project)": {"required": 7.5, "importance": "HIGH", "category": "Management"},
        "AutoCAD 2D/3D Drafting": {"required": 8.0, "importance": "HIGH", "category": "Design"},
        "GIS & Remote Sensing Basics": {"required": 6.5, "importance": "MEDIUM", "category": "Civil"},
    },
    # 5. Business, Finance & Analytics
    "Business & Product Analyst": {
        "SQL & Advanced Querying": {"required": 8.5, "importance": "HIGH", "category": "Databases"},
        "Data Visualization (PowerBI / Tableau)": {"required": 8.5, "importance": "HIGH", "category": "Analytics"},
        "Business Metrics (KPIs, LTV, CAC, Churn)": {"required": 8.0, "importance": "HIGH", "category": "Business"},
        "Excel & Financial Modeling": {"required": 8.5, "importance": "HIGH", "category": "Analytics"},
        "Product Management & Agile/Scrum": {"required": 7.0, "importance": "HIGH", "category": "Management"},
        "Python Basics (Pandas)": {"required": 6.5, "importance": "MEDIUM", "category": "Languages"},
    },
    "Quantitative Financial Analyst": {
        "Financial Mathematics & Stochastic Calculus": {"required": 8.5, "importance": "HIGH", "category": "Finance"},
        "Python for Quantitative Finance (NumPy/SciPy)": {"required": 8.5, "importance": "HIGH", "category": "Languages"},
        "Time Series Modeling & Econometrics": {"required": 8.0, "importance": "HIGH", "category": "Analytics"},
        "SQL & Financial Data APIs": {"required": 8.0, "importance": "HIGH", "category": "Databases"},
        "Derivatives Pricing & Risk Management": {"required": 7.5, "importance": "HIGH", "category": "Finance"},
        "Algorithmic Trading & Backtesting": {"required": 7.5, "importance": "HIGH", "category": "Finance"},
    },
    "Financial Risk Analyst": {
        "Financial Statement Analysis": {"required": 8.5, "importance": "HIGH", "category": "Finance"},
        "Risk Modeling (Credit, Market, Liquidity Risk)": {"required": 8.0, "importance": "HIGH", "category": "Finance"},
        "Excel VBA & Financial Modeling": {"required": 8.5, "importance": "HIGH", "category": "Analytics"},
        "SQL Querying": {"required": 7.5, "importance": "HIGH", "category": "Databases"},
        "Regulatory Frameworks (Basel III / IFRS)": {"required": 7.0, "importance": "HIGH", "category": "Finance"},
        "Python for Risk Metrics": {"required": 6.5, "importance": "MEDIUM", "category": "Languages"},
    },
    "Fintech Product Manager": {
        "Product Strategy & User Journey Mapping": {"required": 8.5, "importance": "HIGH", "category": "Product"},
        "Fintech Ecosystem (UPI, Payments, Lending, Neo-banking)": {"required": 8.5, "importance": "HIGH", "category": "Finance"},
        "SQL & Product Analytics (Mixpanel/Amplitude)": {"required": 7.5, "importance": "HIGH", "category": "Analytics"},
        "API Design & System Architecture Basics": {"required": 7.0, "importance": "HIGH", "category": "Architecture"},
        "Agile Sprint Execution & Wireframing": {"required": 8.0, "importance": "HIGH", "category": "Product"},
    },
    "Digital Marketing & Growth Analyst": {
        "Growth Analytics & Conversion Rate Optimization (CRO)": {"required": 8.5, "importance": "HIGH", "category": "Marketing"},
        "Google Analytics 4 & Tag Manager": {"required": 8.5, "importance": "HIGH", "category": "Marketing"},
        "SQL & Dashboarding (Looker / PowerBI)": {"required": 7.5, "importance": "HIGH", "category": "Analytics"},
        "Performance Marketing (Meta Ads / Google Search)": {"required": 8.0, "importance": "HIGH", "category": "Marketing"},
        "SEO, Content Strategy & Copywriting": {"required": 7.5, "importance": "HIGH", "category": "Marketing"},
        "A/B Testing & Statistical Significance": {"required": 7.5, "importance": "HIGH", "category": "Analytics"},
    }
}

class ReadinessResult(dict):
    def __init__(self, pct: int, score: float, strong: List[str], missing: List[str], partial: List[str], role: str = ""):
        super().__init__(
            readiness_pct=pct,
            readiness_score=score,
            strong_skills=strong,
            missing_skills=missing,
            partial_skills=partial,
            target_role=role
        )
        self.pct = pct
        self.score = score
        self.strong = strong
        self.missing = missing
        self.partial = partial
        self.role = role

    def __iter__(self):
        return iter((self.pct, self.score, self.strong, self.missing, self.partial))

class CareerEngine:
    @staticmethod
    def get_skill_map(profile: StudentProfile) -> Dict[str, float]:
        skill_dict = {}
        for s in profile.skills:
            skill_dict[s.name.strip().lower()] = s.proficiency
        return skill_dict

    @classmethod
    def get_all_roles(cls) -> List[str]:
        return list(ROLE_BENCHMARKS.keys())

    @classmethod
    def get_degree_catalogue(cls) -> Dict[str, Any]:
        """Maps degrees and disciplines to recommended career goals"""
        return {
            "B.Tech / B.E": {
                "Computer Science / IT": [
                    "Full Stack Developer", "AI Engineer", "ML Engineer", "Backend Systems Engineer",
                    "Cloud & DevOps Engineer", "Cybersecurity Analyst", "Data Engineer",
                    "Mobile App Developer (Flutter/React Native)"
                ],
                "AI, Data Science & Machine Learning": [
                    "AI Engineer", "Generative AI & LLM Engineer", "ML Engineer", "Data Scientist", "Data Engineer"
                ],
                "Electronics & Communication (ECE / EEE)": [
                    "Embedded Systems & IoT Engineer", "VLSI & Chip Design Engineer", "Robotics & Automation Engineer",
                    "Cloud & DevOps Engineer", "Full Stack Developer"
                ],
                "Mechanical & Mechatronics": [
                    "CAD / CAE Simulation Engineer", "Robotics & Automation Engineer",
                    "Business & Product Analyst", "Data Scientist"
                ],
                "Civil & Structural Engineering": [
                    "BIM & Smart Infrastructure Engineer", "CAD / CAE Simulation Engineer",
                    "Business & Product Analyst"
                ]
            },
            "BCA / MCA": {
                "Computer Applications": [
                    "Full Stack Developer", "Mobile App Developer (Flutter/React Native)",
                    "Cloud & DevOps Engineer", "Data Scientist", "Cybersecurity Analyst"
                ]
            },
            "B.Sc / M.Sc": {
                "Computer Science / Data Science": [
                    "Data Scientist", "AI Engineer", "Full Stack Developer", "Data Engineer"
                ],
                "Mathematics / Statistics": [
                    "Quantitative Financial Analyst", "Data Scientist", "Financial Risk Analyst",
                    "Business & Product Analyst"
                ]
            },
            "B.Com / BBA / MBA": {
                "Finance & Banking": [
                    "Financial Risk Analyst", "Quantitative Financial Analyst", "Fintech Product Manager", "Business & Product Analyst"
                ],
                "Management, Marketing & Analytics": [
                    "Business & Product Analyst", "Digital Marketing & Growth Analyst", "Fintech Product Manager"
                ]
            }
        }

    @classmethod
    def analyze_skill_gap(cls, profile: StudentProfile, target_role: str = None) -> List[SkillGapItem]:
        role = target_role or profile.career_goal
        benchmarks = ROLE_BENCHMARKS.get(role, ROLE_BENCHMARKS["AI Engineer"])
        user_skills = cls.get_skill_map(profile)
        
        gaps = []
        for skill_name, req in benchmarks.items():
            req_score = req["required"]
            curr_score = 0.0
            
            key = skill_name.strip().lower()
            if key in user_skills:
                curr_score = user_skills[key]
            else:
                for u_key, u_val in user_skills.items():
                    if u_key in key or key in u_key:
                        curr_score = max(curr_score, u_val)
            
            if curr_score >= req_score * 0.85:
                status = "MASTERED"
                curr_lvl = "Advanced" if curr_score >= 7.5 else "Intermediate"
            elif curr_score >= req_score * 0.35:
                status = "IN_PROGRESS"
                curr_lvl = "Beginner / Developing"
            else:
                status = "MISSING"
                curr_lvl = "Not Started"
                
            gaps.append(SkillGapItem(
                skill=skill_name,
                required_level=f"{req_score}/10 ({req['importance']})",
                current_level=f"{curr_score}/10 ({curr_lvl})",
                status=status,
                importance=req["importance"],
                category=req["category"]
            ))
            
        order = {"MISSING": 0, "IN_PROGRESS": 1, "MASTERED": 2}
        imp_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        gaps.sort(key=lambda x: (order.get(x.status, 3), imp_order.get(x.importance, 3)))
        return gaps

    @classmethod
    def calculate_readiness(cls, profile: StudentProfile, role_name: Optional[str] = None) -> "ReadinessResult":
        role = role_name or profile.career_goal or "AI Engineer"
        benchmarks = ROLE_BENCHMARKS.get(role, ROLE_BENCHMARKS.get(profile.career_goal, ROLE_BENCHMARKS["AI Engineer"]))
        user_skills = cls.get_skill_map(profile)
        
        total_weight = 0.0
        earned_weight = 0.0
        strong = []
        missing = []
        partial = []
        
        weights = {"HIGH": 3.0, "MEDIUM": 2.0, "LOW": 1.0}
        
        for skill_name, req in benchmarks.items():
            w = weights.get(req["importance"], 2.0)
            req_score = req["required"]
            curr_score = 0.0
            
            key = skill_name.strip().lower()
            if key in user_skills:
                curr_score = user_skills[key]
            else:
                for u_key, u_val in user_skills.items():
                    if u_key in key or key in u_key:
                        curr_score = max(curr_score, u_val)
                        
            ratio = min(1.0, curr_score / req_score if req_score > 0 else 1.0)
            earned_weight += ratio * w
            total_weight += w
            
            if curr_score >= req_score * 0.8:
                strong.append(skill_name)
            elif curr_score >= req_score * 0.35:
                partial.append(skill_name)
            else:
                missing.append(skill_name)
                
        pct = int(round((earned_weight / total_weight) * 100)) if total_weight > 0 else 0
        readiness_score = round((pct / 10.0), 1)
        return ReadinessResult(pct, readiness_score, strong, missing, partial, role)

    @classmethod
    def get_career_recommendations(cls, profile: StudentProfile) -> List[CareerMatch]:
        results = []
        descriptions = {
            "AI Engineer": "Designs, deploys, and scales Generative AI, LLM applications, and deep learning systems into production APIs.",
            "ML Engineer": "Builds automated ML pipelines, feature stores, model training loops, and CI/CD for predictive models.",
            "Generative AI & LLM Engineer": "Specializes in prompt engineering, RAG pipelines, fine-tuning open-weights models, and vector database retrieval.",
            "Data Scientist": "Extracts predictive insights from structured/unstructured data using statistical modeling and machine learning.",
            "Full Stack Developer": "Creates end-to-end web applications combining React/Next.js frontends, microservices, and databases.",
            "Backend Systems Engineer": "Architects high-concurrency distributed systems, message queues, and low-latency database engines.",
            "Cloud & DevOps Engineer": "Automates cloud infrastructure, Kubernetes clusters, CI/CD deployment pipelines, and security monitoring.",
            "Cybersecurity Analyst": "Secures enterprise infrastructure through penetration testing, vulnerability assessments, and SIEM monitoring.",
            "Data Engineer": "Architects high-throughput ETL data pipelines, lakehouses, BigQuery schemas, and data warehousing infrastructure.",
            "Mobile App Developer (Flutter/React Native)": "Develops cross-platform native iOS & Android applications with offline-first architecture.",
            "Embedded Systems & IoT Engineer": "Programs microcontrollers (ARM, ESP32), RTOS, and hardware communication protocols for smart devices.",
            "VLSI & Chip Design Engineer": "Designs, synthesizes, and verifies digital integrated circuits, ASICs, and FPGA systems using Verilog/EDA tools.",
            "Robotics & Automation Engineer": "Builds autonomous robotic systems, ROS 2 pipelines, motion planning, and computer vision integration.",
            "CAD / CAE Simulation Engineer": "Conducts finite element structural simulations (FEA), thermal stress analysis, and generative 3D modeling.",
            "BIM & Smart Infrastructure Engineer": "Leads building information modeling, 3D structural analysis, and smart construction lifecycle planning.",
            "Business & Product Analyst": "Translates complex user and financial telemetry into actionable product roadmaps and SQL analytics.",
            "Quantitative Financial Analyst": "Develops mathematical trading models, derivative pricing engines, and algorithmic execution strategies.",
            "Financial Risk Analyst": "Models credit, market, and liquidity risk for banks, fintechs, and asset management institutions.",
            "Fintech Product Manager": "Drives payment gateway integrations, neo-banking user experiences, and regulatory compliance workflows.",
            "Digital Marketing & Growth Analyst": "Scales customer acquisition funnels through conversion rate optimization, Google Analytics 4, and paid ads."
        }
        salaries = {
            "AI Engineer": "₹12L - ₹24L/yr (High Growth)",
            "ML Engineer": "₹10L - ₹22L/yr (High Demand)",
            "Generative AI & LLM Engineer": "₹14L - ₹26L/yr (Top Tier)",
            "Data Scientist": "₹9L - ₹18L/yr (Stable)",
            "Full Stack Developer": "₹8L - ₹18L/yr (Broad Opportunities)",
            "Backend Systems Engineer": "₹10L - ₹22L/yr (Core Tech)",
            "Cloud & DevOps Engineer": "₹9L - ₹20L/yr (High Demand)",
            "Cybersecurity Analyst": "₹8L - ₹18L/yr (Critical Role)",
            "Data Engineer": "₹10L - ₹20L/yr (High Demand)",
            "Mobile App Developer (Flutter/React Native)": "₹7L - ₹16L/yr (Fast Growing)",
            "Embedded Systems & IoT Engineer": "₹7L - ₹16L/yr (Core Tech)",
            "VLSI & Chip Design Engineer": "₹10L - ₹22L/yr (Semiconductor)",
            "Robotics & Automation Engineer": "₹8L - ₹18L/yr (Advanced Tech)",
            "CAD / CAE Simulation Engineer": "₹6L - ₹14L/yr (Core Engg)",
            "BIM & Smart Infrastructure Engineer": "₹6L - ₹15L/yr (Core Engg)",
            "Business & Product Analyst": "₹8L - ₹16L/yr (High Demand)",
            "Quantitative Financial Analyst": "₹14L - ₹30L/yr (Fintech/Quant)",
            "Financial Risk Analyst": "₹8L - ₹18L/yr (Banking/Fintech)",
            "Fintech Product Manager": "₹12L - ₹25L/yr (Leadership)",
            "Digital Marketing & Growth Analyst": "₹6L - ₹15L/yr (Growth)"
        }
        
        for role_name in ROLE_BENCHMARKS.keys():
            pct, score, strong, missing, partial = cls.calculate_readiness(profile, role_name)
            
            reasons = []
            if profile.career_goal.lower() in role_name.lower():
                reasons.append(f"Directly matches your designated target career goal of {role_name}.")
            if "Python" in strong or "JavaScript/TypeScript" in strong or "C / C++" in strong or "SQL" in strong:
                reasons.append("Leverages your core programming and analytical foundations.")
            if profile.academic.branch:
                reasons.append(f"Strongly aligns with your {profile.academic.branch} curriculum.")
            if missing:
                reasons.append(f"Key gap to close: {', '.join(missing[:2])}.")
                
            why = " ".join(reasons) if reasons else f"Great alignment with your {profile.academic.degree} degree."
            
            results.append(CareerMatch(
                role=role_name,
                match_percentage=pct,
                readiness_score=score,
                badge="🥇 Target Role" if role_name == profile.career_goal else "Alternative Career Path",
                description=descriptions.get(role_name, ""),
                why_recommended=why,
                salary_range_inr=salaries.get(role_name, "₹8L - ₹18L/yr"),
                strong_skills=strong,
                missing_skills=missing,
                partial_skills=partial
            ))
            
        results.sort(key=lambda x: (x.role == profile.career_goal, x.match_percentage), reverse=True)
        if len(results) >= 1:
            results[0].badge = "🥇 Target Goal"
        if len(results) >= 2 and results[1].role != profile.career_goal:
            results[1].badge = "🥈 Strong Alternative"
        if len(results) >= 3 and results[2].role != profile.career_goal:
            results[2].badge = "🥉 Viable Path"
            
        return results

    @classmethod
    def generate_roadmap(cls, profile: StudentProfile) -> LearningRoadmap:
        target = profile.career_goal
        hours_per_day = max(1.0, profile.preferences.study_hours_per_day)
        weekly_hours = hours_per_day * 7
        
        gaps = cls.analyze_skill_gap(profile, target)
        missing_names = [g.skill for g in gaps if g.status in ["MISSING", "IN_PROGRESS"]]
        p1 = missing_names[0] if len(missing_names) > 0 else "Core Foundations"
        p2 = missing_names[1] if len(missing_names) > 1 else "Advanced Architecture"
        p3 = missing_names[2] if len(missing_names) > 2 else "Production Deployment"

        months = [
            RoadmapMonth(
                month_number=1,
                month_title=f"Month 1: Core Foundations & Algorithmic Problem Solving",
                focus_theme=f"Master fundamental programming, data structures, and tools for {target}",
                milestones=[
                    RoadmapMilestone(
                        title=f"Core Language & Tooling Mastery",
                        topics=["Object-Oriented Design", "Version Control (Git/GitHub)", "Clean Code & Testing"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Modular GitHub Repository with CI/CD Unit Tests"
                    ),
                    RoadmapMilestone(
                        title="Problem Solving & Logic Sprints",
                        topics=["Core Data Structures", "Algorithmic Complexity", "Interview Patterns"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Solve 25+ domain problems on LeetCode/HackerRank"
                    )
                ],
                project_milestone="Automated Codebase Scaffold & Portfolio Setup",
                target_completion_weeks=4
            ),
            RoadmapMonth(
                month_number=2,
                month_title=f"Month 2: Primary Domain Gap - {p1}",
                focus_theme=f"Hands-on immersion and practical engineering for {p1}",
                milestones=[
                    RoadmapMilestone(
                        title=f"{p1} Deep Dive",
                        topics=[f"{p1} Architecture", "Core Libraries & Frameworks", "Validation & Benchmarking"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable=f"Working {p1} Implementation Pipeline"
                    ),
                    RoadmapMilestone(
                        title="Data Handling & Integration",
                        topics=["Data Ingestion & Cleaning", "Database Queries & Indexing", "Performance Optimization"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Optimized Database & Data Schema"
                    )
                ],
                project_milestone=f"{p1} Capstone Implementation with Documentation",
                target_completion_weeks=4
            ),
            RoadmapMonth(
                month_number=3,
                month_title=f"Month 3: Secondary Domain Gap - {p2}",
                focus_theme=f"Advanced system engineering and scaling with {p2}",
                milestones=[
                    RoadmapMilestone(
                        title=f"{p2} System Design",
                        topics=[f"{p2} Scalability", "Async / Concurrent Processing", "API Contract Design"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable=f"Production-grade {p2} Service"
                    ),
                    RoadmapMilestone(
                        title="Automated Validation & Testing",
                        topics=["Integration Tests", "Benchmark Telemetry", "Error Handling & Retries"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Automated Test Suite with >80% Coverage"
                    )
                ],
                project_milestone=f"Integrated {target} Microservice Architecture",
                target_completion_weeks=4
            ),
            RoadmapMonth(
                month_number=4,
                month_title=f"Month 4: Production Deployment & Containerization ({p3})",
                focus_theme="Packaging, Docker, Cloud Deployment & Observability",
                milestones=[
                    RoadmapMilestone(
                        title="Containerization & Cloud Infrastructure",
                        topics=["Multi-stage Dockerfiles", "Cloud Setup (AWS/GCP)", "Environment Secrets Management"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Dockerized Container Deployed to Cloud"
                    ),
                    RoadmapMilestone(
                        title="Monitoring & API Documentation",
                        topics=["Swagger / OpenAPI Docs", "Structured Logging", "Latency Benchmarks"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Live Public API Endpoint with Interactive Docs"
                    )
                ],
                project_milestone="Cloud-Hosted Production Demo with Live URL",
                target_completion_weeks=4
            ),
            RoadmapMonth(
                month_number=5,
                month_title="Month 5: Comprehensive Capstone Project",
                focus_theme="Building a standout portfolio piece tailored to hiring managers",
                milestones=[
                    RoadmapMilestone(
                        title="Full-Stack Integration",
                        topics=["End-to-End User Flow", "Interactive Dashboard/UI", "Asynchronous Processing"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Complete Flagship Project Demo Video & Repo"
                    ),
                    RoadmapMilestone(
                        title="Resume ATS Engineering",
                        topics=["Quantified STAR Impact Bullets", "GitHub Showcase Readme", "Tech Stack Highlighting"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="ATS-Optimized 90+ Score Resume"
                    )
                ],
                project_milestone="Flagship GitHub Repository with 5-Star Documentation",
                target_completion_weeks=4
            ),
            RoadmapMonth(
                month_number=6,
                month_title="Month 6: Placement & Interview Readiness Sprint",
                focus_theme="Mock Interviews, Technical Rounds, and Active Job Applications",
                milestones=[
                    RoadmapMilestone(
                        title="Technical & System Design Mock Rounds",
                        topics=["Live Coding Interviews", "System Architecture Defense", "Behavioral / Leadership STAR"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Complete 10 Mock Technical Interviews"
                    ),
                    RoadmapMilestone(
                        title="Targeted Job Application Campaign",
                        topics=["Target Company Mapping", "LinkedIn Networking", "Referral Outreach"],
                        estimated_hours=int(weekly_hours * 2),
                        key_deliverable="Apply to 30+ curated campus and off-campus openings"
                    )
                ],
                project_milestone="Offer-Ready Portfolio, Resume & Recruiter Pipeline",
                target_completion_weeks=4
            )
        ]

        return LearningRoadmap(
            career_goal=target,
            total_duration_months=6,
            weekly_commitment_hours=weekly_hours,
            months=months
        )

    @classmethod
    def get_recommended_projects(cls, profile: StudentProfile) -> List[RecommendedProject]:
        target = profile.career_goal
        
        # Build customizable projects
        return [
            RecommendedProject(
                title=f"Production-Grade {target} Enterprise Capstone",
                difficulty="Advanced",
                estimated_hours=40,
                skills_learned=[target, "Docker", "REST APIs", "Cloud Deployment", "Git/GitHub"],
                description=f"A full-lifecycle production project implementing core {target} workflows, containerized with Docker, automated with CI/CD, and deployed live to cloud infrastructure.",
                roi_score="10/10",
                resume_bullet=f"Architected and deployed production {target} microservice handling real-time requests with <50ms latency, achieving 99.8% uptime using Docker and automated CI/CD."
            ),
            RecommendedProject(
                title=f"Intelligent Analytics & Automation Engine for {target}",
                difficulty="Intermediate",
                estimated_hours=25,
                skills_learned=["SQL", "Python", "Data Processing", "System Design"],
                description=f"An automated pipeline that ingests, cleans, analyzes, and visualizes complex telemetry for {target} decision making.",
                roi_score="9/10",
                resume_bullet=f"Engineered high-throughput ETL data pipeline processing 50K+ records with SQL and Python, reducing manual analysis latency by 65%."
            ),
            RecommendedProject(
                title=f"Interactive Real-Time Dashboard & Benchmark Suite",
                difficulty="Intermediate",
                estimated_hours=20,
                skills_learned=["React", "Data Visualization", "FastAPI", "WebSockets"],
                description="Modern full-stack web dashboard providing real-time telemetry, model metrics, and user controls.",
                roi_score="8.5/10",
                resume_bullet="Developed responsive real-time web interface with React and FastAPI, visualizing key operational KPIs and telemetry."
            )
        ]

    recommend_projects = get_recommended_projects
    recommend_careers = get_career_recommendations
