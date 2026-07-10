const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // Remove quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.SUPABASE_URL || 'https://srxogdtbokmlfibjkvcw.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const courses = [
  {
    id: 'ec9a8bb7-1de9-4c8d-b857-cf0728596b45',
    slug: 'piano',
    name: 'Piano',
    tagline: 'Classical technique to jazz improvisation',
    summary: 'A complete piano programme covering classical repertoire, jazz harmony, sight-reading and performance. Students progress from basic touch and posture through graded exam repertoire to concert-level performance.',
    duration: '12–36 months',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Performance'],
    curriculum: [
      {term: "Term 1: Fundamentals", topics: ["Posture and hand position", "Five-finger exercises", "Simple intervals & scales"]},
      {term: "Term 2: Core Technique", topics: ["Major and minor scales", "Basic sight reading", "Hands coordination & pedaling"]},
      {term: "Term 3: Intermediate Repertoire", topics: ["Classical pieces (Bach, Mozart, Beethoven)", "Dynamic control & expression", "Performance preparation"]},
      {term: "Term 4: Advanced Performance", topics: ["Concerto repertoire", "Jazz harmony & improvisation", "Concert recital preparation"]}
    ],
    outcomes: ['Read sheet music fluently', 'Perform at recitals', 'ABRSM / Trinity grade ready', 'Improvise over jazz standards'],
    certification: 'ABRSM / Trinity College London',
    display_order: 1
  },
  {
    id: 'a1a0f132-5d2c-4544-a0be-bdbe56e5fb5a',
    slug: 'keyboard',
    name: 'Keyboard',
    tagline: 'Synths, pads and live performance',
    summary: 'Contemporary keyboard for pop, worship and band settings. Students learn chord voicings, rhythmic accompaniment patterns, sound selection and live band coordination.',
    duration: '6–24 months',
    levels: ['Beginner', 'Intermediate', 'Advanced'],
    curriculum: [
      {term: "Term 1", topics: ["Chord shapes & voicings", "Pop progressions", "Sound selection & patch design"]},
      {term: "Term 2", topics: ["Rhythmic comping patterns", "Lead lines & fills", "Playing in a band context"]},
      {term: "Term 3", topics: ["Advanced harmony", "Worship & contemporary styles", "Live performance skills"]}
    ],
    outcomes: ['Play any pop song', 'Lead a band or worship team', 'Design and navigate synth sounds'],
    certification: 'Zahau Performance Certificate',
    display_order: 2
  },
  {
    id: '78ce58c0-a0f5-4073-b54b-e577b48eb258',
    slug: 'guitar',
    name: 'Guitar',
    tagline: 'Ukulele, Classical & Electric',
    summary: 'Comprehensive guitar programme covering acoustic, electric, classical and ukulele. From open chords and basic strumming to advanced soloing, fingerpicking, and performance across all styles.',
    duration: '6–36 months',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Performance'],
    curriculum: [
      {term: "Term 1: Foundations", topics: ["Open chords & strumming patterns", "Basic fingerpicking", "First songs & music reading"]},
      {term: "Term 2: Technique", topics: ["Barre chords", "Pentatonic & major scales", "Lead guitar basics"]},
      {term: "Term 3: Styles", topics: ["Classical technique (nylon string)", "Electric soloing & effects", "Ukulele chords & strumming"]},
      {term: "Term 4: Performance", topics: ["Stage performance skills", "Advanced repertoire", "Recording & tone shaping"]}
    ],
    outcomes: ['Play & sing across all styles', 'Solo over backing tracks', 'Read TAB & standard notation', 'Perform on stage confidently'],
    certification: 'Trinity Rock & Pop',
    display_order: 3
  },
  {
    id: 'd56d0c9f-f7d0-4225-bcf9-8ec04b5da433',
    slug: 'drums',
    name: 'Drum',
    tagline: 'Rhythmic foundations and polyrhythms',
    summary: 'Acoustic and electronic drumming — rudiments, grooves, fills and live performance. Students develop timing, independence and stylistic versatility across rock, jazz, pop and Latin genres.',
    duration: '6–36 months',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Performance'],
    curriculum: [
      {term: "Term 1: Fundamentals", topics: ["Single & double strokes", "Basic rock beat", "Counting & subdivisions"]},
      {term: "Term 2: Grooves", topics: ["16th-note patterns", "Hi-hat variations", "Fills & transitions"]},
      {term: "Term 3: Styles", topics: ["Jazz brush technique", "Latin patterns", "Playing with a click track"]},
      {term: "Term 4: Performance", topics: ["Band performance skills", "Studio recording basics", "Electronic drum programming"]}
    ],
    outcomes: ['Play in a live band', 'Record drum tracks professionally', 'Play across rock, jazz, Latin & pop styles'],
    certification: 'Trinity Rock & Pop Drums',
    display_order: 4
  },
  {
    id: '24af4f02-b783-449d-921e-3f4fb7cafa6d',
    slug: 'voice',
    name: 'Vocal Performance',
    tagline: 'Hindustani, Carnatic & Western vocal',
    summary: 'Comprehensive vocal training across all three major traditions — Hindustani classical, Carnatic classical, and Western contemporary. Students develop healthy technique, repertoire depth and powerful stage presence.',
    duration: '6–36 months',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Performance'],
    curriculum: [
      {term: "Term 1: Foundations", topics: ["Breath support & posture", "Range exploration & warm-ups", "Pitch accuracy & tone quality"]},
      {term: "Term 2: Style Streams", topics: ["Hindustani: Ragas & Taal basics", "Carnatic: Swara & Varna", "Western: Contemporary pop technique & belting"]},
      {term: "Term 3: Repertoire", topics: ["Song selection & interpretation", "Mic technique & stagecraft", "Ensemble & harmony singing"]},
      {term: "Term 4: Performance", topics: ["Concert preparation", "Recording vocals in studio", "Exam & recital performance"]}
    ],
    outcomes: ['Sing confidently on stage', 'Perform in Hindustani, Carnatic or Western style', 'Studio-ready vocal technique', 'Control pitch, breath and dynamics'],
    certification: 'Trinity Rock & Pop Vocals / Sangeet Visharad',
    display_order: 5
  },
  {
    id: 'a56b3a2d-6455-448a-9a5d-d986fd27ae8a',
    slug: 'music-theory',
    name: 'Music Theory',
    tagline: 'Written theory, oral theory & ear training',
    summary: 'The shared language of music — reading, writing, analysing, hearing and understanding musical structure. Covers written theory, oral theory, ear training, dictation, and harmony for all instruments and styles.',
    duration: '3–18 months',
    levels: ['Beginner', 'Intermediate', 'Advanced'],
    curriculum: [
      {term: "Term 1: Foundations", topics: ["Pitch & rhythm reading", "Major/minor scales & keys", "Intervals & basic harmony"]},
      {term: "Term 2: Ear Training", topics: ["Melodic dictation", "Chord recognition by ear", "Rhythmic dictation & sight-singing"]},
      {term: "Term 3: Written & Oral Theory", topics: ["Four-part harmony", "Oral theory examinations", "Analysis of musical forms"]},
      {term: "Term 4: Advanced", topics: ["Modal harmony & jazz theory", "Composition & counterpoint", "ABRSM Theory exam preparation"]}
    ],
    outcomes: ['Read & write music fluently', 'Develop a trained musical ear', 'Compose simple pieces', 'Pass ABRSM Theory of Music grades'],
    certification: 'ABRSM Theory of Music',
    display_order: 6
  }
];

const fees = [
  {
    title: 'Monthly Enrolment',
    fees: 'Rs. 5,000',
    raw_fees: 5000,
    duration: '1 Month',
    mode: 'In-Person & Online',
    tagline: 'Flexible pay-as-you-go learning',
    features: ['1 class per week (4 classes / month)', '1 hour per class at convenient timings', 'Choice of instrument or vocal stream', 'Introduction to music theory', 'Access to practice materials', 'No lock-in — renew month to month'],
    popular: false,
    badge: 'Flexible',
    display_order: 1
  },
  {
    title: '3 Months Course',
    fees: 'Rs. 25,000',
    raw_fees: 25000,
    duration: '3 Months',
    mode: 'In-Person & Online',
    tagline: 'Structured foundation program (until finish)',
    features: ['2 classes per week (24 classes total)', '1 hour per class at convenient timings', 'Structured beginner syllabus', 'Choose Piano, Keyboard, Guitar, Drums, Voice or Theory', 'Regular progress assessments', 'Zahau Foundation Certificate on completion'],
    popular: false,
    badge: 'Starter',
    display_order: 2
  },
  {
    title: '6 Months Certificate',
    fees: 'Rs. 50,000',
    raw_fees: 50000,
    duration: '6 Months',
    mode: 'In-Person & Online',
    tagline: 'Comprehensive certificate program (until finish)',
    features: ['2 classes per week (48 classes total)', '1 hour per class at convenient timings', 'Intermediate to advanced repertoire', 'Deep dive into harmony, theory & ear training', 'Personalized faculty reviews & feedback', 'Performance Grade preparation & recitals', 'Zahau Certificate on completion'],
    popular: true,
    badge: 'Best Value',
    display_order: 3
  },
  {
    title: '1 Year Certificate Course',
    fees: 'Rs. 70,000',
    raw_fees: 70000,
    duration: '12 Months',
    mode: 'In-Person & Online',
    tagline: 'Full-year professional certification',
    features: ['2 classes per week (96 classes total)', '1 hour per class at convenient timings', 'Comprehensive technique & repertoire', 'Advanced music theory & composition', 'Stage performance & recital opportunities', 'Exam board preparation (ABRSM / Trinity)', 'Zahau Annual Certificate of Achievement'],
    popular: false,
    badge: 'Certificate',
    display_order: 4
  },
  {
    title: 'Diploma in Music',
    fees: 'Rs. 1,40,000',
    raw_fees: 140000,
    duration: '24 Months',
    mode: 'In-Person & Online',
    tagline: 'Professional 2-year music diploma',
    features: ['3 classes per week (288 classes total)', '1 hour per class at convenient timings', 'Full performance & composition curriculum', 'Advanced ensembles & band sessions', 'Industry mentorship & masterclasses', 'International exam board certifications', 'Zahau Diploma in Music — graduate credential', 'Career guidance & performance portfolio'],
    popular: false,
    badge: 'Diploma',
    display_order: 5
  }
];

async function run() {
  console.log("Updating courses...");
  for (const course of courses) {
    const { error } = await supabase.from('courses').upsert(course, { onConflict: 'id' });
    if (error) {
      console.error(`Error updating course ${course.slug}:`, error.message);
    } else {
      console.log(`Updated course: ${course.name}`);
    }
  }

  // Update old courses to bottom
  console.log("Updating old courses display order...");
  await supabase.from('courses').update({ display_order: 99 }).eq('slug', 'bass');
  await supabase.from('courses').update({ display_order: 98 }).eq('slug', 'violin');

  console.log("Re-populating fees...");
  // Clear old fees
  const { error: deleteError } = await supabase.from('fees').delete().neq('title', 'placeholder_force_nonempty_dummy_string');
  if (deleteError) {
    console.error("Error clearing fees:", deleteError.message);
  }

  for (const fee of fees) {
    const { error } = await supabase.from('fees').insert(fee);
    if (error) {
      console.error(`Error inserting fee ${fee.title}:`, error.message);
    } else {
      console.log(`Inserted fee package: ${fee.title}`);
    }
  }

  console.log("Database update completed!");
}

run();
