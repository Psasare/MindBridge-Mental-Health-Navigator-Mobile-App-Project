import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const goalsData = [
  // ANXIETY (25 Goals)
  // Grounding
  { condition: 'anxiety', category: 'grounding', variant: '54321', name: '5-4-3-2-1 Technique', description: 'Find 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.', duration: 5, difficulty: 2, whyItHelps: 'Interrupts anxious thought loops by engaging your physical senses.', points: 10, badgeUnlock: 'Grounding Master' },
  { condition: 'anxiety', category: 'grounding', variant: 'box_breathing', name: 'Box Breathing', description: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 5 times.', duration: 3, difficulty: 1, whyItHelps: 'Activates your parasympathetic nervous system to calm your heart rate.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'grounding', variant: 'ice_cube', name: 'Hold an Ice Cube', description: 'Hold an ice cube in your hand until it melts, focusing entirely on the cold sensation.', duration: 2, difficulty: 3, whyItHelps: 'The intense temperature shock pulls your brain out of panic and into the physical present.', points: 15, badgeUnlock: null },
  { condition: 'anxiety', category: 'grounding', variant: 'color_scan', name: 'Color Scanning', description: 'Pick a color. Find 10 objects in the room that are that color.', duration: 2, difficulty: 1, whyItHelps: 'A simple cognitive task that distracts from racing thoughts.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'grounding', variant: 'texture_focus', name: 'Texture Focus', description: 'Find an object with an interesting texture (a blanket, a leaf) and describe it out loud for 2 minutes.', duration: 2, difficulty: 2, whyItHelps: 'Engages tactile and verbal centers of the brain to reduce emotional flooding.', points: 10, badgeUnlock: null },
  
  // Planning
  { condition: 'anxiety', category: 'planning', variant: 'brain_dump', name: '10-Minute Brain Dump', description: 'Write down every single thing you are worried about right now. Don\'t organize it, just list it.', duration: 10, difficulty: 2, whyItHelps: 'Gets abstract fears out of your head and onto paper where they are manageable.', points: 15, badgeUnlock: 'Planner' },
  { condition: 'anxiety', category: 'planning', variant: 'next_right_step', name: 'The Next Right Step', description: 'Pick the ONE smallest task you need to do next, and write it on a sticky note. Ignore everything else.', duration: 2, difficulty: 1, whyItHelps: 'Reduces the paralysis of being overwhelmed by too many choices.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'planning', variant: 'worst_case', name: 'Worst Case Scenario Check', description: 'Write down the absolute worst case scenario, then write down how likely it actually is to happen (1-100%).', duration: 5, difficulty: 3, whyItHelps: 'Challenges cognitive distortions and catastrophizing.', points: 15, badgeUnlock: null },
  { condition: 'anxiety', category: 'planning', variant: 'worry_time', name: 'Schedule "Worry Time"', description: 'Set a 15-minute timer for later today explicitly just to worry. For now, postpone all worries until then.', duration: 1, difficulty: 4, whyItHelps: 'Contains anxiety to a specific window so it doesn\'t ruin your whole day.', points: 20, badgeUnlock: null },
  { condition: 'anxiety', category: 'planning', variant: 'tomorrow_clothes', name: 'Lay Out Clothes', description: 'Lay out the clothes you will wear tomorrow morning right now.', duration: 5, difficulty: 1, whyItHelps: 'Reduces decision fatigue and morning anxiety.', points: 10, badgeUnlock: null },

  // Connection
  { condition: 'anxiety', category: 'connection', variant: 'text_friend', name: 'Text a Safe Person', description: 'Send a quick text to someone you trust. It doesn\'t have to be about your anxiety.', duration: 2, difficulty: 2, whyItHelps: 'Reminds your nervous system that you are part of a tribe and are safe.', points: 15, badgeUnlock: 'Connector' },
  { condition: 'anxiety', category: 'connection', variant: 'pet_animal', name: 'Pet an Animal', description: 'Spend 5 minutes petting a dog, cat, or other animal.', duration: 5, difficulty: 1, whyItHelps: 'Releases oxytocin which naturally lowers cortisol levels.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'connection', variant: 'smile_stranger', name: 'Smile at a Stranger', description: 'Make eye contact and smile at one person today, even if it feels forced.', duration: 1, difficulty: 4, whyItHelps: 'Breaks the social withdrawal cycle of anxiety.', points: 20, badgeUnlock: null },
  { condition: 'anxiety', category: 'connection', variant: 'voice_note', name: 'Send a Voice Note', description: 'Send a 30-second voice message to a friend instead of a text.', duration: 2, difficulty: 3, whyItHelps: 'Hearing and using your vocal cords can be more regulating than typing.', points: 15, badgeUnlock: null },
  { condition: 'anxiety', category: 'connection', variant: 'community_post', name: 'Post in Community', description: 'Go to the MindBridge community board and leave one encouraging comment on someone else\'s post.', duration: 3, difficulty: 2, whyItHelps: 'Helping others is a proven way to reduce focus on your own anxiety.', points: 10, badgeUnlock: null },

  // Movement
  { condition: 'anxiety', category: 'movement', variant: 'shake_it_out', name: 'Shake It Out', description: 'Stand up and vigorously shake your arms, legs, and body for 60 seconds.', duration: 1, difficulty: 1, whyItHelps: 'Releases pent-up adrenaline from the fight-or-flight response.', points: 10, badgeUnlock: 'Mover' },
  { condition: 'anxiety', category: 'movement', variant: 'brisk_walk', name: '10-Min Brisk Walk', description: 'Take a fast-paced walk outside without looking at your phone.', duration: 10, difficulty: 2, whyItHelps: 'Bilateral stimulation (walking) helps the brain process emotional stress.', points: 15, badgeUnlock: null },
  { condition: 'anxiety', category: 'movement', variant: 'yoga_flow', name: '3 Yoga Poses', description: 'Do Child\'s Pose, Cat-Cow, and Downward Dog. Hold each for 30 seconds.', duration: 3, difficulty: 2, whyItHelps: 'Stretches the psoas and chest, where we hold physical anxiety.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'movement', variant: 'dance_song', name: 'Dance to One Song', description: 'Put on your favorite upbeat song and dance until it finishes.', duration: 3, difficulty: 1, whyItHelps: 'Endorphin release and pattern interrupt.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'movement', variant: 'wall_pushups', name: '10 Wall Pushups', description: 'Do 10 slow pushups against a wall, focusing on the resistance.', duration: 2, difficulty: 2, whyItHelps: 'Proprioceptive input (heavy work) is deeply calming to the nervous system.', points: 10, badgeUnlock: null },

  // Nutrition
  { condition: 'anxiety', category: 'nutrition', variant: 'drink_water', name: 'Drink a Glass of Water', description: 'Drink 8oz of cold water right now.', duration: 1, difficulty: 1, whyItHelps: 'Dehydration mimics and exacerbates physical anxiety symptoms.', points: 5, badgeUnlock: 'Nourisher' },
  { condition: 'anxiety', category: 'nutrition', variant: 'eat_protein', name: 'Eat a Protein Snack', description: 'Eat a handful of nuts, some yogurt, or a piece of cheese.', duration: 5, difficulty: 1, whyItHelps: 'Stabilizes blood sugar, preventing the crashes that cause panic.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'nutrition', variant: 'herbal_tea', name: 'Brew Herbal Tea', description: 'Make a cup of chamomile, peppermint, or green tea and drink it slowly.', duration: 10, difficulty: 1, whyItHelps: 'The ritual is calming, and warm liquids soothe the vagus nerve.', points: 10, badgeUnlock: null },
  { condition: 'anxiety', category: 'nutrition', variant: 'no_caffeine', name: 'Skip the Coffee', description: 'Replace your next caffeinated drink with decaf or water.', duration: 0, difficulty: 3, whyItHelps: 'Caffeine directly stimulates the sympathetic nervous system.', points: 15, badgeUnlock: null },
  { condition: 'anxiety', category: 'nutrition', variant: 'magnesium_snack', name: 'Magnesium Boost', description: 'Eat a banana, some dark chocolate, or pumpkin seeds.', duration: 2, difficulty: 1, whyItHelps: 'Magnesium regulates the neurotransmitters associated with calm.', points: 10, badgeUnlock: null },


  // DEPRESSION (25 Goals)
  // Getting Up
  { condition: 'depression', category: 'getting_up', variant: 'feet_on_floor', name: 'Feet on the Floor', description: 'Just swing your legs over the bed and put both feet flat on the floor for 60 seconds.', duration: 1, difficulty: 3, whyItHelps: 'Breaks the inertia of staying in bed without the pressure of full movement.', points: 15, badgeUnlock: 'Riser' },
  { condition: 'depression', category: 'getting_up', variant: 'open_blinds', name: 'Let the Light In', description: 'Open your blinds or curtains to let natural sunlight in.', duration: 1, difficulty: 2, whyItHelps: 'Sunlight hits your retinas and triggers serotonin production.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'getting_up', variant: 'make_bed', name: 'Make the Bed (Poorly)', description: 'Just pull the covers up. It doesn\'t have to be perfect.', duration: 2, difficulty: 3, whyItHelps: 'Provides an immediate, visible "win" for the day.', points: 15, badgeUnlock: null },
  { condition: 'depression', category: 'getting_up', variant: 'sit_up', name: 'Sit Up at 90 Degrees', description: 'Stack your pillows and sit totally upright in bed for 5 minutes.', duration: 5, difficulty: 2, whyItHelps: 'Signals to your brain that rest time is over.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'getting_up', variant: 'drink_water_bed', name: 'Bedside Water', description: 'Drink the glass of water next to your bed before doing anything else.', duration: 1, difficulty: 1, whyItHelps: 'Jumpstarts your metabolism and brain function.', points: 5, badgeUnlock: null },

  // Self-Care
  { condition: 'depression', category: 'self_care', variant: 'brush_teeth', name: 'Brush Teeth', description: 'Go brush your teeth right now. Even if it\'s 3 PM.', duration: 2, difficulty: 3, whyItHelps: 'Restores a sense of dignity and routine.', points: 15, badgeUnlock: 'Self-Care Pro' },
  { condition: 'depression', category: 'self_care', variant: 'splash_face', name: 'Splash Cold Water', description: 'Splash cold water on your face 3 times.', duration: 1, difficulty: 2, whyItHelps: 'Triggers the mammalian dive reflex, resetting your nervous system.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'self_care', variant: 'change_clothes', name: 'Change Out of PJs', description: 'Put on different clothes. Even if it\'s just a clean pair of sweatpants.', duration: 3, difficulty: 3, whyItHelps: 'Creates psychological separation between sleep time and awake time.', points: 15, badgeUnlock: null },
  { condition: 'depression', category: 'self_care', variant: 'eat_anything', name: 'Eat Something Small', description: 'Eat one piece of toast, a banana, or a cracker.', duration: 2, difficulty: 2, whyItHelps: 'Depression destroys appetite, but fasting deepens depression.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'self_care', variant: 'shower', name: 'Take a 3-Minute Shower', description: 'Get in, wash your body, get out. Don\'t worry about hair or shaving.', duration: 5, difficulty: 4, whyItHelps: 'Physically washing away lethargy provides a massive psychological reset.', points: 20, badgeUnlock: null },

  // Accomplishment
  { condition: 'depression', category: 'accomplishment', variant: 'read_1_page', name: 'Read One Page', description: 'Read exactly one page of a book or one paragraph of an article.', duration: 2, difficulty: 2, whyItHelps: 'Re-engages your attention span without overwhelming it.', points: 10, badgeUnlock: 'Achiever' },
  { condition: 'depression', category: 'accomplishment', variant: 'wash_1_dish', name: 'Wash One Dish', description: 'Go to the sink and wash a single cup or plate.', duration: 1, difficulty: 3, whyItHelps: 'Proves to your brain that you still have agency and can affect your environment.', points: 15, badgeUnlock: null },
  { condition: 'depression', category: 'accomplishment', variant: 'throw_trash', name: 'Throw Away 3 Items', description: 'Find 3 pieces of trash in your room and put them in the bin.', duration: 2, difficulty: 2, whyItHelps: 'Micro-cleaning reduces visual overwhelm.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'accomplishment', variant: 'reply_1_email', name: 'Reply to 1 Message', description: 'Reply to one text or email you\'ve been ignoring.', duration: 2, difficulty: 4, whyItHelps: 'Reduces the guilt weight of avoided tasks.', points: 20, badgeUnlock: null },
  { condition: 'depression', category: 'accomplishment', variant: 'write_1_sentence', name: 'Write One Sentence', description: 'Open your journal and write a single sentence about how you feel.', duration: 1, difficulty: 2, whyItHelps: 'Externalizing the depression makes it slightly less heavy.', points: 10, badgeUnlock: null },

  // Connection
  { condition: 'depression', category: 'connection', variant: 'emoji_text', name: 'Send an Emoji', description: 'Text a friend just a single emoji (like a heart or a wave). No words required.', duration: 1, difficulty: 2, whyItHelps: 'Maintains relationships when you don\'t have the energy for conversation.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'connection', variant: 'sit_in_living_room', name: 'Sit in a Shared Space', description: 'Move from your bedroom to the living room or a coffee shop for 15 minutes.', duration: 15, difficulty: 3, whyItHelps: 'Passive socialization combats extreme isolation.', points: 15, badgeUnlock: null },
  { condition: 'depression', category: 'connection', variant: 'call_family', name: '5-Minute Call', description: 'Call a family member and explicitly say "I only have 5 minutes to chat."', duration: 5, difficulty: 4, whyItHelps: 'Provides connection with a safe, built-in escape hatch.', points: 20, badgeUnlock: null },
  { condition: 'depression', category: 'connection', variant: 'watch_with_someone', name: 'Co-watch a Video', description: 'Watch a YouTube video or show while sitting next to someone.', duration: 10, difficulty: 2, whyItHelps: 'Shared experience without the pressure to talk.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'connection', variant: 'ask_for_help', name: 'Ask for a Tiny Favor', description: 'Ask someone to grab you a glass of water or help with a small task.', duration: 1, difficulty: 4, whyItHelps: 'Allows people to support you and reminds you that you are worthy of care.', points: 20, badgeUnlock: null },

  // Movement
  { condition: 'depression', category: 'movement', variant: 'bed_stretches', name: 'Stretch in Bed', description: 'Reach your arms over your head and point your toes for 30 seconds.', duration: 1, difficulty: 1, whyItHelps: 'Gets blood flowing even if you can\'t get up.', points: 5, badgeUnlock: null },
  { condition: 'depression', category: 'movement', variant: 'walk_to_mailbox', name: 'Walk to the Mailbox', description: 'Walk outside to check the mail, then come right back in.', duration: 3, difficulty: 3, whyItHelps: 'Combines fresh air, sunlight, and light movement.', points: 15, badgeUnlock: null },
  { condition: 'depression', category: 'movement', variant: '5_squats', name: '5 Squats', description: 'Stand up and do 5 squats.', duration: 1, difficulty: 2, whyItHelps: 'Engages large muscle groups to quickly generate endorphins.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'movement', variant: 'sway_to_music', name: 'Sway to Music', description: 'Put on a slow song and just sway your body for 3 minutes.', duration: 3, difficulty: 1, whyItHelps: 'Gentle rhythmic movement is soothing to the nervous system.', points: 10, badgeUnlock: null },
  { condition: 'depression', category: 'movement', variant: 'clean_1_surface', name: 'Wipe One Surface', description: 'Take a cloth and wipe down your desk or kitchen counter.', duration: 2, difficulty: 3, whyItHelps: 'Productive movement provides a double benefit of dopamine and a cleaner space.', points: 15, badgeUnlock: null },

  // STRESS / ACADEMIC PRESSURE (Selection of 15 goals for brevity, covering key categories)
  { condition: 'academic_pressure', category: 'planning', variant: 'pomodoro', name: 'One Pomodoro', description: 'Work completely focused for 25 minutes, then stop immediately.', duration: 25, difficulty: 3, whyItHelps: 'Breaks massive projects into unintimidating chunks.', points: 20, badgeUnlock: 'Scholar' },
  { condition: 'academic_pressure', category: 'planning', variant: 'close_tabs', name: 'Close 10 Browser Tabs', description: 'Close browser tabs you no longer need.', duration: 2, difficulty: 1, whyItHelps: 'Digital clutter causes subconscious stress.', points: 10, badgeUnlock: null },
  { condition: 'academic_pressure', category: 'grounding', variant: 'stare_at_distance', name: '20-20-20 Rule', description: 'Look at something 20 feet away for 20 seconds.', duration: 1, difficulty: 1, whyItHelps: 'Relieves eye strain and physical tension from screen time.', points: 5, badgeUnlock: null },
  { condition: 'academic_pressure', category: 'self_care', variant: 'hard_stop', name: 'Set a Hard Stop', description: 'Set an alarm for 9 PM. Promise yourself you will stop studying when it rings.', duration: 1, difficulty: 4, whyItHelps: 'Prevents burnout by ensuring recovery time.', points: 15, badgeUnlock: null },
  { condition: 'stress', category: 'nutrition', variant: 'eat_away_from_desk', name: 'Lunch Away from Desk', description: 'Eat your next meal entirely away from your workspace.', duration: 15, difficulty: 3, whyItHelps: 'Prevents associating your resting state with stress.', points: 15, badgeUnlock: null },
];

async function main() {
  console.log('Seeding Goals...');
  
  // Clear existing goals to avoid duplicates on re-run
  await prisma.goal.deleteMany({});
  
  let count = 0;
  for (const goal of goalsData) {
    await prisma.goal.create({
      data: goal
    });
    count++;
  }
  
  console.log(`Successfully seeded ${count} gamified goals into the database!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
