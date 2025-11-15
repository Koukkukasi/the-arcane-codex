"""
The Arcane Codex - Core Scenarios and Quest Content
Phase 5: Replayable scenarios with moral complexity
"""

import json
import random
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)

@dataclass
class ScenarioVariation:
    """A variation of a core scenario"""
    variation_id: str
    twist: str
    modified_whispers: Dict[str, str]
    special_conditions: List[str]
    unique_outcomes: Dict[str, str]

@dataclass
class NPCRole:
    """NPC's role in a scenario"""
    npc_name: str
    role: str  # ally, antagonist, wildcard, victim
    motivation: str
    secret: str
    betrayal_condition: Optional[str]
    loyalty_reward: Optional[str]

@dataclass
class ScenarioOutcome:
    """Possible outcome of a scenario"""
    id: str
    description: str
    requirements: List[str]
    consequences: Dict[str, Any]
    divine_reaction: str
    world_changes: Dict[str, bool]

@dataclass
class CoreScenario:
    """Complete scenario definition"""
    id: str
    name: str
    theme: str  # sacrifice, betrayal, greed, loyalty, justice, revenge
    description: str
    moral_dilemma: str
    acts: List[Dict]  # 3-act structure
    npcs: List[NPCRole]
    variations: List[ScenarioVariation]
    outcomes: List[ScenarioOutcome]
    environmental_elements: List[str]
    sensory_focus: Dict[str, str]

class ScenarioLibrary:
    """
    Library of core scenarios with variations for replayability
    Each scenario creates impossible moral dilemmas
    """

    def __init__(self):
        self.scenarios = self.load_core_scenarios()
        self.active_scenarios = {}  # game_id -> current scenario

    def load_core_scenarios(self) -> Dict[str, CoreScenario]:
        """Load all core scenarios"""

        scenarios = {}

        # Scenario 1: The Blood Price
        scenarios['blood_price'] = CoreScenario(
            id='blood_price',
            name='The Blood Price',
            theme='sacrifice',
            description='A desperate father begs for help saving his daughter, but the medicine is cursed',
            moral_dilemma='Save one child but doom hundreds, or let the child die to save many?',
            acts=[
                {
                    'act': 1,
                    'name': 'The Desperate Plea',
                    'public': """Grimsby finds you in the tavern, tears streaming down his weathered face.

"Please," he begs, gripping your arm with trembling hands. "My daughter Elara...
she's dying. The Duke has medicine in his warehouse, but he refuses to sell.
Says it's for the army. But they're healthy! She has days, maybe hours!"

He pulls out a crude map, marked with guard positions.

"I know every entrance, every patrol. I worked there for twenty years before...
before the Duke had me beaten for asking for a raise. Please. She's all I have left."

The tavern falls silent. Everyone watches your response.""",
                    'whispers': {
                        'fighter': "Grimsby's map is wrong. Those guard positions are from last season. It's a trap or he's been deceived.",
                        'mage': "You sense powerful magic emanating from Grimsby. He's under a compulsion spell - someone is forcing him to do this.",
                        'thief': "His story doesn't add up. You've heard Elara died three months ago in the plague. Who is he really trying to save?",
                        'cleric': "Divine sight reveals: Grimsby's soul is fractured. He made a deal with something dark to save his daughter."
                    },
                    'choices': [
                        {'id': 'help', 'text': 'Agree to help immediately'},
                        {'id': 'investigate', 'text': 'Investigate his claims first'},
                        {'id': 'refuse', 'text': 'Refuse to steal from the Duke'},
                        {'id': 'negotiate', 'text': 'Offer to negotiate with the Duke instead'}
                    ]
                },
                {
                    'act': 2,
                    'name': 'The Heist',
                    'public': """The warehouse looms in the fog. As Grimsby promised, a side door hangs ajar.

Inside, crates of medicine are stacked high, marked with the Duke's seal.
But something feels wrong. Too quiet. Too easy.

Grimsby's daughter wasn't at his home - he claims she's hidden with healers.
Renna, your companion, keeps her hand on her blade. "This stinks of trap," she mutters.

Then you hear it - footsteps above. Many footsteps.""",
                    'whispers': {
                        'fighter': "Twenty soldiers minimum. They're not patrolling - they're waiting. This IS a trap.",
                        'mage': "The medicine crates glow with necromantic energy. This isn't medicine - it's concentrated plague.",
                        'thief': "You spot Grimsby signaling someone in the rafters. He's working with them.",
                        'ranger': "Blood scent, fresh. Someone died here within the hour. The real guards, perhaps?",
                        'cleric': "200 souls cry out in anguish. If this 'medicine' is used, 200 will die horribly.",
                        'bard': "You recognize the Captain of Guards' voice above. He's Grimsby's brother-in-law."
                    },
                    'environmental': [
                        'Oil barrels (flammable)',
                        'Crane mechanism (drop crates)',
                        'Smoke bombs in crate',
                        'Hidden tunnel (thief only)',
                        'Window to roof (acrobatics)'
                    ]
                },
                {
                    'act': 3,
                    'name': 'The Truth Revealed',
                    'public': """The truth explodes like thunder.

Grimsby's daughter IS dying - but not from disease. She was poisoned by the Duke's son
in a failed assault. The Duke covered it up, threatened the healers.

The 'medicine' is indeed cursed plague, meant for the Duke's enemies in the
neighboring kingdom. Using it on Elara would save her... but release a magical
plague that would kill everyone in the poor quarter within a week.

Grimsby knows. He doesn't care. "They let her suffer! Let THEM suffer!"

The Duke's soldiers surround you. The Captain speaks:
"Surrender the plague vials. We know why you're really here. The Duke offers a deal -
your freedom for your silence about his son's crime."

Elara has hours left. 200 innocents don't know death approaches.
Grimsby has a knife to his own throat: "Save her or I die here!"

What do you do?""",
                    'final_choices': [
                        {'id': 'save_child', 'text': 'Use the cursed medicine on Elara (200 die)'},
                        {'id': 'save_many', 'text': 'Refuse to use it (Elara dies)'},
                        {'id': 'expose_duke', 'text': 'Expose the Duke\'s crimes publicly'},
                        {'id': 'find_another_way', 'text': 'Desperately seek alternative cure'},
                        {'id': 'destroy_plague', 'text': 'Destroy all the plague vials'}
                    ]
                }
            ],
            npcs=[
                NPCRole(
                    npc_name='Grimsby',
                    role='victim/antagonist',
                    motivation='Save daughter at any cost',
                    secret='Knows medicine is cursed, doesn\'t care',
                    betrayal_condition='If party refuses to help',
                    loyalty_reward='Reveals Duke\'s corruption'
                ),
                NPCRole(
                    npc_name='Renna',
                    role='companion',
                    motivation='Justice for the wronged',
                    secret='Her sister died in the last plague',
                    betrayal_condition='If party uses plague medicine',
                    loyalty_reward='Helps find alternative cure'
                ),
                NPCRole(
                    npc_name='Captain Morris',
                    role='antagonist/wildcard',
                    motivation='Protect his brother-in-law Grimsby',
                    secret='Hates the Duke but needs the job',
                    betrayal_condition=None,
                    loyalty_reward='Lets party escape if they save Elara'
                ),
                NPCRole(
                    npc_name='Elara',
                    role='victim',
                    motivation='Doesn\'t want others to die for her',
                    secret='Knows what the Duke\'s son did',
                    betrayal_condition=None,
                    loyalty_reward='Testimony against Duke\'s son'
                )
            ],
            variations=[
                ScenarioVariation(
                    variation_id='plague_spreads',
                    twist='The plague is already spreading - the choice is who to save',
                    modified_whispers={'mage': 'The plague is airborne. You\'re all infected.'},
                    special_conditions=['Time limit: 10 turns before symptoms'],
                    unique_outcomes={'quarantine': 'Seal the warehouse, trap everyone inside'}
                ),
                ScenarioVariation(
                    variation_id='elara_is_lying',
                    twist='Elara isn\'t dying - she\'s the Duke\'s spy',
                    modified_whispers={'cleric': 'The girl has no injury. She\'s perfectly healthy.'},
                    special_conditions=['Grimsby was deceived too'],
                    unique_outcomes={'family_tragedy': 'Grimsby kills his own daughter'}
                ),
                ScenarioVariation(
                    variation_id='divine_intervention',
                    twist='The gods offer a bargain - one life for another',
                    modified_whispers={'cleric': 'VALDRIS speaks: "A life for a life. Choose who dies."'},
                    special_conditions=['Divine Council automatically convenes'],
                    unique_outcomes={'divine_sacrifice': 'Party member can die to save both'}
                )
            ],
            outcomes=[
                ScenarioOutcome(
                    id='saved_child',
                    description='Elara lives, 200 innocents die from plague',
                    requirements=['Use cursed medicine'],
                    consequences={
                        'divine_favor': {'VALDRIS': -30, 'MORVANE': +20, 'SYLARA': -25},
                        'npc_changes': {'Grimsby': +50, 'Renna': -100, 'Town': -75},
                        'world_flags': {'plague_released': True, 'elara_alive': True}
                    },
                    divine_reaction='CONDEMNED - "You chose one over many"',
                    world_changes={'poor_quarter_dead': True, 'duke_flees': True}
                ),
                ScenarioOutcome(
                    id='saved_many',
                    description='Elara dies, plague prevented, Grimsby broken',
                    requirements=['Refuse medicine', 'Don\'t find alternative'],
                    consequences={
                        'divine_favor': {'VALDRIS': +20, 'SYLARA': +25, 'MORVANE': -20},
                        'npc_changes': {'Grimsby': -100, 'Renna': +30, 'Town': +50},
                        'world_flags': {'elara_dead': True, 'grimsby_suicide_risk': True}
                    },
                    divine_reaction='APPROVED - "The needs of many prevailed"',
                    world_changes={'grimsby_becomes_enemy': True}
                ),
                ScenarioOutcome(
                    id='perfect_solution',
                    description='Alternative cure found, all saved, Duke exposed',
                    requirements=['Find alternative', 'Expose Duke', 'Roll >90'],
                    consequences={
                        'divine_favor': {'ATHENA': +40, 'VALDRIS': +30, 'ALL': +10},
                        'npc_changes': {'ALL': +50},
                        'world_flags': {'perfect_ending': True, 'duke_arrested': True}
                    },
                    divine_reaction='DIVINE_CONCORDANCE - "Wisdom found a way"',
                    world_changes={'new_duke': True, 'party_heroes': True}
                )
            ],
            environmental_elements=[
                'Warehouse (multiple levels)',
                'Fog (limited visibility)',
                'Medicine crates (explosive if burned)',
                'Guard towers (sniper positions)',
                'Sewer entrance (escape route)'
            ],
            sensory_focus={
                'smell': 'Sickness and death permeate everything',
                'audio': 'Elara\'s labored breathing via magic (constant pressure)',
                'visual': 'The medicine glows with sickly green light',
                'emotional': 'Desperation radiates from Grimsby like heat'
            }
        )

        # Scenario 2: The Poisoned Crown
        scenarios['poisoned_crown'] = CoreScenario(
            id='poisoned_crown',
            name='The Poisoned Crown',
            theme='betrayal',
            description='The King is dying from poison. The Queen begs for help. But who is the real villain?',
            moral_dilemma='Support a murderous queen who was defending herself, or let a victim become a tyrant?',
            acts=[
                {
                    'act': 1,
                    'name': 'Royal Summons',
                    'public': """You're dragged from your beds by royal guards. No explanation, just urgent commands.

The throne room is chaos. The King writhes on the floor, foam on his lips, skin turning purple.
The Queen kneels beside him, tears streaming. "Please! Someone help him!"

The Court Physician shakes his head. "Thornwood poison. No cure exists. He has an hour, perhaps less."

The Queen turns to you, desperate. "You're the heroes who saved the merchant district!
Please, find who did this! Save my husband!"

But the King, in his agony, points a trembling finger at HER.""",
                    'whispers': {
                        'fighter': "The guards are positioned to stop people from leaving, not entering. This was an inside job.",
                        'mage': "Thornwood poison is a lie. This is Dreambane - causes madness before death. Very different.",
                        'thief': "The Queen has fresh scratches hidden under her sleeves. Defensive wounds.",
                        'cleric': "The Queen's soul is pure terror, not guilt. She's afraid of something else entirely.",
                        'ranger': "Thornwood has a distinct smell. This isn't it. Also, that servant is armed.",
                        'bard': "Court gossip: The King was planning to execute the Queen's family tomorrow."
                    }
                },
                {
                    'act': 2,
                    'name': 'Web of Lies',
                    'public': """Investigation reveals layers of deception.

The Queen did poison the King - but evidence suggests the King murdered their son last month,
claiming illness. He was consolidating power, eliminating rivals.

The Royal Advisor shows you documents: "The King planned to marry his brother's daughter.
The Queen and her children were to have... accidents. She found out this morning."

The Queen breaks down: "He killed our boy! Marcus was only twelve! Said it was flux,
but I saw the bruises. I... I couldn't let him kill Sarah too. She's only eight."

Princess Sarah peers from behind a tapestry, terrified.

The King, in a moment of clarity, laughs bitterly:
"The weak... deserve... to die. She... proved... worthy..."

Who do you save? Who do you condemn?""",
                    'whispers': {
                        'fighter': "The King's brother waits outside with an army. If the King dies, civil war begins.",
                        'mage': "There IS an antidote, but using it will kill whoever administers it. Life force transfer.",
                        'thief': "The Royal Advisor forged those documents. He's playing everyone.",
                        'cleric': "Princess Sarah has the same madness in her eyes. The poison wasn't meant for the King.",
                        'bard': "The Queen loved the King until she found their son's real autopsy report yesterday.",
                        'ranger': "More assassins wait in the shadows. This isn't over regardless of your choice."
                    }
                },
                {
                    'act': 3,
                    'name': 'The Crown Falls',
                    'public': """Time runs out. The King has minutes.

The Queen offers her confession publicly: "I poisoned him. He murdered our son.
He would have killed Sarah. I did what any mother would do."

The Court erupts. Some call for her execution. Others kneel in support.

The Royal Advisor makes his play: "The law is clear. Regicide means death.
But... if the King dies without naming an heir, civil war will consume thousands."

The dying King gasps out: "Save... me... and I'll... spare... the girl..."

The Queen grabs a knife: "You'll kill her the moment you're well!"

Princess Sarah steps forward: "Let father die. I'll be Queen. I'll be better."

The antidote exists but costs a life. The kingdom teeters on chaos.
Every choice births a different tyranny.""",
                    'final_choices': [
                        {'id': 'save_king', 'text': 'Save the King (Queen and possibly Sarah die)'},
                        {'id': 'let_die', 'text': 'Let the King die (Queen rules as regent)'},
                        {'id': 'sacrifice_self', 'text': 'Give your life force to save the King'},
                        {'id': 'expose_all', 'text': 'Expose everyone\'s crimes, let the people decide'},
                        {'id': 'crown_sarah', 'text': 'Support Sarah\'s claim to the throne'}
                    ]
                }
            ],
            npcs=[
                NPCRole(
                    npc_name='Queen Lyanna',
                    role='victim/murderer',
                    motivation='Protect her daughter',
                    secret='Planning to flee the kingdom',
                    betrayal_condition='If party saves the King',
                    loyalty_reward='Grants party titles and lands'
                ),
                NPCRole(
                    npc_name='Royal Advisor Blackwood',
                    role='manipulator',
                    motivation='Become the power behind the throne',
                    secret='Orchestrated the son\'s death to start this chain',
                    betrayal_condition='Always betrays for power',
                    loyalty_reward=None
                ),
                NPCRole(
                    npc_name='Princess Sarah',
                    role='wildcard',
                    motivation='Unknown even to herself',
                    secret='Has her father\'s madness and mother\'s ruthlessness',
                    betrayal_condition='If not made queen',
                    loyalty_reward='Becomes either greatest ruler or worst tyrant'
                ),
                NPCRole(
                    npc_name='Duke Marcus (King\'s brother)',
                    role='opportunist',
                    motivation='Claims the throne',
                    secret='Has his own army ready',
                    betrayal_condition=None,
                    loyalty_reward='Civil war avoided if supported'
                )
            ],
            variations=[
                ScenarioVariation(
                    variation_id='son_lives',
                    twist='The son survived, hidden by the Queen',
                    modified_whispers={'cleric': 'A child\'s soul calls from the castle crypts. Still alive!'},
                    special_conditions=['Prince can be rescued'],
                    unique_outcomes={'restoration': 'Rightful heir returns'}
                ),
                ScenarioVariation(
                    variation_id='divine_judgment',
                    twist='The gods demand trial by divine combat',
                    modified_whispers={'cleric': 'VALDRIS and KAITHA both claim jurisdiction'},
                    special_conditions=['Combat determines ruler'],
                    unique_outcomes={'divine_rule': 'Winner becomes divinely appointed ruler'}
                )
            ],
            outcomes=[
                ScenarioOutcome(
                    id='tyrant_lives',
                    description='King saved, Queen executed, Sarah flees',
                    requirements=['Save the King'],
                    consequences={
                        'divine_favor': {'VALDRIS': +15, 'MORVANE': -20, 'KAITHA': -25},
                        'world_flags': {'tyrant_king': True, 'sarah_becomes_rebel': True}
                    },
                    divine_reaction='CONFLICTED - "Law upheld, justice denied"',
                    world_changes={'rebellion_brewing': True, 'queen_martyred': True}
                ),
                ScenarioOutcome(
                    id='queen_regent',
                    description='King dies, Queen rules as regent',
                    requirements=['Let King die'],
                    consequences={
                        'divine_favor': {'KAITHA': +25, 'MORVANE': +20, 'VALDRIS': -20},
                        'world_flags': {'queen_rules': True, 'civil_war_risk': True}
                    },
                    divine_reaction='DIVIDED - "Murder rewarded with power"',
                    world_changes={'noble_uprising': True}
                ),
                ScenarioOutcome(
                    id='child_queen',
                    description='Sarah becomes Queen, unknown future',
                    requirements=['Crown Sarah'],
                    consequences={
                        'divine_favor': {'ATHENA': +30, 'KAITHA': +15},
                        'world_flags': {'child_ruler': True, 'uncertain_future': True}
                    },
                    divine_reaction='WATCHING - "The child\'s path remains unwritten"',
                    world_changes={'regency_council': True, 'party_as_advisors': True}
                )
            ],
            environmental_elements=[
                'Throne room (multiple exits)',
                'Hidden passages (thief knowledge)',
                'Court audience (public pressure)',
                'Royal guard positions',
                'Poison vial evidence'
            ],
            sensory_focus={
                'visual': 'The King\'s skin shifts through purple hues',
                'audio': 'His dying gasps punctuate every conversation',
                'smell': 'Sweet almond scent of poison fills the air',
                'emotional': 'Waves of fear, guilt, and ambition crash together'
            }
        )

        # Scenario 3: The Beast Within
        scenarios['beast_within'] = CoreScenario(
            id='beast_within',
            name='The Beast Within',
            theme='transformation',
            description='A werewolf plague threatens the city, but the infected are innocent children',
            moral_dilemma='Kill innocent infected children to save the city, or risk everyone becoming monsters?',
            acts=[
                {
                    'act': 1,
                    'name': 'The First Night',
                    'public': """Screams pierce the night. You rush to the orphanage to find horror.

Three children have transformed into wolf-creatures, but smaller, still partially human.
They\'ve killed two caretakers but now huddle together, whimpering, confused.

Sister Marina, the head of the orphanage, blocks your path:
"No! They\'re just children! It\'s not their fault! Please, there must be a cure!"

The city guard captain arrives: "Orders from the Duke. All infected to be eliminated immediately.
The plague spreads through bites. One night, and half the city could turn."

Seven more children show early symptoms - fever, growing claws, hunger for raw meat.
They have hours before they turn.

The transformed children recognize Sister Marina, calling her "Mama" through elongated jaws.""",
                    'whispers': {
                        'fighter': "These aren\'t normal werewolves. They\'re too weak. Someone made them wrong on purpose.",
                        'mage': "This curse is artificial, magical. Someone is using these children to test something.",
                        'ranger': "Their wolf-scent is mixed with something else... dragon blood? Impossible.",
                        'thief': "The Duke\'s son was here yesterday with a \'donation\'. Staff were sent away.",
                        'cleric': "These souls are split but not lost. The children are still in there, screaming.",
                        'bard': "Rumors say the Duke seeks to create controllable were-soldiers. These are failures."
                    }
                },
                {
                    'act': 2,
                    'name': 'The Horrible Truth',
                    'public': """Dawn brings revelations and horror in equal measure.

The Duke\'s son confesses under pressure: They were creating were-soldiers using orphans
as test subjects. The process failed - the children kept their innocence, making them
unable to fight, only suffer.

But it gets worse. The "cure" exists - Dragon\'s Heart Elixir. One dragon heart
cures up to twenty infected. But the only dragon nearby is Syltharion, the Ancient
Protector of the Forest. Killing her would doom the forest to corruption.

The infected children grow more feral by the hour. Three have already bitten
other children in confusion and hunger. By nightfall, forty children will turn.

Sister Marina offers herself: "Turn me. Let me lead them away from the city."

The Dragon speaks through magical sending: "I know why you come. I offer a bargain -
my heart for all your memories of love. You\'ll save them but never feel joy again."

Time runs out. The children begin to howl.""",
                    'whispers': {
                        'fighter': "The city guard prepares to burn the orphanage at sunset. With everyone inside.",
                        'mage': "There\'s another way - transfer the curse to willing adults. But they\'ll be true monsters.",
                        'ranger': "Syltharion is pregnant. Kill her, and you kill the last dragon eggs too.",
                        'thief': "The Duke has more Dragon Heart Elixir in his private vault. He\'s saving it.",
                        'cleric': "A divine intervention is possible, but the gods demand a terrible price.",
                        'bard': "The Duke plans to blame the party for the plague. Guards already spread the rumor."
                    }
                },
                {
                    'act': 3,
                    'name': 'The Choice of Monsters',
                    'public': """Sunset. Forty-three children infected. The city mobilizes to destroy the orphanage.

Sister Marina has been bitten trying to calm the children. She has minutes before turning.
"Please," she gasps, "They didn\'t choose this. They\'re innocents."

The Duke arrives with an ultimatum: "Kill the dragon, cure the children, become heroes.
Or refuse, and I\'ll burn them all and name you as the cause of the plague."

Syltharion lands on the orphanage roof, magnificent and terrible:
"I offer one final option. I will cure them all, but the city must accept them
as they are - part wolf forever. Different, but not monsters. If even one person
refuses, I withdraw my offer."

The mob outside shouts for blood. The children inside cry for their mothers.
The guard\'s torches are lit.

Every solution saves some and damns others. There is no clean answer.
Only the choice of which horror you can live with.""",
                    'final_choices': [
                        {'id': 'kill_dragon', 'text': 'Kill Syltharion, save the children'},
                        {'id': 'kill_children', 'text': 'Allow the purge of the infected'},
                        {'id': 'transfer_curse', 'text': 'Transfer curse to volunteers'},
                        {'id': 'dragon_bargain', 'text': 'Accept dragon\'s offer of partial cure'},
                        {'id': 'steal_elixir', 'text': 'Steal Duke\'s hidden elixir'},
                        {'id': 'divine_intervention', 'text': 'Call upon the gods (unknown price)'}
                    ]
                }
            ],
            npcs=[
                NPCRole(
                    npc_name='Sister Marina',
                    role='moral compass',
                    motivation='Save the children at any cost',
                    secret='Was once a werewolf herself, cured long ago',
                    betrayal_condition='If party chooses to kill children',
                    loyalty_reward='Reveals location of other cure ingredients'
                ),
                NPCRole(
                    npc_name='Duke Alderon',
                    role='antagonist',
                    motivation='Cover up his son\'s crimes',
                    secret='Has enough elixir for his family',
                    betrayal_condition='Always betrays to protect his position',
                    loyalty_reward=None
                ),
                NPCRole(
                    npc_name='Syltharion',
                    role='force of nature',
                    motivation='Protect the natural order',
                    secret='Dying anyway from previous wounds',
                    betrayal_condition=None,
                    loyalty_reward='Grants forest\'s protection if shown mercy'
                ),
                NPCRole(
                    npc_name='Timothy',
                    role='infected child',
                    motivation='Wants his mama',
                    secret='Can partially control his wolf form',
                    betrayal_condition=None,
                    loyalty_reward='Becomes powerful ally if saved and trained'
                )
            ],
            variations=[
                ScenarioVariation(
                    variation_id='marina_is_mother',
                    twist='Sister Marina is the werewolf who started the plague',
                    modified_whispers={'cleric': 'Marina\'s soul reeks of guilt. She\'s the source.'},
                    special_conditions=['Marina infected them deliberately to create a pack'],
                    unique_outcomes={'redemption': 'Marina sacrifices herself to cure them all'}
                ),
                ScenarioVariation(
                    variation_id='children_are_evolved',
                    twist='The children are evolving into something new, not cursed',
                    modified_whispers={'mage': 'This isn\'t a curse - it\'s evolution. They\'re becoming something better.'},
                    special_conditions=['Children gain telepathic abilities'],
                    unique_outcomes={'new_species': 'Children become founding members of new race'}
                )
            ],
            outcomes=[
                ScenarioOutcome(
                    id='dragon_slain',
                    description='Dragon killed, children cured, forest doomed',
                    requirements=['Kill Syltharion'],
                    consequences={
                        'divine_favor': {'SYLARA': -50, 'MORVANE': +25, 'VALDRIS': +10},
                        'world_flags': {'forest_dying': True, 'last_dragon_dead': True, 'children_saved': True}
                    },
                    divine_reaction='MOURNING - "The last dragon falls for mortal fear"',
                    world_changes={'forest_corruption_spreads': True, 'party_dragonslayers': True}
                ),
                ScenarioOutcome(
                    id='children_purged',
                    description='Infected children killed, plague stopped, innocence lost',
                    requirements=['Allow purge'],
                    consequences={
                        'divine_favor': {'VALDRIS': +5, 'MORVANE': +30, 'SYLARA': -30, 'KAITHA': -40},
                        'npc_changes': {'Marina': -200, 'Duke': +50},
                        'world_flags': {'orphanage_burned': True, 'plague_stopped': True}
                    },
                    divine_reaction='CONDEMNED - "Innocence burned for convenience"',
                    world_changes={'party_child_killers': True, 'city_saved': True}
                ),
                ScenarioOutcome(
                    id='hybrid_acceptance',
                    description='Children remain part-wolf, city learns acceptance',
                    requirements=['Dragon bargain accepted by all'],
                    consequences={
                        'divine_favor': {'SYLARA': +40, 'KAITHA': +30, 'ATHENA': +25},
                        'world_flags': {'werewolf_integration': True, 'dragon_ally': True}
                    },
                    divine_reaction='BLESSED - "Acceptance triumphs over fear"',
                    world_changes={'new_world_order': True, 'prejudice_challenged': True}
                )
            ],
            environmental_elements=[
                'Orphanage (multiple rooms, basement)',
                'City streets (mob gathering)',
                'Forest edge (dragon\'s domain)',
                'Duke\'s mansion (vault location)',
                'Clock tower (time pressure visible)'
            ],
            sensory_focus={
                'audio': 'Children\'s howls shift between wolf and human crying',
                'smell': 'Wet dog mixed with infant powder and blood',
                'visual': 'Transformation happens in spurts - human to wolf and back',
                'emotional': 'Pure terror from children who don\'t understand what\'s happening'
            }
        )

        return scenarios

    def get_scenario(self, scenario_id: str) -> Optional[CoreScenario]:
        """Get a specific scenario"""
        return self.scenarios.get(scenario_id)

    def get_random_scenario(self, exclude_themes: List[str] = None) -> CoreScenario:
        """Get a random scenario, avoiding specified themes"""
        available = [s for s in self.scenarios.values()
                    if exclude_themes is None or s.theme not in exclude_themes]
        return random.choice(available) if available else list(self.scenarios.values())[0]

    def apply_variation(self, scenario: CoreScenario, variation_id: str = None) -> CoreScenario:
        """Apply a variation to make the scenario unique"""
        if variation_id:
            variation = next((v for v in scenario.variations if v.variation_id == variation_id), None)
        else:
            variation = random.choice(scenario.variations) if scenario.variations else None

        if variation:
            # Apply the variation's modifications
            # This would modify the scenario with the variation's twists
            pass

        return scenario

    def get_scenario_for_act(self, game_id: str, act_number: int) -> Dict:
        """Get the current act of a scenario"""
        if game_id not in self.active_scenarios:
            return None

        scenario = self.active_scenarios[game_id]
        if act_number <= len(scenario.acts):
            return scenario.acts[act_number - 1]
        return None

    def calculate_outcome(self, scenario: CoreScenario, choices_made: List[str],
                          world_state: Dict) -> ScenarioOutcome:
        """Calculate which outcome was achieved"""

        for outcome in scenario.outcomes:
            # Check if requirements are met
            requirements_met = all(req in choices_made for req in outcome.requirements)
            if requirements_met:
                return outcome

        # Return default outcome if no specific one matches
        return scenario.outcomes[0]

    def generate_npc_dialogue(self, npc: NPCRole, situation: str, approval: int) -> str:
        """Generate contextual NPC dialogue"""

        if approval > 80:
            tone = "supportive"
        elif approval > 60:
            tone = "friendly"
        elif approval > 40:
            tone = "neutral"
        elif approval > 20:
            tone = "suspicious"
        else:
            tone = "hostile"

        dialogue_templates = {
            'supportive': [
                f"{npc.npc_name}: 'I trust your judgment completely. Lead and I follow.'",
                f"{npc.npc_name}: 'Whatever you decide, I'm with you to the end.'"
            ],
            'hostile': [
                f"{npc.npc_name}: 'This is exactly what I expected from you. Disappointing.'",
                f"{npc.npc_name}: 'I'm done with this. And with you.'"
            ]
        }

        return random.choice(dialogue_templates.get(tone, [f"{npc.npc_name} remains silent."]))


# Testing
if __name__ == "__main__":
    library = ScenarioLibrary()

    print("=== THE ARCANE CODEX SCENARIOS ===\n")

    for scenario_id, scenario in library.scenarios.items():
        print(f"Scenario: {scenario.name}")
        print(f"Theme: {scenario.theme.upper()}")
        print(f"Moral Dilemma: {scenario.moral_dilemma}")
        print(f"Acts: {len(scenario.acts)}")
        print(f"NPCs: {', '.join([npc.npc_name for npc in scenario.npcs])}")
        print(f"Possible Outcomes: {len(scenario.outcomes)}")
        print(f"Variations: {len(scenario.variations)}")
        print("-" * 50 + "\n")

    # Test getting a random scenario
    random_scenario = library.get_random_scenario(exclude_themes=['betrayal'])
    print(f"Random Scenario Selected: {random_scenario.name}")

    # Show Act 1 of the Blood Price
    blood_price = library.get_scenario('blood_price')
    print(f"\n=== {blood_price.name} - Act 1 ===")
    print(blood_price.acts[0]['public'])
    print("\nWhispers:")
    for role, whisper in blood_price.acts[0]['whispers'].items():
        print(f"  {role.upper()}: {whisper[:80]}...")

    print("\n✅ Scenario library test complete!")