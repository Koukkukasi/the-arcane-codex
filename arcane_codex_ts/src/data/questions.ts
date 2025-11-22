import { InterrogationQuestion } from '../types/game';

// Mock questions for Divine Interrogation (ported from Python version)
export const MOCK_INTERROGATION_QUESTIONS: InterrogationQuestion[] = [
  // Question 1 - VALDRIS (Justice)
  {
    question_number: 1,
    question_text: "A merchant confesses to price gouging during a famine. The law says death, but his family will starve. What is your judgment?",
    options: [
      { id: "q1_a", letter: "A", text: "The law is absolute - execute him", favor: { VALDRIS: 3, KAITHA: -2, SYLARA: -1 } },
      { id: "q1_b", letter: "B", text: "Exile him and confiscate half his wealth", favor: { VALDRIS: 1, MERCUS: 2, ATHENA: 1 } },
      { id: "q1_c", letter: "C", text: "Force him to distribute food freely as penance", favor: { SYLARA: 2, VALDRIS: -1, KAITHA: 1 } },
      { id: "q1_d", letter: "D", text: "Let the starving mob decide his fate", favor: { KAITHA: 3, VALDRIS: -3, KORVAN: 1 } }
    ],
    total_questions: 30
  },
  // Question 2 - KAITHA (Chaos)
  {
    question_number: 2,
    question_text: "You find a deck of cards that predicts the future but drives users mad. What do you do?",
    options: [
      { id: "q2_a", letter: "A", text: "Use it yourself - madness is a small price", favor: { KAITHA: 3, ATHENA: -2, MORVANE: 1 } },
      { id: "q2_b", letter: "B", text: "Destroy it immediately", favor: { VALDRIS: 2, KAITHA: -3, ATHENA: 1 } },
      { id: "q2_c", letter: "C", text: "Study it carefully to understand its power", favor: { ATHENA: 3, KAITHA: -1, MERCUS: 1 } },
      { id: "q2_d", letter: "D", text: "Sell it to the highest bidder", favor: { MERCUS: 3, VALDRIS: -2, KAITHA: 1 } }
    ],
    total_questions: 30
  },
  // Question 3 - MORVANE (Death)
  {
    question_number: 3,
    question_text: "A plague victim begs you to end their suffering. Their death might save others from infection. What is your choice?",
    options: [
      { id: "q3_a", letter: "A", text: "Grant them a merciful death", favor: { MORVANE: 3, SYLARA: -2, VALDRIS: 1 } },
      { id: "q3_b", letter: "B", text: "Quarantine them and seek a cure", favor: { SYLARA: 2, ATHENA: 2, MORVANE: -1 } },
      { id: "q3_c", letter: "C", text: "Let nature take its course", favor: { SYLARA: 1, MORVANE: 2, KAITHA: 1 } },
      { id: "q3_d", letter: "D", text: "Use them to study the disease", favor: { ATHENA: 2, MORVANE: 1, SYLARA: -3 } }
    ],
    total_questions: 30
  },
  // Question 4 - SYLARA (Nature)
  {
    question_number: 4,
    question_text: "A village needs to cut down an ancient forest to survive the winter. The forest spirits threaten revenge. How do you mediate?",
    options: [
      { id: "q4_a", letter: "A", text: "Protect the forest at all costs", favor: { SYLARA: 3, MERCUS: -2, MORVANE: 1 } },
      { id: "q4_b", letter: "B", text: "Help the village find alternative fuel", favor: { ATHENA: 2, SYLARA: 2, MERCUS: 1 } },
      { id: "q4_c", letter: "C", text: "Let them fight it out naturally", favor: { KAITHA: 2, KORVAN: 2, VALDRIS: -2 } },
      { id: "q4_d", letter: "D", text: "Negotiate a limited harvest", favor: { MERCUS: 2, SYLARA: 1, VALDRIS: 1 } }
    ],
    total_questions: 30
  },
  // Question 5 - KORVAN (War)
  {
    question_number: 5,
    question_text: "Your army is outnumbered 3 to 1. Your scout suggests poisoning the enemy's water supply. This violates the warrior's code. What do you command?",
    options: [
      { id: "q5_a", letter: "A", text: "Fight with honor and likely die", favor: { KORVAN: 3, VALDRIS: 2, KAITHA: -2 } },
      { id: "q5_b", letter: "B", text: "Use the poison - victory matters most", favor: { KAITHA: 2, ATHENA: 1, KORVAN: -2 } },
      { id: "q5_c", letter: "C", text: "Retreat and regroup", favor: { ATHENA: 3, KORVAN: -1, MERCUS: 1 } },
      { id: "q5_d", letter: "D", text: "Challenge their leader to single combat", favor: { KORVAN: 2, MORVANE: 1, ATHENA: -1 } }
    ],
    total_questions: 30
  },
  // Question 6 - ATHENA (Wisdom)
  {
    question_number: 6,
    question_text: "You discover a spell that grants infinite knowledge but erases all emotion. Do you cast it?",
    options: [
      { id: "q6_a", letter: "A", text: "Yes - knowledge is supreme", favor: { ATHENA: 3, KAITHA: -2, SYLARA: -2 } },
      { id: "q6_b", letter: "B", text: "No - emotion defines humanity", favor: { SYLARA: 2, KAITHA: 2, ATHENA: -1 } },
      { id: "q6_c", letter: "C", text: "Modify it to preserve some feeling", favor: { ATHENA: 2, MERCUS: 1, VALDRIS: 1 } },
      { id: "q6_d", letter: "D", text: "Test it on someone else first", favor: { MERCUS: 2, MORVANE: 1, VALDRIS: -2 } }
    ],
    total_questions: 30
  },
  // Question 7 - MERCUS (Commerce)
  {
    question_number: 7,
    question_text: "You inherit a profitable slave trade business. The slaves are well-treated but still property. What do you do?",
    options: [
      { id: "q7_a", letter: "A", text: "Free them all immediately", favor: { VALDRIS: 2, SYLARA: 2, MERCUS: -3 } },
      { id: "q7_b", letter: "B", text: "Gradually transition to paid labor", favor: { MERCUS: 2, ATHENA: 2, VALDRIS: 1 } },
      { id: "q7_c", letter: "C", text: "Maintain the profitable status quo", favor: { MERCUS: 3, VALDRIS: -2, SYLARA: -2 } },
      { id: "q7_d", letter: "D", text: "Arm them and start a rebellion", favor: { KAITHA: 3, KORVAN: 1, MERCUS: -3 } }
    ],
    total_questions: 30
  },
  // Question 8 - Mixed Dilemma
  {
    question_number: 8,
    question_text: "A child has murdered their abusive parent. They come to you for sanctuary. The mob demands justice. What is your response?",
    options: [
      { id: "q8_a", letter: "A", text: "Protect the child at all costs", favor: { SYLARA: 2, KAITHA: 1, VALDRIS: -1 } },
      { id: "q8_b", letter: "B", text: "Hold a fair trial", favor: { VALDRIS: 3, ATHENA: 2, KAITHA: -1 } },
      { id: "q8_c", letter: "C", text: "Exile the child for their safety", favor: { MERCUS: 2, ATHENA: 1, KORVAN: -1 } },
      { id: "q8_d", letter: "D", text: "Let the mob have them", favor: { MORVANE: 2, KAITHA: 2, VALDRIS: -3 } }
    ],
    total_questions: 30
  },
  // Question 9 - Power and Corruption
  {
    question_number: 9,
    question_text: "You find a crown that makes you an invincible ruler but slowly corrupts your soul. Do you wear it?",
    options: [
      { id: "q9_a", letter: "A", text: "Never - power corrupts absolutely", favor: { VALDRIS: 2, ATHENA: 2, KORVAN: -1 } },
      { id: "q9_b", letter: "B", text: "Wear it only in dire need", favor: { ATHENA: 1, MERCUS: 2, VALDRIS: -1 } },
      { id: "q9_c", letter: "C", text: "Embrace the corruption for power", favor: { KAITHA: 3, MORVANE: 2, VALDRIS: -3 } },
      { id: "q9_d", letter: "D", text: "Study it to make a safer version", favor: { ATHENA: 3, MERCUS: 1, KAITHA: -1 } }
    ],
    total_questions: 30
  },
  // Question 10 - Final Judgment
  {
    question_number: 10,
    question_text: "The gods themselves are dying. You can save only one. Who do you choose?",
    options: [
      { id: "q10_a", letter: "A", text: "Valdris - for justice must endure", favor: { VALDRIS: 5, KAITHA: -2 } },
      { id: "q10_b", letter: "B", text: "Sylara - for life must continue", favor: { SYLARA: 5, MORVANE: -2 } },
      { id: "q10_c", letter: "C", text: "Athena - for wisdom guides all", favor: { ATHENA: 5, KORVAN: -2 } },
      { id: "q10_d", letter: "D", text: "None - let a new age begin", favor: { KAITHA: 5, VALDRIS: -3 } }
    ],
    total_questions: 30
  },
  // Additional questions 11-30
  {
    question_number: 11,
    question_text: "A beggar claims to be a fallen god. They ask for a single coin. What do you do?",
    options: [
      { id: "q11_a", letter: "A", text: "Give them your entire purse", favor: { SYLARA: 2, MERCUS: -2, KAITHA: 1 } },
      { id: "q11_b", letter: "B", text: "Give exactly one coin as asked", favor: { VALDRIS: 2, ATHENA: 1 } },
      { id: "q11_c", letter: "C", text: "Test their divinity first", favor: { ATHENA: 3, VALDRIS: -1 } },
      { id: "q11_d", letter: "D", text: "Ignore them completely", favor: { MERCUS: 1, MORVANE: 1, SYLARA: -2 } }
    ],
    total_questions: 30
  },
  {
    question_number: 12,
    question_text: "Your lover is revealed to be an enemy spy. They claim their love is real. How do you proceed?",
    options: [
      { id: "q12_a", letter: "A", text: "Execute them for treason", favor: { VALDRIS: 2, KORVAN: 2, SYLARA: -2 } },
      { id: "q12_b", letter: "B", text: "Turn them into a double agent", favor: { ATHENA: 3, MERCUS: 2, VALDRIS: -1 } },
      { id: "q12_c", letter: "C", text: "Run away together", favor: { KAITHA: 2, SYLARA: 2, VALDRIS: -3 } },
      { id: "q12_d", letter: "D", text: "Imprison them but spare their life", favor: { VALDRIS: 1, SYLARA: 1, KORVAN: -1 } }
    ],
    total_questions: 30
  },
  {
    question_number: 13,
    question_text: "A prophecy says you will betray your closest friend. Do you distance yourself to prevent it?",
    options: [
      { id: "q13_a", letter: "A", text: "Yes - prevent the prophecy", favor: { ATHENA: 2, VALDRIS: 1, KAITHA: -2 } },
      { id: "q13_b", letter: "B", text: "No - face fate together", favor: { KORVAN: 2, SYLARA: 2, ATHENA: -1 } },
      { id: "q13_c", letter: "C", text: "Tell them and let them decide", favor: { VALDRIS: 3, ATHENA: 1 } },
      { id: "q13_d", letter: "D", text: "Betray them now on your terms", favor: { KAITHA: 3, MERCUS: 1, VALDRIS: -3 } }
    ],
    total_questions: 30
  },
  {
    question_number: 14,
    question_text: "You can resurrect one person: your mentor, your parent, or a great hero. Who returns?",
    options: [
      { id: "q14_a", letter: "A", text: "Your mentor - for guidance", favor: { ATHENA: 3, VALDRIS: 1 } },
      { id: "q14_b", letter: "B", text: "Your parent - for love", favor: { SYLARA: 3, MORVANE: -1 } },
      { id: "q14_c", letter: "C", text: "The hero - for the greater good", favor: { KORVAN: 2, VALDRIS: 2, SYLARA: -1 } },
      { id: "q14_d", letter: "D", text: "None - death should be final", favor: { MORVANE: 3, SYLARA: -2, ATHENA: 1 } }
    ],
    total_questions: 30
  },
  {
    question_number: 15,
    question_text: "A demon offers you three wishes in exchange for three random souls. Do you accept?",
    options: [
      { id: "q15_a", letter: "A", text: "Never - no soul is mine to trade", favor: { VALDRIS: 3, SYLARA: 2, KAITHA: -2 } },
      { id: "q15_b", letter: "B", text: "Yes - sacrifice few for many", favor: { MERCUS: 2, KAITHA: 2, VALDRIS: -3 } },
      { id: "q15_c", letter: "C", text: "Trick the demon somehow", favor: { ATHENA: 2, KAITHA: 2, VALDRIS: -1 } },
      { id: "q15_d", letter: "D", text: "Offer your own soul instead", favor: { KORVAN: 2, MORVANE: 2, MERCUS: -2 } }
    ],
    total_questions: 30
  },
  {
    question_number: 16,
    question_text: "You discover your heroic deeds were orchestrated by a villain to serve their plan. Do you continue?",
    options: [
      { id: "q16_a", letter: "A", text: "Stop immediately", favor: { VALDRIS: 2, ATHENA: -1, KORVAN: -1 } },
      { id: "q16_b", letter: "B", text: "Continue but sabotage their plan", favor: { ATHENA: 3, KAITHA: 1, VALDRIS: 1 } },
      { id: "q16_c", letter: "C", text: "Join them if the cause is just", favor: { MERCUS: 2, KAITHA: 2, VALDRIS: -2 } },
      { id: "q16_d", letter: "D", text: "Continue - good is good regardless", favor: { SYLARA: 2, VALDRIS: 1, ATHENA: -1 } }
    ],
    total_questions: 30
  },
  {
    question_number: 17,
    question_text: "Time freezes and only you can move. You have one hour. What do you do?",
    options: [
      { id: "q17_a", letter: "A", text: "Steal from the rich for the poor", favor: { KAITHA: 2, SYLARA: 1, VALDRIS: -2 } },
      { id: "q17_b", letter: "B", text: "Gather strategic information", favor: { ATHENA: 3, MERCUS: 2, KORVAN: -1 } },
      { id: "q17_c", letter: "C", text: "Save people from ongoing disasters", favor: { SYLARA: 3, VALDRIS: 2 } },
      { id: "q17_d", letter: "D", text: "Do nothing - this power is not meant for mortals", favor: { VALDRIS: 1, MORVANE: 2, KAITHA: -2 } }
    ],
    total_questions: 30
  },
  {
    question_number: 18,
    question_text: "Your rival saves your life but demands you abandon your quest. What is your response?",
    options: [
      { id: "q18_a", letter: "A", text: "Honor the life debt completely", favor: { VALDRIS: 3, KORVAN: 1, KAITHA: -2 } },
      { id: "q18_b", letter: "B", text: "Find another way to repay", favor: { MERCUS: 2, ATHENA: 2, VALDRIS: -1 } },
      { id: "q18_c", letter: "C", text: "Refuse - you didn't ask to be saved", favor: { KAITHA: 2, KORVAN: 1, VALDRIS: -2 } },
      { id: "q18_d", letter: "D", text: "Pretend to agree then continue secretly", favor: { MERCUS: 1, KAITHA: 2, VALDRIS: -3 } }
    ],
    total_questions: 30
  },
  {
    question_number: 19,
    question_text: "A cursed artifact kills whoever uses it but could end a war. Do you use it?",
    options: [
      { id: "q19_a", letter: "A", text: "Use it yourself to save others", favor: { KORVAN: 3, MORVANE: 2, MERCUS: -2 } },
      { id: "q19_b", letter: "B", text: "Destroy it immediately", favor: { VALDRIS: 2, SYLARA: 2, KORVAN: -2 } },
      { id: "q19_c", letter: "C", text: "Give it to a condemned criminal", favor: { MERCUS: 2, ATHENA: 1, VALDRIS: -2 } },
      { id: "q19_d", letter: "D", text: "Study it to remove the curse", favor: { ATHENA: 3, SYLARA: 1, MORVANE: -1 } }
    ],
    total_questions: 30
  },
  {
    question_number: 20,
    question_text: "You meet yourself from the future warning of a terrible mistake. But they won't say what. Do you change your path?",
    options: [
      { id: "q20_a", letter: "A", text: "Yes - heed the warning completely", favor: { ATHENA: 2, VALDRIS: 1, KAITHA: -2 } },
      { id: "q20_b", letter: "B", text: "No - paradoxes are dangerous", favor: { ATHENA: 2, MORVANE: 1, KAITHA: -1 } },
      { id: "q20_c", letter: "C", text: "Try to get more information first", favor: { ATHENA: 3, MERCUS: 1 } },
      { id: "q20_d", letter: "D", text: "Do the opposite out of spite", favor: { KAITHA: 3, VALDRIS: -2, ATHENA: -2 } }
    ],
    total_questions: 30
  },
  {
    question_number: 21,
    question_text: "A phoenix offers rebirth but you'll forget everything. Do you accept?",
    options: [
      { id: "q21_a", letter: "A", text: "Yes - a fresh start", favor: { SYLARA: 3, MORVANE: 1, ATHENA: -2 } },
      { id: "q21_b", letter: "B", text: "No - memories define us", favor: { ATHENA: 3, VALDRIS: 1, SYLARA: -1 } },
      { id: "q21_c", letter: "C", text: "Write everything down first", favor: { ATHENA: 2, MERCUS: 2, MORVANE: -1 } },
      { id: "q21_d", letter: "D", text: "Bargain for partial memories", favor: { MERCUS: 3, KAITHA: 1, VALDRIS: -1 } }
    ],
    total_questions: 30
  },
  {
    question_number: 22,
    question_text: "You can prevent a disaster but history will remember you as the villain. Do you act?",
    options: [
      { id: "q22_a", letter: "A", text: "Yes - truth matters less than lives", favor: { SYLARA: 2, KORVAN: 2, MERCUS: -1 } },
      { id: "q22_b", letter: "B", text: "No - legacy is everything", favor: { MERCUS: 2, VALDRIS: -1, SYLARA: -2 } },
      { id: "q22_c", letter: "C", text: "Act but leave evidence of truth", favor: { ATHENA: 3, VALDRIS: 2 } },
      { id: "q22_d", letter: "D", text: "Find someone else to take the blame", favor: { MERCUS: 2, KAITHA: 2, VALDRIS: -3 } }
    ],
    total_questions: 30
  },
  {
    question_number: 23,
    question_text: "A mirror shows your deepest fear. Looking longer might overcome it or break you. How long do you look?",
    options: [
      { id: "q23_a", letter: "A", text: "Don't look at all", favor: { MERCUS: 1, MORVANE: 1, KORVAN: -2 } },
      { id: "q23_b", letter: "B", text: "One quick glance", favor: { VALDRIS: 2, ATHENA: 1, KORVAN: -1 } },
      { id: "q23_c", letter: "C", text: "Stare until you conquer it", favor: { KORVAN: 3, KAITHA: 1, MERCUS: -2 } },
      { id: "q23_d", letter: "D", text: "Look with friends for support", favor: { SYLARA: 2, VALDRIS: 1, MORVANE: -1 } }
    ],
    total_questions: 30
  },
  {
    question_number: 24,
    question_text: "You find a book that writes the future. Every page you read becomes unchangeable. Do you read it?",
    options: [
      { id: "q24_a", letter: "A", text: "Read it all - knowledge is power", favor: { ATHENA: 3, KAITHA: -2, VALDRIS: -1 } },
      { id: "q24_b", letter: "B", text: "Read only one page", favor: { ATHENA: 1, MERCUS: 2, VALDRIS: 1 } },
      { id: "q24_c", letter: "C", text: "Burn it immediately", favor: { KAITHA: 2, VALDRIS: 1, ATHENA: -3 } },
      { id: "q24_d", letter: "D", text: "Let others read their pages first", favor: { MERCUS: 1, MORVANE: 2, VALDRIS: -2 } }
    ],
    total_questions: 30
  },
  {
    question_number: 25,
    question_text: "A god offers godhood but you must choose 1000 people to die. Do you ascend?",
    options: [
      { id: "q25_a", letter: "A", text: "Never - no power is worth that", favor: { VALDRIS: 3, SYLARA: 3, KAITHA: -2 } },
      { id: "q25_b", letter: "B", text: "Yes - then use power for good", favor: { MERCUS: 2, KAITHA: 2, VALDRIS: -3 } },
      { id: "q25_c", letter: "C", text: "Choose 1000 evil people", favor: { VALDRIS: 1, MORVANE: 2, SYLARA: -2 } },
      { id: "q25_d", letter: "D", text: "Volunteer yourself as one of them", favor: { KORVAN: 3, SYLARA: 1, MERCUS: -3 } }
    ],
    total_questions: 30
  },
  {
    question_number: 26,
    question_text: "Your worst enemy is dying and names you their heir. Do you accept?",
    options: [
      { id: "q26_a", letter: "A", text: "Accept and honor their wishes", favor: { VALDRIS: 3, KORVAN: 1, KAITHA: -1 } },
      { id: "q26_b", letter: "B", text: "Accept but give it all away", favor: { SYLARA: 2, VALDRIS: 1, MERCUS: -3 } },
      { id: "q26_c", letter: "C", text: "Refuse out of principle", favor: { KORVAN: 2, VALDRIS: -1, MERCUS: -2 } },
      { id: "q26_d", letter: "D", text: "Accept and destroy everything", favor: { KAITHA: 3, MORVANE: 2, VALDRIS: -3 } }
    ],
    total_questions: 30
  },
  {
    question_number: 27,
    question_text: "You can erase one emotion from humanity forever. Which do you choose?",
    options: [
      { id: "q27_a", letter: "A", text: "Hatred - for peace", favor: { SYLARA: 2, VALDRIS: 2, KORVAN: -2 } },
      { id: "q27_b", letter: "B", text: "Fear - for courage", favor: { KORVAN: 3, KAITHA: 1, ATHENA: -2 } },
      { id: "q27_c", letter: "C", text: "Greed - for equality", favor: { VALDRIS: 2, SYLARA: 1, MERCUS: -3 } },
      { id: "q27_d", letter: "D", text: "None - all emotions have purpose", favor: { ATHENA: 3, SYLARA: 2, KAITHA: -1 } }
    ],
    total_questions: 30
  },
  {
    question_number: 28,
    question_text: "A child can see everyone's death date except their own. They ask you when they'll die. What do you say?",
    options: [
      { id: "q28_a", letter: "A", text: "Tell them the truth", favor: { VALDRIS: 2, MORVANE: 2, SYLARA: -1 } },
      { id: "q28_b", letter: "B", text: "Lie to protect them", favor: { SYLARA: 2, MERCUS: 1, VALDRIS: -2 } },
      { id: "q28_c", letter: "C", text: "Say you don't know", favor: { ATHENA: 2, VALDRIS: 1, MORVANE: -1 } },
      { id: "q28_d", letter: "D", text: "Teach them to stop looking", favor: { SYLARA: 3, ATHENA: 1, MORVANE: -2 } }
    ],
    total_questions: 30
  },
  {
    question_number: 29,
    question_text: "Reality is breaking. You can save either the physical world or the dream world. Which survives?",
    options: [
      { id: "q29_a", letter: "A", text: "Physical - reality matters most", favor: { VALDRIS: 2, KORVAN: 2, KAITHA: -2 } },
      { id: "q29_b", letter: "B", text: "Dreams - imagination is everything", favor: { KAITHA: 3, SYLARA: 1, VALDRIS: -2 } },
      { id: "q29_c", letter: "C", text: "Try to merge them", favor: { ATHENA: 3, KAITHA: 1, VALDRIS: -1 } },
      { id: "q29_d", letter: "D", text: "Let both end for something new", favor: { MORVANE: 3, KAITHA: 2, VALDRIS: -3 } }
    ],
    total_questions: 30
  },
  {
    question_number: 30,
    question_text: "You are offered the chance to rewrite one law of nature. Which do you change?",
    options: [
      { id: "q30_a", letter: "A", text: "Death is no longer permanent", favor: { SYLARA: 2, MORVANE: -3, KAITHA: 1 } },
      { id: "q30_b", letter: "B", text: "Time can flow backward", favor: { KAITHA: 3, ATHENA: 1, VALDRIS: -2 } },
      { id: "q30_c", letter: "C", text: "Energy can be created freely", favor: { MERCUS: 3, ATHENA: 2, MORVANE: -1 } },
      { id: "q30_d", letter: "D", text: "Change nothing - nature is perfect", favor: { VALDRIS: 2, SYLARA: 3, KAITHA: -3 } }
    ],
    total_questions: 30
  }
];

/**
 * Get a mock interrogation question by number
 * @param questionNumber - The question number (1-30)
 * @returns The interrogation question or cycles back if out of range
 */
export function getMockInterrogationQuestion(questionNumber: number): InterrogationQuestion {
  if (questionNumber <= MOCK_INTERROGATION_QUESTIONS.length) {
    return MOCK_INTERROGATION_QUESTIONS[questionNumber - 1];
  }

  // Cycle back if we run out of mock questions
  const index = (questionNumber - 1) % MOCK_INTERROGATION_QUESTIONS.length;
  const question = { ...MOCK_INTERROGATION_QUESTIONS[index] };
  question.question_number = questionNumber;
  return question;
}