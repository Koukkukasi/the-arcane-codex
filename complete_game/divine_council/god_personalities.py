"""
God Personality Definitions
Behavioral patterns for all 7 gods in the Divine Council
"""

GOD_PERSONALITIES = {
    "VALDRIS": {
        "name": "Valdris",
        "domain": "Order, Law, Justice",
        "symbol": "⚖️",
        "color": "#FFD700",  # Gold
        "core_values": ["order", "law", "justice", "consistency", "oaths", "honor", "contract", "promise", "vow"],
        "opposed_to": ["chaos", "lawbreaking", "oath-breaking", "anarchy", "lying", "betray"],
        "voting_style": "principled",
        "coalition_affinity": ["KORVAN", "ATHENA"],
        "coalition_rivalry": ["KAITHA", "MORVANE"],
        "abstain_likelihood": 0.1,
        "speech_tone": "stern, formal, judicial"
    },

    "KAITHA": {
        "name": "Kaitha",
        "domain": "Chaos, Freedom, Change",
        "symbol": "🔥",
        "color": "#FF4500",  # Red-orange
        "core_values": ["freedom", "chaos", "change", "rebellion", "individuality", "rebel", "defy", "break free"],
        "opposed_to": ["tyranny", "conformity", "stagnation", "oppression", "control", "restrict"],
        "voting_style": "passionate",
        "coalition_affinity": ["MERCUS"],
        "coalition_rivalry": ["VALDRIS", "KORVAN"],
        "abstain_likelihood": 0.05,
        "speech_tone": "fiery, defiant, provocative"
    },

    "MORVANE": {
        "name": "Morvane",
        "domain": "Survival, Pragmatism, Harsh Truths",
        "symbol": "💀",
        "color": "#800080",  # Purple
        "core_values": ["survival", "pragmatism", "harsh truth", "efficiency", "sacrifice few", "practical", "necessary"],
        "opposed_to": ["idealism", "waste", "sentiment", "weakness", "naive"],
        "voting_style": "calculated",
        "coalition_affinity": ["MERCUS", "ATHENA"],
        "coalition_rivalry": ["SYLARA", "KORVAN"],
        "abstain_likelihood": 0.15,
        "speech_tone": "cold, blunt, realistic"
    },

    "SYLARA": {
        "name": "Sylara",
        "domain": "Nature, Balance, Growth",
        "symbol": "🌿",
        "color": "#228B22",  # Green
        "core_values": ["balance", "nature", "growth", "harmony", "cycles", "natural", "heal", "nurture"],
        "opposed_to": ["corruption", "destruction", "imbalance", "poison", "defile", "corrupt"],
        "voting_style": "patient",
        "coalition_affinity": ["ATHENA", "VALDRIS"],
        "coalition_rivalry": ["MORVANE", "KORVAN"],
        "abstain_likelihood": 0.25,
        "speech_tone": "calm, measured, philosophical"
    },

    "KORVAN": {
        "name": "Korvan",
        "domain": "War, Honor, Glory",
        "symbol": "⚔️",
        "color": "#DC143C",  # Crimson
        "core_values": ["honor", "courage", "strength", "glory", "combat", "fight", "brave", "warrior"],
        "opposed_to": ["cowardice", "dishonor", "weakness", "pacifism", "flee", "surrender"],
        "voting_style": "direct",
        "coalition_affinity": ["VALDRIS"],
        "coalition_rivalry": ["KAITHA", "SYLARA"],
        "abstain_likelihood": 0.08,
        "speech_tone": "fierce, commanding, martial"
    },

    "ATHENA": {
        "name": "Athena",
        "domain": "Wisdom, Knowledge, Strategy",
        "symbol": "📚",
        "color": "#4169E1",  # Blue
        "core_values": ["wisdom", "knowledge", "strategy", "learning", "truth", "think", "study", "understand"],
        "opposed_to": ["ignorance", "recklessness", "destroy knowledge", "blind", "foolish"],
        "voting_style": "analytical",
        "coalition_affinity": ["VALDRIS", "SYLARA"],
        "coalition_rivalry": ["KAITHA", "KORVAN"],
        "abstain_likelihood": 0.20,
        "speech_tone": "thoughtful, precise, scholarly"
    },

    "MERCUS": {
        "name": "Mercus",
        "domain": "Commerce, Wealth, Ambition",
        "symbol": "💰",
        "color": "#FFD700",  # Gold
        "core_values": ["commerce", "wealth", "ambition", "negotiation", "value", "profit", "trade", "deal"],
        "opposed_to": ["waste", "destroy value", "foolish deals", "charity", "give away"],
        "voting_style": "transactional",
        "coalition_affinity": ["MORVANE", "KAITHA"],
        "coalition_rivalry": ["VALDRIS", "SYLARA"],
        "abstain_likelihood": 0.12,
        "speech_tone": "shrewd, persuasive, opportunistic"
    }
}

# Alias for convenience
GODS = GOD_PERSONALITIES

# Speech templates for god personalities
SPEECH_TEMPLATES = {
    "VALDRIS": {
        "support": [
            "This action upholds the sacred order. I approve.",
            "Justice demands this course. The law must be honored.",
            "By the scales of balance, this is righteous."
        ],
        "oppose": [
            "This violates the sacred compact. I condemn it.",
            "The law is clear. This cannot stand.",
            "Order crumbles when such acts go unpunished."
        ],
        "abstain": [
            "The law is silent on this matter. I withhold judgment.",
            "Both justice and mercy have claims here. I abstain."
        ]
    },
    "KAITHA": {
        "support": [
            "Bold! Defy the chains that bind you!",
            "Freedom burns brightest in such choices. I approve!",
            "Let chaos reign! This is the path of true will!"
        ],
        "oppose": [
            "You bow to tyranny! I cannot support this cowardice!",
            "Chains accepted are chains deserved. I oppose!",
            "Where is your fire? This path leads to enslavement!"
        ],
        "abstain": [
            "Even fire must sometimes wait. I watch.",
            "The flames are uncertain here. I withhold my spark."
        ]
    },
    "MORVANE": {
        "support": [
            "Pragmatic. Necessary. I approve.",
            "Survival demands harsh choices. This is acceptable.",
            "Sentiment dies, but survival endures. Support."
        ],
        "oppose": [
            "Wasteful. Inefficient. I oppose.",
            "This serves no purpose but vanity. Condemned.",
            "Death comes for idealists first. Opposed."
        ],
        "abstain": [
            "The cost-benefit is unclear. I abstain.",
            "Neither survival nor death is certain here. I watch."
        ]
    },
    "SYLARA": {
        "support": [
            "Balance is maintained. The cycle continues. Approved.",
            "Nature's harmony guides this choice. I support.",
            "Growth springs from such decisions. Blessed."
        ],
        "oppose": [
            "This corrupts the natural order. I oppose.",
            "Balance is broken by such deeds. Condemned.",
            "The cycle is poisoned. I cannot approve."
        ],
        "abstain": [
            "Nature's judgment takes time. I wait.",
            "The seasons will reveal truth. I abstain."
        ]
    },
    "KORVAN": {
        "support": [
            "Courage! Honor! This is the warrior's way! Support!",
            "Glory awaits those who dare. I approve!",
            "Face the challenge head-on. This is strength!"
        ],
        "oppose": [
            "Cowardice wears many masks. This is one. Opposed!",
            "No honor in this path. Condemned!",
            "Weakness disguised as wisdom. I oppose!"
        ],
        "abstain": [
            "The battle is not yet joined. I wait.",
            "Honor is unclear here. I abstain from judgment."
        ]
    },
    "ATHENA": {
        "support": [
            "Wisdom guides this choice. Knowledge approves.",
            "A calculated decision, well-reasoned. I support.",
            "The path of understanding is clear. Approved."
        ],
        "oppose": [
            "Ignorance breeds such folly. I oppose.",
            "Recklessness masquerading as action. Condemned.",
            "Knowledge weeps at this choice. Opposed."
        ],
        "abstain": [
            "More information is required. I withhold judgment.",
            "Wisdom counsels patience here. I abstain."
        ]
    },
    "MERCUS": {
        "support": [
            "Profitable. A sound investment. I approve.",
            "The deal is fair, the value clear. Support.",
            "Ambition tempered by wisdom. This pays dividends."
        ],
        "oppose": [
            "Wasteful! No profit in this path! Opposed!",
            "A foolish bargain. I condemn this trade.",
            "Value destroyed for nothing. I oppose."
        ],
        "abstain": [
            "The ledger is unclear. I wait to see the balance.",
            "Neither profit nor loss is certain. I abstain."
        ]
    }
}
