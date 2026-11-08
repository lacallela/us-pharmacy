const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_LVoi1pZ4zUDY@ep-plain-mud-ba01n8lt-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

const MORE_DRUGS = [
  {
    name: 'Celexa',
    slug: 'celexa',
    generic_name: 'Citalopram Hydrobromide',
    category: 'Mental Health & Mood',
    drug_type: 'Rx',
    dosage: '20mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Allergan / Generic Labs',
    brand_price: 110.00,
    generic_cash_price: 12.50,
    coupon_code: 'pu-8992',
    path: '/categories/Depression/Celexa',
    symptoms: ['Depression', 'Anxiety', 'Low Energy'],
    description: 'Celexa (citalopram) is a widely trusted SSRI that helps restore the balance of serotonin in the brain, improving mood, energy levels, and feelings of well-being.',
    fda_indications: 'Treatment of major depressive disorder in adults.',
    contraindications: 'Concomitant MAOI use, congenital long QT syndrome.',
    how_to_use: 'Take 1 tablet once daily, morning or evening, with or without food.',
    side_effects: 'Nausea, dry mouth, somnolence, insomnia, increased sweating.'
  },
  {
    name: 'Paxil',
    slug: 'paxil',
    generic_name: 'Paroxetine HCl',
    category: 'Mental Health & Mood',
    drug_type: 'Rx',
    dosage: '20mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'GlaxoSmithKline / Generic Labs',
    brand_price: 120.00,
    generic_cash_price: 13.00,
    coupon_code: 'pu-8992',
    path: '/categories/Depression/Paxil',
    symptoms: ['Panic Disorder', 'Social Anxiety', 'Depression', 'OCD'],
    description: 'Paxil (paroxetine) is a potent SSRI antidepressant particularly effective for severe panic attacks, social phobia, and generalized anxiety.',
    fda_indications: 'Major depressive disorder, panic disorder, social anxiety disorder, generalized anxiety disorder, PTSD.',
    contraindications: 'MAOI use within 14 days, concurrent thioridazine or pimozide.',
    how_to_use: 'Take 1 tablet in the morning with food to reduce nausea.',
    side_effects: 'Drowsiness, weakness, dizziness, dry mouth, sexual dysfunction.'
  },
  {
    name: 'Effexor XR',
    slug: 'effexor-xr',
    generic_name: 'Venlafaxine HCl (Extended-Release)',
    category: 'Mental Health & Mood',
    drug_type: 'Rx',
    dosage: '75mg, 30 capsules',
    form: 'Extended-Release Capsules',
    manufacturer: 'Wyeth / Pfizer',
    brand_price: 165.00,
    generic_cash_price: 15.50,
    coupon_code: 'pu-8992',
    path: '/categories/Anxiety/Effexor-XR',
    symptoms: ['Major Depression', 'Severe Anxiety', 'Social Phobia'],
    description: 'Effexor XR (venlafaxine) is a serotonin-norepinephrine reuptake inhibitor (SNRI) that relieves severe depressive symptoms and panic disorder.',
    fda_indications: 'Major depressive disorder, GAD, social anxiety disorder, panic disorder.',
    contraindications: 'Concomitant MAOIs, uncontrolled narrow-angle glaucoma.',
    how_to_use: 'Take once daily with food at approximately the same time.',
    side_effects: 'Nausea, somnolence, dry mouth, sweating, hypertension.'
  },
  {
    name: 'Cozaar',
    slug: 'cozaar',
    generic_name: 'Losartan Potassium',
    category: 'Blood Pressure & Heart',
    drug_type: 'Rx',
    dosage: '50mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Merck / Generic Labs',
    brand_price: 135.00,
    generic_cash_price: 11.50,
    coupon_code: 'pu-8992',
    path: '/categories/Blood-Pressure/Cozaar',
    symptoms: ['High Blood Pressure', 'Diabetic Nephropathy', 'Stroke Risk'],
    description: 'Cozaar (losartan) is an angiotensin II receptor blocker (ARB) that keeps blood vessels from narrowing, lowering blood pressure and protecting kidney function.',
    fda_indications: 'Hypertension, diabetic nephropathy in type 2 diabetes, stroke risk reduction in patients with hypertension and LVH.',
    contraindications: 'Pregnancy (boxed warning), concurrent aliskiren in diabetes.',
    how_to_use: 'Take once daily with or without food.',
    side_effects: 'Upper respiratory infection, dizziness, nasal congestion, back pain.'
  },
  {
    name: 'Diovan',
    slug: 'diovan',
    generic_name: 'Valsartan',
    category: 'Blood Pressure & Heart',
    drug_type: 'Rx',
    dosage: '80mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Novartis / Generic Labs',
    brand_price: 170.00,
    generic_cash_price: 12.80,
    coupon_code: 'pu-8992',
    path: '/categories/Blood-Pressure/Diovan',
    symptoms: ['Hypertension', 'Heart Failure', 'Post-Myocardial Infarction'],
    description: 'Diovan (valsartan) blocks the action of angiotensin II to relax arteries, improve cardiac output in heart failure, and prevent post-MI mortality.',
    fda_indications: 'Hypertension, heart failure (NYHA class II-IV), post-myocardial infarction.',
    contraindications: 'Pregnancy, concomitant aliskiren in patients with diabetes.',
    how_to_use: 'Take once or twice daily as prescribed.',
    side_effects: 'Dizziness, hypotension, fatigue, hyperkalemia.'
  },
  {
    name: 'Atenolol',
    slug: 'atenolol',
    generic_name: 'Atenolol',
    category: 'Heart & Blood Pressure',
    drug_type: 'Rx',
    dosage: '50mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Generic Labs',
    brand_price: 38.00,
    generic_cash_price: 10.20,
    coupon_code: 'pu-8992',
    path: '/categories/Blood-Pressure/Tenormin',
    symptoms: ['Hypertension', 'Angina Pectoris', 'Arrhythmia'],
    description: 'Atenolol is a cardioselective beta-1 adrenergic blocker that reduces myocardial oxygen demand and stabilizes blood pressure.',
    fda_indications: 'Hypertension, management of angina pectoris, post-MI hemodynamically stable patients.',
    contraindications: 'Sinus bradycardia, heart block greater than first degree, cardiogenic shock.',
    how_to_use: 'Take 1 tablet daily with a glass of water.',
    side_effects: 'Bradycardia, cold extremities, dizziness, fatigue.'
  },
  {
    name: 'Clarinex',
    slug: 'clarinex',
    generic_name: 'Desloratadine',
    category: 'Allergies',
    drug_type: 'Rx',
    dosage: '5mg, 30 tablets',
    form: 'Film-coated Tablets',
    manufacturer: 'Merck / Schering-Plough',
    brand_price: 145.00,
    generic_cash_price: 13.80,
    coupon_code: 'pu-8992',
    path: '/categories/Allergies/Clarinex',
    symptoms: ['Allergic Rhinitis', 'Chronic Hives', 'Nasal Congestion'],
    description: 'Clarinex (desloratadine) is a long-acting tricyclic histamine antagonist that blocks H1 receptors without sedating the central nervous system.',
    fda_indications: 'Seasonal and perennial allergic rhinitis, chronic idiopathic urticaria.',
    contraindications: 'Hypersensitivity to desloratadine or loratadine.',
    how_to_use: 'Take 1 tablet once daily with or without food.',
    side_effects: 'Pharyngitis, dry mouth, fatigue, somnolence.'
  },
  {
    name: 'Flonase',
    slug: 'flonase',
    generic_name: 'Fluticasone Propionate',
    category: 'Allergies & Sinus',
    drug_type: 'OTC',
    dosage: '50mcg/spray, 120 metered sprays',
    form: 'Nasal Spray Suspension',
    manufacturer: 'GlaxoSmithKline',
    brand_price: 32.00,
    generic_cash_price: 14.50,
    coupon_code: 'pu-8992',
    path: '/categories/Allergies/Flonase',
    symptoms: ['Nasal Allergies', 'Sinus Pressure', 'Sneezing', 'Post-Nasal Drip'],
    description: 'Flonase (fluticasone) is the #1 doctor-recommended steroid nasal spray that calms inflammation directly in the nasal passages for 24-hour relief.',
    fda_indications: 'Management of symptoms of seasonal and perennial allergic rhinitis.',
    contraindications: 'Recent nasal ulcers, nasal surgery, or nasal trauma.',
    how_to_use: 'Shake gently. Prime before first use. Spray 1 to 2 times into each nostril once daily.',
    side_effects: 'Epistaxis (nosebleed), nasal burning, headache, bitter taste.'
  },
  {
    name: 'Advair Diskus',
    slug: 'advair-diskus',
    generic_name: 'Fluticasone + Salmeterol',
    category: 'Asthma & Respiratory',
    drug_type: 'Rx',
    dosage: '250/50mcg, 60 blisters',
    form: 'Inhalation Powder',
    manufacturer: 'GlaxoSmithKline',
    brand_price: 380.00,
    generic_cash_price: 38.00,
    coupon_code: 'pu-8992',
    path: '/categories/Asthma/Advair-Diskus',
    symptoms: ['Chronic Asthma', 'COPD Flare-ups', 'Shortness of Breath'],
    description: 'Advair Diskus combines an inhaled corticosteroid with a long-acting bronchodilator for daily controller therapy in asthma and COPD.',
    fda_indications: 'Treatment of asthma in patients aged 4 years and older; maintenance treatment of COPD.',
    contraindications: 'Primary treatment of status asthmaticus; severe milk protein allergy.',
    how_to_use: 'Inhale 1 blister twice daily approximately 12 hours apart. Rinse mouth with water after inhalation.',
    side_effects: 'Oral thrush, hoarseness, throat irritation, headache.'
  },
  {
    name: 'Biaxin',
    slug: 'biaxin',
    generic_name: 'Clarithromycin',
    category: 'Antibiotics',
    drug_type: 'Rx',
    dosage: '500mg, 20 tablets',
    form: 'Film-coated Tablets',
    manufacturer: 'Abbott / Generic Labs',
    brand_price: 110.00,
    generic_cash_price: 15.20,
    coupon_code: 'pu-8992',
    path: '/categories/Antibiotics/Biaxin',
    symptoms: ['H. pylori Ulcers', 'Pneumonia', 'Sinusitis', 'Strep Throat'],
    description: 'Biaxin (clarithromycin) is a potent macrolide antibiotic essential for eradicating H. pylori in peptic ulcers and treating tough respiratory infections.',
    fda_indications: 'Pharyngitis/tonsillitis, acute maxillary sinusitis, acute bacterial exacerbation of chronic bronchitis, H. pylori eradication.',
    contraindications: 'History of cholestatic jaundice with clarithromycin; concomitant cisapride, pimozide, or colchicine in renal impairment.',
    how_to_use: 'Take 500mg every 12 hours with or without meals for 7 to 14 days.',
    side_effects: 'Abdominal pain, diarrhea, nausea, abnormal taste (metallic), headache.'
  },
  {
    name: 'Ceftin',
    slug: 'ceftin',
    generic_name: 'Cefuroxime Axetil',
    category: 'Antibiotics',
    drug_type: 'Rx',
    dosage: '500mg, 20 tablets',
    form: 'Tablets',
    manufacturer: 'GlaxoSmithKline',
    brand_price: 130.00,
    generic_cash_price: 16.50,
    coupon_code: 'pu-8992',
    path: '/categories/Antibiotics/Ceftin',
    symptoms: ['Lyme Disease (Early Stage)', 'Bronchitis', 'Sinusitis', 'Otitis Media'],
    description: 'Ceftin (cefuroxime) is a second-generation cephalosporin with excellent bactericidal coverage against beta-lactamase producing respiratory pathogens and early Lyme disease.',
    fda_indications: 'Pharyngitis/tonsillitis, acute bacterial otitis media, acute bacterial maxillary sinusitis, early Lyme disease (erythema migrans).',
    contraindications: 'Cephalosporin allergy.',
    how_to_use: 'Take with food to enhance absorption and reduce stomach upset. Swallow whole.',
    side_effects: 'Diarrhea, nausea, vomiting, vaginitis.'
  },
  {
    name: 'Lamisil',
    slug: 'lamisil',
    generic_name: 'Terbinafine HCl',
    category: 'Anti Fungal',
    drug_type: 'Rx',
    dosage: '250mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Novartis / Generic Labs',
    brand_price: 175.00,
    generic_cash_price: 16.80,
    coupon_code: 'pu-8992',
    path: '/categories/Anti-Fungal/Lamisil',
    symptoms: ['Toenail Fungus (Onychomycosis)', 'Athlete’s Foot', 'Ringworm'],
    description: 'Lamisil (terbinafine) is the gold-standard oral allylamine antifungal that accumulates in the nail bed, permanently eradicating fungal toenail and fingernail infections.',
    fda_indications: 'Treatment of onychomycosis of the toenail or fingernail due to dermatophytes.',
    contraindications: 'Chronic or active liver disease, severe renal impairment.',
    how_to_use: 'Take 1 tablet daily for 6 weeks (fingernails) or 12 weeks (toenails).',
    side_effects: 'Headache, diarrhea, rash, dyspepsia, temporary alteration in taste.'
  },
  {
    name: 'Motrin',
    slug: 'motrin',
    generic_name: 'Ibuprofen',
    category: 'Pain Relief',
    drug_type: 'OTC',
    dosage: '800mg, 30 tablets',
    form: 'Film-coated Tablets',
    manufacturer: 'McNeil / Generic Labs',
    brand_price: 35.00,
    generic_cash_price: 10.50,
    coupon_code: 'pu-8992',
    path: '/categories/Pain-Relief/Ibuprofen',
    symptoms: ['Headache', 'Dental Pain', 'Fever', 'Menstrual Cramps', 'Back Pain'],
    description: 'Motrin (ibuprofen) is the classic nonsteroidal anti-inflammatory drug (NSAID) providing fast, reliable relief from headaches, toothaches, fever, and muscle soreness.',
    fda_indications: 'Relief of the signs and symptoms of rheumatoid arthritis and osteoarthritis; mild to moderate pain; primary dysmenorrhea.',
    contraindications: 'History of asthma, urticaria, or allergic reactions after taking aspirin; coronary artery bypass graft surgery.',
    how_to_use: 'Take with food or milk to prevent stomach discomfort. Do not exceed recommended dosage.',
    side_effects: 'Nausea, epigastric pain, heartburn, dizziness.'
  },
  {
    name: 'Aleve',
    slug: 'aleve',
    generic_name: 'Naproxen Sodium',
    category: 'Pain Relief',
    drug_type: 'OTC',
    dosage: '220mg, 50 caplets',
    form: 'Caplets',
    manufacturer: 'Bayer / Generic Labs',
    brand_price: 28.00,
    generic_cash_price: 11.00,
    coupon_code: 'pu-8992',
    path: '/categories/Pain-Relief/Aleve',
    symptoms: ['Joint Pain', 'Arthritis Aches', 'Tendonitis', 'Backache'],
    description: 'Aleve (naproxen sodium) delivers up to 12 hours of continuous pain relief from minor arthritis aches, joint stiffness, and muscle inflammation in a single dose.',
    fda_indications: 'Temporary relief of minor aches and pains due to minor pain of arthritis, muscular aches, backache, headache.',
    contraindications: 'Aspirin allergy, active bleeding ulcers.',
    how_to_use: 'Take 1 caplet every 8 to 12 hours with a full glass of water while symptoms last.',
    side_effects: 'Heartburn, abdominal cramps, nausea, mild fluid retention.'
  },
  {
    name: 'Antabuse',
    slug: 'antabuse',
    generic_name: 'Disulfiram',
    category: 'Other & Wellness',
    drug_type: 'Rx',
    dosage: '250mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Teva / Generic Labs',
    brand_price: 85.00,
    generic_cash_price: 14.80,
    coupon_code: 'pu-8992',
    path: '/categories/Bestsellers/Antabuse',
    symptoms: ['Alcohol Dependence Support', 'Sobriety Maintenance'],
    description: 'Antabuse (disulfiram) blocks aldehyde dehydrogenase, producing severe unpleasant physiological reactions if alcohol is ingested, reinforcing complete abstinence.',
    fda_indications: 'An aid in the management of selected chronic alcohol patients who want to remain in a state of enforced sobriety.',
    contraindications: 'Severe myocardial disease, coronary occlusion, psychosis, concurrent metronidazole, recent alcohol use.',
    how_to_use: 'Take 1 tablet daily in the morning or bedtime as prescribed. Must be abstinent from alcohol for at least 12 hours before first dose.',
    side_effects: 'Drowsiness, fatigue, headache, metallic or garlic-like aftertaste.'
  },
  {
    name: 'Aricept',
    slug: 'aricept',
    generic_name: 'Donepezil HCl',
    category: 'Neurology & Memory',
    drug_type: 'Rx',
    dosage: '10mg, 30 film-coated tablets',
    form: 'Film-coated Tablets',
    manufacturer: 'Eisai / Pfizer',
    brand_price: 220.00,
    generic_cash_price: 15.80,
    coupon_code: 'pu-8992',
    path: '/categories/Other/Aricept',
    symptoms: ['Memory Loss', 'Alzheimer’s Dementia', 'Cognitive Decline'],
    description: 'Aricept (donepezil) is a reversible acetylcholinesterase inhibitor that enhances cholinergic neurotransmission, stabilizing cognitive function in Alzheimer’s disease.',
    fda_indications: 'Treatment of dementia of the Alzheimer’s type (mild, moderate, and severe).',
    contraindications: 'Known hypersensitivity to donepezil or piperidine derivatives.',
    how_to_use: 'Take 1 tablet once daily in the evening immediately before bedtime.',
    side_effects: 'Nausea, diarrhea, insomnia, muscle cramps, fatigue, anorexia.'
  },
  {
    name: 'Atarax',
    slug: 'atarax',
    generic_name: 'Hydroxyzine HCl',
    category: 'Anxiety & Allergies',
    drug_type: 'Rx',
    dosage: '25mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Pfizer / Generic Labs',
    brand_price: 55.00,
    generic_cash_price: 11.50,
    coupon_code: 'pu-8992',
    path: '/categories/Allergies/Atarax',
    symptoms: ['Severe Allergic Itching', 'Acute Anxiety', 'Tension', 'Hives'],
    description: 'Atarax (hydroxyzine) is a calming first-generation antihistamine with central anxiolytic properties, rapidly stopping severe itching, urticaria, and acute anxiety.',
    fda_indications: 'Symptomatic relief of anxiety and tension; management of pruritus due to allergic conditions.',
    contraindications: 'Prolonged QT interval, early pregnancy, hypersensitivity to cetirizine.',
    how_to_use: 'Take as needed or scheduled with water. Avoid driving until effect is known.',
    side_effects: 'Drowsiness, dry mouth, headache, dizziness.'
  },
  {
    name: 'Rogaine',
    slug: 'rogaine',
    generic_name: 'Minoxidil (5% Solution)',
    category: 'Hair Loss',
    drug_type: 'OTC',
    dosage: '5% topical solution, 60ml bottle',
    form: 'Topical Solution',
    manufacturer: 'Johnson & Johnson',
    brand_price: 45.00,
    generic_cash_price: 14.00,
    coupon_code: 'pu-8992',
    path: '/categories/Hair-Loss/Rogaine-2',
    symptoms: ['Vertex Hair Thinning', 'Male Pattern Baldness'],
    description: 'Rogaine (minoxidil 5%) directly revitalizes shrunken hair follicles, increases local scalp circulation, and stimulates new thicker hair regrowth.',
    fda_indications: 'Regrow hair on top of the scalp (vertex only) in men with androgenetic alopecia.',
    contraindications: 'Scalp irritation, sunburn, open lesions, sudden or patchy hair loss.',
    how_to_use: 'Apply 1 mL directly to the scalp in the hair loss area twice daily.',
    side_effects: 'Local scalp stinging, redness, unwanted facial hair if dripped.'
  },
  {
    name: 'Arimidex',
    slug: 'arimidex',
    generic_name: 'Anastrozole',
    category: "Women's Health",
    drug_type: 'Rx',
    dosage: '1mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'AstraZeneca / Generic Labs',
    brand_price: 240.00,
    generic_cash_price: 18.50,
    coupon_code: 'pu-8992',
    path: "/categories/Woman's-Health/Arimidex",
    symptoms: ['Postmenopausal Breast Health', 'Estrogen Suppression'],
    description: 'Arimidex (anastrozole) is a potent non-steroidal aromatase inhibitor that lowers circulating estrogen levels by over 80% in postmenopausal women.',
    fda_indications: 'Adjuvant treatment of postmenopausal women with hormone receptor-positive early breast cancer.',
    contraindications: 'Women of premenopausal status, pregnancy.',
    how_to_use: 'Take 1 tablet once daily with or without food.',
    side_effects: 'Hot flashes, asthenia, arthritis, joint pain, osteoporosis risk.'
  },
  {
    name: 'Femara',
    slug: 'femara',
    generic_name: 'Letrozole',
    category: "Women's Health",
    drug_type: 'Rx',
    dosage: '2.5mg, 30 tablets',
    form: 'Yellow Film-coated Tablets',
    manufacturer: 'Novartis / Generic Labs',
    brand_price: 280.00,
    generic_cash_price: 19.20,
    coupon_code: 'pu-8992',
    path: "/categories/Woman's-Health/Femara",
    symptoms: ['Ovulation Induction', 'PCOS Fertility', 'Estrogen Suppression'],
    description: 'Femara (letrozole) is an aromatase inhibitor widely preferred by reproductive endocrinologists for inducing ovulation in women with PCOS.',
    fda_indications: 'Hormone receptor-positive breast cancer; widely used off-label for ovulation induction in anovulatory infertility.',
    contraindications: 'Pregnancy, women of premenopausal endocrine status (unless used for fertility under medical protocol).',
    how_to_use: 'For fertility, typically taken daily for 5 days starting early in the menstrual cycle.',
    side_effects: 'Hot flashes, joint pain, fatigue, mild nausea.'
  },
  {
    name: 'Zanaflex',
    slug: 'zanaflex',
    generic_name: 'Tizanidine HCl',
    category: 'Muscle Relaxant',
    drug_type: 'Rx',
    dosage: '4mg, 30 tablets',
    form: 'Short-acting Tablets',
    manufacturer: 'Acorda / Generic Labs',
    brand_price: 85.00,
    generic_cash_price: 13.50,
    coupon_code: 'pu-8992',
    path: '/categories/Muscle-Relaxant/Baclofen',
    symptoms: ['Severe Muscle Spasms', 'Back Strain', 'Spasticity'],
    description: 'Zanaflex (tizanidine) is an alpha-2 adrenergic agonist that reduces muscle tone and spasm frequency for acute back and neck strain relief.',
    fda_indications: 'Management of spasticity.',
    contraindications: 'Concomitant ciprofloxacin or fluvoxamine (potent CYP1A2 inhibitors).',
    how_to_use: 'Take as prescribed up to three times daily. Dose every 6 to 8 hours as needed.',
    side_effects: 'Dry mouth, somnolence, asthenia, dizziness.'
  },
  {
    name: 'Zantac',
    slug: 'zantac',
    generic_name: 'Famotidine',
    category: 'Gastrointestinal',
    drug_type: 'OTC',
    dosage: '20mg, 30 tablets',
    form: 'Tablets',
    manufacturer: 'Sanofi / Generic Labs',
    brand_price: 25.00,
    generic_cash_price: 9.80,
    coupon_code: 'pu-8992',
    path: '/categories/Gastrointestinal/Prilosec',
    symptoms: ['Heartburn', 'Sour Stomach', 'Acid Indigestion'],
    description: 'Zantac 360 (famotidine) is an H2-receptor antagonist that prevents and relieves heartburn by reducing acid production in as little as 15 to 30 minutes.',
    fda_indications: 'Relief of heartburn associated with acid indigestion and sour stomach.',
    contraindications: 'Hypersensitivity to famotidine or other H2 blockers.',
    how_to_use: 'Take 1 tablet with a glass of water 15 to 60 minutes before eating food or drinking beverages that cause heartburn.',
    side_effects: 'Headache, dizziness, constipation, diarrhea.'
  },
  {
    name: 'Topamax',
    slug: 'topamax',
    generic_name: 'Topiramate',
    category: 'Neurology & Migraine',
    drug_type: 'Rx',
    dosage: '50mg, 30 tablets',
    form: 'Coated Tablets',
    manufacturer: 'Janssen / Generic Labs',
    brand_price: 145.00,
    generic_cash_price: 15.00,
    coupon_code: 'pu-8992',
    path: '/categories/Other/Topamax',
    symptoms: ['Chronic Migraine Prevention', 'Nerve Pain', 'Seizures'],
    description: 'Topamax (topiramate) is an anticonvulsant and FDA-approved migraine preventative that stabilizes hyperactive neuronal channels to reduce headache frequency.',
    fda_indications: 'Prophylaxis of migraine in patients 12 years of age and older; initial monotherapy for seizures.',
    contraindications: 'Recent alcohol use with extended release; metabolic acidosis history.',
    how_to_use: 'Take with or without food. Maintain high daily fluid intake to prevent kidney stones.',
    side_effects: 'Paresthesia (tingling in fingers/toes), taste perversion, fatigue, weight loss.'
  },
  {
    name: 'Synthroid',
    slug: 'synthroid',
    generic_name: 'Levothyroxine Sodium',
    category: 'Thyroid & Hormone',
    drug_type: 'Rx',
    dosage: '100mcg (0.1mg), 30 tablets',
    form: 'Tablets',
    manufacturer: 'AbbVie / Generic Labs',
    brand_price: 68.00,
    generic_cash_price: 11.20,
    coupon_code: 'pu-8992',
    path: '/categories/Other/Synthroid',
    symptoms: ['Hypothyroidism', 'Low Energy', 'Weight Gain', 'Sluggish Metabolism'],
    description: 'Synthroid (levothyroxine) is synthetic T4 thyroid hormone identical to that produced by the human thyroid gland, restoring optimal energy and metabolic rate.',
    fda_indications: 'Hypothyroidism; pituitary TSH suppression.',
    contraindications: 'Uncorrected adrenal insufficiency.',
    how_to_use: 'Take as a single daily dose on an empty stomach with a full glass of water, 30 to 60 minutes before breakfast.',
    side_effects: 'Rare when properly dosed (signs of excess: palpitations, sweating, nervousness).'
  }
];

async function run() {
  const pharmCheck = await sql`SELECT id FROM pharmacies WHERE slug = 'pharm-store'`;
  const pharmStoreId = pharmCheck[0].id;
  const retailPharmacies = await sql`SELECT id, slug FROM pharmacies WHERE slug IN ('walmart', 'cvs', 'walgreens')`;

  console.log(`Processing additional ${MORE_DRUGS.length} popular drugs...`);

  for (const m of MORE_DRUGS) {
    const existing = await sql`SELECT id FROM drugs WHERE slug = ${m.slug}`;
    let drugId;

    if (existing.length > 0) {
      drugId = existing[0].id;
      await sql`
        UPDATE drugs SET
          name = ${m.name},
          generic_name = ${m.generic_name},
          drug_type = ${m.drug_type},
          category = ${m.category},
          symptoms = ${JSON.stringify(m.symptoms)},
          dosage = ${m.dosage},
          form = ${m.form},
          manufacturer = ${m.manufacturer},
          brand_price = ${m.brand_price},
          generic_cash_price = ${m.generic_cash_price},
          coupon_code = ${m.coupon_code},
          description = ${m.description},
          fda_indications = ${m.fda_indications},
          contraindications = ${m.contraindications},
          how_to_use = ${m.how_to_use},
          side_effects = ${m.side_effects}
        WHERE id = ${drugId};
      `;
    } else {
      const ins = await sql`
        INSERT INTO drugs (
          slug, name, generic_name, drug_type, category, symptoms,
          dosage, form, manufacturer, brand_price, generic_cash_price,
          coupon_code, description, fda_indications, contraindications,
          how_to_use, side_effects, is_trending
        ) VALUES (
          ${m.slug}, ${m.name}, ${m.generic_name}, ${m.drug_type}, ${m.category}, ${JSON.stringify(m.symptoms)},
          ${m.dosage}, ${m.form}, ${m.manufacturer}, ${m.brand_price}, ${m.generic_cash_price},
          ${m.coupon_code}, ${m.description}, ${m.fda_indications}, ${m.contraindications},
          ${m.how_to_use}, ${m.side_effects}, 1
        ) RETURNING id;
      `;
      drugId = ins[0].id;
    }

    const couponDiscountedPrice = Number((m.generic_cash_price * 0.95).toFixed(2));
    const affiliateUrl = `http://pharm-store.com${m.path}?id=924`;

    await sql`DELETE FROM drug_pharmacy_prices WHERE drug_id = ${drugId} AND pharmacy_id = ${pharmStoreId};`;
    await sql`
      INSERT INTO drug_pharmacy_prices (drug_id, pharmacy_id, cash_price, coupon_price, in_stock, affiliate_url)
      VALUES (${drugId}, ${pharmStoreId}, ${m.generic_cash_price}, ${couponDiscountedPrice}, 1, ${affiliateUrl});
    `;

    for (const rp of retailPharmacies) {
      const exists = await sql`SELECT id FROM drug_pharmacy_prices WHERE drug_id = ${drugId} AND pharmacy_id = ${rp.id}`;
      if (exists.length === 0) {
        let multiplier = rp.slug === 'walmart' ? 1.25 : (rp.slug === 'cvs' ? 1.45 : 1.40);
        let retailCash = Number((m.generic_cash_price * multiplier).toFixed(2));
        let retailCoupon = Number((retailCash * 0.90).toFixed(2));
        await sql`
          INSERT INTO drug_pharmacy_prices (drug_id, pharmacy_id, cash_price, coupon_price, in_stock, affiliate_url)
          VALUES (${drugId}, ${rp.id}, ${retailCash}, ${retailCoupon}, 1, NULL);
        `;
      }
    }
  }

  const countRes = await sql`SELECT COUNT(*) as count FROM drugs`;
  console.log(`\n🎉 Total drugs in Neon Database now: ${countRes[0].count}!`);
}

run().catch(console.error);
