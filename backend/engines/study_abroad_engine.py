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
    StudyAbroadCountry(
        id="CHE",
        name="Switzerland",
        flag="🇨🇭",
        currency="CHF (Fr)",
        avg_tuition_annual_inr=150000.0,   # ~ CHF 1,500 / yr (highly subsidized public)
        avg_living_annual_inr=1600000.0,   # ~ CHF 18,000 / yr
        psw_visa_years="6 Months Job-Search Visa",
        common_exams=["GRE (Mandatory at ETH Zurich for non-Swiss)", "IELTS / TOEFL"],
        english_tests=["IELTS 7.0+", "TOEFL 100+"],
        key_advantages=[
            "World Top 10 institutions (ETH Zurich, EPFL) with near-zero tuition",
            "Highest starting tech salaries in Europe (CHF 120k+ / ₹1.1 Cr+)",
            "Global innovation hub for Robotics, Quantum Computing, and AI"
        ],
        intake_seasons=["Fall (September)"]
    ),
    StudyAbroadCountry(
        id="SWE",
        name="Sweden",
        flag="🇸🇪",
        currency="SEK (kr)",
        avg_tuition_annual_inr=1250000.0,  # ~ SEK 160,000 / yr
        avg_living_annual_inr=920000.0,    # ~ SEK 115,000 / yr
        psw_visa_years="1 Year Job Search Permit",
        common_exams=["IELTS / TOEFL", "GRE Optional"],
        english_tests=["IELTS 6.5+", "TOEFL 90+"],
        key_advantages=[
            "Unified central application portal (UniversityAdmissions.se) for all Swedish universities",
            "Silicon Valley of Europe for tech startups (Spotify, Klarna, King)",
            "High quality of life, sustainability, and open work culture"
        ],
        intake_seasons=["Autumn (August/September)"]
    ),
]

# Curated University Database with Realistic Benchmarks, Cutoffs & ROI
CURATED_UNIVERSITIES_DB: List[Dict[str, Any]] = [
    # ==================== USA (10) ====================
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
        "post_ms_avg_starting_salary_inr": 12800000.0,
        "official_portal_url": "https://applygrad.cs.cmu.edu/apply/index.php",
        "direct_application_url": "https://applygrad.cs.cmu.edu/apply/index.php",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Dec 15 (Fall Intake)",
        "application_fee_inr": 10500.0,
        "is_stem_certified": True
    },
    {
        "id": "stanford_mscs",
        "university_name": "Stanford University",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Computer Science (Artificial Intelligence Track)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 5,
        "annual_tuition_usd": 58000.0,
        "annual_tuition_inr": 4800000.0,
        "annual_living_inr": 1600000.0,
        "min_cgpa_cutoff": 9.0,
        "gre_requirement": "Optional / Recommended (Target: 330+)",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 14500000.0,
        "official_portal_url": "https://applyweb.cc/stanford",
        "direct_application_url": "https://applyweb.cc/stanford",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Dec 05 (Fall Intake)",
        "application_fee_inr": 11000.0,
        "is_stem_certified": True
    },
    {
        "id": "mit_eecs",
        "university_name": "Massachusetts Institute of Technology (MIT)",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "Master of Engineering in EECS / Computing",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 1,
        "annual_tuition_usd": 61000.0,
        "annual_tuition_inr": 5050000.0,
        "annual_living_inr": 1650000.0,
        "min_cgpa_cutoff": 9.2,
        "gre_requirement": "Waived / Optional",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 15500000.0,
        "official_portal_url": "https://gradapply.mit.edu/eecs",
        "direct_application_url": "https://gradapply.mit.edu/eecs",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 15 (Fall Intake)",
        "application_fee_inr": 12000.0,
        "is_stem_certified": True
    },
    {
        "id": "berkeley_eecs",
        "university_name": "University of California, Berkeley",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "Master of Engineering (MEng) in EECS / Data Science",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 10,
        "annual_tuition_usd": 57000.0,
        "annual_tuition_inr": 4720000.0,
        "annual_living_inr": 1550000.0,
        "min_cgpa_cutoff": 8.9,
        "gre_requirement": "Optional / Not required",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 14000000.0,
        "official_portal_url": "https://apply.grad.berkeley.edu/apply/",
        "direct_application_url": "https://apply.grad.berkeley.edu/apply/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 06 (Fall Intake)",
        "application_fee_inr": 12000.0,
        "is_stem_certified": True
    },
    {
        "id": "gatech_mscs",
        "university_name": "Georgia Institute of Technology",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Computer Science (Machine Learning)",
        "tier": "TARGET",
        "qs_world_ranking": 33,
        "annual_tuition_usd": 33000.0,
        "annual_tuition_inr": 2750000.0,
        "annual_living_inr": 1250000.0,
        "min_cgpa_cutoff": 8.4,
        "gre_requirement": "Recommended (Quant: 165+)",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 11500000.0,
        "official_portal_url": "https://grad.gatech.edu/apply",
        "direct_application_url": "https://grad.gatech.edu/apply",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Feb 01 (Fall Intake)",
        "application_fee_inr": 8500.0,
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
        "post_ms_avg_starting_salary_inr": 11000000.0,
        "official_portal_url": "https://gradapply.ucsd.edu/",
        "direct_application_url": "https://gradapply.ucsd.edu/",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Dec 20 (Fall Intake)",
        "application_fee_inr": 12500.0,
        "is_stem_certified": True
    },
    {
        "id": "usc_mscs",
        "university_name": "University of Southern California",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Computer Science (Artificial Intelligence)",
        "tier": "TARGET",
        "qs_world_ranking": 116,
        "annual_tuition_usd": 44000.0,
        "annual_tuition_inr": 3650000.0,
        "annual_living_inr": 1500000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Optional",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 10500000.0,
        "official_portal_url": "https://usc.liaisoncas.com/applicant-ux/#/login",
        "direct_application_url": "https://usc.liaisoncas.com/applicant-ux/#/login",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 15 (Fall Intake)",
        "application_fee_inr": 7500.0,
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
        "post_ms_avg_starting_salary_inr": 8500000.0,
        "official_portal_url": "https://students.asu.edu/graduate/apply",
        "direct_application_url": "https://students.asu.edu/graduate/apply",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Feb 01 (Fall Intake)",
        "application_fee_inr": 9500.0,
        "is_stem_certified": True
    },
    {
        "id": "neu_mscs",
        "university_name": "Northeastern University",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Computer Science (Khoury College)",
        "tier": "SAFE",
        "qs_world_ranking": 375,
        "annual_tuition_usd": 32000.0,
        "annual_tuition_inr": 2650000.0,
        "annual_living_inr": 1300000.0,
        "min_cgpa_cutoff": 7.5,
        "gre_requirement": "Optional",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 9000000.0,
        "official_portal_url": "https://apply.northeastern.edu/apply/",
        "direct_application_url": "https://apply.northeastern.edu/apply/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Apr 15 (Fall Intake)",
        "application_fee_inr": 8000.0,
        "is_stem_certified": True
    },
    {
        "id": "utd_mscs",
        "university_name": "University of Texas at Dallas",
        "country": "USA",
        "flag": "🇺🇸",
        "program_name": "MS in Computer Science (Data Sciences & AI)",
        "tier": "SAFE",
        "qs_world_ranking": 520,
        "annual_tuition_usd": 28000.0,
        "annual_tuition_inr": 2300000.0,
        "annual_living_inr": 950000.0,
        "min_cgpa_cutoff": 7.0,
        "gre_requirement": "Optional (Target: 315+)",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 8000000.0,
        "official_portal_url": "https://utdallas.liaisoncas.com/applicant-ux/#/login",
        "direct_application_url": "https://utdallas.liaisoncas.com/applicant-ux/#/login",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "May 01 (Fall Intake)",
        "application_fee_inr": 8200.0,
        "is_stem_certified": True
    },

    # ==================== GERMANY (6) ====================
    {
        "id": "tum_msinf",
        "university_name": "Technical University of Munich (TUM)",
        "country": "Germany",
        "flag": "🇩🇪",
        "program_name": "M.Sc. Informatics (AI & Machine Learning)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 28,
        "annual_tuition_usd": 6500.0,
        "annual_tuition_inr": 540000.0,
        "annual_living_inr": 1100000.0,
        "min_cgpa_cutoff": 8.5,
        "gre_requirement": "Mandatory for non-EU (Quant: 164+, Verbal: 153+)",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 7200000.0,
        "official_portal_url": "https://campus.tum.de/tumonline/webnav.ini",
        "direct_application_url": "https://campus.tum.de/tumonline/webnav.ini",
        "exam_form_url": "https://ereg.ets.org/",
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
        "annual_tuition_inr": 60000.0,
        "annual_living_inr": 980000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Mandatory for non-EU applicants (Q: 160+, V: 145+)",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6500000.0,
        "official_portal_url": "https://online.rwth-aachen.de/RWTHonline/webnav.ini",
        "direct_application_url": "https://online.rwth-aachen.de/RWTHonline/webnav.ini",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Mar 01 (Winter Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "kit_mscs",
        "university_name": "Karlsruhe Institute of Technology (KIT)",
        "country": "Germany",
        "flag": "🇩🇪",
        "program_name": "M.Sc. Computer Science / Informatics",
        "tier": "TARGET",
        "qs_world_ranking": 102,
        "annual_tuition_usd": 3200.0,
        "annual_tuition_inr": 270000.0,
        "annual_living_inr": 1000000.0,
        "min_cgpa_cutoff": 8.1,
        "gre_requirement": "Recommended",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6400000.0,
        "official_portal_url": "https://www.sle.kit.edu/vorstudium/bewerbung.php",
        "direct_application_url": "https://www.sle.kit.edu/vorstudium/bewerbung.php",
        "exam_form_url": "https://aps-india.info/registration/",
        "application_deadline": "Jul 15 (Winter Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "tuberlin_mscs",
        "university_name": "Technical University of Berlin",
        "country": "Germany",
        "flag": "🇩🇪",
        "program_name": "M.Sc. Computer Science (Informatik)",
        "tier": "TARGET",
        "qs_world_ranking": 154,
        "annual_tuition_usd": 650.0,
        "annual_tuition_inr": 55000.0,
        "annual_living_inr": 1050000.0,
        "min_cgpa_cutoff": 7.8,
        "gre_requirement": "Recommended",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6200000.0,
        "official_portal_url": "https://zulapp.tu-berlin.de/",
        "direct_application_url": "https://zulapp.tu-berlin.de/",
        "exam_form_url": "https://aps-india.info/registration/",
        "application_deadline": "Jun 15 (Winter Intake)",
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
        "annual_tuition_inr": 270000.0,
        "annual_living_inr": 960000.0,
        "min_cgpa_cutoff": 7.5,
        "gre_requirement": "Recommended, not mandatory",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5900000.0,
        "official_portal_url": "https://campus.uni-stuttgart.de/cusonline/webnav.ini",
        "direct_application_url": "https://campus.uni-stuttgart.de/cusonline/webnav.ini",
        "exam_form_url": "https://aps-india.info/registration/",
        "application_deadline": "Feb 15 (Winter Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "tudarmstadt_mscs",
        "university_name": "TU Darmstadt",
        "country": "Germany",
        "flag": "🇩🇪",
        "program_name": "M.Sc. Autonomous Systems & Artificial Intelligence",
        "tier": "SAFE",
        "qs_world_ranking": 246,
        "annual_tuition_usd": 700.0,
        "annual_tuition_inr": 60000.0,
        "annual_living_inr": 980000.0,
        "min_cgpa_cutoff": 7.4,
        "gre_requirement": "Optional",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6000000.0,
        "official_portal_url": "https://www.tu-darmstadt.de/studieren/bewerben/",
        "direct_application_url": "https://www.tu-darmstadt.de/studieren/bewerben/",
        "exam_form_url": "https://aps-india.info/registration/",
        "application_deadline": "Jul 15 (Winter Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },

    # ==================== CANADA (7) ====================
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
        "post_ms_avg_starting_salary_inr": 7800000.0,
        "official_portal_url": "https://admissions.sgs.utoronto.ca/apply/",
        "direct_application_url": "https://admissions.sgs.utoronto.ca/apply/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 01 (Fall Intake)",
        "application_fee_inr": 11000.0,
        "is_stem_certified": True
    },
    {
        "id": "ubc_mscs",
        "university_name": "University of British Columbia",
        "country": "Canada",
        "flag": "🇨🇦",
        "program_name": "MSc in Computer Science",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 34,
        "annual_tuition_usd": 12000.0,
        "annual_tuition_inr": 950000.0,
        "annual_living_inr": 1350000.0,
        "min_cgpa_cutoff": 8.5,
        "gre_requirement": "Optional",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 7500000.0,
        "official_portal_url": "https://www.grad.ubc.ca/apply/online/",
        "direct_application_url": "https://www.grad.ubc.ca/apply/online/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 15 (Fall Intake)",
        "application_fee_inr": 10500.0,
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
        "post_ms_avg_starting_salary_inr": 7200000.0,
        "official_portal_url": "https://www.ouac.on.ca/apply/waterloograd/en_CA/user/login",
        "direct_application_url": "https://www.ouac.on.ca/apply/waterloograd/en_CA/user/login",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 8500.0,
        "is_stem_certified": True
    },
    {
        "id": "mcgill_mscs",
        "university_name": "McGill University",
        "country": "Canada",
        "flag": "🇨🇦",
        "program_name": "MSc in Computer Science (Mila Affiliate)",
        "tier": "TARGET",
        "qs_world_ranking": 29,
        "annual_tuition_usd": 21000.0,
        "annual_tuition_inr": 1700000.0,
        "annual_living_inr": 1100000.0,
        "min_cgpa_cutoff": 8.3,
        "gre_requirement": "Optional",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 7000000.0,
        "official_portal_url": "https://futurestudents.mcgill.ca/apply/",
        "direct_application_url": "https://futurestudents.mcgill.ca/apply/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 01 (Fall Intake)",
        "application_fee_inr": 9000.0,
        "is_stem_certified": True
    },
    {
        "id": "ualberta_mscs",
        "university_name": "University of Alberta",
        "country": "Canada",
        "flag": "🇨🇦",
        "program_name": "MSc in Computing Science (Amii AI Center)",
        "tier": "TARGET",
        "qs_world_ranking": 96,
        "annual_tuition_usd": 17000.0,
        "annual_tuition_inr": 1400000.0,
        "annual_living_inr": 1000000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Optional",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 6800000.0,
        "official_portal_url": "https://www.ualberta.ca/graduate-studies/prospective-students/apply-now",
        "direct_application_url": "https://www.ualberta.ca/graduate-studies/prospective-students/apply-now",
        "exam_form_url": "https://ielts.idp.com/book-now",
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
        "post_ms_avg_starting_salary_inr": 5800000.0,
        "official_portal_url": "https://www.ouac.on.ca/apply/uottawagrad/en_CA/user/login",
        "direct_application_url": "https://www.ouac.on.ca/apply/uottawagrad/en_CA/user/login",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Feb 01 (Fall Intake)",
        "application_fee_inr": 7500.0,
        "is_stem_certified": True
    },
    {
        "id": "concordia_mapcomp",
        "university_name": "Concordia University",
        "country": "Canada",
        "flag": "🇨🇦",
        "program_name": "Master of Applied Computer Science (MApCompSc)",
        "tier": "SAFE",
        "qs_world_ranking": 415,
        "annual_tuition_usd": 19500.0,
        "annual_tuition_inr": 1600000.0,
        "annual_living_inr": 980000.0,
        "min_cgpa_cutoff": 7.0,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5400000.0,
        "official_portal_url": "https://www.concordia.ca/admissions/graduate/apply.html",
        "direct_application_url": "https://www.concordia.ca/admissions/graduate/apply.html",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Mar 01 (Fall Intake)",
        "application_fee_inr": 7000.0,
        "is_stem_certified": True
    },

    # ==================== UNITED KINGDOM (7) ====================
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
        "post_ms_avg_starting_salary_inr": 7800000.0,
        "official_portal_url": "https://imperial.elluciancrmrecruit.com/Apply/Account/Login",
        "direct_application_url": "https://imperial.elluciancrmrecruit.com/Apply/Account/Login",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 9800.0,
        "is_stem_certified": True
    },
    {
        "id": "ucl_ml",
        "university_name": "University College London (UCL)",
        "country": "United Kingdom",
        "flag": "🇬🇧",
        "program_name": "MSc in Machine Learning / Computational Statistics",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 9,
        "annual_tuition_usd": 48500.0,
        "annual_tuition_inr": 4050000.0,
        "annual_living_inr": 1500000.0,
        "min_cgpa_cutoff": 8.5,
        "gre_requirement": "Not required",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 7600000.0,
        "official_portal_url": "https://www.ucl.ac.uk/prospective-students/graduate/applying-graduate-study",
        "direct_application_url": "https://www.ucl.ac.uk/prospective-students/graduate/applying-graduate-study",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Mar 28 (Fall Intake)",
        "application_fee_inr": 9500.0,
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
        "post_ms_avg_starting_salary_inr": 6500000.0,
        "official_portal_url": "https://www.ed.ac.uk/studying/postgraduate/degrees/index.php?r=site/view&edition=2024&id=107",
        "direct_application_url": "https://www.ed.ac.uk/studying/postgraduate/degrees/index.php?r=site/view&edition=2024&id=107",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Mar 31 (Fall Intake)",
        "application_fee_inr": 6500.0,
        "is_stem_certified": True
    },
    {
        "id": "kcl_mscai",
        "university_name": "King's College London",
        "country": "United Kingdom",
        "flag": "🇬🇧",
        "program_name": "MSc in Advanced Computing / Artificial Intelligence",
        "tier": "TARGET",
        "qs_world_ranking": 40,
        "annual_tuition_usd": 43500.0,
        "annual_tuition_inr": 3600000.0,
        "annual_living_inr": 1450000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Not required",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 6300000.0,
        "official_portal_url": "https://apply.kcl.ac.uk/",
        "direct_application_url": "https://apply.kcl.ac.uk/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Apr 15 (Fall Intake)",
        "application_fee_inr": 8000.0,
        "is_stem_certified": True
    },
    {
        "id": "manchester_mscs",
        "university_name": "University of Manchester",
        "country": "United Kingdom",
        "flag": "🇬🇧",
        "program_name": "MSc in Advanced Computer Science (AI Track)",
        "tier": "TARGET",
        "qs_world_ranking": 34,
        "annual_tuition_usd": 44500.0,
        "annual_tuition_inr": 3700000.0,
        "annual_living_inr": 1200000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Not required",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 6200000.0,
        "official_portal_url": "https://www.manchester.ac.uk/study/masters/admissions/apply-online/",
        "direct_application_url": "https://www.manchester.ac.uk/study/masters/admissions/apply-online/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "May 15 (Fall Intake)",
        "application_fee_inr": 0.0,
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
        "post_ms_avg_starting_salary_inr": 5400000.0,
        "official_portal_url": "https://mysis.qmul.ac.uk/",
        "direct_application_url": "https://mysis.qmul.ac.uk/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "May 31 (Fall Intake)",
        "application_fee_inr": 5000.0,
        "is_stem_certified": True
    },
    {
        "id": "birmingham_mscs",
        "university_name": "University of Birmingham",
        "country": "United Kingdom",
        "flag": "🇬🇧",
        "program_name": "MSc in Computer Science / Artificial Intelligence",
        "tier": "SAFE",
        "qs_world_ranking": 80,
        "annual_tuition_usd": 37500.0,
        "annual_tuition_inr": 3100000.0,
        "annual_living_inr": 1150000.0,
        "min_cgpa_cutoff": 7.4,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5500000.0,
        "official_portal_url": "https://www.birmingham.ac.uk/postgraduate/courses/apply-pg",
        "direct_application_url": "https://www.birmingham.ac.uk/postgraduate/courses/apply-pg",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jun 01 (Fall Intake)",
        "application_fee_inr": 5000.0,
        "is_stem_certified": True
    },

    # ==================== AUSTRALIA (6) ====================
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
        "post_ms_avg_starting_salary_inr": 6500000.0,
        "official_portal_url": "https://admissions.unimelb.edu.au/",
        "direct_application_url": "https://admissions.unimelb.edu.au/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Nov 30 (Feb Intake)",
        "application_fee_inr": 7000.0,
        "is_stem_certified": True
    },
    {
        "id": "unsw_mit",
        "university_name": "University of New South Wales (UNSW Sydney)",
        "country": "Australia",
        "flag": "🇦🇺",
        "program_name": "Master of Information Technology (AI)",
        "tier": "TARGET",
        "qs_world_ranking": 19,
        "annual_tuition_usd": 35000.0,
        "annual_tuition_inr": 2900000.0,
        "annual_living_inr": 1350000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6400000.0,
        "official_portal_url": "https://apply.unsw.edu.au/",
        "direct_application_url": "https://apply.unsw.edu.au/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Nov 30 (Feb Intake)",
        "application_fee_inr": 7500.0,
        "is_stem_certified": True
    },
    {
        "id": "sydney_mscs",
        "university_name": "University of Sydney",
        "country": "Australia",
        "flag": "🇦🇺",
        "program_name": "Master of Computer Science / Data Science",
        "tier": "TARGET",
        "qs_world_ranking": 18,
        "annual_tuition_usd": 34500.0,
        "annual_tuition_inr": 2850000.0,
        "annual_living_inr": 1350000.0,
        "min_cgpa_cutoff": 8.1,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6300000.0,
        "official_portal_url": "https://www.sydney.edu.au/study/how-to-apply.html",
        "direct_application_url": "https://www.sydney.edu.au/study/how-to-apply.html",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 15 (Feb Intake)",
        "application_fee_inr": 7000.0,
        "is_stem_certified": True
    },
    {
        "id": "anu_mcomp",
        "university_name": "Australian National University (ANU)",
        "country": "Australia",
        "flag": "🇦🇺",
        "program_name": "Master of Computing (Artificial Intelligence)",
        "tier": "TARGET",
        "qs_world_ranking": 30,
        "annual_tuition_usd": 34000.0,
        "annual_tuition_inr": 2800000.0,
        "annual_living_inr": 1200000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6200000.0,
        "official_portal_url": "https://www.anu.edu.au/study/apply",
        "direct_application_url": "https://www.anu.edu.au/study/apply",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 15 (Feb Intake)",
        "application_fee_inr": 6500.0,
        "is_stem_certified": True
    },
    {
        "id": "monash_mai",
        "university_name": "Monash University",
        "country": "Australia",
        "flag": "🇦🇺",
        "program_name": "Master of Artificial Intelligence",
        "tier": "SAFE",
        "qs_world_ranking": 37,
        "annual_tuition_usd": 32000.0,
        "annual_tuition_inr": 2650000.0,
        "annual_living_inr": 1200000.0,
        "min_cgpa_cutoff": 7.5,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6000000.0,
        "official_portal_url": "https://www.monash.edu/admissions/apply/online",
        "direct_application_url": "https://www.monash.edu/admissions/apply/online",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 01 (Feb Intake)",
        "application_fee_inr": 6500.0,
        "is_stem_certified": True
    },
    {
        "id": "uq_mscs",
        "university_name": "University of Queensland",
        "country": "Australia",
        "flag": "🇦🇺",
        "program_name": "Master of Computer Science",
        "tier": "SAFE",
        "qs_world_ranking": 40,
        "annual_tuition_usd": 31500.0,
        "annual_tuition_inr": 2600000.0,
        "annual_living_inr": 1150000.0,
        "min_cgpa_cutoff": 7.4,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5900000.0,
        "official_portal_url": "https://apply.uq.edu.au/",
        "direct_application_url": "https://apply.uq.edu.au/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Nov 30 (Feb Intake)",
        "application_fee_inr": 6500.0,
        "is_stem_certified": True
    },

    # ==================== IRELAND (4) ====================
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
        "post_ms_avg_starting_salary_inr": 6200000.0,
        "official_portal_url": "https://my.tcd.ie/",
        "direct_application_url": "https://my.tcd.ie/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Apr 30 (Fall Intake)",
        "application_fee_inr": 5000.0,
        "is_stem_certified": True
    },
    {
        "id": "ucd_mscs",
        "university_name": "University College Dublin (UCD)",
        "country": "Ireland",
        "flag": "🇮🇪",
        "program_name": "MSc Computer Science (Negotiated Learning)",
        "tier": "TARGET",
        "qs_world_ranking": 126,
        "annual_tuition_usd": 26000.0,
        "annual_tuition_inr": 2150000.0,
        "annual_living_inr": 1100000.0,
        "min_cgpa_cutoff": 7.8,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6000000.0,
        "official_portal_url": "https://www.ucd.ie/apply/",
        "direct_application_url": "https://www.ucd.ie/apply/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "May 15 (Fall Intake)",
        "application_fee_inr": 5000.0,
        "is_stem_certified": True
    },
    {
        "id": "galway_mscai",
        "university_name": "University of Galway",
        "country": "Ireland",
        "flag": "🇮🇪",
        "program_name": "MSc in Artificial Intelligence",
        "tier": "SAFE",
        "qs_world_ranking": 273,
        "annual_tuition_usd": 23500.0,
        "annual_tuition_inr": 1950000.0,
        "annual_living_inr": 950000.0,
        "min_cgpa_cutoff": 7.2,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5600000.0,
        "official_portal_url": "https://www.universityofgalway.ie/postgraduate-admissions/",
        "direct_application_url": "https://www.universityofgalway.ie/postgraduate-admissions/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jun 30 (Fall Intake)",
        "application_fee_inr": 4500.0,
        "is_stem_certified": True
    },
    {
        "id": "dcu_mscs",
        "university_name": "Dublin City University (DCU)",
        "country": "Ireland",
        "flag": "🇮🇪",
        "program_name": "M.Sc. in Computing (Data Analytics Track)",
        "tier": "SAFE",
        "qs_world_ranking": 436,
        "annual_tuition_usd": 20500.0,
        "annual_tuition_inr": 1700000.0,
        "annual_living_inr": 1000000.0,
        "min_cgpa_cutoff": 7.0,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5400000.0,
        "official_portal_url": "https://dcu.ie/apply",
        "direct_application_url": "https://dcu.ie/apply",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jul 01 (Fall Intake)",
        "application_fee_inr": 4500.0,
        "is_stem_certified": True
    },

    # ==================== NETHERLANDS (4) ====================
    {
        "id": "tudelft_mscs",
        "university_name": "Delft University of Technology (TU Delft)",
        "country": "Netherlands",
        "flag": "🇳🇱",
        "program_name": "MSc Computer Science (Data Science & AI Track)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 47,
        "annual_tuition_usd": 23000.0,
        "annual_tuition_inr": 1900000.0,
        "annual_living_inr": 1150000.0,
        "min_cgpa_cutoff": 8.5,
        "gre_requirement": "Mandatory for non-Dutch applicants (Quant: 165+, Verbal: 153+)",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 6800000.0,
        "official_portal_url": "https://www.tudelft.nl/en/education/admission-and-application/msc-international-diploma",
        "direct_application_url": "https://www.tudelft.nl/en/education/admission-and-application/msc-international-diploma",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 9000.0,
        "is_stem_certified": True
    },
    {
        "id": "uva_mscai",
        "university_name": "University of Amsterdam",
        "country": "Netherlands",
        "flag": "🇳🇱",
        "program_name": "MSc in Artificial Intelligence",
        "tier": "TARGET",
        "qs_world_ranking": 53,
        "annual_tuition_usd": 19500.0,
        "annual_tuition_inr": 1600000.0,
        "annual_living_inr": 1250000.0,
        "min_cgpa_cutoff": 8.2,
        "gre_requirement": "Recommended",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 6500000.0,
        "official_portal_url": "https://www.uva.nl/en/programmes/masters/artificial-intelligence/application-and-admission/application-and-admission.html",
        "direct_application_url": "https://www.uva.nl/en/programmes/masters/artificial-intelligence/application-and-admission/application-and-admission.html",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 9000.0,
        "is_stem_certified": True
    },
    {
        "id": "tue_mscs",
        "university_name": "Eindhoven University of Technology (TU/e)",
        "country": "Netherlands",
        "flag": "🇳🇱",
        "program_name": "MSc Computer Science and Engineering",
        "tier": "TARGET",
        "qs_world_ranking": 124,
        "annual_tuition_usd": 18500.0,
        "annual_tuition_inr": 1550000.0,
        "annual_living_inr": 1050000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Recommended",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6400000.0,
        "official_portal_url": "https://www.tue.nl/en/education/become-a-tue-student/admission-and-enrollment",
        "direct_application_url": "https://www.tue.nl/en/education/become-a-tue-student/admission-and-enrollment",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Feb 01 (Fall Intake)",
        "application_fee_inr": 9000.0,
        "is_stem_certified": True
    },
    {
        "id": "utwente_mscs",
        "university_name": "University of Twente",
        "country": "Netherlands",
        "flag": "🇳🇱",
        "program_name": "MSc Computer Science (Software Tech / Cyber Security)",
        "tier": "SAFE",
        "qs_world_ranking": 210,
        "annual_tuition_usd": 17800.0,
        "annual_tuition_inr": 1480000.0,
        "annual_living_inr": 980000.0,
        "min_cgpa_cutoff": 7.3,
        "gre_requirement": "Optional",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5800000.0,
        "official_portal_url": "https://www.utwente.nl/en/education/master/how-to-apply/",
        "direct_application_url": "https://www.utwente.nl/en/education/master/how-to-apply/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "May 01 (Fall Intake)",
        "application_fee_inr": 8500.0,
        "is_stem_certified": True
    },

    # ==================== FRANCE (4) ====================
    {
        "id": "ipparis_ai",
        "university_name": "Institut Polytechnique de Paris",
        "country": "France",
        "flag": "🇫🇷",
        "program_name": "Master in Computer Science & Artificial Intelligence",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 38,
        "annual_tuition_usd": 11000.0,
        "annual_tuition_inr": 900000.0,
        "annual_living_inr": 1000000.0,
        "min_cgpa_cutoff": 8.5,
        "gre_requirement": "Recommended",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 6500000.0,
        "official_portal_url": "https://www.ip-paris.fr/en/education/admissions",
        "direct_application_url": "https://www.ip-paris.fr/en/education/admissions",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Feb 02 (Fall Intake)",
        "application_fee_inr": 7000.0,
        "is_stem_certified": True
    },
    {
        "id": "sorbonne_mscs",
        "university_name": "Sorbonne University",
        "country": "France",
        "flag": "🇫🇷",
        "program_name": "Master of Computer Science (AI & Robotics)",
        "tier": "TARGET",
        "qs_world_ranking": 59,
        "annual_tuition_usd": 4100.0,
        "annual_tuition_inr": 340000.0,
        "annual_living_inr": 1050000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Optional",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6000000.0,
        "official_portal_url": "https://candidatures-inscriptions.sorbonne-universite.fr/",
        "direct_application_url": "https://candidatures-inscriptions.sorbonne-universite.fr/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Mar 31 (Fall Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "centralesupelec_ai",
        "university_name": "CentraleSupélec (Université Paris-Saclay)",
        "country": "France",
        "flag": "🇫🇷",
        "program_name": "Master in Artificial Intelligence",
        "tier": "TARGET",
        "qs_world_ranking": 73,
        "annual_tuition_usd": 13000.0,
        "annual_tuition_inr": 1080000.0,
        "annual_living_inr": 980000.0,
        "min_cgpa_cutoff": 8.1,
        "gre_requirement": "Recommended",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 6200000.0,
        "official_portal_url": "https://www.universite-paris-saclay.fr/en/admission/postgraduate-studies",
        "direct_application_url": "https://www.universite-paris-saclay.fr/en/admission/postgraduate-studies",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Apr 15 (Fall Intake)",
        "application_fee_inr": 7500.0,
        "is_stem_certified": True
    },
    {
        "id": "grenoble_mosig",
        "university_name": "Université Grenoble Alpes",
        "country": "France",
        "flag": "🇫🇷",
        "program_name": "Master of Science in Informatics at Grenoble (MoSIG)",
        "tier": "SAFE",
        "qs_world_ranking": 294,
        "annual_tuition_usd": 4100.0,
        "annual_tuition_inr": 340000.0,
        "annual_living_inr": 850000.0,
        "min_cgpa_cutoff": 7.4,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5400000.0,
        "official_portal_url": "https://www.univ-grenoble-alpes.fr/admissions/",
        "direct_application_url": "https://www.univ-grenoble-alpes.fr/admissions/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "May 15 (Fall Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },

    # ==================== SINGAPORE (3) ====================
    {
        "id": "nus_mcomp",
        "university_name": "National University of Singapore (NUS)",
        "country": "Singapore",
        "flag": "🇸🇬",
        "program_name": "Master of Computing (AI / Infocomm Security Track)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 8,
        "annual_tuition_usd": 41000.0,
        "annual_tuition_inr": 3400000.0,
        "annual_living_inr": 1400000.0,
        "min_cgpa_cutoff": 8.8,
        "gre_requirement": "Recommended (Target: 320+)",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 8800000.0,
        "official_portal_url": "https://gradapp.nus.edu.sg/",
        "direct_application_url": "https://gradapp.nus.edu.sg/",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Feb 28 (August Intake)",
        "application_fee_inr": 6500.0,
        "is_stem_certified": True
    },
    {
        "id": "ntu_msai",
        "university_name": "Nanyang Technological University (NTU)",
        "country": "Singapore",
        "flag": "🇸🇬",
        "program_name": "Master of Science in Artificial Intelligence (MSAI)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 15,
        "annual_tuition_usd": 39500.0,
        "annual_tuition_inr": 3250000.0,
        "annual_living_inr": 1350000.0,
        "min_cgpa_cutoff": 8.5,
        "gre_requirement": "Recommended",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 8400000.0,
        "official_portal_url": "https://wis.ntu.edu.sg/webexe/owa/pgr$gradapp.Entrance",
        "direct_application_url": "https://wis.ntu.edu.sg/webexe/owa/pgr$gradapp.Entrance",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Jan 31 (August Intake)",
        "application_fee_inr": 6000.0,
        "is_stem_certified": True
    },
    {
        "id": "smu_mitb",
        "university_name": "Singapore Management University",
        "country": "Singapore",
        "flag": "🇸🇬",
        "program_name": "Master of IT in Business (AI & FinTech Track)",
        "tier": "TARGET",
        "qs_world_ranking": 545,
        "annual_tuition_usd": 36000.0,
        "annual_tuition_inr": 3000000.0,
        "annual_living_inr": 1350000.0,
        "min_cgpa_cutoff": 7.8,
        "gre_requirement": "Optional (GMAT/GRE accepted)",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 7400000.0,
        "official_portal_url": "https://masters.smu.edu.sg/apply",
        "direct_application_url": "https://masters.smu.edu.sg/apply",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "May 31 (August Intake)",
        "application_fee_inr": 6000.0,
        "is_stem_certified": True
    },

    # ==================== NEW ZEALAND (3) ====================
    {
        "id": "auckland_mit",
        "university_name": "University of Auckland",
        "country": "New Zealand",
        "flag": "🇳🇿",
        "program_name": "Master of Information Technology / MS Computer Science",
        "tier": "TARGET",
        "qs_world_ranking": 68,
        "annual_tuition_usd": 27500.0,
        "annual_tuition_inr": 2300000.0,
        "annual_living_inr": 1100000.0,
        "min_cgpa_cutoff": 7.8,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5400000.0,
        "official_portal_url": "https://www.auckland.ac.nz/en/study/applications-and-admissions/apply-now.html",
        "direct_application_url": "https://www.auckland.ac.nz/en/study/applications-and-admissions/apply-now.html",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 01 (Feb Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "canterbury_mads",
        "university_name": "University of Canterbury",
        "country": "New Zealand",
        "flag": "🇳🇿",
        "program_name": "Master of Applied Data Science / Computer Science",
        "tier": "SAFE",
        "qs_world_ranking": 256,
        "annual_tuition_usd": 25000.0,
        "annual_tuition_inr": 2100000.0,
        "annual_living_inr": 980000.0,
        "min_cgpa_cutoff": 7.2,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5000000.0,
        "official_portal_url": "https://www.canterbury.ac.nz/study/apply-and-enrol",
        "direct_application_url": "https://www.canterbury.ac.nz/study/apply-and-enrol",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 15 (Feb Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },
    {
        "id": "vuw_msd",
        "university_name": "Victoria University of Wellington",
        "country": "New Zealand",
        "flag": "🇳🇿",
        "program_name": "Master of Software Development / Computer Science",
        "tier": "SAFE",
        "qs_world_ranking": 241,
        "annual_tuition_usd": 24500.0,
        "annual_tuition_inr": 2050000.0,
        "annual_living_inr": 1000000.0,
        "min_cgpa_cutoff": 7.3,
        "gre_requirement": "Not required",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5100000.0,
        "official_portal_url": "https://www.wgtn.ac.nz/study/apply-enrol",
        "direct_application_url": "https://www.wgtn.ac.nz/study/apply-enrol",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 01 (Feb Intake)",
        "application_fee_inr": 0.0,
        "is_stem_certified": True
    },

    # ==================== SWITZERLAND (3) ====================
    {
        "id": "eth_mscs",
        "university_name": "ETH Zurich",
        "country": "Switzerland",
        "flag": "🇨🇭",
        "program_name": "Master in Computer Science (Machine Intelligence Specialization)",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 7,
        "annual_tuition_usd": 1600.0,
        "annual_tuition_inr": 140000.0,
        "annual_living_inr": 1600000.0,
        "min_cgpa_cutoff": 9.0,
        "gre_requirement": "Mandatory for non-Swiss applicants (Quant: 165+)",
        "ielts_requirement": 7.5,
        "post_ms_avg_starting_salary_inr": 12000000.0,
        "official_portal_url": "https://ethz.ch/en/studies/master/application.html",
        "direct_application_url": "https://ethz.ch/en/studies/master/application.html",
        "exam_form_url": "https://ereg.ets.org/",
        "application_deadline": "Dec 15 (Fall Intake)",
        "application_fee_inr": 13500.0,
        "is_stem_certified": True
    },
    {
        "id": "epfl_mscs",
        "university_name": "EPFL",
        "country": "Switzerland",
        "flag": "🇨🇭",
        "program_name": "Master in Computer Science / Data Science",
        "tier": "AMBITIOUS",
        "qs_world_ranking": 26,
        "annual_tuition_usd": 1700.0,
        "annual_tuition_inr": 150000.0,
        "annual_living_inr": 1500000.0,
        "min_cgpa_cutoff": 8.8,
        "gre_requirement": "Strongly Recommended (Target: 320+)",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 11500000.0,
        "official_portal_url": "https://www.epfl.ch/education/admission/admission-criteria-masters/",
        "direct_application_url": "https://www.epfl.ch/education/admission/admission-criteria-masters/",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Dec 15 (Fall Intake)",
        "application_fee_inr": 13500.0,
        "is_stem_certified": True
    },
    {
        "id": "uzh_informatics",
        "university_name": "University of Zurich",
        "country": "Switzerland",
        "flag": "🇨🇭",
        "program_name": "Master of Science in Informatics (AI & Data Systems)",
        "tier": "TARGET",
        "qs_world_ranking": 91,
        "annual_tuition_usd": 1900.0,
        "annual_tuition_inr": 170000.0,
        "annual_living_inr": 1600000.0,
        "min_cgpa_cutoff": 8.2,
        "gre_requirement": "Recommended",
        "ielts_requirement": 7.0,
        "post_ms_avg_starting_salary_inr": 10500000.0,
        "official_portal_url": "https://www.uzh.ch/en/studies/application/master.html",
        "direct_application_url": "https://www.uzh.ch/en/studies/application/master.html",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Feb 28 (Fall Intake)",
        "application_fee_inr": 9000.0,
        "is_stem_certified": True
    },

    # ==================== SWEDEN (3) ====================
    {
        "id": "kth_ml",
        "university_name": "KTH Royal Institute of Technology",
        "country": "Sweden",
        "flag": "🇸🇪",
        "program_name": "Master's in Machine Learning / Computer Science",
        "tier": "TARGET",
        "qs_world_ranking": 73,
        "annual_tuition_usd": 15500.0,
        "annual_tuition_inr": 1300000.0,
        "annual_living_inr": 950000.0,
        "min_cgpa_cutoff": 8.2,
        "gre_requirement": "Optional",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5800000.0,
        "official_portal_url": "https://www.universityadmissions.se/intl/start",
        "direct_application_url": "https://www.universityadmissions.se/intl/start",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 7000.0,
        "is_stem_certified": True
    },
    {
        "id": "chalmers_cs",
        "university_name": "Chalmers University of Technology",
        "country": "Sweden",
        "flag": "🇸🇪",
        "program_name": "Master's in Computer Science (Algorithms & AI)",
        "tier": "SAFE",
        "qs_world_ranking": 129,
        "annual_tuition_usd": 14500.0,
        "annual_tuition_inr": 1220000.0,
        "annual_living_inr": 900000.0,
        "min_cgpa_cutoff": 7.6,
        "gre_requirement": "Optional",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5500000.0,
        "official_portal_url": "https://www.universityadmissions.se/intl/start",
        "direct_application_url": "https://www.universityadmissions.se/intl/start",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 15 (Fall Intake)",
        "application_fee_inr": 7000.0,
        "is_stem_certified": True
    },
    {
        "id": "lund_ml",
        "university_name": "Lund University",
        "country": "Sweden",
        "flag": "🇸🇪",
        "program_name": "Master's in Machine Learning, Systems & Data Science",
        "tier": "TARGET",
        "qs_world_ranking": 85,
        "annual_tuition_usd": 14500.0,
        "annual_tuition_inr": 1220000.0,
        "annual_living_inr": 920000.0,
        "min_cgpa_cutoff": 8.0,
        "gre_requirement": "Optional",
        "ielts_requirement": 6.5,
        "post_ms_avg_starting_salary_inr": 5600000.0,
        "official_portal_url": "https://www.universityadmissions.se/intl/start",
        "direct_application_url": "https://www.universityadmissions.se/intl/start",
        "exam_form_url": "https://ielts.idp.com/book-now",
        "application_deadline": "Jan 15 (Fall Intake)",
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
                official_portal_url="https://ereg.ets.org/",
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
                official_portal_url="https://ielts.idp.com/book-now",
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
                    official_portal_url="https://aps-india.info/registration/",
                    free_study_resource_links=[
                        {"name": "Official APS India Document Checklist", "url": "https://aps-india.info/guidelines/"},
                        {"name": "DAAD India Official Masters Guide", "url": "https://www.daad.in/en/study-research-in-germany/"}
                    ]
                )
            )

        return exams

    @classmethod
    def get_university_scholarships(cls, university_name: str, country: str) -> List[Dict[str, Any]]:
        c_upper = country.upper()
        if "USA" in c_upper or "UNITED STATES" in c_upper:
            return [
                {
                    "name": "Knight-Hennessy Scholars / Fellowship",
                    "coverage": "Full Tuition + $35,000/yr Living Stipend",
                    "eligibility": "Global multidisciplinary master's candidates with leadership index",
                    "deadline": "October 11",
                    "apply_url": "https://knight-hennessy.stanford.edu/"
                },
                {
                    "name": "Fulbright-Nehru Master's Fellowship",
                    "coverage": "100% Tuition + J-1 Visa + Return Airfare + Living Allowance",
                    "eligibility": "Indian graduates with min 3 years professional work experience",
                    "deadline": "May 15",
                    "apply_url": "https://www.usief.org.in/Fulbright-Nehru-Fellowships.aspx"
                },
                {
                    "name": "Graduate Research & Teaching Assistantship (GRA/GTA)",
                    "coverage": "Full / 50% Tuition Waiver + $2,400 - $3,200/mo Monthly Stipend",
                    "eligibility": "Departmental merit based on academic profile and research matching",
                    "deadline": "Rolling with Admission",
                    "apply_url": "https://grad.gatech.edu/financial-support"
                }
            ]
        elif "GERMANY" in c_upper or "DEU" in c_upper:
            return [
                {
                    "name": "DAAD Study Scholarships for Foreign Graduates",
                    "coverage": "€934/month Living Allowance + Health Insurance + Travel Subsidy",
                    "eligibility": "Bachelor's graduates with top 10% academic standing",
                    "deadline": "November 15",
                    "apply_url": "https://www.daad.de/en/study-and-research-in-germany/scholarships/"
                },
                {
                    "name": "Deutschlandstipendium National Merit Grant",
                    "coverage": "€300/month merit stipend (Co-funded by German Federal Govt & Industry)",
                    "eligibility": "Enrolled students demonstrating exceptional academic and social commitment",
                    "deadline": "July 15 (University specific)",
                    "apply_url": "https://www.deutschlandstipendium.de/"
                },
                {
                    "name": "Heinrich Böll Foundation STEM Grant",
                    "coverage": "€934/month + Individual support for non-EU students",
                    "eligibility": "Excellent academic record with active engagement in technology ethics",
                    "deadline": "September 01",
                    "apply_url": "https://www.boell.de/en/foundation/scholarships"
                }
            ]
        elif "CANADA" in c_upper or "CAN" in c_upper:
            return [
                {
                    "name": "Ontario Graduate Scholarship (OGS)",
                    "coverage": "CAD $15,000/year Merit Grant",
                    "eligibility": "Students admitted to participating Ontario universities (Toronto, Waterloo)",
                    "deadline": "January 15",
                    "apply_url": "https://osap.gov.on.ca/OSAPPortal/en/A-ZListofAids/PRDR019245.html"
                },
                {
                    "name": "Vanier Canada Graduate Scholarship (CGS)",
                    "coverage": "CAD $50,000/year for 3 years",
                    "eligibility": "High research output, academic excellence, leadership skills",
                    "deadline": "November 01",
                    "apply_url": "https://vanier.gc.ca/en/home-accueil.html"
                },
                {
                    "name": "University International Master's Award",
                    "coverage": "CAD $10,000 - $14,000 Automatic Entrance Award",
                    "eligibility": "Top quartile international STEM applicants",
                    "deadline": "Automatic with Application",
                    "apply_url": "https://www.sgs.utoronto.ca/awards/international-awards/"
                }
            ]
        elif "KINGDOM" in c_upper or "UK" in c_upper or "GBR" in c_upper:
            return [
                {
                    "name": "Chevening Scholarship (UK FCDO)",
                    "coverage": "100% Tuition Fees + Monthly Stipend (£1,400) + Airfare",
                    "eligibility": "Minimum 2 years work experience and demonstrable leadership potential",
                    "deadline": "November 07",
                    "apply_url": "https://www.chevening.org/"
                },
                {
                    "name": "Commonwealth Master's Scholarship",
                    "coverage": "Full Tuition + Living Allowance + Return Flight Tickets",
                    "eligibility": "Citizens of Commonwealth nations unable to afford study without aid",
                    "deadline": "October 17",
                    "apply_url": "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/"
                },
                {
                    "name": "GREAT Scholarships (British Council)",
                    "coverage": "£10,000 Tuition Fee Waiver",
                    "eligibility": "Indian passport holders applying for one-year postgraduate courses",
                    "deadline": "April 30",
                    "apply_url": "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships"
                }
            ]
        elif "AUSTRALIA" in c_upper or "AUS" in c_upper:
            return [
                {
                    "name": "Australia Awards Scholarship",
                    "coverage": "Full Tuition + Return Airfare + Living Allowance (AUD $30,000/yr)",
                    "eligibility": "Citizens of partner Indo-Pacific nations",
                    "deadline": "April 30",
                    "apply_url": "https://www.dfat.gov.au/people-to-people/australia-awards"
                },
                {
                    "name": "Destination Australia Scholarship",
                    "coverage": "AUD $15,000 per academic year",
                    "eligibility": "International students enrolling in regional Australian tertiary campuses",
                    "deadline": "Varies by University",
                    "apply_url": "https://www.education.gov.au/destination-australia"
                }
            ]
        elif "IRELAND" in c_upper or "IRL" in c_upper:
            return [
                {
                    "name": "Government of Ireland International Education Scholarship",
                    "coverage": "€10,000 Stipend + 100% Tuition Fee Waiver for 1 Year",
                    "eligibility": "High-achieving non-EU/EEA students applying to Irish Higher Education",
                    "deadline": "March 24",
                    "apply_url": "https://eurireland.ie/2023/02/10/government-of-ireland-international-education-scholarships-2023/"
                }
            ]
        elif "SINGAPORE" in c_upper or "SGP" in c_upper:
            return [
                {
                    "name": "Singapore International Graduate Award (SINGA)",
                    "coverage": "Full Tuition + SGD $2,700/mo Living Stipend + $1,500 Airfare",
                    "eligibility": "Graduates with proven passion for AI, Computing, and Biomedical Research",
                    "deadline": "June 01 / December 01",
                    "apply_url": "https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa"
                }
            ]
        elif "NETHERLANDS" in c_upper or "NLD" in c_upper:
            return [
                {
                    "name": "NL Scholarship (Holland Scholarship)",
                    "coverage": "€5,000 One-off Financial Award in Year 1",
                    "eligibility": "Non-EEA students accepted into participating Dutch Research Universities",
                    "deadline": "May 01",
                    "apply_url": "https://www.studyinnl.org/finances/nl-scholarship"
                }
            ]
        elif "FRANCE" in c_upper or "FRA" in c_upper:
            return [
                {
                    "name": "Eiffel Excellence Scholarship (Campus France)",
                    "coverage": "€1,181/month Living Allowance + Health Insurance + International Travel",
                    "eligibility": "Top-tier international candidates nominated directly by French Grande Écoles",
                    "deadline": "January 10",
                    "apply_url": "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence"
                }
            ]
        elif "SWITZERLAND" in c_upper or "CHE" in c_upper:
            return [
                {
                    "name": "ETH Excellence Scholarship & Opportunity Programme (ESOP)",
                    "coverage": "CHF 12,000/semester Living Costs + 100% Tuition Waiver",
                    "eligibility": "Outstanding academic record (Upper 10% of Bachelor's degree cohort)",
                    "deadline": "December 15",
                    "apply_url": "https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html"
                }
            ]
        elif "SWEDEN" in c_upper or "SWE" in c_upper:
            return [
                {
                    "name": "Swedish Institute Scholarship for Global Professionals (SISGP)",
                    "coverage": "100% Tuition + SEK 12,000/month Living Stipend + Travel Grant",
                    "eligibility": "Minimum 3,000 hours certified work experience + leadership proof",
                    "deadline": "February 28",
                    "apply_url": "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/"
                }
            ]
        elif "ZEALAND" in c_upper or "NZL" in c_upper:
            return [
                {
                    "name": "Manaaki New Zealand Scholarships",
                    "coverage": "Full Tuition + NZD $531/week Living Allowance + Medical Cover",
                    "eligibility": "Eligible developing country citizens with commitment to return post-degree",
                    "deadline": "February 28",
                    "apply_url": "https://www.mfat.govt.nz/en/aid-and-development/scholarships/"
                }
            ]
        else:
            return [
                {
                    "name": "University International Graduate Merit Award",
                    "coverage": "25% to 50% Tuition Fee Reduction",
                    "eligibility": "Applicants meeting university top percentile criteria",
                    "deadline": "Rolling with admission",
                    "apply_url": "https://www.educations.com/scholarships"
                }
            ]

    @classmethod
    def get_living_cost_breakdown(cls, country: str, annual_living_inr: float) -> Dict[str, Any]:
        monthly_inr = round(annual_living_inr / 12.0, 2)
        return {
            "annual_living_inr": annual_living_inr,
            "monthly_living_inr": monthly_inr,
            "rent_monthly_inr": round(monthly_inr * 0.54, 2),
            "food_groceries_monthly_inr": round(monthly_inr * 0.22, 2),
            "transit_utilities_monthly_inr": round(monthly_inr * 0.14, 2),
            "health_insurance_monthly_inr": round(monthly_inr * 0.10, 2),
            "country": country
        }

    @classmethod
    def get_university_loan_profile(cls, tuition_2y: float, living_2y: float, country: str, uni_name: str) -> Dict[str, Any]:
        total_outlay = tuition_2y + living_2y + 280000.0  # flight, visa, initial settlement
        recommended_loan = round(total_outlay * 0.82, 2)  # assuming 18% personal/family seed margin
        
        # Monthly EMI calculation for 15 years @ 10.5% interest rate
        r = (10.5 / 100.0) / 12.0
        n = 15 * 12
        if recommended_loan > 0:
            monthly_emi = round((recommended_loan * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1), 2)
        else:
            monthly_emi = 0.0

        return {
            "total_outlay_2y_inr": total_outlay,
            "recommended_loan_inr": recommended_loan,
            "estimated_monthly_emi_inr": monthly_emi,
            "tenure_years": 15,
            "interest_rate_pct": 10.5,
            "collateral_options": [
                {
                    "bank": "SBI Global Ed-Vantage",
                    "rate": "8.65% - 9.15%",
                    "max_amount_inr": 15000000,
                    "collateral_required": "Tangible Property / Fixed Deposit (100% security)",
                    "features": "Lowest public sector rate in India, Tax rebate under Section 80E, 0.50% concession for girls"
                },
                {
                    "bank": "Bank of Baroda Scholar Scheme",
                    "rate": "8.85% - 9.35%",
                    "max_amount_inr": 8000000,
                    "collateral_required": "Immovable Residential/Commercial Property",
                    "features": "Zero processing fee for top 50 global universities, fast-track branch clearance"
                }
            ],
            "non_collateral_options": [
                {
                    "lender": "Prodigy Finance (UK/US)",
                    "rate": "10.2% - 12.4% USD",
                    "max_amount_inr": 12000000,
                    "collateral_required": "NO Collateral & NO Co-signer Required",
                    "features": "Sanction based entirely on future earning potential; disbursed directly in foreign currency"
                },
                {
                    "lender": "HDFC Credila",
                    "rate": "10.50% - 11.75%",
                    "max_amount_inr": 7500000,
                    "collateral_required": "Unsecured up to ₹75 Lakhs with earning co-applicant",
                    "features": "Sanction letter delivered before i-20 / CAS; covers 100% tuition, living, and flight"
                },
                {
                    "lender": "Avanse Financial Services",
                    "rate": "10.75% - 12.25%",
                    "max_amount_inr": 7000000,
                    "collateral_required": "Non-collateral with co-signer",
                    "features": "Flexible moratorium period (course duration + 6 months post graduation)"
                }
            ]
        }

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
            country_code = (
                "USA" if "USA" in country_norm or "UNITED STATES" in country_norm else
                "DEU" if "GERMANY" in country_norm or "DEU" in country_norm else
                "CAN" if "CANADA" in country_norm or "CAN" in country_norm else
                "GBR" if "KINGDOM" in country_norm or "UK" in country_norm or "GBR" in country_norm else
                "IRL" if "IRELAND" in country_norm or "IRL" in country_norm else
                "AUS" if "AUSTRALIA" in country_norm or "AUS" in country_norm else
                "NLD" if "NETHERLANDS" in country_norm or "NLD" in country_norm or "HOLLAND" in country_norm else
                "FRA" if "FRANCE" in country_norm or "FRA" in country_norm else
                "SGP" if "SINGAPORE" in country_norm or "SGP" in country_norm else
                "NZL" if "ZEALAND" in country_norm or "NZL" in country_norm else
                "CHE" if "SWITZERLAND" in country_norm or "CHE" in country_norm else
                "SWE" if "SWEDEN" in country_norm or "SWE" in country_norm else
                country_norm
            )

            # Match if country matches any selected, or if ALL selected / empty
            is_match = False
            if not selected_countries_normalized or "ALL" in selected_countries_normalized:
                is_match = True
            else:
                for sc in selected_countries_normalized:
                    if sc in [country_norm, country_code] or sc in country_norm or country_norm in sc:
                        is_match = True
                        break

            if not is_match:
                continue

            # Calculate 2-year total cost and ROI payback
            tuition_2y = item["annual_tuition_inr"] * 2.0
            living_2y = item["annual_living_inr"] * 2.0
            total_cost_2y = tuition_2y + living_2y
            post_tax_post_living_savings_inr = item["post_ms_avg_starting_salary_inr"] * 0.45  # ~45% net disposable after taxes & overseas living
            roi_years = round(total_cost_2y / max(post_tax_post_living_savings_inr, 1000000.0), 1)

            # Rich Scholarships, Loan Profiles, Living Breakdowns
            scholarships_data = cls.get_university_scholarships(item["university_name"], item["country"])
            living_data = cls.get_living_cost_breakdown(item["country"], item["annual_living_inr"])
            loan_data = cls.get_university_loan_profile(tuition_2y, living_2y, item["country"], item["university_name"])
            tuition_data = {
                "annual_tuition_inr": item["annual_tuition_inr"],
                "annual_tuition_usd": item["annual_tuition_usd"],
                "tuition_2y_inr": tuition_2y,
                "is_tuition_free": item["annual_tuition_inr"] < 100000.0  # e.g. German public universities
            }

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
                    direct_application_url=item.get("direct_application_url", item["official_portal_url"]),
                    exam_form_url=item.get("exam_form_url"),
                    application_deadline=item["application_deadline"],
                    application_fee_inr=item["application_fee_inr"],
                    is_stem_certified=item["is_stem_certified"],
                    scholarships=scholarships_data,
                    living_breakdown=living_data,
                    loan_options=loan_data,
                    tuition_breakdown=tuition_data,
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
