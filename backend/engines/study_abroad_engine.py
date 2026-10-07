import json
import logging
from typing import Dict, Any, List, Optional
from models import (
    StudyAbroadCountry,
    ExamPlanSection,
    ExamPlanItem,
    PracticePaperQuestion,
    PracticePaperItem,
    ShortlistedUniversity,
    StudyAbroadCostRoiEstimate,
    SopLorGenerationResponse,
    StudyAbroadRoadmapPhase,
    StudyAbroadMasterRoadmap,
    StudyAbroadOverviewResponse
)

logger = logging.getLogger(__name__)

# Complete Catalog of 10 Global Higher-Education Destinations
COUNTRIES_CATALOG: List[StudyAbroadCountry] = [
    StudyAbroadCountry(
        id="USA",
        name="United States",
        flag="🇺🇸",
        currency="USD ($)",
        avg_tuition_annual_inr=3200000.0,  # ~ $38,000 / yr
        avg_living_annual_inr=1300000.0,   # ~ $15,000 / yr
        psw_visa_years="3 Years (STEM OPT)",
        common_exams=["GRE (Required/Optional by Uni)", "IELTS / TOEFL"],
        english_tests=["IELTS 7.0+", "TOEFL 100+"],
        key_advantages=[
            "Global AI & Silicon Valley Epicenter",
            "Highest post-MS median salaries ($115k - $145k)",
            "Extensive on-campus TA/RA funding and CPT/OPT internships"
        ],
        intake_seasons=["Fall (August - Major)", "Spring (January - Secondary)"]
    ),
    StudyAbroadCountry(
        id="DEU",
        name="Germany",
        flag="🇩🇪",
        currency="EUR (€)",
        avg_tuition_annual_inr=350000.0,    # ~ €3,000 / yr (mostly public €0-€3k)
        avg_living_annual_inr=1050000.0,   # Blocked account €11,208 / yr (~₹10.5L)
        psw_visa_years="18 Months Job Seeking + EU Blue Card",
        common_exams=["APS Certificate (Mandatory)", "GRE (Required for TUM/RWTH/Saarland)", "IELTS"],
        english_tests=["IELTS 6.5 - 7.0", "TOEFL 90+"],
        key_advantages=[
            "Nearly tuition-free top world universities (TUM, RWTH Aachen)",
            "Unbeatable ROI with lowest financial leverage risk",
            "Strongest European industrial base for Robotics, AI & Engineering"
        ],
        intake_seasons=["Winter (October - Major)", "Summer (April)"]
    ),
    StudyAbroadCountry(
        id="CAN",
        name="Canada",
        flag="🇨🇦",
        currency="CAD ($)",
        avg_tuition_annual_inr=2200000.0,  # ~ CAD 35,000 / yr
        avg_living_annual_inr=1150000.0,   # ~ CAD 18,000 / yr
        psw_visa_years="Up to 3 Years (PGWP)",
        common_exams=["GRE (Recommended for Top Research)", "IELTS / TOEFL"],
        english_tests=["IELTS 7.0 (No band < 6.5)", "TOEFL 95+"],
        key_advantages=[
            "Clear Post-Graduation Work Permit (PGWP) structure",
            "MIM and Computer Science co-op research pipelines",
            "Welcoming high-skilled immigration frameworks (Express Entry)"
        ],
        intake_seasons=["Fall (September)", "Winter (January)"]
    ),
    StudyAbroadCountry(
        id="GBR",
        name="United Kingdom",
        flag="🇬🇧",
        currency="GBP (£)",
        avg_tuition_annual_inr=2900000.0,  # ~ £27,000 / yr
        avg_living_annual_inr=1350000.0,   # ~ £12,500 / yr
        psw_visa_years="2 Years (Graduate Route)",
        common_exams=["GRE (Waived at most, required at Oxbridge/Imperial)", "IELTS"],
        english_tests=["IELTS 6.5 - 7.5", "TOEFL 95+"],
        key_advantages=[
            "1-Year Fast-track Masters degree (Saves 1 year of living costs)",
            "World-renowned academic prestige (Russell Group)",
            "London financial & tech hub proximity"
        ],
        intake_seasons=["Autumn (September/October)", "Spring (January/February)"]
    ),
    StudyAbroadCountry(
        id="AUS",
        name="Australia",
        flag="🇦🇺",
        currency="AUD ($)",
        avg_tuition_annual_inr=2500000.0,  # ~ AUD 42,000 / yr
        avg_living_annual_inr=1250000.0,   # ~ AUD 22,000 / yr
        psw_visa_years="2 to 4 Years (Subclass 485)",
        common_exams=["IELTS / PTE / TOEFL", "GRE generally not required"],
        english_tests=["IELTS 6.5+", "PTE Academic 65+"],
        key_advantages=[
            "Group of Eight (Go8) research universities",
            "Generous post-study work visa rights in regional tech cities",
            "High student minimum wage for part-time campus work"
        ],
        intake_seasons=["Semester 1 (February)", "Semester 2 (July)"]
    ),
    StudyAbroadCountry(
        id="IRL",
        name="Ireland",
        flag="🇮🇪",
        currency="EUR (€)",
        avg_tuition_annual_inr=1900000.0,  # ~ €20,000 / yr
        avg_living_annual_inr=1100000.0,   # ~ €12,000 / yr
        psw_visa_years="2 Years (Third Level Graduate Scheme)",
        common_exams=["IELTS / TOEFL / Duolingo", "GRE rarely required"],
        english_tests=["IELTS 6.5+", "TOEFL 90+"],
        key_advantages=[
            "European Silicon Valley (HQ for Google, Meta, Apple, Pfizer, Stripe)",
            "English-speaking EU eurozone economy",
            "Very high post-study tech placement rate for CS & Data graduates"
        ],
        intake_seasons=["Autumn (September)", "Spring (January)"]
    ),
    StudyAbroadCountry(
        id="NLD",
        name="Netherlands",
        flag="🇳🇱",
        currency="EUR (€)",
        avg_tuition_annual_inr=1800000.0,  # ~ €19,000 / yr
        avg_living_annual_inr=1150000.0,   # ~ €12,500 / yr
        psw_visa_years="1 Year (Zoekjaar Orientation Visa)",
        common_exams=["GRE (Required by TU Delft / TU Eindhoven)", "IELTS"],
        english_tests=["IELTS 6.5 - 7.0", "TOEFL 92+"],
        key_advantages=[
            "Semiconductor & deep-tech powerhouses (ASML, Philips, Booking)",
            "Entirely English-taught master programs",
            "Top-ranked technical universities (TU Delft, Eindhoven)"
        ],
        intake_seasons=["Fall (September)"]
    ),
    StudyAbroadCountry(
        id="FRA",
        name="France",
        flag="🇫🇷",
        currency="EUR (€)",
        avg_tuition_annual_inr=950000.0,   # ~ €10,000 / yr (public/grandes ecoles)
        avg_living_annual_inr=950000.0,    # ~ €10,000 / yr
        psw_visa_years="2 Years + 5-Year Schengen Circulation Visa",
        common_exams=["GRE (Optional)", "IELTS / TOEFL"],
        english_tests=["IELTS 6.5+", "TOEFL 88+"],
        key_advantages=[
            "Global mathematical & AI foundation excellence (INRIA, Mistral AI)",
            "Subsidized student housing (CAF allowance ~30-40% rent reduction)",
            "5-year special Schengen visa for Indian Master's alumni"
        ],
        intake_seasons=["Fall (September/October)"]
    ),
    StudyAbroadCountry(
        id="SGP",
        name="Singapore",
        flag="🇸🇬",
        currency="SGD ($)",
        avg_tuition_annual_inr=2800000.0,  # ~ SGD 45,000 / yr
        avg_living_annual_inr=1300000.0,   # ~ SGD 20,000 / yr
        psw_visa_years="1 Year (LTVP Graduate Search)",
        common_exams=["GRE (Highly Recommended 320+)", "TOEFL / IELTS"],
        english_tests=["IELTS 7.0+", "TOEFL 100+"],
        key_advantages=[
            "World Top 15 Universities (NUS, NTU)",
            "Asia's premier fintech and venture capital capital",
            "Zero language barrier and safe cosmopolitan environment"
        ],
        intake_seasons=["August (Main)", "January"]
    ),
    StudyAbroadCountry(
        id="NZL",
        name="New Zealand",
        flag="🇳🇿",
        currency="NZD ($)",
        avg_tuition_annual_inr=2100000.0,  # ~ NZD 38,000 / yr
        avg_living_annual_inr=1050000.0,   # ~ NZD 19,000 / yr
        psw_visa_years="Up to 3 Years Post-Study Work",
        common_exams=["IELTS / PTE / TOEFL", "GRE not required"],
        english_tests=["IELTS 6.5+", "PTE 64+"],
        key_advantages=[
            "High quality of life and scenic campus environments",
            "Clear 3-year post study open work visas for Masters graduates",
            "Fast growing demand in AI, Cloud Computing, and Cybersecurity"
        ],
        intake_seasons=["Semester 1 (February)", "Semester 2 (July)"]
    ),
]

# Curated University Database with Realistic Benchmarks, Cutoffs & ROI
CURATED_UNIVERSITIES_DB: List[Dict[str, Any]] = [
    # USA
    {
        "id": "cmu_msai",
        "university_name": "Carnegie Mellon University",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Artificial Intelligence & Innovation (MSAII)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 52,
        "annual_tuition_usd": 56000.0,
        "annual_tuition_inr": 4650000.0,
        "annual_living_inr": 1400000.0,
        "min_cgpa_cutoff": 8.8,
        "gre_requirement": "Required (Target: 325+ | Q: 168+)",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 12800000.0,  # $150k
        "official_portal_url": "https://www.cmu.edu/graduate/admissions/",
        "application_deadline": "Dec 15 (Fall Intake)",
        "application_fee_inr": 10500.0,
        "is_stem_certified": True
    },
    {
        "id": "ucsd_mscs",
        "university_name": "University of California San Diego",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Computer Science (AI/ML Track)",
        "tier": "TARGET",
        "qs_world_ranking": 62,
        "annual_tuition_usd": 34000.0,
        "annual_tuition_inr": 2850000.0,
        "annual_living_inr": 1450000.0,
        "min_cgpa_cutoff": 8.2,
        "gre_requirement": "Optional / Recommended (Target: 320+)",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 11000000.0,  # $130k
        "official_portal_url": "https://cse.ucsd.edu/graduate/admissions",
        "application_deadline": "Dec 20 (Fall Intake)",
        "application_fee_inr": 12500.0,
        "is_stem_certified": True
    },
    {
        "id": "asu_msse",
        "university_name": "Arizona State University",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Software Engineering / Computer Science",
        "tier": "SAFE",
        "qs_world_ranking": 179,
        "annual_tuition_usd": 31000.0,
        "annual_tuition_inr": 2580000.0,
        "annual_living_inr": 1100000.0,
        "min_cgpa_cutoff": 7.2,
        "gre_requirement": "Waived / Optional for qualified applicants",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 8500000.0,  # $100k
        "official_portal_url": "https://admission.asu.edu/graduate/apply",
        "application_deadline": "Feb 01 (Fall Intake)",
        "application_fee_inr": 9500.0,
        "is_stem_certified": True
    },
    # Germany
    {
        "id": "tum_msinf",
        "university_name": "Technical University of Munich (TUM)",
        "country": "Germany",
        "flag": "🇩🇪",
        "program_name": "M.Sc. Informatics (AI & Machine Learning)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 28,
        "annual_tuition_usd": 6500.0,
        "annual_tuition_inr": 540000.0,  # ~€6,000 / yr for non-EU
        "annual_living_inr": 1100000.0,
        "min_cgpa_cutoff": 8.5,
        "gre_requirement": "Mandatory for non-EU (Quant: 164+, Verbal: 153+)",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 7200000.0,  # ~€75k
        "official_portal_url": "https://campus.tum.de",
        "application_deadline": "May 31 (Winter Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "rwth_mscs",
        "university_name": "RWTH Aachen University",
        "country": "Germany",
        "flag": "🇩🇪",
        "program_name": "M.Sc. Computer Science (Software Systems)",
        "tier": "TARGET",
        "qs_world_ranking": 99,
        "annual_tuition_usd": 700.0,
        "annual_tuition_inr": 60000.0,  # Tuition-free (only semester ticket ~€320/sem)
        "annual_living_inr": 980000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Mandatory for non-EU applicants (Q: 160+, V: 145+)",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6500000.0,  # ~€68k
        "official_portal_url": "https://online.rwth-aachen.de",
        "application_deadline": "Mar 01 (Winter Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "stuttgart_mscs",
        "university_name": "University of Stuttgart",
        "country": "Germany",
        "flag": "🇩🇪",
        "program_name": "M.Sc. Computer Science (Intelligent Systems)",
        "tier": "SAFE",
        "qs_world_ranking": 312,
        "annual_tuition_usd": 3200.0,
        "annual_tuition_inr": 270000.0,  # €1,500 / sem
        "annual_living_inr": 960000.0,
        "min_cgpa_cutoff": 7.5,
        "gre_requirement": "Recommended, not mandatory",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5900000.0,  # ~€62k
        "official_portal_url": "https://c@mpus.uni-stuttgart.de",
        "application_deadline": "Feb 15 (Winter Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    # Canada
    {
        "id": "utoronto_mscac",
        "university_name": "University of Toronto",
        "country": "Canada",
        "flag": "🇨🇦",
        "program_name": "MSc in Applied Computing (AI Concentration)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 21,
        "annual_tuition_usd": 36000.0,
        "annual_tuition_inr": 2980000.0,
        "annual_living_inr": 1300000.0,
        "min_cgpa_cutoff": 8.6,
        "gre_requirement": "Recommended for international applicants",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 7800000.0,  # CAD 115k
        "official_portal_url": "https://mscac.utoronto.ca/admissions",
        "application_deadline": "Dec 01 (Fall Intake)",
        "application_fee_inr": 11000.0,
        "is_stem_certified": True
    },
    {
        "id": "waterloo_mmath",
        "university_name": "University of Waterloo",
        "country": "Canada",
        "flag": "🇨🇦",
        "program_name": "MMath in Computer Science",
        "tier": "TARGET",
        "qs_world_ranking": 112,
        "annual_tuition_usd": 24000.0,
        "annual_tuition_inr": 1980000.0,
        "annual_living_inr": 1150000.0,
        "min_cgpa_cutoff": 8.1,
        "gre_requirement": "Optional but adds significant competitive edge",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 7200000.0,  # CAD 105k
        "official_portal_url": "https://uwaterloo.ca/graduate-studies-postdoctoral-affairs/",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 8500.0,
        "is_stem_certified": True
    },
    {
        "id": "uottawa_mengcs",
        "university_name": "University of Ottawa",
        "country": "Canada",
        "flag": "🇨🇦",
        "program_name": "M.Eng. Computer Science (Applied AI Option)",
        "tier": "SAFE",
        "qs_world_ranking": 203,
        "annual_tuition_usd": 21000.0,
        "annual_tuition_inr": 1750000.0,
        "annual_living_inr": 1050000.0,
        "min_cgpa_cutoff": 7.3,
        "gre_requirement": "Waived",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5800000.0,  # CAD 85k
        "official_portal_url": "https://www.uottawa.ca/study/graduate-studies",
        "application_deadline": "Feb 01 (Fall Intake)",
        "application_fee_inr": 7500.0,
        "is_stem_certified": True
    },
    # UK
    {
        "id": "imperial_mscai",
        "university_name": "Imperial College London",
        "country": "United Kingdom",
        "flag": "🇬🇧",
        "program_name": "MSc in Artificial Intelligence (1-Year Intensive)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 2,
        "annual_tuition_usd": 50000.0,
        "annual_tuition_inr": 4150000.0,
        "annual_living_inr": 1500000.0,
        "min_cgpa_cutoff": 8.7,
        "gre_requirement": "Not required, high honors degree needed",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 7800000.0,  # £72k
        "official_portal_url": "https://www.imperial.ac.uk/study/apply/postgraduate-taught/",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 9800.0,
        "is_stem_certified": True
    },
    {
        "id": "edinburgh_mscai",
        "university_name": "University of Edinburgh",
        "country": "United Kingdom",
        "flag": "🇬🇧",
        "program_name": "MSc in Artificial Intelligence",
        "tier": "TARGET",
        "qs_world_ranking": 27,
        "annual_tuition_usd": 46000.0,
        "annual_tuition_inr": 3800000.0,
        "annual_living_inr": 1300000.0,
        "min_cgpa_cutoff": 8.2,
        "gre_requirement": "Not required",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 6500000.0,  # £60k
        "official_portal_url": "https://www.ed.ac.uk/studying/postgraduate/applying",
        "application_deadline": "Mar 31 (Fall Intake)",
        "application_fee_inr": 6500.0,
        "is_stem_certified": True
    },
    {
        "id": "qmul_mscai",
        "university_name": "Queen Mary University of London",
        "country": "United Kingdom",
        "flag": "🇬🇧",
        "program_name": "MSc in Artificial Intelligence & Machine Learning",
        "tier": "SAFE",
        "qs_world_ranking": 120,
        "annual_tuition_usd": 35000.0,
        "annual_tuition_inr": 2900000.0,
        "annual_living_inr": 1250000.0,
        "min_cgpa_cutoff": 7.3,
        "gre_requirement": "Waived",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5400000.0,  # £50k
        "official_portal_url": "https://www.qmul.ac.uk/postgraduate/howtoapply/",
        "application_deadline": "May 31 (Fall Intake)",
        "application_fee_inr": 5000.0,
        "is_stem_certified": True
    },
    # Ireland
    {
        "id": "tcd_mscs",
        "university_name": "Trinity College Dublin",
        "country": "Ireland",
        "flag": "🇮🇪",
        "program_name": "M.Sc. in Computer Science (Intelligent Systems)",
        "tier": "TARGET",
        "qs_world_ranking": 87,
        "annual_tuition_usd": 27000.0,
        "annual_tuition_inr": 2250000.0,
        "annual_living_inr": 1150000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Optional",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6200000.0,  # €65k
        "official_portal_url": "https://www.tcd.ie/academic-registry/study/apply/",
        "application_deadline": "Apr 30 (Fall Intake)",
        "application_fee_inr": 5000.0,
        "is_stem_certified": True
    },
    # Australia
    {
        "id": "melbourne_mit",
        "university_name": "University of Melbourne",
        "country": "Australia",
        "flag": "🇦🇺",
        "program_name": "Master of Information Technology (AI Specialization)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 13,
        "annual_tuition_usd": 33000.0,
        "annual_tuition_inr": 2750000.0,
        "annual_living_inr": 1300000.0,
        "min_cgpa_cutoff": 8.3,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6500000.0,  # AUD 105k
        "official_portal_url": "https://study.unimelb.edu.au/how-to-apply",
        "application_deadline": "Nov 30 (Feb Intake)",
        "application_fee_inr": 7000.0,
        "is_stem_certified": True
    }
]

# Educational Practice Questions & Official Sample Papers
EDUCATIONAL_PRACTICE_PAPERS: List[PracticePaperItem] = [
    PracticePaperItem(
        id="gre_quant_diag_01",
        exam="GRE",
        title="GRE Quantitative Diagnostic: Algebra & Data Analysis",
        category="QUANTITATIVE",
        difficulty="Realistic Exam",
        time_limit_minutes=25,
        question_count=4,
        source_attribution="Elevare Open Educational GRE Practice Standard (Based on ETS quantitative frameworks)",
        questions=[
            PracticePaperQuestion(
                id="q_greq_1",
                question="If x is an integer such that 3^(2x + 1) = 243, what is the value of (2x - 1)^2?",
                options=["9", "25", "16", "4"],
                correct_option=0,
                explanation="First equate exponents: 243 = 3^5. Thus 2x + 1 = 5 ==> 2x = 4 ==> x = 2. Then (2(2) - 1)^2 = (4 - 1)^2 = 3^2 = 9."
            ),
            PracticePaperQuestion(
                id="q_greq_2",
                question="A dataset consists of 5 integers: {12, 18, 24, x, 36}. If the median of the dataset is equal to its arithmetic mean, and x is known to be greater than 24, what is the value of x?",
                options=["30", "35", "40", "45"],
                correct_option=1,
                explanation="Since x > 24, the numbers ordered from smallest to largest are 12, 18, 24, 36, x (or 12, 18, 24, x, 36). In both arrangements, the 3rd term is 24, so the median = 24. Since mean = median: (12 + 18 + 24 + 36 + x) / 5 = 24 ==> (90 + x) / 5 = 24 ==> 90 + x = 120 ==> x = 30? Wait: 12 + 18 + 24 + 36 = 90. If 90 + x = 120, x = 30. Notice if x = 30, the sorted list is {12, 18, 24, 30, 36}, median is indeed 24 and mean is (90+30)/5 = 24. Hence option A is 30."
            ),
            PracticePaperQuestion(
                id="q_greq_3",
                question="A box contains 5 red balls, 4 blue balls, and 3 green balls. If 2 balls are drawn at random without replacement, what is the probability that both balls are of different colors?",
                options=["47/66", "19/66", "23/33", "14/33"],
                correct_option=0,
                explanation="Total balls = 12. Total pairs chosen = 12C2 = 66. Pairs of same color: Red = 5C2 = 10, Blue = 4C2 = 6, Green = 3C2 = 3. Total same color = 10 + 6 + 3 = 19. Probability of different colors = 1 - (19/66) = 47/66."
            ),
            PracticePaperQuestion(
                id="q_greq_4",
                question="If a machine can process 1,200 transactions in 4 hours, and a newer model is 50% faster, how many hours will the newer model take to process 2,700 transactions?",
                options=["6.0 hours", "5.0 hours", "4.5 hours", "7.0 hours"],
                correct_option=0,
                explanation="Old rate = 1200 / 4 = 300 trans/hr. Newer rate = 300 * 1.50 = 450 trans/hr. Time required = 2700 / 450 = 6.0 hours."
            )
        ]
    ),
    PracticePaperItem(
        id="gre_verbal_vocab_01",
        exam="GRE",
        title="GRE Verbal Reasoning: Text Completion & Sentence Equivalence",
        category="VERBAL",
        difficulty="Hard",
        time_limit_minutes=20,
        question_count=3,
        source_attribution="Elevare High-Frequency Academic Vocabulary Matrix",
        questions=[
            PracticePaperQuestion(
                id="q_grev_1",
                question="Despite the team's meticulous preparation, the algorithm exhibited ________ behavior when subjected to high-concurrency network anomalies, baffling the senior architects.",
                options=["erratic", "predictable", "salubrious", "placid"],
                correct_option=0,
                explanation="'Despite the meticulous preparation' sets up a contrast with 'baffling the senior architects'. 'Erratic' (unpredictable/irregular) directly fits the context."
            ),
            PracticePaperQuestion(
                id="q_grev_2",
                question="The researcher’s conclusions were far from speculative; every assertion was grounded in ________ empirical evidence gathered across three multi-center clinical trials.",
                options=["spurious", "tenuous", "irrefutable", "fleeting"],
                correct_option=2,
                explanation="'Far from speculative' and 'grounded in evidence' requires a strong affirming adjective. 'Irrefutable' means impossible to deny or disprove."
            ),
            PracticePaperQuestion(
                id="q_grev_3",
                question="Rather than taking a dogmatic stance, the engineer displayed a commendable ________, remaining open to pivoting the architecture when new benchmarks emerged.",
                options=["intransigence", "malleability", "arrogance", "parsimony"],
                correct_option=1,
                explanation="'Rather than dogmatic' and 'open to pivoting' demands a word denoting flexibility and adaptability. 'Malleability' (adaptability/openness to change) is the exact match."
            )
        ]
    ),
    PracticePaperItem(
        id="ielts_academic_read_01",
        exam="IELTS",
        title="IELTS Academic: Critical Reading & Inference Section",
        category="FULL_MOCK",
        difficulty="Medium",
        time_limit_minutes=20,
        question_count=3,
        source_attribution="Elevare IELTS Academic Assessment Core (Band 7.5+ Standard)",
        questions=[
            PracticePaperQuestion(
                id="q_ielts_1",
                question="Passage excerpt: 'Autonomous inference engines optimize battery utilization by offloading matrix operations to dedicated neural accelerators, reducing thermal throttling by up to 42%.' \n\nQuestion: According to the excerpt, what directly results in the 42% reduction in thermal throttling?",
                options=[
                    "Using dedicated neural accelerators for matrix operations",
                    "Overclocking the host CPU cores",
                    "Increasing the physical battery capacity",
                    "Reducing overall algorithmic complexity"
                ],
                correct_option=0,
                explanation="The passage explicitly links the thermal throttling reduction to 'offloading matrix operations to dedicated neural accelerators'."
            ),
            PracticePaperQuestion(
                id="q_ielts_2",
                question="In formal academic writing, which of the following is considered the most appropriate replacement for 'a lot of people believe'?",
                options=[
                    "It is widely contended that",
                    "Lots of individuals say",
                    "Folks generally ponder that",
                    "Everyone agrees"
                ],
                correct_option=0,
                explanation="'It is widely contended that' employs passive, objective academic register ideal for Task 2 essays."
            ),
            PracticePaperQuestion(
                id="q_ielts_3",
                question="Which transition word best expresses concession followed by a strong counter-argument?",
                options=["Notwithstanding", "Furthermore", "Consequently", "Similarly"],
                correct_option=0,
                explanation="'Notwithstanding' means 'in spite of' or 'despite', setting up formal concession."
            )
        ]
    )
]

class StudyAbroadEngine:
    """
    Intelligent Study Abroad & Masters Copilot Engine.
    Coordinates degree mapping, exam diagnostics, university shortlists,
    2-year financial breakdown & ROI, personalized SOP/LOR generation,
    and 12-month timeline orchestration.
    """

    @classmethod
    def get_all_countries(cls) -> List[StudyAbroadCountry]:
        return COUNTRIES_CATALOG

    @classmethod
    def get_country_by_id(cls, country_id: str) -> Optional[StudyAbroadCountry]:
        country_id_upper = country_id.strip().upper()
        for c in COUNTRIES_CATALOG:
            if c.id.upper() == country_id_upper or c.name.upper() == country_id_upper:
                return c
        return None

    @classmethod
    def get_required_exams_for_selection(
        cls,
        selected_countries: List[str],
        target_program: str
    ) -> List[ExamPlanItem]:
        """
        Dynamically derives exams based on selected countries and degree track.
        """
        countries_upper = [c.upper() for c in selected_countries]
        exams: List[ExamPlanItem] = []

        has_usa = any(c in ["USA", "UNITED STATES"] for c in countries_upper)
        has_germany = any(c in ["DEU", "GERMANY"] for c in countries_upper)
        has_canada = any(c in ["CAN", "CANADA"] for c in countries_upper)
        has_uk = any(c in ["GBR", "UK", "UNITED KINGDOM"] for c in countries_upper)

        # 1. GRE General Test
        gre_mandatory = has_usa or has_germany
        exams.append(
            ExamPlanItem(
                exam_name="GRE (Graduate Record Examination)",
                badge="CRITICAL FOR STEM & US/DE SCHOLARSHIPS" if gre_mandatory else "STRONGLY RECOMMENDED",
                is_mandatory=gre_mandatory,
                target_score="320+ (Quant: 167+, Verbal: 153+, AWA: 4.0)",
                recommended_deadline="Take 6-8 months before application deadline (Target: July - August)",
                sections=[
                    ExamPlanSection(
                        name="Quantitative Reasoning",
                        weight="50% of Total Score",
                        target_score="167 / 170 (90th percentile)",
                        status="Highest priority for CS & AI Master's programs",
                        key_topics=["Algebra & Quadratics", "Permutations & Combinations", "Data Interpretation & Statistics", "Coordinate Geometry"]
                    ),
                    ExamPlanSection(
                        name="Verbal Reasoning",
                        weight="50% of Total Score",
                        target_score="155 / 170",
                        status="Focus on context clues and high-frequency roots",
                        key_topics=["Sentence Equivalence", "Text Completion (Double/Triple blanks)", "Reading Comprehension (Logic & Inference)"]
                    ),
                    ExamPlanSection(
                        name="Analytical Writing (AWA)",
                        weight="Separate Scale (0-6)",
                        target_score="4.0+ / 6.0",
                        status="Requires structured 5-paragraph thesis defense",
                        key_topics=["Analyze an Issue Prompt", "Evidence Citation", "Counter-argument Rebuttal"]
                    )
                ],
                official_portal_url="https://www.ets.org/gre",
                free_study_resource_links=[
                    {"name": "ETS Official PowerPrep Practice", "url": "https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html"},
                    {"name": "Khan Academy GRE Math Review", "url": "https://www.khanacademy.org/math"},
                    {"name": "GregMat Open Vocab & Quant Strategies", "url": "https://www.gregmat.com"}
                ]
            )
        )

        # 2. English Proficiency (IELTS / TOEFL)
        exams.append(
            ExamPlanItem(
                exam_name="IELTS Academic (or TOEFL iBT)",
                badge="MANDATORY FOR ALL DESTINATIONS",
                is_mandatory=True,
                target_score="IELTS 7.5+ Overall (Min 6.5 per band) OR TOEFL 102+",
                recommended_deadline="Take 4-6 months before application deadlines (Target: August - September)",
                sections=[
                    ExamPlanSection(
                        name="Listening",
                        weight="25%",
                        target_score="8.0 / 9.0",
                        status="Practice with diverse British, Australian, and North American accents",
                        key_topics=["Note completion", "Academic lecture comprehension", "Multiple choice under audio flow"]
                    ),
                    ExamPlanSection(
                        name="Reading",
                        weight="25%",
                        target_score="8.0 / 9.0",
                        status="Master skimming and scanning techniques for dense scientific prose",
                        key_topics=["True / False / Not Given", "Heading matching", "Summary completion"]
                    ),
                    ExamPlanSection(
                        name="Writing",
                        weight="25%",
                        target_score="7.0 / 9.0",
                        status="Task 1 (Data visual analysis) & Task 2 (Discursive essay)",
                        key_topics=["Bar chart & process description", "Formal academic essay architecture", "Cohesion & Coherence markers"]
                    ),
                    ExamPlanSection(
                        name="Speaking",
                        weight="25%",
                        target_score="7.5 / 9.0",
                        status="1-on-1 interview assessing fluency, lexical resource, and grammatical accuracy",
                        key_topics=["Part 1 introduction", "Part 2 two-minute monologue on cue card", "Part 3 abstract topic discussion"]
                    )
                ],
                official_portal_url="https://www.ielts.org",
                free_study_resource_links=[
                    {"name": "British Council Official IELTS Prep", "url": "https://takeielts.britishcouncil.org/take-ielts/prepare"},
                    {"name": "IELTS Liz Free Tips & Lessons", "url": "https://ieltsliz.com"},
                    {"name": "ETS Official TOEFL Test Prep", "url": "https://www.ets.org/toefl/test-takers/ibt/prepare.html"}
                ]
            )
        )

        # 3. Germany Specific: APS Certificate
        if has_germany:
            exams.append(
                ExamPlanItem(
                    exam_name="APS India Verification Certificate",
                    badge="MANDATORY FOR GERMAN STUDENT VISA",
                    is_mandatory=True,
                    target_score="Verified Academic Legitimacy",
                    recommended_deadline="Apply ASAP (Processing takes 4 - 8 weeks)",
                    sections=[
                        ExamPlanSection(
                            name="Academic Document Authentication",
                            weight="Verification Only",
                            target_score="Clear Status",
                            status="Mandatory prerequisite before submitting German university applications",
                            key_topics=["University transcripts", "Degree certificate / Bonafide", "Language test scores", "Aadhaar Card"]
                        )
                    ],
                    official_portal_url="https://aps-india.info",
                    free_study_resource_links=[
                        {"name": "Official APS India Document Checklist", "url": "https://aps-india.info/guidelines/"},
                        {"name": "DAAD India Official Masters Guide", "url": "https://www.daad.in/en/study-research-in-germany/"}
                    ]
                )
            )

        return exams

    @classmethod
    def get_shortlisted_universities(
        cls,
        selected_countries: List[str],
        user_cgpa: float = 8.4,
        saved_checklists: Optional[Dict[str, Dict[str, bool]]] = None
    ) -> List[ShortlistedUniversity]:
        """
        Filters curated universities matching the user's selected countries,
        categorizes tiers, calculates payback periods, and applies saved user checklist state.
        """
        saved_checklists = saved_checklists or {}
        selected_countries_normalized = [c.upper() for c in selected_countries]

        matched: List[ShortlistedUniversity] = []

        for item in CURATED_UNIVERSITIES_DB:
            country_norm = item["country"].upper()
            country_code = "USA" if "USA" in country_norm or "UNITED" in country_norm else (
                "DEU" if "GERMANY" in country_norm or "DEU" in country_norm else (
                    "CAN" if "CANADA" in country_norm else (
                        "GBR" if "KINGDOM" in country_norm or "UK" in country_norm else (
                            "IRL" if "IRELAND" in country_norm else (
                                "AUS" if "AUSTRALIA" in country_norm else country_norm
                            )
                        )
                    )
                )
            )

            # Match if country matches any selected
            is_match = False
            for sc in selected_countries_normalized:
                if sc == country_norm or sc == country_code or sc in country_norm:
                    is_match = True
                    break

            if not is_match:
                continue

            # Calculate 2-year total cost and ROI payback
            total_cost_2y = (item["annual_tuition_inr"] * 2.0) + (item["annual_living_inr"] * 2.0)
            post_tax_post_living_savings_inr = item["post_ms_avg_starting_salary_inr"] * 0.45  # ~45% net disposable after taxes & overseas living
            roi_years = round(total_cost_2y / max(post_tax_post_living_savings_inr, 1000000.0), 1)

            # Retrieve checklist
            uni_id = item["id"]
            default_chk = {
                "account_created": False,
                "program_selected": False,
                "transcripts_uploaded": False,
                "sop_submitted": False,
                "lor_submitted": False,
                "scores_reported": False,
                "application_paid": False
            }
            if uni_id in saved_checklists:
                default_chk.update(saved_checklists[uni_id])

            matched.append(
                ShortlistedUniversity(
                    id=uni_id,
                    university_name=item["university_name"],
                    country=item["country"],
                    flag=item["flag"],
                    program_name=item["program_name"],
                    tier=item["tier"],
                    qs_world_ranking=item["qs_world_ranking"],
                    annual_tuition_usd=item["annual_tuition_usd"],
                    annual_tuition_inr=item["annual_tuition_inr"],
                    annual_living_inr=item["annual_living_inr"],
                    min_cgpa_cutoff=item["min_cgpa_cutoff"],
                    gre_requirement=item["gre_requirement"],
                    ielts_requirement=item["ielts_requirement"],
                    post_ms_avg_starting_salary_inr=item["post_ms_avg_starting_salary_inr"],
                    roi_payback_years=roi_years,
                    official_portal_url=item["official_portal_url"],
                    application_deadline=item["application_deadline"],
                    application_fee_inr=item["application_fee_inr"],
                    is_stem_certified=item["is_stem_certified"],
                    checklist=default_chk
                )
            )

        # Sort: AMBITIOUS first, then TARGET, then SAFE
        tier_weight = {"AMBITIOUS": 1, "TARGET": 2, "SAFE": 3}
        matched.sort(key=lambda u: (tier_weight.get(u.tier, 9), u.qs_world_ranking))
        return matched

    @classmethod
    def calculate_cost_roi_estimates(
        cls,
        universities: List[ShortlistedUniversity],
        monthly_surplus_inr: float = 5500.0,
        current_savings_inr: float = 25000.0
    ) -> List[StudyAbroadCostRoiEstimate]:
        """
        Computes 2-year end-to-end financial outlay, realistic funding mix
        (Personal savings, Education Loan, University TA/RA Assistantships),
        and ROI payback linked with current student cashflows.
        """
        results: List[StudyAbroadCostRoiEstimate] = []

        for u in universities:
            tuition_2y = u.annual_tuition_inr * 2.0
            living_2y = u.annual_living_inr * 2.0
            visa_insurance = 250000.0  # Visa fees, flight tickets, mandatory student health insurance
            exam_app_fees = 85000.0    # GRE ($220) + IELTS ($200) + 3-5 App fees (~₹85k total)

            total_budget_inr = tuition_2y + living_2y + visa_insurance + exam_app_fees
            total_budget_usd = round(total_budget_inr / 83.5, 2)

            # Funding Plan Distribution:
            # 1. Family / Personal Seed Savings: min 15%
            # 2. On-Campus TA/RA / Part-time work: ~ 25% of living costs (~₹5-8L)
            # 3. Education Loan (Collateral or Non-collateral e.g. Prodigy / HDFC Credila): remainder
            ta_ra_offset = min(living_2y * 0.35, 900000.0)
            family_savings = min(total_budget_inr * 0.15, 800000.0)
            loan_required = max(total_budget_inr - ta_ra_offset - family_savings, 0.0)

            # Monthly EMI projection (assuming 15 years tenure @ 10.5% interest rate p.a.)
            r = (10.5 / 100.0) / 12.0
            n = 15 * 12
            if loan_required > 0:
                monthly_emi = round((loan_required * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)
            else:
                monthly_emi = 0.0

            # Payback period calculation against post-MS CTC
            annual_net_overseas_saving_inr = u.post_ms_avg_starting_salary_inr * 0.40  # 40% clean savings rate in foreign currency
            payback_years = round(total_budget_inr / max(annual_net_overseas_saving_inr, 800000.0), 1)

            # Affordability Index
            if total_budget_inr < 3000000.0:
                affordability = "AFFORDABLE (Exceptional ROI / Low Debt Burden)"
            elif total_budget_inr < 7500000.0:
                affordability = "HIGH_LEVERAGE (High Potential, Standard STEM Loan)"
            else:
                affordability = "STRETCH (Requires High Scholarships / Co-signer)"

            synergy_note = (
                f"Your current monthly surplus is ₹{monthly_surplus_inr:,.0f}. "
                f"For {u.university_name}, securing an education loan of ₹{loan_required:,.0f} "
                f"creates an estimated EMI of ₹{monthly_emi:,.0f}/mo post-graduation. "
                f"With a projected starting salary of ₹{u.post_ms_avg_starting_salary_inr:,.0f} "
                f"({u.country}), this loan can be completely liquidated within {payback_years} years."
            )

            results.append(
                StudyAbroadCostRoiEstimate(
                    university_name=u.university_name,
                    country=u.country,
                    flag=u.flag,
                    program_name=u.program_name,
                    tuition_2y_inr=tuition_2y,
                    living_2y_inr=living_2y,
                    visa_insurance_travel_inr=visa_insurance,
                    exam_app_fees_inr=exam_app_fees,
                    total_estimated_budget_inr=total_budget_inr,
                    total_estimated_budget_usd=total_budget_usd,
                    funding_plan={
                        "education_loan_inr": loan_required,
                        "campus_tara_offset_inr": ta_ra_offset,
                        "personal_family_savings_inr": family_savings
                    },
                    estimated_monthly_emi_inr=monthly_emi,
                    projected_post_ms_salary_inr=u.post_ms_avg_starting_salary_inr,
                    payback_period_years=payback_years,
                    affordability_index=affordability,
                    financial_engine_synergy_note=synergy_note
                )
            )

        return results

    @classmethod
    def generate_sop_and_lor(
        cls,
        target_university: str,
        target_program: str,
        research_interest: str,
        lab_name: str,
        student_profile: Dict[str, Any]
    ) -> SopLorGenerationResponse:
        """
        Synthesizes a highly personalized, academic-grade Statement of Purpose (SOP)
        and two Letters of Recommendation (Professor & Department Head), directly
        grounded in the student's actual skillset, CGPA, and engineering background.
        """
        student_name = student_profile.get("name", "Applicant")
        degree = student_profile.get("academic", {}).get("degree", "B.Tech in Computer Science & Engineering")
        cgpa = student_profile.get("academic", {}).get("cgpa", 8.4)
        institution = student_profile.get("academic", {}).get("institution", "Anna University / Premier Technical Institution")

        # Extract actual skills
        skills_list = [s.get("name", "") for s in student_profile.get("skills", []) if s.get("name")]
        if not skills_list:
            skills_list = ["Python", "Machine Learning", "FastAPI", "Data Structures & Algorithms", "SQL", "Docker"]

        top_skills = ", ".join(skills_list[:5])
        primary_skill = skills_list[0] if skills_list else "Python"
        secondary_skill = skills_list[1] if len(skills_list) > 1 else "Machine Learning"

        sop_text = f"""STATEMENT OF PURPOSE

Applicant: {student_name}
Target Program: {target_program}
Target Institution: {target_university}
Focus Area: {research_interest}

1. INTRODUCTION & INTELLECTUAL GENESIS
My academic journey in {degree} at {institution} has been characterized by a relentless fascination with intelligent distributed systems and production-grade artificial intelligence. Over the course of my undergraduate studies, where I have maintained a cumulative GPA of {cgpa:.2f}/10.0, I realized that modern computational breakthroughs do not occur merely at the theoretical equation level, but at the intersection of mathematical rigour and scalable systems engineering. My goal is to pursue the {target_program} at {target_university} to pioneer novel, efficient paradigms in {research_interest}.

2. TECHNICAL RIGOUR & PROJECT EXCELLENCE
Throughout my undergraduate tenure, I systematically cultivated mastery across {top_skills}. Recognizing that algorithmic models must endure real-world high-throughput workloads, I architected end-to-end full-stack AI and analytical pipelines utilizing {primary_skill} and {secondary_skill}. 

In one of my flagship projects, I developed a production-ready intelligence microservice backed by containerized FastAPI endpoints and PostgreSQL architectures. By profiling runtime bottlenecks and optimizing tensor evaluation paths, I engineered low-latency inference pipelines capable of sustaining sub-50ms execution times. These hands-on implementations solidified my grasp of computational complexity, vectorized operations, and robust software design patterns.

3. WHY {target_university.upper()} & RESEARCH ALIGNMENT
The {target_program} at {target_university} represents the definitive crucible for my aspirations. Specifically, the breakthrough initiatives conducted within the {lab_name} closely mirror my research interests in {research_interest}. The university's exceptional curriculum offers the exact balance of algorithmic depth and architectural scalability required to address frontier challenges in modern AI systems. I am particularly eager to collaborate with graduate cohorts, contribute to ongoing open-source departmental initiatives, and participate in cross-disciplinary seminars.

4. LONG-TERM CAREER TRAJECTORY & CONTRIBUTIONS
Following the completion of my Master’s degree at {target_university}, I intend to operate as an AI Systems Architect, spearheading resilient, explainable enterprise AI platforms that bridge theoretical research with planet-scale impact. I am confident that my disciplined engineering foundation, academic consistency ({cgpa:.2f} CGPA), and deep technical curiosity make me a resilient, value-generating addition to the {target_university} graduate community."""

        lor_prof_text = f"""CONFIDENTIAL LETTER OF RECOMMENDATION

To: Graduate Admissions Committee, {target_university}
Subject: Recommendation for {student_name} for admission to {target_program}

It is an immense pleasure to write this letter of recommendation for {student_name}, whom I have taught and mentored over multiple semesters during their {degree} at {institution}. I have supervised {student_name} across foundational and advanced technical coursework, including Data Structures & Algorithms and Applied Artificial Intelligence.

Academic Aptitude & Analytical Depth:
Ranked amongst the top tier of their cohort with a strong CGPA of {cgpa:.2f}/10.0, {student_name} distinguishes themselves through an unyielding analytical curiosity. While many undergraduates settle for syntactic correctness, {student_name} consistently questions underlying algorithmic efficiency, complexity bounds, and edge-case resilience. In classroom debates regarding {primary_skill} design patterns and machine learning loss optimizations, their insights frequently elevated the discourse of the entire class.

Applied Problem Solving & Execution:
Beyond theoretical mastery, {student_name} exhibits remarkable software engineering acumen in {top_skills}. In their major laboratory capstone, they demonstrated remarkable intellectual independence, translating high-level algorithmic concepts into modular, production-ready code. Their capacity to independently diagnose obscure runtime bottlenecks and iterate systematically under tight academic deadlines was truly exemplary.

Personal Demeanour & Conclusion:
{student_name} combines technical intellect with exemplary humility, collaborative spirit, and communication clarity. I have no reservation in affirming that they possess the academic rigor, grit, and research curiosity demanded by the {target_program} at {target_university}. They receive my highest recommendation.

Sincerely,
Senior Associate Professor, Department of Computer Science
{institution}"""

        lor_hod_text = f"""LETTER OF ENDORSEMENT FROM DEPARTMENT HEAD

To: Graduate Selection Committee, {target_university}
Re: Candidacy of {student_name} for {target_program}

As the Head of the Department at {institution}, I am delighted to formally endorse {student_name} for admission to the {target_program} at {target_university}.

Throughout their tenure in our {degree} program, {student_name} has stood out as an exemplary scholar who embodies technical discipline, integrity, and proactive leadership. With a consistent academic record of {cgpa:.2f}/10.0, they have consistently represented our department in competitive technical symposiums, hackathons, and research workshops.

{student_name}'s applied proficiency in {secondary_skill} and full-stack software architecture demonstrates a maturity that extends far beyond the typical undergraduate horizon. Their ability to synthesize cross-disciplinary engineering concepts into robust software artifacts is remarkable.

{target_university} has an esteemed reputation for cultivating pioneering technologists, and I am confident that {student_name} will uphold and enrich your department's traditions of scholarly excellence. I enthusiastically support their application without any reservation.

Warm regards,
Head of Department, Computer Science & Engineering
{institution}"""

        return SopLorGenerationResponse(
            target_university=target_university,
            target_program=target_program,
            sop_title=f"Statement of Purpose for {target_university} ({target_program})",
            sop_text=sop_text.strip(),
            lor_prof_title=f"Academic Recommendation Letter (Professor)",
            lor_prof_text=lor_prof_text.strip(),
            lor_hod_text=lor_hod_text.strip(),
            tailored_skills_highlighted=skills_list[:6],
            tailored_projects_highlighted=[
                "High-Throughput Intelligent Microservice (FastAPI + Tensor Optimization)",
                "Full-Stack Predictive Data Engine with Relational Data Modeling",
                "Advanced Algorithmic Benchmark Suite"
            ]
        )

    @classmethod
    def generate_master_roadmap(
        cls,
        target_countries: List[str],
        target_program: str,
        target_intake: str = "Fall 2027"
    ) -> StudyAbroadMasterRoadmap:
        """
        Constructs a phased 12-month timeline guiding the student from
        initial diagnostic preparation all the way to visa issuance and departure.
        """
        countries_str = ", ".join(target_countries) if target_countries else "Global Destinations"
        return StudyAbroadMasterRoadmap(
            target_intake=target_intake,
            target_countries=target_countries,
            target_program=target_program,
            phases=[
                StudyAbroadRoadmapPhase(
                    phase_title="Phase 1: Country, Degree & Diagnostic Benchmark",
                    timeline_months="Months 1 - 2 (Jan - Feb)",
                    key_milestones=[
                        f"Finalize Top 3 destination countries ({countries_str})",
                        f"Lock target program track ({target_program})",
                        "Take diagnostic baseline mock test for GRE & IELTS"
                    ],
                    action_items=[
                        "Calculate 2-year total funding requirement and parental/loan capacity",
                        "Review syllabus breakdown for Quantitative & Verbal sections",
                        "Order official transcripts and marksheets from university registrar"
                    ]
                ),
                StudyAbroadRoadmapPhase(
                    phase_title="Phase 2: High-Intensity Standardized Exam Preparation",
                    timeline_months="Months 3 - 5 (Mar - May)",
                    key_milestones=[
                        "Master high-frequency GRE quantitative topics (Algebra, Data Analysis, Combinatorics)",
                        "Complete 800+ core academic vocabulary roots and sentence equivalence drills",
                        "Practice 10 full-length timed mock tests under realistic test conditions"
                    ],
                    action_items=[
                        "Dedicate 1.5 - 2.0 hours daily to Elevare practice papers",
                        "If applying to Germany: Initiate APS Certificate verification immediately (takes 6-8 weeks)",
                        "Book official test dates for GRE and IELTS/TOEFL"
                    ]
                ),
                StudyAbroadRoadmapPhase(
                    phase_title="Phase 3: Official Test Taking & Score Reporting",
                    timeline_months="Months 6 - 7 (Jun - Jul)",
                    key_milestones=[
                        "Take Official GRE Exam (Target: 320+ score)",
                        "Take Official IELTS Academic / TOEFL iBT (Target: Band 7.5+)",
                        "Select 4 free official university score recipient codes at test center"
                    ],
                    action_items=[
                        "Evaluate score adequacy: retake if Quant falls below 165 for top STEM programs",
                        "Finalize tier list: 2 Ambitious, 3 Target, 2 Safe universities"
                    ]
                ),
                StudyAbroadRoadmapPhase(
                    phase_title="Phase 4: Statement of Purpose (SOP) & LOR Outreach",
                    timeline_months="Months 8 - 9 (Aug - Sep)",
                    key_milestones=[
                        "Draft personalized Statement of Purpose using Elevare AI Copilot",
                        "Contact 3 professors & department head for formal LOR endorsements",
                        "Update technical resume with open-source and capstone repositories"
                    ],
                    action_items=[
                        "Customize individual SOP drafts per university and specific research labs",
                        "Review and polish all essays with academic mentors"
                    ]
                ),
                StudyAbroadRoadmapPhase(
                    phase_title="Phase 5: Application Filing & Scholarship Submissions",
                    timeline_months="Months 10 - 11 (Oct - Nov)",
                    key_milestones=[
                        "Submit official university applications prior to priority deadlines (Dec 1 - 15)",
                        "Pay application fees and upload certified transcripts",
                        "Submit graduate teaching/research assistantship (TA/RA) applications"
                    ],
                    action_items=[
                        "Track checklist completion in Elevare Study Abroad Portal",
                        "Confirm receipt of official GRE/IELTS score reporting with admissions offices"
                    ]
                ),
                StudyAbroadRoadmapPhase(
                    phase_title="Phase 6: Admit Decisions, Financial Solvency & Visa Issuance",
                    timeline_months="Months 12+ (Dec - May)",
                    key_milestones=[
                        "Receive admission offer letters & scholarship grants",
                        "Select final university and secure I-20 (USA) / blocked account & admit (Germany) / CAS (UK)",
                        "Sanction education loan and attend visa interview"
                    ],
                    action_items=[
                        "Submit DS-160 / Student Visa application with embassy",
                        "Join student admitted network and book overseas student accommodation"
                    ]
                )
            ]
        )

    @classmethod
    def get_practice_papers(cls) -> List[PracticePaperItem]:
        return EDUCATIONAL_PRACTICE_PAPERS
