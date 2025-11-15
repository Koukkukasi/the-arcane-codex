"""
The Arcane Codex - ASCII Art Rendering System
Dynamic renderer for all ASCII art with colors and animations
"""

import re
import os

# Import all ASCII art modules
from ascii_classes import get_class_ascii, get_class_colors, CLASS_METADATA
from ascii_enemies import get_enemy_ascii, get_enemy_colors, get_enemy_threat_level, ENEMY_METADATA
from ascii_status_effects import get_status_effect_ascii, get_status_effect_color, STATUS_EFFECT_METADATA
from ascii_items import get_item_ascii, get_item_metadata, get_rarity_border, get_rarity_color, ITEM_METADATA
from ascii_locations import get_location_frame, get_location_element, get_location_colors, LOCATION_METADATA
from ascii_abilities import get_ability_ascii, get_ability_metadata, get_abilities_by_class, ABILITY_METADATA
from ascii_divine_frames import get_divine_frame, render_divine_question, get_divine_colors, DIVINE_FRAME_METADATA

# Path to the complete ASCII art library
OPUS_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), 'OPUS_CREATIVE_OUTPUT.md')

def extract_ascii_from_section(section_name, subsection_name=None):
    """
    Extract ASCII art from OPUS_CREATIVE_OUTPUT.md

    Args:
        section_name: Main section (e.g., "CHARACTER CLASS SYMBOLS")
        subsection_name: Optional subsection (e.g., "FIGHTER")

    Returns:
        str: The ASCII art, or None if not found
    """
    try:
        with open(OPUS_OUTPUT_PATH, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the section
        section_pattern = f"##.*{section_name}"
        section_match = re.search(section_pattern, content, re.IGNORECASE)

        if not section_match:
            return None

        # Get content after section header
        section_start = section_match.end()

        # If subsection specified, find it
        if subsection_name:
            subsection_pattern = f"###.*{subsection_name}"
            subsection_match = re.search(subsection_pattern, content[section_start:], re.IGNORECASE)
            if not subsection_match:
                return None
            subsection_start = section_start + subsection_match.end()
        else:
            subsection_start = section_start

        # Find the code block (between triple backticks)
        code_block_pattern = r'```\n(.*?)\n```'
        code_match = re.search(code_block_pattern, content[subsection_start:subsection_start+2000], re.DOTALL)

        if code_match:
            return code_match.group(1)

        return None

    except FileNotFoundError:
        return None

def apply_color_to_ascii(ascii_art, color_hex):
    """
    Apply ANSI color code to ASCII art for terminal display

    Args:
        ascii_art: The ASCII art string
        color_hex: Hex color code (e.g., "#FF0000")

    Returns:
        str: Colored ASCII art with ANSI codes
    """
    # Convert hex to RGB
    color_hex = color_hex.lstrip('#')
    r, g, b = tuple(int(color_hex[i:i+2], 16) for i in (0, 2, 4))

    # ANSI 24-bit color code
    ansi_color = f"\033[38;2;{r};{g};{b}m"
    ansi_reset = "\033[0m"

    return f"{ansi_color}{ascii_art}{ansi_reset}"

def render_class_symbol(class_name, colored=False):
    """Render a character class symbol"""
    ascii_art = get_class_ascii(class_name)
    if not ascii_art:
        return None

    if colored:
        colors = get_class_colors(class_name)
        if colors:
            return apply_color_to_ascii(ascii_art, colors['primary'])

    return ascii_art

def render_enemy_symbol(enemy_type, colored=False):
    """Render an enemy type symbol"""
    ascii_art = get_enemy_ascii(enemy_type)
    if not ascii_art:
        return None

    if colored:
        colors = get_enemy_colors(enemy_type)
        if colors:
            return apply_color_to_ascii(ascii_art, colors['primary'])

    return ascii_art

def render_status_effect(effect_name, colored=False):
    """Render a status effect badge"""
    ascii_art = get_status_effect_ascii(effect_name)
    if not ascii_art:
        return None

    if colored:
        color = get_status_effect_color(effect_name)
        return apply_color_to_ascii(ascii_art, color)

    return ascii_art

def render_item(item_name, rarity=None, show_border=True):
    """
    Render an item with optional rarity border

    Args:
        item_name: Name of the item (e.g., "Iron Sword", "Health Potion")
        rarity: Rarity tier ("common", "uncommon", "rare", "epic", "legendary", "divine")
        show_border: Whether to show the rarity border
    """
    # Get item ASCII from items module
    ascii_art = get_item_ascii(item_name)

    if not ascii_art:
        # Fallback: try extracting from OPUS output
        ascii_art = extract_ascii_from_section("ITEMS & EQUIPMENT ART", item_name)

    if not ascii_art:
        return None

    # Add rarity border if specified
    if rarity and show_border:
        border = get_rarity_border(rarity)
        if border:
            # Combine item with border
            return f"{border}\n{ascii_art}"

    return ascii_art

def render_location_frame(location_name, content=""):
    """Render a location environment frame with optional content"""
    # Get location frame from locations module
    frame = get_location_frame(location_name)

    if not frame:
        # Fallback: try extracting from OPUS output
        location_map = {
            'forest': 'Forest - The Whispering Woods',
            'dungeon': 'Dungeon - The Forgotten Depths',
            'town': 'Town - The Bustling Square',
            'castle': 'Castle - The Seat of Power',
            'temple': 'Temple - The Sacred Threshold'
        }
        full_name = location_map.get(location_name.lower(), location_name)
        frame = extract_ascii_from_section("LOCATION ENVIRONMENT ART", full_name)

    if not frame:
        return None

    # Replace placeholder with content if provided
    if content and '[' in frame:
        frame = frame.replace('[SCENE CONTENT HERE]', content) \
                    .replace('[DUNGEON CONTENT HERE]', content) \
                    .replace('[TOWN CONTENT HERE]', content) \
                    .replace('[CASTLE CONTENT HERE]', content) \
                    .replace('[TEMPLE CONTENT HERE]', content)

    return frame

def render_ability_icon(ability_name, colored=False):
    """Render a class ability icon"""
    # Get ability ASCII from abilities module
    ascii_art = get_ability_ascii(ability_name)

    if not ascii_art:
        # Fallback: try extracting from OPUS output
        ascii_art = extract_ascii_from_section("CLASS ABILITIES & SKILLS ICONS", ability_name)

    if not ascii_art:
        return None

    if colored:
        metadata = get_ability_metadata(ability_name)
        if metadata and 'color' in metadata:
            return apply_color_to_ascii(ascii_art, metadata['color'])

    return ascii_art

def render_divine_frame(god_name):
    """Render a divine interrogation frame for a specific god (use render_divine_question for full rendering)"""
    # Use the new divine frames module
    return get_divine_frame(god_name)

# God color schemes
GOD_COLORS = {
    'valdris': {'primary': '#2563EB', 'name': 'Order & Justice'},
    'kaitha': {'primary': '#F59E0B', 'name': 'Chaos & Freedom'},
    'morvane': {'primary': '#7C3AED', 'name': 'Death & Survival'},
    'sylara': {'primary': '#059669', 'name': 'Nature & Balance'},
    'korvan': {'primary': '#DC2626', 'name': 'War & Honor'},
    'athena': {'primary': '#2563EB', 'name': 'Wisdom & Knowledge'},
    'mercus': {'primary': '#D4AF37', 'name': 'Commerce & Wealth'},
    'drakmor': {'primary': '#991B1B', 'name': 'Freedom & Fury'}
}

# Rarity color schemes
RARITY_COLORS = {
    'common': '#9CA3AF',
    'uncommon': '#10B981',
    'rare': '#3B82F6',
    'epic': '#A855F7',
    'legendary': '#F97316',
    'divine': '#D4AF37'
}

def get_color_for_god(god_name):
    """Get the primary color for a god"""
    return GOD_COLORS.get(god_name.lower(), {}).get('primary', '#FFFFFF')

def get_color_for_rarity(rarity):
    """Get the color for an item rarity"""
    return RARITY_COLORS.get(rarity.lower(), '#FFFFFF')

# Quick access functions for web integration
def render_for_html(ascii_art, color=None, css_class=None):
    """
    Render ASCII art for HTML display with optional coloring

    Args:
        ascii_art: The ASCII art string
        color: Optional hex color
        css_class: Optional CSS class to apply

    Returns:
        str: HTML-formatted ASCII art
    """
    if not ascii_art:
        return ""

    # Escape HTML and preserve whitespace
    from html import escape
    escaped = escape(ascii_art)

    style = f'color: {color};' if color else ''
    class_attr = f'class="{css_class}"' if css_class else ''

    return f'<pre {class_attr} style="{style} font-family: monospace; line-height: 1.2;">{escaped}</pre>'
