"""
The Arcane Codex - Divine Interrogation Frames
Contains themed question frames for all 8 divine gods
Used during character creation to determine player alignment and deity affinity
"""

# ========== VALDRIS - ORDER & JUSTICE ==========

VALDRIS_FRAME = """
╔═══════════════════════════════════════════════════════╗
║         ⚖️ THE SCALES OF VALDRIS WEIGH YOU ⚖️         ║
╠═══════════════════════════════════════════════════════╣
║                                                        ║
║  Question: {question}                                 ║
║                                                        ║
╠═══════════════════════════════════════════════════════╣
║  ╔═══════════════════════════════════════════════╗   ║
║  ║ A) {choice_a}                                 ║   ║
║  ╚═══════════════════════════════════════════════╝   ║
║  ╔═══════════════════════════════════════════════╗   ║
║  ║ B) {choice_b}                                 ║   ║
║  ╚═══════════════════════════════════════════════╝   ║
║  ╔═══════════════════════════════════════════════╗   ║
║  ║ C) {choice_c}                                 ║   ║
║  ╚═══════════════════════════════════════════════╝   ║
║  ╔═══════════════════════════════════════════════╗   ║
║  ║ D) {choice_d}                                 ║   ║
║  ╚═══════════════════════════════════════════════╝   ║
╚═══════════════════════════════════════════════════════╝
"""

# ========== KAITHA - CHAOS & FREEDOM ==========

KAITHA_FRAME = """
╔◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣╗
║    🔥 KAITHA'S WILD FLAME TESTS YOUR SPIRIT 🔥      ║
╠◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤╣
║                                                        ║
║  Question: {question}                                 ║
║                                                        ║
╠══◢◣══◢◣══◢◣══◢◣══◢◣══◢◣══◢◣══◢◣══◢◣══◢◣══╣
║  ╱◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢╲    ║
║  ▌ A) {choice_a}                           ▐    ║
║  ╲◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥╱    ║
║  ╱◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢╲    ║
║  ▌ B) {choice_b}                           ▐    ║
║  ╲◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥╱    ║
║  ╱◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢╲    ║
║  ▌ C) {choice_c}                           ▐    ║
║  ╲◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥╱    ║
║  ╱◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢╲    ║
║  ▌ D) {choice_d}                           ▐    ║
║  ╲◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥╱    ║
╚◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣╝
"""

# ========== MORVANE - DEATH & SURVIVAL ==========

MORVANE_FRAME = """
╔═════════════════════════════════════════════════════════╗
║      💀 MORVANE SEES YOUR INEVITABLE END 💀           ║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║                                                         ║
║  Question: {question}                                  ║
║                                                         ║
║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║
║  ┌─────────────────────────────────────────────┐      ║
║  │ A) {choice_a}                               │      ║
║  └─────────────────────────────────────────────┘      ║
║  ┌─────────────────────────────────────────────┐      ║
║  │ B) {choice_b}                               │      ║
║  └─────────────────────────────────────────────┘      ║
║  ┌─────────────────────────────────────────────┐      ║
║  │ C) {choice_c}                               │      ║
║  └─────────────────────────────────────────────┘      ║
║  ┌─────────────────────────────────────────────┐      ║
║  │ D) {choice_d}                               │      ║
║  └─────────────────────────────────────────────┘      ║
╚═════════════════════════════════════════════════════════╝
"""

# ========== SYLARA - NATURE & BALANCE ==========

SYLARA_FRAME = """
╔═════════════════════════════════════════════════════════╗
║      🌿 SYLARA'S ROOTS SEEK YOUR TRUE NATURE 🌿       ║
╠═════════════════════════════════════════════════════════╣
║  ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ║
║ ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲   ║
║                                                         ║
║  Question: {question}                                  ║
║                                                         ║
╠═════════════════════════════════════════════════════════╣
║  ╔═══════════════════════════════════════════════╗    ║
║  ║🍃 A) {choice_a}                               ║    ║
║  ╚═══════════════════════════════════════════════╝    ║
║  ╔═══════════════════════════════════════════════╗    ║
║  ║🌱 B) {choice_b}                               ║    ║
║  ╚═══════════════════════════════════════════════╝    ║
║  ╔═══════════════════════════════════════════════╗    ║
║  ║🌿 C) {choice_c}                               ║    ║
║  ╚═══════════════════════════════════════════════╝    ║
║  ╔═══════════════════════════════════════════════╗    ║
║  ║🏗️ D) {choice_d}                               ║    ║
║  ╚═══════════════════════════════════════════════╝    ║
║ ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱║
╚═════════════════════════════════════════════════════════╝
"""

# ========== KORVAN - WAR & HONOR ==========

KORVAN_FRAME = """
╔═════════════════════════════════════════════════════════╗
║        ⚔️ KORVAN TESTS YOUR WARRIOR SPIRIT ⚔️          ║
╠═════════════════════════════════════════════════════════╣
║  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲  ╱╲ ║
║ ████████████████████████████████████████████████████  ║
║                                                         ║
║  Question: {question}                                  ║
║                                                         ║
╠═════════════════════════════════════════════════════════╣
║  ╔═[⚔️]═══════════════════════════════════[⚔️]═╗      ║
║  ║    A) {choice_a}                            ║      ║
║  ╚═[⚔️]═══════════════════════════════════[⚔️]═╝      ║
║  ╔═[🛡️]═══════════════════════════════════[🛡️]═╗      ║
║  ║    B) {choice_b}                            ║      ║
║  ╚═[🛡️]═══════════════════════════════════[🛡️]═╝      ║
║  ╔═[⚔️]═══════════════════════════════════[⚔️]═╗      ║
║  ║    C) {choice_c}                            ║      ║
║  ╚═[⚔️]═══════════════════════════════════[⚔️]═╝      ║
║  ╔═[🕊️]═══════════════════════════════════[🕊️]═╗      ║
║  ║    D) {choice_d}                            ║      ║
║  ╚═[🕊️]═══════════════════════════════════[🕊️]═╝      ║
╚═════════════════════════════════════════════════════════╝
"""

# ========== ATHENA - WISDOM & KNOWLEDGE ==========

ATHENA_FRAME = """
╔═════════════════════════════════════════════════════════╗
║       📚 ATHENA EXAMINES YOUR INTELLECT 📚            ║
╠═════════════════════════════════════════════════════════╣
║     ◊       ◊       ◊       ◊       ◊       ◊         ║
║    ╱│╲     ╱│╲     ╱│╲     ╱│╲     ╱│╲     ╱│╲       ║
║                                                         ║
║  Question: {question}                                  ║
║                                                         ║
╠═════════════════════════════════════════════════════════╣
║  ╔─────────────────────────────────────────────╗      ║
║  ║ 🔍 A) {choice_a}                            ║      ║
║  ╚─────────────────────────────────────────────╝      ║
║  ╔─────────────────────────────────────────────╗      ║
║  ║ 📖 B) {choice_b}                            ║      ║
║  ╚─────────────────────────────────────────────╝      ║
║  ╔─────────────────────────────────────────────╗      ║
║  ║ 🔒 C) {choice_c}                            ║      ║
║  ╚─────────────────────────────────────────────╝      ║
║  ╔─────────────────────────────────────────────╗      ║
║  ║ 🙈 D) {choice_d}                            ║      ║
║  ╚─────────────────────────────────────────────╝      ║
║  ═══════════════════════════════════════════════════  ║
╚═════════════════════════════════════════════════════════╝
"""

# ========== MERCUS - COMMERCE & WEALTH ==========

MERCUS_FRAME = """
╔═════════════════════════════════════════════════════════╗
║       💰 MERCUS WEIGHS YOUR AMBITION 💰               ║
╠═════════════════════════════════════════════════════════╣
║  ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤   ║
║  $ € £ ¥ $ € £ ¥ $ € £ ¥ $ € £ ¥ $ € £ ¥ $ € £     ║
║                                                         ║
║  Question: {question}                                  ║
║                                                         ║
╠═════════════════════════════════════════════════════════╣
║  ╔═$═════════════════════════════════════$═╗         ║
║  ║    A) {choice_a}                        ║         ║
║  ╚═$═════════════════════════════════════$═╝         ║
║  ╔═€═════════════════════════════════════€═╗         ║
║  ║    B) {choice_b}                        ║         ║
║  ╚═€═════════════════════════════════════€═╝         ║
║  ╔═£═════════════════════════════════════£═╗         ║
║  ║    C) {choice_c}                        ║         ║
║  ╚═£═════════════════════════════════════£═╝         ║
║  ╔═¥═════════════════════════════════════¥═╗         ║
║  ║    D) {choice_d}                        ║         ║
║  ╚═¥═════════════════════════════════════¥═╝         ║
║  ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤ ¤   ║
╚═════════════════════════════════════════════════════════╝
"""

# ========== DRAKMOR - FREEDOM & FURY ==========

DRAKMOR_FRAME = """
╔═════════════════════════════════════════════════════════╗
║       🐉 DRAKMOR'S RAGE BURNS WITHIN YOU 🐉           ║
╠═════════════════════════════════════════════════════════╣
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║
║  ████████████████████████████████████████████████████  ║
║                                                         ║
║  Question: {question}                                  ║
║                                                         ║
╠═════════════════════════════════════════════════════════╣
║  ╔═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═╗            ║
║  ║ 🔥 A) {choice_a}                      ║            ║
║  ╚═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═╝            ║
║  ╔═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═╗            ║
║  ║ ⚡ B) {choice_b}                      ║            ║
║  ╚═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═╝            ║
║  ╔═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═╗            ║
║  ║ 🗡️ C) {choice_c}                      ║            ║
║  ╚═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═▓═╝            ║
║  ╔═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═╗            ║
║  ║ 🕊️ D) {choice_d}                      ║            ║
║  ╚═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═█═╝            ║
╚═════════════════════════════════════════════════════════╝
"""

# ========== DIVINE FRAME METADATA ==========

DIVINE_FRAME_METADATA = {
    'valdris': {
        'name': 'Valdris - Order & Justice',
        'frame': VALDRIS_FRAME,
        'colors': {
            'primary': '#2563EB',  # Royal blue
            'secondary': '#C0C0C0'  # Silver
        },
        'theme': 'Order vs Chaos, Law vs Freedom',
        'animation': 'Scales tip with each choice hover',
        'domain': 'Order, Justice, Law'
    },
    'kaitha': {
        'name': 'Kaitha - Chaos & Freedom',
        'frame': KAITHA_FRAME,
        'colors': {
            'primary': '#F59E0B',  # Chaos orange
            'secondary': '#EF4444'  # Flame red
        },
        'theme': 'Freedom vs Control, Chaos vs Order',
        'animation': 'Border flames flicker, choices shake slightly',
        'domain': 'Chaos, Freedom, Rebellion'
    },
    'morvane': {
        'name': 'Morvane - Death & Survival',
        'frame': MORVANE_FRAME,
        'colors': {
            'primary': '#7C3AED',  # Death purple
            'secondary': '#FAF5FF'  # Bone white
        },
        'theme': 'Life vs Death, Survival vs Sacrifice',
        'animation': 'Skull eyes glow, shadow creep effect',
        'domain': 'Death, Survival, Mortality'
    },
    'sylara': {
        'name': 'Sylara - Nature & Balance',
        'frame': SYLARA_FRAME,
        'colors': {
            'primary': '#059669',  # Nature green
            'secondary': '#78350F'  # Earth brown
        },
        'theme': 'Nature vs Civilization, Balance vs Progress',
        'animation': 'Leaves float across, vines grow',
        'domain': 'Nature, Balance, Harmony'
    },
    'korvan': {
        'name': 'Korvan - War & Honor',
        'frame': KORVAN_FRAME,
        'colors': {
            'primary': '#DC2626',  # War red
            'secondary': '#6B7280'  # Steel gray
        },
        'theme': 'Honor vs Victory, Combat vs Peace',
        'animation': 'Sword clash sparks, battle drum beat',
        'domain': 'War, Honor, Combat'
    },
    'athena': {
        'name': 'Athena - Wisdom & Knowledge',
        'frame': ATHENA_FRAME,
        'colors': {
            'primary': '#2563EB',  # Wisdom blue
            'secondary': '#FEF3C7'  # Parchment
        },
        'theme': 'Knowledge vs Ignorance, Truth vs Secrets',
        'animation': 'Book pages turn, eye blinks',
        'domain': 'Wisdom, Knowledge, Truth'
    },
    'mercus': {
        'name': 'Mercus - Commerce & Wealth',
        'frame': MERCUS_FRAME,
        'colors': {
            'primary': '#D4AF37',  # Gold
            'secondary': '#065F46'  # Emerald
        },
        'theme': 'Wealth vs Morality, Profit vs Ethics',
        'animation': 'Coins flip, scales balance',
        'domain': 'Commerce, Wealth, Trade'
    },
    'drakmor': {
        'name': 'Drakmor - Freedom & Fury',
        'frame': DRAKMOR_FRAME,
        'colors': {
            'primary': '#991B1B',  # Dragon crimson
            'secondary': '#EA580C'  # Fury orange
        },
        'theme': 'Freedom vs Tyranny, Revolution vs Order',
        'animation': 'Fire breath effect, dragon roar vibration',
        'domain': 'Freedom, Fury, Revolution'
    }
}

def get_divine_frame(god_name):
    """Get the interrogation frame for a specific god"""
    god_name = god_name.lower()
    if god_name in DIVINE_FRAME_METADATA:
        return DIVINE_FRAME_METADATA[god_name]['frame']
    return None

def render_divine_question(god_name, question, choice_a, choice_b, choice_c, choice_d):
    """Render a complete divine interrogation with question and choices"""
    frame = get_divine_frame(god_name)
    if not frame:
        return None

    # Replace placeholders with actual content
    rendered = frame.format(
        question=question,
        choice_a=choice_a,
        choice_b=choice_b,
        choice_c=choice_c,
        choice_d=choice_d
    )
    return rendered

def get_divine_colors(god_name):
    """Get color scheme for a specific god"""
    god_name = god_name.lower()
    if god_name in DIVINE_FRAME_METADATA:
        return DIVINE_FRAME_METADATA[god_name]['colors']
    return None

def get_divine_metadata(god_name):
    """Get full metadata for a specific god"""
    god_name = god_name.lower()
    return DIVINE_FRAME_METADATA.get(god_name)

def get_all_gods():
    """Get list of all divine gods"""
    return list(DIVINE_FRAME_METADATA.keys())

def get_god_by_domain(domain):
    """Find gods associated with a specific domain"""
    domain = domain.lower()
    matching_gods = []
    for god_name, data in DIVINE_FRAME_METADATA.items():
        if domain in data['domain'].lower():
            matching_gods.append(god_name)
    return matching_gods
