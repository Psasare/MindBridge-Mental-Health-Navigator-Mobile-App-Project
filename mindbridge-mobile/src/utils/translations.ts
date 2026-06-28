export type Language = 'English' | 'French' | 'Twi' | 'Ga' | 'Ewe' | 'Hausa';

export interface TranslationSchema {

    journey: {
      title: string;
      subtitle: string;
      streak: string;
      points: string;
      done: string;
      progress_label: string;
      daily_plan: string;
    };
  common: {
    takeYourTime: string;
    loadingSafeSpace: string;
    back: string;
    next: string;
    skip: string;
    confirm: string;
    cancel: string;
  };
  tabs: {
    today: string;
    explore: string;
    tracker: string;
    oracle: string;
    profile: string;
    settings: string;
  };
  onboarding: {
    skipConfirm: string;
    skipConfirmAction: string;
    skipConfirmCancel: string;
    privacyTitle: string;
    privacyPoints: string[];
    summaryTitle: string;
  };
  dashboard: {
    weeklyPulse: string;
    emotionalRhythm: string;
    viewJourney: string;
    moodSeed: string;
    reflect: string;
    breathe: string;
    dailyRituals: string;
    plantSeed: string;
    checkInMood: string;
    dailyReflection: string;
    writeJournalEntry: string;
    completeBreathing: string;
    latestReflection: string;
    viewAll: string;
    oracleInsights: string;
    chatNow: string;
    recentConversation: string;
    latestGuidance: string;
    moodGarden: string;
    seeds: string;
    activity: string;
    todaysSteps: string;
    steps: string;
    assessments: string;
    ready: string;
    done: string;
    resources: string;
    discoveryHub: string;
    crisisSupport: string;
    "247Help": string;
    tools: string;
    therapeutic: string;
    journal: string;
    reflections: string;
    community: string;
    connect: string;
    recommendedForYou: string;
    basedOnReflections: string;
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    nurtureTitle: string;
    clarityTitle: string;
    toolsTitle: string;
    supportTitle: string;
    motivations: { text: string; author: string }[];
    startWithIntention: string;
    checkInWithYourself: string;
    windDownAndReflect: string;
    howWasYourDay: string;
    nurturePeaceToday: string;
    yourJourney: string;
    startJourneyToday: string;
    dayStreak: string;
    dailyQuests: string;
    completeAllQuests: string;
    wellnessHub: string;
    wellnessToolkit: string;
  };
  tracker: {
    title: string;
    subtitle: string;
    checkInQuestion: string;
    supportNudge: string;
    successTitle: string;
    successSubtitle: string;
    energyLevel: string;
    sleepQuality: string;
    socialInteraction: string;
    physicalSymptoms: string;
    audioNote: string;
    submitBtn: string;
  };
  ai: {
    title: string;
    subtitle: string;
    placeholder: string;
    goToSupport: string;
    disclaimer: string;
    greetingStandard: string;
    greetingHeavy: string;
    greetingGlowing: string;
    greetingRecent: string;
    greetingWelcome: string;
  };
  settings: {
    account_privacy: string;
    personal_info: string;
    security_password: string;
    passcode_unlock: string;
    notifications: string;
    quest_reminders: string;
    language: string;
    support_legal: string;
    help_center: string;
    feedback: string;
    about: string;
    log_out: string;
    select_language: string;
    language_desc: string;
  };
  profile: {
    title: string;
    subtitle: string;
    edit_profile: string;
    university: string;
    joined: string;
    stats_reflections: string;
    stats_streak: string;
    stats_points: string;
    stats_seeds: string;
    stats_badges: string;
    stats_level: string;
    mood_insights: string;
    identity_personal: string;
    academic_info: string;
    emergency_contact: string;
    crisis_support: string;
    my_garden: string;
    settings: string;
    log_out: string;
  };
  journal: {
    title: string;
    subtitle: string;
    new_entry: string;
    write_reflection: string;
    title_placeholder: string;
    content_placeholder: string;
    save_entry: string;
    delete_entry: string;
    no_entries: string;
    recording: string;
    voice_note: string;
  };
  crisis: {
    title: string;
    subtitle: string;
    immediate_help: string;
    emergency_contact: string;
    national_emergency: string;
    university_counseling: string;
    mental_health_helpline: string;
    safety_plan: string;
    safety_steps: string;
    find_hospital: string;
    find_hospital_desc: string;
    edit: string;
  };
  resources: {
    title: string;
    subtitle: string;
    for_you: string;
    explore_all: string;
    coping_tools: string;
    all: string;
    audio: string;
    techniques: string;
    articles: string;
    videos: string;
    books: string;
  };
  community: {
    title: string;
    subtitle: string;
    explore_groups: string;
    members: string;
    anonymous_feed: string;
    send_hug: string;
    comment: string;
    just_now: string;
    hours_ago: string;
    days_ago: string;
    share_thought: string;
  };
  assessments: {
    title: string;
    subtitle: string;
    available_tests: string;
    recent_results: string;
    depression_screening: string;
    anxiety_screening: string;
    burnout_test: string;
    pss_screening: string;
    cssrs_screening: string;
    brs_screening: string;
    start: string;
    minutes: string;
  };
  tools: {
    title: string;
    subtitle: string;
    daily_growth: string;
    knowledge_checks: string;
    support_connection: string;
    app_preferences: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  English: {

    journey: {
      title: 'My Journey',
      subtitle: 'Today',
      streak: 'Streak',
      points: 'Points',
      done: 'Done',
      progress_label: 'Completed',
      daily_plan: 'Daily Plan',
    },
    common: {
      takeYourTime: 'Take your time',
      loadingSafeSpace: 'Creating your safe space...',
      back: 'Back',
      next: 'Next',
      skip: 'Skip',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    tabs: {
      today: 'Home',
      explore: 'Explore',
      tracker: 'Tracker',
      oracle: 'Oracle',
      profile: 'Profile',
      settings: 'Settings',
    },
    onboarding: {
      skipConfirm: 'This information helps us personalize your support. Are you sure you want to skip?',
      skipConfirmAction: 'Skip Anyway',
      skipConfirmCancel: 'Go Back',
      privacyTitle: 'Privacy & Data Commitment',
      privacyPoints: [
        'Your data is secured with industry-standard encryption',
        'Personal conversations remain strictly confidential',
        'You maintain full control over your shared information',
        'Account and data deletion is available at any time',
        'Information is used exclusively for your wellness support'
      ],
      summaryTitle: 'Your Mindful Summary',
    },
    dashboard: {
      weeklyPulse: 'Weekly Pulse',
      emotionalRhythm: 'Emotional Rhythm',
      viewJourney: 'View Journey',
      moodSeed: 'Mood Seed',
      reflect: 'Reflect',
      breathe: 'Breathe',
      dailyRituals: 'Daily Rituals',
      plantSeed: 'Plant a Seed',
      checkInMood: 'Check in with your mood',
      dailyReflection: 'Daily Reflection',
      writeJournalEntry: 'Write a journal entry',
      completeBreathing: 'Complete a breathing exercise',
      latestReflection: 'Latest Reflection',
      viewAll: 'View All',
      oracleInsights: 'Oracle Insights',
      chatNow: 'Chat Now',
      recentConversation: 'Recent Conversation',
      latestGuidance: 'Latest Guidance',
      moodGarden: 'Mood Garden',
      seeds: 'seeds',
      activity: 'Activity',
      todaysSteps: 'Today\'s Steps',
      steps: 'steps',
      assessments: 'Assessments',
      ready: 'Ready',
      done: 'done',
      resources: 'Resources',
      discoveryHub: 'Discovery Hub',
      crisisSupport: 'Crisis Support',
      "247Help": '24/7 Help',
      tools: 'Tools',
      therapeutic: 'Guided Support',
      journal: 'Journal',
      reflections: 'Reflections',
      community: 'Community',
      connect: 'Connect',
      recommendedForYou: 'Recommended for You',
      basedOnReflections: 'Based on your reflections',
      greetingMorning: 'Good Morning',
      greetingAfternoon: 'Good Afternoon',
      greetingEvening: 'Good Evening',
      nurtureTitle: 'Daily Nurture',
      clarityTitle: 'Moment of Clarity',
      toolsTitle: 'Mindful Tools',
      supportTitle: 'Community & Support',
      motivations: [
        { text: "What mental health needs is more sunlight, more candor, and more unashamed conversation.", author: "Glenn Close" },
        { text: "There is hope, even when your brain tells you there isn’t.", author: "John Green" },
        { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay" },
        { text: "Self-care is how you take your power back.", author: "Lalah Delia" },
      ],
      startWithIntention: 'Start with intention',
      checkInWithYourself: 'Check in with yourself',
      windDownAndReflect: 'Wind down and reflect',
      howWasYourDay: 'How was your day?',
      nurturePeaceToday: 'Nurture your peace today',
      yourJourney: 'Your Journey',
      startJourneyToday: 'Start your journey today',
      dayStreak: 'Day Streak!',
      dailyQuests: 'Daily Quests',
      completeAllQuests: 'Complete all to keep your streak!',
      wellnessHub: 'Wellness Hub',
      wellnessToolkit: 'Wellness Toolkit',
    },
    tracker: {
      title: 'Wellness Tracker',
      subtitle: 'Track your daily balance',
      checkInQuestion: 'How are you feeling right now?',
      supportNudge: "I'm sorry you're feeling this way. Would you like to try a quick breathing exercise?",
      successTitle: 'Check-in Complete!',
      successSubtitle: "Your wellness record has been updated. This data helps us provide better support for you.",
      energyLevel: "How is your energy?",
      sleepQuality: "How was your sleep?",
      socialInteraction: "Who have you been with?",
      physicalSymptoms: "Any physical symptoms?",
      audioNote: "Voice Reflection",
      submitBtn: "Complete Check-in"
    },
    ai: {
      title: 'MindBridge Oracle',
      subtitle: 'Your safe space',
      placeholder: 'Type your message...',
      goToSupport: 'Get Support Now',
      disclaimer: "The MindBridge Oracle provides wellness support but is not a replacement for professional clinical care. If you are in immediate danger, please use the Crisis Support tab.",
      greetingStandard: "Hello! I'm the MindBridge Oracle. I'm here to listen, support, and help you navigate your feelings. How are you doing today?",
      greetingHeavy: "Hi {name}. I noticed your last check-in felt heavy, reflecting {emotions}. That takes courage to name. What's been weighing on you most?",
      greetingGlowing: "Hello {name}! Your last seed was glowing with {emotions} What's been contributing to that good energy?",
      greetingRecent: "Hi {name}. I see your recent mood reflected {emotions}. How are you really doing today?",
      greetingWelcome: "Welcome, {name}. I am the MindBridge Oracle, your personal guide. What's on your mind today?",
    },
    settings: {
      account_privacy: 'Account & Privacy',
      personal_info: 'Personal Information',
      security_password: 'Security & Password',
      passcode_unlock: 'Passcode Unlock',
      notifications: 'Notifications',
      quest_reminders: 'Daily Quest Reminders',
      language: 'Language',
      support_legal: 'Support & Legal',
      help_center: 'Help Center',
      feedback: 'Send Feedback',
      about: 'About MindBridge',
      log_out: 'Log Out',
      select_language: 'Select Language',
      language_desc: 'Choose your preferred language for the MindBridge experience.',
    },
    profile: {
      title: 'Your Space',
      subtitle: 'Student Wellness Profile',
      edit_profile: 'Edit Profile',
      university: 'University',
      joined: 'Joined',
      stats_reflections: 'Reflections',
      stats_streak: 'Day Streak',
      stats_points: 'Wellness XP',
      stats_seeds: 'Mood Seeds',
      stats_badges: 'Achievements',
      stats_level: 'Zen Level',
      mood_insights: 'Mood Insights',
      identity_personal: 'Identity & Personal',
      academic_info: 'Academic Info',
      emergency_contact: 'Emergency Contact',
      crisis_support: 'Crisis Support',
      my_garden: 'Wellness History',
      settings: 'Settings',
      log_out: 'Log Out',
    },
    journal: {
      title: 'Moments of Clarity',
      subtitle: 'Your private safe space for reflection',
      new_entry: 'New Entry',
      write_reflection: 'Write a reflection',
      title_placeholder: 'Give it a title...',
      content_placeholder: "What's on your mind?",
      save_entry: 'Save Reflection',
      delete_entry: 'Delete Entry',
      no_entries: 'No reflections yet. Start by planting a thought.',
      recording: 'Recording...',
      voice_note: 'Voice Reflection',
    },
    crisis: {
      title: 'Crisis Support',
      subtitle: 'You are not alone. Reach out for immediate help.',
      immediate_help: 'Immediate Help',
      emergency_contact: 'Emergency Contact',
      national_emergency: 'National Emergency',
      university_counseling: 'University Counseling',
      mental_health_helpline: 'Mental Health Helpline',
      safety_plan: 'My Safety Plan',
      safety_steps: 'Steps to stay safe right now',
      find_hospital: 'Find Nearest Hospital',
      find_hospital_desc: 'Locate an emergency room near you.',
      edit: 'Edit',
    },
    resources: {
      title: 'Discovery Hub',
      subtitle: 'Curated wellness resources for you',
      for_you: 'For You',
      explore_all: 'Explore All',
      coping_tools: 'Evidence-Based Tools',
      all: 'All',
      audio: 'Audio',
      techniques: 'Techniques',
      articles: 'Articles',
      videos: 'Videos',
      books: 'Books',
    },
    community: {
      title: 'Safe Space',
      subtitle: 'Connect anonymously with your peer community',
      explore_groups: 'Explore Groups',
      members: 'members',
      anonymous_feed: 'Peer Activity',
      send_hug: 'Send Hug',
      comment: 'Comment',
      just_now: 'Just now',
      hours_ago: 'h ago',
      days_ago: 'd ago',
      share_thought: 'Start a Discussion',
    },
    assessments: {
      title: 'Assessments',
      subtitle: 'Scientifically validated clinical screenings',
      available_tests: 'Available Screenings',
      recent_results: 'Recent History',
      depression_screening: 'Depression Screening',
      anxiety_screening: 'Anxiety Screening',
      burnout_test: 'Student Burnout Test',
      pss_screening: 'Perceived Stress Scale',
      cssrs_screening: 'Risk Screener',
      brs_screening: 'Brief Resilience Scale',
      start: 'Start',
      minutes: 'mins',
    },
    tools: {
      title: 'Explore',
      subtitle: 'All your MindBridge tools in one place',
      daily_growth: 'Daily Growth',
      knowledge_checks: 'Knowledge & Checks',
      support_connection: 'Support & Connection',
      app_preferences: 'App Preferences',
    },
  },
  Twi: {

    journey: {
      title: 'My Journey',
      subtitle: 'Today',
      streak: 'Streak',
      points: 'Points',
      done: 'Done',
      progress_label: 'Completed',
      daily_plan: 'Daily Plan',
    },
    common: {
      takeYourTime: 'Gye wo bere',
      loadingSafeSpace: 'Yɛreyɛ wo banbɔbea...',
      back: 'San kɔ akyi',
      next: 'Kɔ anim',
      skip: 'Twa mu',
      confirm: 'Si so dua',
      cancel: 'Paasowa',
    },
    tabs: {
      today: 'Nnɛ',
      explore: 'Explore',
      tracker: 'Suivi',
      oracle: 'Oracle',
      profile: 'Profile',
      settings: 'Settings',
    },
    onboarding: {
      skipConfirm: 'Saa asɛm yi bɛboa yɛn ma yɛahu sɛnea yɛbɛboa wo. Wopɛ sɛ wotwa mu ampa?',
      skipConfirmAction: 'Twa mu nanso',
      skipConfirmCancel: 'San kɔ akyi',
      privacyTitle: 'Wo kokoamsɛm ho hia yɛn',
      privacyPoints: [
        'W’asɛm yɛ dwoodwoo na ɛwɔ banbɔ',
        'Nkɔmmɔbɔ no yɛ kokoamsɛm',
        'Wona wuhwɛ nea wopɛ sɛ wosɛɛ',
        'Bere biara wotumi popa wo akawnt',
        'Yɛmfa w’asɛm mma obiara gye sɛ woma yɛn kwan'
      ],
      summaryTitle: 'Wo Dwumadi ho Ntsetsee',
    },
    dashboard: {
      weeklyPulse: 'Weekly Pulse (Twi)',
      emotionalRhythm: 'Emotional Rhythm (Twi)',
      viewJourney: 'View Journey (Twi)',
      moodSeed: 'Mood Seed (Twi)',
      reflect: 'Reflect (Twi)',
      breathe: 'Breathe (Twi)',
      dailyRituals: 'Daily Rituals (Twi)',
      plantSeed: 'Plant a Seed (Twi)',
      checkInMood: 'Check in with your mood (Twi)',
      dailyReflection: 'Daily Reflection (Twi)',
      writeJournalEntry: 'Write a journal entry (Twi)',
      completeBreathing: 'Complete a breathing exercise (Twi)',
      latestReflection: 'Latest Reflection (Twi)',
      viewAll: 'View All (Twi)',
      oracleInsights: 'Oracle Insights (Twi)',
      chatNow: 'Chat Now (Twi)',
      recentConversation: 'Recent Conversation (Twi)',
      latestGuidance: 'Latest Guidance (Twi)',
      moodGarden: 'Mood Garden (Twi)',
      seeds: 'seeds (Twi)',
      activity: 'Activity (Twi)',
      todaysSteps: 'Today\'s Steps (Twi)',
      steps: 'steps (Twi)',
      assessments: 'Assessments (Twi)',
      ready: 'Ready (Twi)',
      done: 'done (Twi)',
      resources: 'Resources (Twi)',
      discoveryHub: 'Discovery Hub (Twi)',
      crisisSupport: 'Crisis Support (Twi)',
      "247Help": '24/7 Help (Twi)',
      tools: 'Tools (Twi)',
      therapeutic: 'Guided Support (Twi)',
      journal: 'Journal (Twi)',
      reflections: 'Reflections (Twi)',
      community: 'Community (Twi)',
      connect: 'Connect (Twi)',
      recommendedForYou: 'Recommended for You (Twi)',
      basedOnReflections: 'Based on your reflections (Twi)',
      greetingMorning: 'Maakye',
      greetingAfternoon: 'Maaha',
      greetingEvening: 'Maadwo',
      nurtureTitle: 'Daa Nkɔsoɔ',
      clarityTitle: 'Adwene Mu Paa',
      toolsTitle: 'Nnwuma Titiriw',
      supportTitle: 'Mmoa ne Mpuntuo',
      motivations: [
        { text: "Nea apɔwmuden adwene hia ne kanea, nokoredi, ne nkɔmmɔbɔ a aniwu nnim.", author: "Glenn Close" },
        { text: "Anidasoɔ wɔ hɔ, sɛ w’adwene kyerɛ wo sɛ enni hɔ mpo a.", author: "John Green" },
        { text: "Saa yadeɛ gye bere, na sɛ wobisa mmoa a, ɛyɛ akokoɔduo.", author: "Mariska Hargitay" },
        { text: "Wo ho a wode bɛhwɛ yɛ ɔkwan a wode bɛgye wo tumi san.", author: "Lalah Delia" },
      ],
      startWithIntention: 'Fi ase ne botae',
      checkInWithYourself: 'Hwɛ wo ho so',
      windDownAndReflect: 'Gye wo bere na dwen ho',
      howWasYourDay: 'Sɛnea wo da no kɔɔ yɛ nie?',
      nurturePeaceToday: 'Hwɛ wo asomdwoe so nnɛ',
      yourJourney: 'Wo Kwantu',
      startJourneyToday: 'Fi wo kwantu ase nnɛ',
      dayStreak: 'Nna Streak!',
      dailyQuests: 'Daa Quests',
      completeAllQuests: 'Wie ne nyinaa na sie wo streak!',
      wellnessHub: 'Wellness Hub',
      wellnessToolkit: 'Wellness Toolkit',
    },
    tracker: {
      title: 'Tuo Garden',
      subtitle: 'Hwɛ wo asomdwoe so',
      checkInQuestion: 'Tebea bɛn na wowɔ mu seesei?',
      supportNudge: "Ɛyɛ me ya sɛ wote nka saa. Wopɛ sɛ wosɔ mframa gye bi hwɛ?",
      successTitle: 'Aba no adua!',
      successSubtitle: "Wo turo no ayɛ fɛ paa seesei. Fa saa asomdwoe yi kura wo wɔ wo da no nyinaa mu.",
      energyLevel: "Wo ho yɛ den sɛn?",
      sleepQuality: "Woada yiye?",
      socialInteraction: "Hwan na wo ne no wɔ hɔ?",
      physicalSymptoms: "Wo honam mu yɛ wo den?",
      audioNote: "Nne nkaebɔ",
      submitBtn: "Ma m'asomdwoe nnɔ"
    },
    ai: {
      title: 'MindBridge Oracle',
      subtitle: 'Wo banbɔbea',
      placeholder: 'Twerɛ wo asɛm...',
      goToSupport: 'Nya Mmoa Seesei',
      disclaimer: "Mewɔ ha sɛ metie wo na maboa wo, nanso menyɛ ayaresabea dɔkta. Sɛ wowɔ asiane mu a, yɛsrɛ wo fa Mmoa akwan no so.",
      greetingStandard: "Maakye! Me ne MindBridge Oracle. Mewɔ ha sɛ metie wo, maboa wo, na mama woahu sɛnea wobɛyɛ wo nkaebɔ ho adwuma. Tebea bɛn na wowɔ mu nnɛ?",
      greetingHeavy: "Hey {name}. Mehuu sɛ wo nkaebɔ a ɛtwa toɔ no yɛ duru, wote nka sɛ {emotions}. Akokoɔduo na ɛhia sɛ wobɛbɔ din. Dɛn na ɛreyɛ wo duru paa?",
      greetingGlowing: "Maakye {name}! Wo aba a ɛtwa toɔ no na ɛrehyerɛn ne {emotions} Dɛn na ɛde saa ahoɔden pa yi aba?",
      greetingRecent: "Maakye {name}. Mehuu sɛ wo nkaebɔ a ɛtwa toɔ no kyerɛ {emotions}. Wowɔ tebea bɛn mu paa nnɛ?",
      greetingWelcome: "Akwaaba, {name}. Me ne MindBridge Oracle, wo ankasa wo kwankyerɛfo. Dɛn na ɛwɔ w’adwene mu nnɛ?",
    },
    settings: {
      account_privacy: 'Akawnt ne Kokoamsɛm',
      personal_info: 'Wo Ho Asɛm',
      security_password: 'Banbɔ ne Paasowa',
      passcode_unlock: 'Kɔde',
      notifications: 'Nkaebɔ',
      quest_reminders: 'Daa Nkaebɔ',
      language: 'Kasa',
      support_legal: 'Mmoa ne Mmara',
      help_center: 'Mmoa Bea',
      feedback: 'Kyerɛ W’adwene',
      about: 'MindBridge Ho Asɛm',
      log_out: 'Pue',
      select_language: 'Paw Kasa',
      language_desc: 'Paw kasa a wopɛ sɛ wode di dwuma wɔ MindBridge.',
    },
    profile: {
      title: 'Wo Bea',
      subtitle: 'Sukuufoɔ Apɔwmuden Profile',
      edit_profile: 'Siesie wo Profile',
      university: 'Suapɔn',
      joined: 'Wode wo ho bɔɔ yɛn',
      stats_reflections: 'Nkaebɔ',
      stats_streak: 'Nna Streak',
      stats_points: 'Apɔwmuden XP',
      stats_seeds: 'Mood Aba',
      stats_badges: 'Mpuntuo',
      stats_level: 'Zen Tebea',
      mood_insights: 'Nkaebɔ Mu Nhwehwɛmu',
      identity_personal: 'Wo Ho Asɛm Titiriw',
      academic_info: 'Sukuu Ho Asɛm',
      emergency_contact: 'Mmoa a ɛhiahia',
      crisis_support: 'Ahoyera Mmoa',
      my_garden: 'Me Tuo',
      settings: 'Settings',
      log_out: 'Pue',
    },
    journal: {
      title: 'Adwene Mu Paa',
      subtitle: 'Wo banbɔbea a ɛwɔ kokoamsɛm',
      new_entry: 'Nkaebɔ Foforo',
      write_reflection: 'Twerɛ nkaebɔ',
      title_placeholder: 'Fa din...',
      content_placeholder: 'Dɛn na ɛwɔ w’adwene mu?',
      save_entry: 'Sie Nkaebɔ',
      delete_entry: 'Popa Nkaebɔ',
      no_entries: 'Nkaebɔ nni hɔ. Dɛn na ɛsɛ sɛ wode firi aseɛ?',
      recording: 'Eretwerɛ...',
      voice_note: 'Nne Nkaebɔ',
    },
    crisis: {
      title: 'Ahoyera Mmoa',
      subtitle: 'Wonyɛ wo nko. Hwehwɛ mmoa seesei.',
      immediate_help: 'Mmoa a ɛhiahia seesei',
      emergency_contact: 'Mmoa a ɛhiahia',
      national_emergency: 'Ɔman Mmoa',
      university_counseling: 'Suapɔn Mmoa',
      mental_health_helpline: 'Apɔwmuden Mmoa',
      safety_plan: 'Me Banbɔ Nhyehyɛe',
      safety_steps: 'Akwan a wobɛfa so abɔ wo ho ban seesei',
      find_hospital: 'Hunu Ayaresabea a ɛbɛn wo',
      find_hospital_desc: 'Hunu baabi a wobɛnya mmoa seesei.',
      edit: 'Siesie',
    },
    resources: {
      title: 'Hunu Ahofama',
      subtitle: 'Apɔwmuden mmoa a yɛasiesie mmaa wo',
      for_you: 'W’ankasa Deɛ',
      explore_all: 'Hunu Ne Nyinaa',
      coping_tools: 'Nnwuma a ɛboa',
      all: 'Ne Nyinaa',
      audio: 'Nne',
      techniques: 'Akwan',
      articles: 'Nkrataa',
      videos: 'Videos',
      books: 'Nwoma',
    },
    community: {
      title: 'Bea a Ɛhɔ Yɛ Kronkron',
      subtitle: 'Wo ne wo mfɛfoɔ nni nkitaho wɔ kokoamsɛm mu',
      explore_groups: 'Hunu Akuo',
      members: 'asɔrefoɔ',
      anonymous_feed: 'Mfɛfoɔ Nnwuma',
      send_hug: 'Atuu',
      comment: 'Kyerɛ wo nsusuwii',
      just_now: 'Seesei ara',
      hours_ago: 'h a atwam',
      days_ago: 'd a atwam',
      share_thought: 'Kyerɛ biribi...',
    },
    assessments: {
      title: 'Nhwehwɛmu',
      subtitle: 'Abɔdeɛ mu nyansahu nhwehwɛmu a yɛagye atom',
      available_tests: 'Nhwehwɛmu a ɛwɔ hɔ',
      recent_results: 'Nhwehwɛmu a atwam',
      depression_screening: 'Adwene mu Yadeɛ Nhwehwɛmu',
      anxiety_screening: 'Ahoyera Nhwehwɛmu',
      burnout_test: 'Sukuufoɔ Brɛ Nhwehwɛmu',
      pss_screening: 'Perceived Stress Scale',
      cssrs_screening: 'Risk Screener',
      brs_screening: 'Brief Resilience Scale',
      start: 'Fi aseɛ',
      minutes: 'miniti',
    },
    tools: {
      title: 'Hunu Ne Nyinaa',
      subtitle: 'MindBridge nnwuma nyinaa wɔ bea baako',
      daily_growth: 'Nnaseɛ Nnyigyeɛ',
      knowledge_checks: 'Nunyanya & Nhwehwɛmu',
      support_connection: 'Mmoa & Nkitaho',
      app_preferences: 'App Nhyehyɛe',
    },
  },
  French: {

    journey: {
      title: 'My Journey',
      subtitle: 'Today',
      streak: 'Streak',
      points: 'Points',
      done: 'Done',
      progress_label: 'Completed',
      daily_plan: 'Daily Plan',
    },
    common: {
      takeYourTime: 'Prenez votre temps',
      loadingSafeSpace: 'Création de votre espace sécurisé...',
      back: 'Retour',
      next: 'Suivant',
      skip: 'Passer',
      confirm: 'Confirmer',
      cancel: 'Annuler',
    },
    tabs: {
      today: 'Aujourd\'hui',
      explore: 'Explorer',
      tracker: 'Suivi',
      oracle: 'Oracle',
      profile: 'Profil',
      settings: 'Paramètres',
    },
    onboarding: {
      skipConfirm: 'Ces informations nous aident à personnaliser votre soutien. Êtes-vous sûr de vouloir passer ?',
      skipConfirmAction: 'Passer quand même',
      skipConfirmCancel: 'Retourner',
      privacyTitle: 'Votre vie privée compte',
      privacyPoints: [
        'Vos données sont cryptées et sécurisées',
        'Les conversations sont confidentielles',
        'Vous contrôlez ce que vous partagez',
        'Supprimez votre compte à tout moment',
        'Aucune donnée partagée sans permission'
      ],
      summaryTitle: 'Votre résumé de pleine conscience',
    },
    dashboard: {
      weeklyPulse: 'Weekly Pulse (French)',
      emotionalRhythm: 'Emotional Rhythm (French)',
      viewJourney: 'View Journey (French)',
      moodSeed: 'Mood Seed (French)',
      reflect: 'Reflect (French)',
      breathe: 'Breathe (French)',
      dailyRituals: 'Daily Rituals (French)',
      plantSeed: 'Plant a Seed (French)',
      checkInMood: 'Check in with your mood (French)',
      dailyReflection: 'Daily Reflection (French)',
      writeJournalEntry: 'Write a journal entry (French)',
      completeBreathing: 'Complete a breathing exercise (French)',
      latestReflection: 'Latest Reflection (French)',
      viewAll: 'View All (French)',
      oracleInsights: 'Oracle Insights (French)',
      chatNow: 'Chat Now (French)',
      recentConversation: 'Recent Conversation (French)',
      latestGuidance: 'Latest Guidance (French)',
      moodGarden: 'Mood Garden (French)',
      seeds: 'seeds (French)',
      activity: 'Activity (French)',
      todaysSteps: 'Today\'s Steps (French)',
      steps: 'steps (French)',
      assessments: 'Assessments (French)',
      ready: 'Ready (French)',
      done: 'done (French)',
      resources: 'Resources (French)',
      discoveryHub: 'Discovery Hub (French)',
      crisisSupport: 'Crisis Support (French)',
      "247Help": '24/7 Help (French)',
      tools: 'Tools (French)',
      therapeutic: 'Guided Support (French)',
      journal: 'Journal (French)',
      reflections: 'Reflections (French)',
      community: 'Community (French)',
      connect: 'Connect (French)',
      recommendedForYou: 'Recommended for You (French)',
      basedOnReflections: 'Based on your reflections (French)',
      greetingMorning: 'Bon matin',
      greetingAfternoon: 'Bon après-midi',
      greetingEvening: 'Bonsoir',
      nurtureTitle: 'Bien-être quotidien',
      clarityTitle: 'Moment de Clarté',
      toolsTitle: 'Outils de pleine conscience',
      supportTitle: 'Communauté et soutien',
      motivations: [
        { text: "Ce dont la santé mentale a besoin, c'est de plus de lumière, de plus de franchise et de conversations plus décomplexées.", author: "Glenn Close" },
        { text: "Il y a de l'espoir, même quand votre cerveau vous dit qu'il n'y en a pas.", author: "John Green" },
        { text: "La guérison prend du temps, et demander de l'aide est une étape courageuse.", author: "Mariska Hargitay" },
        { text: "Prendre soin de soi, c'est reprendre son pouvoir.", author: "Lalah Delia" },
      ],
      startWithIntention: 'Commencez avec intention',
      checkInWithYourself: 'Faites le point avec vous-même',
      windDownAndReflect: 'Détendez-vous et réfléchissez',
      howWasYourDay: 'Comment s\'est passée votre journée ?',
      nurturePeaceToday: 'Cultivez votre paix aujourd\'hui',
      yourJourney: 'Votre Voyage',
      startJourneyToday: 'Commencez votre voyage aujourd\'hui',
      dayStreak: 'Série de Jours !',
      dailyQuests: 'Quêtes Quotidiennes',
      completeAllQuests: 'Complétez tout pour garder votre série !',
      wellnessHub: 'Centre de Bien-être',
      wellnessToolkit: 'Boîte à Outils de Bien-être',
    },
    tracker: {
      title: "Jardin d'humeur",
      subtitle: 'Cultivez votre paix',
      checkInQuestion: 'Comment vous sentez-vous en ce moment?',
      supportNudge: "Je suis désolé que vous vous sentiez ainsi. Voudriez-vous essayer un exercice de respiration rapide ?",
      successTitle: 'Graine plantée !',
      successSubtitle: "Votre jardin est un peu plus vibrant maintenant. Emportez cette paix avec vous pour le reste de votre journée.",
      energyLevel: "Comment est votre énergie ?",
      sleepQuality: "Comment était votre sommeil ?",
      socialInteraction: "Avec qui étiez-vous ?",
      physicalSymptoms: "Des symptômes physiques ?",
      audioNote: "Réflexion vocale",
      submitBtn: "Nourrir ma paix"
    },
    ai: {
      title: 'Oracle MindBridge',
      subtitle: 'Votre espace sécurisé',
      placeholder: 'Tapez votre message...',
      goToSupport: 'Obtenir de l\'aide',
      disclaimer: "Je suis là pour écouter et soutenir, mais je ne remplace pas les soins cliniques. Si vous êtes en danger immédiat, veuillez utiliser l'onglet Support de crise.",
      greetingStandard: "Bonjour ! Je suis l'Oracle MindBridge. Je suis ici pour vous écouter, vous soutenir et vous aider à gérer vos émotions. Comment allez-vous aujourd'hui ?",
      greetingHeavy: "Hé {name}. J'ai remarqué que votre dernier enregistrement était lourd, vous vous sentiez {emotions}. Il faut du courage pour le dire. Qu'est-ce qui vous pèse le plus ?",
      greetingGlowing: "Bonjour {name} ! Votre dernière graine brillait de {emotions} Qu'est-ce qui a contribué à cette bonne énergie ?",
      greetingRecent: "Salut {name}. Je vois que votre humeur récente reflétait {emotions}. Comment allez-vous vraiment aujourd'hui ?",
      greetingWelcome: "Bienvenue, {name}. Je suis l'Oracle MindBridge, votre guide personnel. Qu'avez-vous à l'esprit aujourd'hui ?",
    },
    settings: {
      account_privacy: 'Compte et confidentialité',
      personal_info: 'Informations personnelles',
      security_password: 'Sécurité et mot de passe',
      passcode_unlock: 'Déverrouillage par code',
      notifications: 'Notifications',
      quest_reminders: 'Rappels quotidiens',
      language: 'Langue',
      support_legal: 'Support et juridique',
      help_center: 'Centre d\'aide',
      feedback: 'Envoyer des commentaires',
      about: 'À propos de MindBridge',
      log_out: 'Déconnexion',
      select_language: 'Choisir la langue',
      language_desc: 'Choisissez votre langue préférée pour l\'expérience MindBridge.',
    },
    profile: {
      title: 'Votre Espace',
      subtitle: 'Profil de bien-être étudiant',
      edit_profile: 'Modifier le profil',
      university: 'Université',
      joined: 'Rejoint',
      stats_reflections: 'Réflexions',
      stats_streak: 'Série de jours',
      stats_points: 'XP Bien-être',
      stats_seeds: 'Graines d\'humeur',
      stats_badges: 'Réalisations',
      stats_level: 'Niveau Zen',
      mood_insights: 'Aperçus de l\'humeur',
      identity_personal: 'Identité et personnel',
      academic_info: 'Infos académiques',
      emergency_contact: 'Contact d\'urgence',
      crisis_support: 'Soutien en cas de crise',
      my_garden: 'Mon jardin',
      settings: 'Paramètres',
      log_out: 'Déconnexion',
    },
    journal: {
      title: 'Moments de clarté',
      subtitle: 'Votre espace sécurisé privé pour la réflexion',
      new_entry: 'Nouvelle entrée',
      write_reflection: 'Écrire une réflexion',
      title_placeholder: 'Donnez-lui un titre...',
      content_placeholder: 'Qu\'avez-vous à l\'esprit ?',
      save_entry: 'Enregistrer la réflexion',
      delete_entry: 'Supprimer l\'entrée',
      no_entries: 'Pas encore de réflexions. Commencez par planter une pensée.',
      recording: 'Enregistrement...',
      voice_note: 'Réflexion vocale',
    },
    crisis: {
      title: 'Soutien en cas de crise',
      subtitle: 'Vous n\'êtes pas seul. Demandez de l\'aide immédiate.',
      immediate_help: 'Aide immédiate',
      emergency_contact: 'Contact d\'urgence',
      national_emergency: 'Urgence nationale',
      university_counseling: 'Conseil universitaire',
      mental_health_helpline: 'Ligne d\'assistance en santé mentale',
      safety_plan: 'Mon plan de sécurité',
      safety_steps: 'Étapes pour rester en sécurité maintenant',
      find_hospital: 'Trouver l\'hôpital le plus proche',
      find_hospital_desc: 'Localisez une salle d\'urgence près de chez vous.',
      edit: 'Modifier',
    },
    resources: {
      title: 'Centre de découverte',
      subtitle: 'Ressources de bien-être curatées pour vous',
      for_you: 'Pour vous',
      explore_all: 'Tout explorer',
      coping_tools: 'Outils basés sur des preuves',
      all: 'Tout',
      audio: 'Audio',
      techniques: 'Techniques',
      articles: 'Articles',
      videos: 'Vidéos',
      books: 'Livres',
    },
    community: {
      title: 'Espace sécurisé',
      subtitle: 'Connectez-vous anonymement avec votre communauté de pairs',
      explore_groups: 'Explorer les groupes',
      members: 'membres',
      anonymous_feed: 'Activité des pairs',
      send_hug: 'Envoyer un câlin',
      comment: 'Commentaire',
      just_now: 'À l\'instant',
      hours_ago: 'h ago',
      days_ago: 'd ago',
      share_thought: 'Partager une pensée...',
    },
    assessments: {
      title: 'Évaluations',
      subtitle: 'Dépistages cliniques validés scientifiquement',
      available_tests: 'Dépistages disponibles',
      recent_results: 'Historique récent',
      depression_screening: 'Dépistage de la dépression',
      anxiety_screening: 'Dépistage de l\'anxiété',
      burnout_test: 'Test d\'épuisement étudiant',
      pss_screening: 'Perceived Stress Scale',
      cssrs_screening: 'Risk Screener',
      brs_screening: 'Brief Resilience Scale',
      start: 'Démarrer',
      minutes: 'min',
    },
    tools: {
      title: 'Explorer',
      subtitle: 'Tous vos outils MindBridge en un seul endroit',
      daily_growth: 'Croissance quotidienne',
      knowledge_checks: 'Connaissance & vérifications',
      support_connection: 'Soutien & connexion',
      app_preferences: 'Préférences de l\'application',
    },
  },
  Ga: {

    journey: {
      title: 'My Journey',
      subtitle: 'Today',
      streak: 'Streak',
      points: 'Points',
      done: 'Done',
      progress_label: 'Completed',
      daily_plan: 'Daily Plan',
    },
    common: {
      takeYourTime: 'Heo be',
      loadingSafeSpace: 'Wofee ohewulaa he lɛ...',
      back: 'Sɛɛ',
      next: 'Hiɛ',
      skip: 'Fã',
      confirm: 'Ma nɔ mi',
      cancel: 'Twa',
    },
    tabs: {
      today: 'Nnɛ',
      explore: 'Explore',
      tracker: 'Abɔɔ',
      oracle: 'Oracle',
      profile: 'Profile',
      settings: 'Settings',
    },
    onboarding: {
      skipConfirm: 'Nitsumɔi nɛ bɛye bɛbua wɔ ni wɔtsɔɔ bo gbɛ ni sa. Omiishɛɛ ni ofã?',
      skipConfirmAction: 'Fã kɛ̃',
      skipConfirmCancel: 'Sɛɛ',
      privacyTitle: 'Ohewulaa he lɛ he hiaa wɔ',
      privacyPoints: [
        'Onyɛmɔi bɛ dwoodwoo kɛ banbɔ',
        'Sanebɛi lɛ ji kokoamsɛm',
        'Bo okwɛɔ nɔ ni ooshɛɛ',
        'Kpa o-account be fɛɛ be',
        'Wɔmbalamɛ obiara ni wɔheee gbɛ'
      ],
      summaryTitle: 'O-jwɛŋmɔ he mlitsɔɔmɔ',
    },
    dashboard: {
      weeklyPulse: 'Weekly Pulse (Ga)',
      emotionalRhythm: 'Emotional Rhythm (Ga)',
      viewJourney: 'View Journey (Ga)',
      moodSeed: 'Mood Seed (Ga)',
      reflect: 'Reflect (Ga)',
      breathe: 'Breathe (Ga)',
      dailyRituals: 'Daily Rituals (Ga)',
      plantSeed: 'Plant a Seed (Ga)',
      checkInMood: 'Check in with your mood (Ga)',
      dailyReflection: 'Daily Reflection (Ga)',
      writeJournalEntry: 'Write a journal entry (Ga)',
      completeBreathing: 'Complete a breathing exercise (Ga)',
      latestReflection: 'Latest Reflection (Ga)',
      viewAll: 'View All (Ga)',
      oracleInsights: 'Oracle Insights (Ga)',
      chatNow: 'Chat Now (Ga)',
      recentConversation: 'Recent Conversation (Ga)',
      latestGuidance: 'Latest Guidance (Ga)',
      moodGarden: 'Mood Garden (Ga)',
      seeds: 'seeds (Ga)',
      activity: 'Activity (Ga)',
      todaysSteps: 'Today\'s Steps (Ga)',
      steps: 'steps (Ga)',
      assessments: 'Assessments (Ga)',
      ready: 'Ready (Ga)',
      done: 'done (Ga)',
      resources: 'Resources (Ga)',
      discoveryHub: 'Discovery Hub (Ga)',
      crisisSupport: 'Crisis Support (Ga)',
      "247Help": '24/7 Help (Ga)',
      tools: 'Tools (Ga)',
      therapeutic: 'Guided Support (Ga)',
      journal: 'Journal (Ga)',
      reflections: 'Reflections (Ga)',
      community: 'Community (Ga)',
      connect: 'Connect (Ga)',
      recommendedForYou: 'Recommended for You (Ga)',
      basedOnReflections: 'Based on your reflections (Ga)',
      greetingMorning: 'Leebi kpakpa',
      greetingAfternoon: 'Shwane kpakpa',
      greetingEvening: 'Gbɛkɛ kpakpa',
      nurtureTitle: 'Daa Minaa',
      clarityTitle: 'Jwɛŋmɔ mli kpaa',
      toolsTitle: 'Nitsumɔi titiri',
      supportTitle: 'Webii kɛ yelikɛbuamɔ',
      motivations: [
        { text: "Nɔ ni jwɛŋmɔ mli apɔwmuden hiaa ji kanea, anɔkwale, kɛ sanebɛi ni aniwu bɛ mli.", author: "Glenn Close" },
        { text: "Hiɛnɔkamɔ yɛ, kɛji ojwɛŋmɔ kɛɛ bo akɛ ebɛ mpo.", author: "John Green" },
        { text: "Tsamɔ he be, ni kɛji obi yelikɛbuamɔ lɛ, ekãa nitsumɔ ni.", author: "Mariska Hargitay" },
        { text: "Ohe ni obɛkwɛ lɛ ji gbɛ ni obɛfa ni o-hewalɛ lɛ baku sɛɛ kba o-dɛŋ.", author: "Lalah Delia" },
      ],
      startWithIntention: 'Je kpo kɛ yiŋtoo',
      checkInWithYourself: 'Kwɛmɔ ohe',
      windDownAndReflect: 'Hejɔɔ ohe ni osusu he',
      howWasYourDay: 'Te ogbɛkɛ lɛ ji tɛŋŋ?',
      nurturePeaceToday: 'Kwɛmɔ ohejɔlɛ lɛ nɔ nnɛ',
      yourJourney: 'O-Kwantu',
      startJourneyToday: 'Je o-kwantu lɛ shishi nnɛ',
      dayStreak: 'Nna Streak!',
      dailyQuests: 'Daa Quests',
      completeAllQuests: 'Gbe fɛɛ naa ni osie o-streak!',
      wellnessHub: 'Wellness Hub',
      wellnessToolkit: 'Wellness Toolkit',
    },
    tracker: {
      title: 'Susuma Abɔɔ',
      subtitle: 'Kwɛmɔ ohejɔlɛ lɛ nɔ',
      checkInQuestion: 'Te onuɔ he tɛŋŋ bianɛ?',
      supportNudge: "Eshwerɛ mi akɛ onuɔ he nakai. Oosumɔ ni okee mu ko kwee?",
      successTitle: 'Dua lɛ edua!',
      successSubtitle: "Wò abɔ lolo vi aɖe fifia. Kpɔ fafa sia ɖe wò ŋukeke si susɔ la me.",
      energyLevel: "Aleke wò ŋusẽ le?",
      sleepQuality: "È dɔ alɔ̃ nyuiea?",
      socialInteraction: "Amekawo gbɔ nèle?",
      physicalSymptoms: "Lãmesẽkuxi aɖewo le wò hã?",
      audioNote: "Gbeɖiɖi dzesi",
      submitBtn: "Na nye fafa natsi"
    },
    ai: {
      title: 'MindBridge Oracle',
      subtitle: 'Ohewulaa he',
      placeholder: 'Ŋmaa osane...',
      goToSupport: 'Yaa Hejɔlɛ He',
      disclaimer: "Miyɛ biɛ ni mabua bo, shi mifeee dɔkta. Kɛ́ ooshɛ oshãra mli lɛ, ofainɛ yaa Mmoa gbɛ lɛ nɔ.",
      greetingStandard: "Leebi! Mi ji MindBridge Oracle lɛ. Miyɛ biɛ ni mabua bo ni maduru ojwɛŋmɔ mli. Te onuɔ he tɛŋŋ nnɛ?",
      greetingHeavy: "Hé {name}. Mina akɛ o-nitsumɔ ni ofee nyɛ lɛ wa, onuɔ he akɛ {emotions}. Ehe hiaa ekãa akɛ obɛtsɛ́ gbɛ́i. Mɛni haa onuɔ he tɛŋŋ?",
      greetingGlowing: "Leebi {name}! O-dua ni ofee nyɛ lɛ miitsɛ̀ kɛ {emotions} Mɛni ha onuɔ he akɛ o-he wa nakai?",
      greetingRecent: "Hé {name}. Mina akɛ o-jwɛŋmɔ mli lɛ etsɔɔ {emotions}. Te onuɔ he tɛŋŋ paa nnɛ?",
      greetingWelcome: "Akwaaba, {name}. Mi ji MindBridge Oracle lɛ, o-gbɛtsɔɔlɔ paa. Mɛni yɔɔ o-jwɛŋmɔ mli nnɛ?",
    },
    settings: {
      account_privacy: 'Account kɛ Kokoamsɛm',
      personal_info: 'O-he Sane',
      security_password: 'Banbɔ kɛ Paasowa',
      passcode_unlock: 'Kɔde',
      notifications: 'Nkaebɔ',
      quest_reminders: 'Daa Nkaebɔ',
      language: 'Kasa',
      support_legal: 'Mmoa kɛ Mla',
      help_center: 'Mmoa Bea',
      feedback: 'Tsɔɔ O-jwɛŋmɔ',
      about: 'MindBridge He Sane',
      log_out: 'Pue',
      select_language: 'Hala Kasa',
      language_desc: 'Hala kasa ni oosumɔ ni okɛtsu nii yɛ MindBridge.',
    },
    profile: {
      title: 'O-hea',
      subtitle: 'Sukuu bii a-wellness Profile',
      edit_profile: 'Siesie o-profile',
      university: 'Suapɔn',
      joined: 'Obote mli',
      stats_reflections: 'Nkaebɔ',
      stats_streak: 'Nna Streak',
      stats_points: 'Wellness XP',
      stats_seeds: 'Mood Aba',
      stats_badges: 'Achievements',
      stats_level: 'Zen Tebea',
      mood_insights: 'Mood Insights',
      identity_personal: 'Identity & Personal',
      academic_info: 'Academic Info',
      emergency_contact: 'Mmoa ni hiahia',
      crisis_support: 'Ahoyera Mmoa',
      my_garden: 'Mi Abɔɔ',
      settings: 'Settings',
      log_out: 'Pue',
    },
    journal: {
      title: 'Jwɛŋmɔ mli kpaa',
      subtitle: 'Ohewulaa he ni yɔɔ kokoamsɛm',
      new_entry: 'Nkaebɔ Heee',
      write_reflection: 'Ŋmaa nkaebɔ',
      title_placeholder: 'Wo din...',
      content_placeholder: 'Mɛni yɔɔ o-jwɛŋmɔ mli?',
      save_entry: 'Sie Nkaebɔ',
      delete_entry: 'Popa Nkaebɔ',
      no_entries: 'Nkaebɔ ko bɛ. Mɛni okɛjeɔ kpo?',
      recording: 'Ereŋmaa...',
      voice_note: 'Nne Nkaebɔ',
    },
    crisis: {
      title: 'Ahoyera Mmoa',
      subtitle: 'O-nko bɛ. Hla mmoa bianɛ.',
      immediate_help: 'Mmoa ni hiahia bianɛ',
      emergency_contact: 'Mmoa ni hiahia',
      national_emergency: 'Ɔman Mmoa',
      university_counseling: 'Suapɔn Mmoa',
      mental_health_helpline: 'Apɔwmuden Mmoa',
      safety_plan: 'Mi Banbɔ Nhyehyɛe',
      safety_steps: 'Gbɛi ni obɛfa ni obaye o-he bua',
      find_hospital: 'Hla Ayaresabea ni bɛn bo',
      find_hospital_desc: 'Hla baabi ni obɛnya mmoa bianɛ.',
      edit: 'Siesie',
    },
    resources: {
      title: 'Discovery Hub',
      subtitle: 'Wellness mmoa ni hla mha bo',
      for_you: 'O-deɛ',
      explore_all: 'Naa fɛɛ',
      coping_tools: 'Nitsumɔi ni yeɔ bua',
      all: 'Fɛɛ',
      audio: 'Nne',
      techniques: 'Gbɛi',
      articles: 'Woji',
      videos: 'Videos',
      books: 'Woji',
    },
    community: {
      title: 'Safe Space',
      subtitle: 'Okɛ o-mfɛfoɔ abote mli yɛ kokoamsɛm mu',
      explore_groups: 'Hla Akuo',
      members: 'asɔrefoɔ',
      anonymous_feed: 'Peer Activity',
      send_hug: 'Atuu',
      comment: 'Comment',
      just_now: 'Bianɛ ara',
      hours_ago: 'h ni eho',
      days_ago: 'd ni eho',
      share_thought: 'Kyerɛ nɔ ko...',
    },
    assessments: {
      title: 'Nhwehwɛmu',
      subtitle: 'Nhwehwɛmu ni yeɔ bua yɛ kokoamsɛm mu',
      available_tests: 'Nhwehwɛmu ni yɔɔ',
      recent_results: 'Nhwehwɛmu ni eho',
      depression_screening: 'Jwɛŋmɔ mli hela Nhwehwɛmu',
      anxiety_screening: 'Ahoyera Nhwehwɛmu',
      burnout_test: 'Sukuu bii a-tɔlɛ Nhwehwɛmu',
      pss_screening: 'Perceived Stress Scale',
      cssrs_screening: 'Risk Screener',
      brs_screening: 'Brief Resilience Scale',
      start: 'Je kpo',
      minutes: 'miniti',
    },
    tools: {
      title: 'Hla Ne Nyinaa',
      subtitle: 'MindBridge nitsumɔi nyinaa yɛ baanyɔ fɛɛ',
      daily_growth: 'Nna Streak',
      knowledge_checks: 'Nunyanya & Nhwehwɛmu',
      support_connection: 'Mmoa & Nkitaho',
      app_preferences: 'App Nhyehyɛe',
    },
  },
  Ewe: {

    journey: {
      title: 'My Journey',
      subtitle: 'Today',
      streak: 'Streak',
      points: 'Points',
      done: 'Done',
      progress_label: 'Completed',
      daily_plan: 'Daily Plan',
    },
    common: {
      takeYourTime: 'Gbɔ ɖe eme',
      loadingSafeSpace: 'Wole wò teƒe nyuie la wɔm...',
      back: 'Megbe',
      next: 'Ŋgɔ',
      skip: 'Tutu',
      confirm: 'Ðo kpe edzi',
      cancel: 'Tso eme',
    },
    tabs: {
      today: 'Egbe',
      explore: 'Explore',
      tracker: 'Abɔ',
      oracle: 'Oracle',
      profile: 'Profile',
      settings: 'Settings',
    },
    onboarding: {
      skipConfirm: 'Nyakpui siawo akpe ɖe mía ŋu be míawɔ nu siwo asɔ na wò. Èka ɖe edzi be èdi be yeatutui?',
      skipConfirmAction: 'Tutui kokoo',
      skipConfirmCancel: 'Megbe',
      privacyTitle: 'Wò gbeɖasiwo ho hia',
      privacyPoints: [
        'Wò nyawo le dzadzɛ ƒe banbɔ me',
        'Dzeɖoɖoawo nye ɣlaɣla nyawo',
        'Wòe nye nu siwo nàma ƒe dziɖula',
        'Nàte ŋu atsɔ wò akawnt ko ɣesiaɣi',
        'Míemana nya aɖeke obiara o negbe ɖe nèma mɔ mí'
      ],
      summaryTitle: 'Wò Nunyanya ƒe Nuvidi',
    },
    dashboard: {
      weeklyPulse: 'Weekly Pulse (Ewe)',
      emotionalRhythm: 'Emotional Rhythm (Ewe)',
      viewJourney: 'View Journey (Ewe)',
      moodSeed: 'Mood Seed (Ewe)',
      reflect: 'Reflect (Ewe)',
      breathe: 'Breathe (Ewe)',
      dailyRituals: 'Daily Rituals (Ewe)',
      plantSeed: 'Plant a Seed (Ewe)',
      checkInMood: 'Check in with your mood (Ewe)',
      dailyReflection: 'Daily Reflection (Ewe)',
      writeJournalEntry: 'Write a journal entry (Ewe)',
      completeBreathing: 'Complete a breathing exercise (Ewe)',
      latestReflection: 'Latest Reflection (Ewe)',
      viewAll: 'View All (Ewe)',
      oracleInsights: 'Oracle Insights (Ewe)',
      chatNow: 'Chat Now (Ewe)',
      recentConversation: 'Recent Conversation (Ewe)',
      latestGuidance: 'Latest Guidance (Ewe)',
      moodGarden: 'Mood Garden (Ewe)',
      seeds: 'seeds (Ewe)',
      activity: 'Activity (Ewe)',
      todaysSteps: 'Today\'s Steps (Ewe)',
      steps: 'steps (Ewe)',
      assessments: 'Assessments (Ewe)',
      ready: 'Ready (Ewe)',
      done: 'done (Ewe)',
      resources: 'Resources (Ewe)',
      discoveryHub: 'Discovery Hub (Ewe)',
      crisisSupport: 'Crisis Support (Ewe)',
      "247Help": '24/7 Help (Ewe)',
      tools: 'Tools (Ewe)',
      therapeutic: 'Guided Support (Ewe)',
      journal: 'Journal (Ewe)',
      reflections: 'Reflections (Ewe)',
      community: 'Community (Ewe)',
      connect: 'Connect (Ewe)',
      recommendedForYou: 'Recommended for You (Ewe)',
      basedOnReflections: 'Based on your reflections (Ewe)',
      greetingMorning: 'Ŋdi na wò',
      greetingAfternoon: 'Ŋdɔ na wò',
      greetingEvening: 'Fiẽ na wò',
      nurtureTitle: 'Ŋkekea ƒe Ŋgɔyiyi',
      clarityTitle: 'Kakaɖedzi ƒe ɣeyiɣi',
      toolsTitle: 'Nunyanya ƒe dɔwunuiwo',
      supportTitle: 'Habɔbɔ kple Kpedenanu',
      motivations: [
        { text: "Nu si jwɛŋmɔ me lãmesẽ hiaa nye kekeli, anukwareɖiɖi, kple dzeɖoɖo si me ŋukpe melé o.", author: "Glenn Close" },
        { text: "Mɔkpɔkpɔ li, ne wò jwɛŋmɔ gblɔ na wò be melé o hã.", author: "John Green" },
        { text: "Yɔyɔ exɔ ɣeyiɣi, eye kpekpedenu biabia nye dzinɔameƒe ƒe afɔɖeɖe.", author: "Mariska Hargitay" },
        { text: "Wò ɖokui kpɔkpɔ nye mɔ si nàzã atsɔ agbugbɔ wò ŋusẽ axɔ.", author: "Lalah Delia" },
      ],
      startWithIntention: 'Dze egɔme kple jwɛŋmɔ',
      checkInWithYourself: 'Kpɔ wò ɖokui gbɔ',
      windDownAndReflect: 'Gbɔ ɖe eme eye nàbu tamme',
      howWasYourDay: 'Aleke wò ŋkekea nɔ?',
      nurturePeaceToday: 'Kpɔ wò ŋutifafa ta egbe',
      yourJourney: 'Wò Mɔzɔzɔ',
      startJourneyToday: 'Dze wò mɔzɔzɔ gɔme egbe',
      dayStreak: 'Ŋkeke ƒe Streak!',
      dailyQuests: 'Gbesiagbe Quests',
      completeAllQuests: 'Wuwu wo fɛɛ enu be nàdzra wò streak ɖo!',
      wellnessHub: 'Wellness Hub',
      wellnessToolkit: 'Wellness Toolkit',
    },
    tracker: {
      title: 'Seselelãme ƒe Abɔ',
      subtitle: 'Kpɔ wo ŋutifafa ta',
      checkInQuestion: 'Aleke nèle sese me fifia?',
      supportNudge: "Eve m be nèle sese me nenema. Àdi be yeasɔ gbɔgbɔ ƒe dɔwɔnu aɖea?",
      successTitle: 'Ku la ƒe dodo!',
      successSubtitle: "Wò abɔ lolo vi aɖe fifia. Kpɔ fafa sia ɖe wò ŋukeke si susɔ la me.",
      energyLevel: "Aleke wò ŋusẽ le?",
      sleepQuality: "È dɔ alɔ̃ nyuiea?",
      socialInteraction: "Amekawo gbɔ nèle?",
      physicalSymptoms: "Lãmesẽkuxi aɖewo le wò hã?",
      audioNote: "Gbeɖiɖi dzesi",
      submitBtn: "Na nye fafa natsi"
    },
    ai: {
      title: 'MindBridge Oracle',
      subtitle: 'Wò teƒe nyuie',
      placeholder: 'Ŋlɔ wò gbedasi...',
      goToSupport: 'Kpɔ Kpedenanu Fifia',
      disclaimer: "Mele afii be mase wò nya agbɔ, gake nyemye dɔkta o. Ne èle nɔnɔme sesẽ me la, taflatse zã Kpedenanu mɔwo.",
      greetingStandard: "Ŋdi! Nyee nye MindBridge Oracle. Mele afii be mase wò nya agbɔ, mado alɔ wò eye makpe ɖe ŋuwò be nàkpɔ wò seselelãmewo gbɔ. Aleke nèle fifia?",
      greetingHeavy: "Hé {name}. Mekpɔe be wò seselelãme mamlɛa mefa o, nèle {emotions} sem. Ehiã dzinɔameƒe be nàgblɔe. Nu kae le fu ɖem na wò wu?",
      greetingGlowing: "Ŋdi {name}! Wò ku mamlɛa le dzo dam kple {emotions} Nu kae na nèle seselelãme nyui sia me?",
      greetingRecent: "Hé {name}. Mekpɔe be wò seselelãme mamlɛa fia {emotions}. Aleke nèle sese me vavã fifia?",
      greetingWelcome: "Woezor, {name}. Nyee nye MindBridge Oracle, wò mɔfiala. Nu kae le wò jwɛŋmɔ me fifia?",
    },
    settings: {
      account_privacy: 'Akawnt kple Ɣlaɣla nyawo',
      personal_info: 'Wò Ŋutinya',
      security_password: 'Banbɔ kple Paasowa',
      passcode_unlock: 'Kɔde',
      notifications: 'Gbeɖasiwo',
      quest_reminders: 'Ŋkekea ƒe Ŋkuɖodzinyawo',
      language: 'Gbegbɔgblɔ',
      support_legal: 'Kpedenanu kple Se',
      help_center: 'Kpekpedenu',
      feedback: 'Gblɔ wò nyanyawo',
      about: 'MindBridge Ŋutinya',
      log_out: 'Do go',
      select_language: 'Tia Gbegbɔgblɔ',
      language_desc: 'Tia gbegbɔgblɔ si nàdi be yeazã le MindBridge.',
    },
    profile: {
      title: 'Wò Teƒe',
      subtitle: 'Sukuu Bii ƒe Lãmesẽ Profile',
      edit_profile: 'Dzra Profile la ɖo',
      university: 'Suapɔn',
      joined: 'Èva kpe ɖe mía ŋu',
      stats_reflections: 'Ŋkuɖodzinyawo',
      stats_streak: 'Ŋkeke ƒe Streak',
      stats_points: 'Wellness XP',
      stats_seeds: 'Seselelãme Ku',
      stats_badges: 'Achievements',
      stats_level: 'Zen ƒe Nɔnɔme',
      mood_insights: 'Mood Insights',
      identity_personal: 'Identity & Personal',
      academic_info: 'Academic Info',
      emergency_contact: 'Kpedenanu si hiahia',
      crisis_support: 'Kpedenanu le nɔnɔme sesẽ me',
      my_garden: 'Nye Abɔ',
      settings: 'Settings',
      log_out: 'Do go',
    },
    journal: {
      title: 'Kakaɖedzi ƒe ɣeyiɣi',
      subtitle: 'Wò teƒe nyuie na wò ŋkuɖodzinyawo',
      new_entry: 'Ŋkuɖodzinya Yeye',
      write_reflection: 'Ŋlɔ ŋkuɖodzinya aɖe',
      title_placeholder: 'Tia tanya nɛ...',
      content_placeholder: 'Nu kae le wò jwɛŋmɔ me?',
      save_entry: 'Dzra Ŋkuɖodzinya la ɖo',
      delete_entry: 'Tutu Ŋkuɖodzinya la',
      no_entries: 'Mèŋlɔ ŋkuɖodzinya aɖeke o. Dze egɔme kple jwɛŋmɔ aɖe.',
      recording: 'Wole record wɔm...',
      voice_note: 'Nne ƒe Ŋkuɖodzinya',
    },
    crisis: {
      title: 'Kpedenanu le nɔnɔme sesẽ me',
      subtitle: 'Mele wò ŋutɔ o. Di kpedenanu fifia.',
      immediate_help: 'Kpedenanu si hiahia',
      emergency_contact: 'Kpedenanu si hiahia',
      national_emergency: 'Tɔnyɔnɔnɔ ƒe kpedenanu',
      university_counseling: 'Sukuu ƒe Mɔfiala',
      mental_health_helpline: 'Seselelãme ƒe Kpedenanu',
      safety_plan: 'Nye Banbɔ Ðoɖo',
      safety_steps: 'Mɔwo na ŋutifafa',
      find_hospital: 'Di Dɔnɔdzi aɖe',
      find_hospital_desc: 'Di dɔnɔdzi aɖe le wò gbɔ.',
      edit: 'Dzra ɖo',
    },
    resources: {
      title: 'Nunyanya ƒe Teƒe',
      subtitle: 'Lãmesẽ ƒe dɔwunuiwo na wò',
      for_you: 'Wò tɔ',
      explore_all: 'Di wo fɛɛ',
      coping_tools: 'Dɔwunui siwo kpena',
      all: 'Wo fɛɛ',
      audio: 'Nne',
      techniques: 'Mɔwo',
      articles: 'Nyakpuiwo',
      videos: 'Videonewo',
      books: 'Agbalẽwo',
    },
    community: {
      title: 'Teƒe Manyagbee',
      subtitle: 'Kpe ɖe wò mfɛfoɔwo ŋu le ɣeaɖuanyi me',
      explore_groups: 'Di Akuowo',
      members: 'asɔrefoɔ',
      anonymous_feed: 'Mfɛfoɔ ƒe dɔwunuiwo',
      send_hug: 'Atuu',
      comment: 'Ŋlɔ nya aɖe',
      just_now: 'Fifia ko',
      hours_ago: 'gaƒoƒo h si va yi',
      days_ago: 'ŋkeke d si va yi',
      share_thought: 'Gblɔ nya aɖe...',
    },
    assessments: {
      title: 'Dɔdɔkpɔwo',
      subtitle: 'Lãmesẽ dɔdɔkpɔ siwo ŋu kpe ɖe',
      available_tests: 'Dɔdɔkpɔ siwo li',
      recent_results: 'Dɔdɔkpɔ siwo va yi',
      depression_screening: 'Jwɛŋmɔ me hela dɔdɔkpɔ',
      anxiety_screening: 'Ahoyera dɔdɔkpɔ',
      burnout_test: 'Sukuu bii ƒe ɖeɖi dɔdɔkpɔ',
      pss_screening: 'Perceived Stress Scale',
      cssrs_screening: 'Risk Screener',
      brs_screening: 'Brief Resilience Scale',
      start: 'Dze egɔme',
      minutes: 'miniti',
    },
    tools: {
      title: 'Di Wo Fɛɛ',
      subtitle: 'MindBridge dɔwunuiwo fɛɛ le teƒe ɖeka',
      daily_growth: 'Nna Streak',
      knowledge_checks: 'Nunyanya & D dɔkpɔwo',
      support_connection: 'Kpedenanu & Kpekpeɖeŋu',
      app_preferences: 'App ƒe Ðoɖowo',
    },
  },
  Hausa: {

    journey: {
      title: 'My Journey',
      subtitle: 'Today',
      streak: 'Streak',
      points: 'Points',
      done: 'Done',
      progress_label: 'Completed',
      daily_plan: 'Daily Plan',
    },
    common: {
      takeYourTime: 'Dauki lokacinka',
      loadingSafeSpace: 'Kirkirar wurin amincin ku...',
      back: 'Baya',
      next: 'Gaba',
      skip: 'Tsallake',
      confirm: 'Tabbatar',
      cancel: 'Soke',
    },
    tabs: {
      today: 'Yau',
      explore: 'Explore',
      tracker: 'Lambu',
      oracle: 'Oracle',
      profile: 'Profile',
      settings: 'Saituna',
    },
    onboarding: {
      skipConfirm: 'Wannan bayanin yana taimaka mana mu keɓance goyan bayan ku. Kun tabbata kuna son tsallake?',
      skipConfirmAction: 'Tsallake Duk da haka',
      skipConfirmCancel: 'Koma Baya',
      privacyTitle: 'Sirrin ku yana da mahimmanci',
      privacyPoints: [
        'Bayanan ku na sirri ne kuma suna da tsaro',
        'Tattaunawa na sirri ne',
        'Kuna sarrafa abin da kuke rabawa',
        'Share asusunku kowane lokaci',
        'Babu raba bayanai ba tare da izini ba'
      ],
      summaryTitle: 'Takaitaccen Tunani',
    },
    dashboard: {
      weeklyPulse: 'Weekly Pulse (Hausa)',
      emotionalRhythm: 'Emotional Rhythm (Hausa)',
      viewJourney: 'View Journey (Hausa)',
      moodSeed: 'Mood Seed (Hausa)',
      reflect: 'Reflect (Hausa)',
      breathe: 'Breathe (Hausa)',
      dailyRituals: 'Daily Rituals (Hausa)',
      plantSeed: 'Plant a Seed (Hausa)',
      checkInMood: 'Check in with your mood (Hausa)',
      dailyReflection: 'Daily Reflection (Hausa)',
      writeJournalEntry: 'Write a journal entry (Hausa)',
      completeBreathing: 'Complete a breathing exercise (Hausa)',
      latestReflection: 'Latest Reflection (Hausa)',
      viewAll: 'View All (Hausa)',
      oracleInsights: 'Oracle Insights (Hausa)',
      chatNow: 'Chat Now (Hausa)',
      recentConversation: 'Recent Conversation (Hausa)',
      latestGuidance: 'Latest Guidance (Hausa)',
      moodGarden: 'Mood Garden (Hausa)',
      seeds: 'seeds (Hausa)',
      activity: 'Activity (Hausa)',
      todaysSteps: 'Today\'s Steps (Hausa)',
      steps: 'steps (Hausa)',
      assessments: 'Assessments (Hausa)',
      ready: 'Ready (Hausa)',
      done: 'done (Hausa)',
      resources: 'Resources (Hausa)',
      discoveryHub: 'Discovery Hub (Hausa)',
      crisisSupport: 'Crisis Support (Hausa)',
      "247Help": '24/7 Help (Hausa)',
      tools: 'Tools (Hausa)',
      therapeutic: 'Guided Support (Hausa)',
      journal: 'Journal (Hausa)',
      reflections: 'Reflections (Hausa)',
      community: 'Community (Hausa)',
      connect: 'Connect (Hausa)',
      recommendedForYou: 'Recommended for You (Hausa)',
      basedOnReflections: 'Based on your reflections (Hausa)',
      greetingMorning: 'Ina kwana',
      greetingAfternoon: 'Barka da rana',
      greetingEvening: 'Barka da yamma',
      nurtureTitle: 'Ci gaban yau',
      clarityTitle: 'Lokacin Haske',
      toolsTitle: 'Kayan Aiki',
      supportTitle: "Al'umma da Taimako",
      motivations: [
        { text: "Abin da lafiyar hankali ke buƙata shi ne ƙarin haske, ƙarin gaskiya, da ƙarin tattaunawa ba tare da jin kunya ba.", author: "Glenn Close" },
        { text: "Akwai fata, koda kwakwalwarka ta gaya maka babu.", author: "John Green" },
        { text: "Warkarwa tana ɗaukar lokaci, kuma neman taimako mataki ne na jajircewa.", author: "Mariska Hargitay" },
        { text: "Kula da kai shine yadda zaka dawo da ikonka.", author: "Lalah Delia" },
      ],
      startWithIntention: 'Fara da niyya',
      checkInWithYourself: 'Bincika kanka',
      windDownAndReflect: 'Huta ka yi tunani',
      howWasYourDay: 'Yaya ranarka ta kasance?',
      nurturePeaceToday: 'Kula da kwanciyar hankalin ku yau',
      yourJourney: 'Tafiyar ku',
      startJourneyToday: 'Fara tafiyar ku yau',
      dayStreak: 'Ranar Streak!',
      dailyQuests: 'Ayyukan Kullum',
      completeAllQuests: 'Kammala duka don kiyaye streak ɗin ku!',
      wellnessHub: 'Cibiyar Lafiya',
      wellnessToolkit: 'Kayan Aikin Lafiya',
    },
    tracker: {
      title: 'Lambun Zuciya',
      subtitle: 'Rafi na kwanciyar hankali',
      checkInQuestion: 'Yaya kake ji a yanzu?',
      supportNudge: "Yi haƙuri kuna jin haka. Za ku so ku gwada darasin numfashi?",
      successTitle: 'An dasa iri!',
      successSubtitle: "Lambun ku ya ɗan ƙara girma yanzu. Ka tafi da wannan kwanciyar hankali cikin sauran ranar ka.",
      energyLevel: "Yaya ƙarfin ka yake?",
      sleepQuality: "Yaya barcin ka ya kasance?",
      socialInteraction: "Da wa kake tare?",
      physicalSymptoms: "Akwai wata matsalar lafiya?",
      audioNote: "Muryar tunani",
      submitBtn: "Haɓaka kwanciyar hankali na"
    },
    ai: {
      title: 'MindBridge Oracle',
      subtitle: 'Wurin amincin ku',
      placeholder: 'Rubuta saƙonku...',
      goToSupport: 'Nemi Taimako Yanzu',
      disclaimer: "Ina nan don sauraro da taimako, amma ni ba likita ba ne. Idan kana cikin haɗari, don Allah yi amfani da sashen Taimakon Gaggawa.",
      greetingStandard: "Ina kwana! Ni ne MindBridge Oracle. Ina nan don in saurare ka, in taimaka maka, in kuma taimaka maka wajen tafiyar da yadda kake ji. Yaya kake yau?",
      greetingHeavy: "Sannu {name}. Na lura cewa bincikenka na ƙarshe ya yi nauyi, kana jin {emotions}. Yana bukatar jajircewa don bayyana hakan. Me ya fi damun ka?",
      greetingGlowing: "Sannu {name}! Irin ka na ƙarshe ya kasance mai haske da {emotions} Me ya taimaka wa wannan kyakkyawan kuzari?",
      greetingRecent: "Sannu {name}. Na ga cewa yanayin ka na baya-bayan nan ya nuna {emotions}. Yaya kake da gaske yau?",
      greetingWelcome: "Barka da zuwa, {name}. Ni ne MindBridge Oracle, jagoran ku. Me ke ranka yau?",
    },
    settings: {
      account_privacy: 'Asusu da Sirri',
      personal_info: 'Bayanin Kai',
      security_password: 'Tsaro da Kalmar Sirri',
      passcode_unlock: 'Kulle Lambar Sirri',
      notifications: 'Sanarwa',
      quest_reminders: 'Tunatarwa Kullum',
      language: 'Yare',
      support_legal: 'Taimako da Shari\'a',
      help_center: 'Cibiyar Taimako',
      feedback: 'Aiko da Sharhi',
      about: 'Game da MindBridge',
      log_out: 'Fita',
      select_language: 'Zaɓi Yare',
      language_desc: 'Zaɓi yaren da kuke so don MindBridge.',
    },
    profile: {
      title: 'Wurin ku',
      subtitle: 'Bayanan Lafiyar Dalibai',
      edit_profile: 'Shirya Bayanan Martaba',
      university: 'Jami\'a',
      joined: 'An Shiga',
      stats_reflections: 'Tunani',
      stats_streak: 'Ranar Streak',
      stats_points: 'Wellness XP',
      stats_seeds: 'Mood Iri',
      stats_badges: 'Achievements',
      stats_level: 'Zen Level',
      mood_insights: 'Mood Insights',
      identity_personal: 'Identity & Personal',
      academic_info: 'Academic Info',
      emergency_contact: 'Tuntuɓi na Gaggawa',
      crisis_support: 'Taimakon Gaggawa',
      my_garden: 'Lambuna',
      settings: 'Saituna',
      log_out: 'Fita',
    },
    journal: {
      title: 'Lokacin Haske',
      subtitle: 'Wurinku na sirri don tunani',
      new_entry: 'Sabuwar Shiga',
      write_reflection: 'Rubuta tunani',
      title_placeholder: 'Ba shi lakabi...',
      content_placeholder: 'Me ke ranka?',
      save_entry: 'Ajiye Tunani',
      delete_entry: 'Share Shigar',
      no_entries: 'Babu sauran tunani tukunna. Fara da dasa tunani.',
      recording: 'Riko...',
      voice_note: 'Tunanin murya',
    },
    crisis: {
      title: 'Taimakon Gaggawa',
      subtitle: 'Ba kai kadai ba ne. Nemi taimako nan take.',
      immediate_help: 'Taimakon Gaggawa',
      emergency_contact: 'Tuntuɓi na Gaggawa',
      national_emergency: 'Gaggawa na Kasa',
      university_counseling: 'Nasiha na Jami\'a',
      mental_health_helpline: 'Layin Taimakon Lafiyar Zuciya',
      safety_plan: 'Tsarin Tsaro na',
      safety_steps: 'Matakan tsira a yanzu',
      find_hospital: 'Nemo Asibiti Mafi Kusa',
      find_hospital_desc: 'Nemo dakin gaggawa kusa da ku.',
      edit: 'Shirya',
    },
    resources: {
      title: 'Cibiyar Gano',
      subtitle: 'Kayan aikin lafiya gare ku',
      for_you: 'Na ku',
      explore_all: 'Bincika Duka',
      coping_tools: 'Kayan Aikin Taimako',
      all: 'Duka',
      audio: 'Murya',
      techniques: 'Hanyoyi',
      articles: 'Kasidu',
      videos: 'Bidiyo',
      books: 'Littattafai',
    },
    community: {
      title: 'Wurin Lafiya',
      subtitle: 'Haɗa kai da tsara ku ba tare da sunan ku ba',
      explore_groups: 'Bincika Kungiyoyi',
      members: 'mambobi',
      anonymous_feed: 'Ayyukan Tsara',
      send_hug: 'Aika Runguma',
      comment: 'Sharhi',
      just_now: 'Yanzu nan',
      hours_ago: 'h da ya wuce',
      days_ago: 'd da ya wuce',
      share_thought: 'Raba tunani...',
    },
    assessments: {
      title: 'Auna Kai',
      subtitle: 'Gwajin asibiti da aka tabbatar da su',
      available_tests: 'Gwajin da Akwai',
      recent_results: 'Tarihin Kusa',
      depression_screening: 'Gwajin Bakin Ciki',
      anxiety_screening: 'Gwajin Damuwa',
      burnout_test: 'Gwajin Gajiya Dalibai',
      pss_screening: 'Perceived Stress Scale',
      cssrs_screening: 'Risk Screener',
      brs_screening: 'Brief Resilience Scale',
      start: 'Fara',
      minutes: 'minti',
    },
    tools: {
      title: 'Bincika',
      subtitle: 'Duk kayan aikin ku na MindBridge a wuri guda',
      daily_growth: 'Girma Kullum',
      knowledge_checks: 'Ilimi & Gwaji',
      support_connection: 'Taimako & Haɗin kai',
      app_preferences: 'Saitunan App',
    },
  },
};
