#!/usr/bin/env python3
"""
Turn Timer System
Gives each player a countdown timer for their action
Creates tension and prevents analysis paralysis
"""

import time
import threading
from colors import colorize, Colors, GameColors


class TurnTimer:
    """Manages turn timers for individual players"""

    def __init__(self, duration_seconds=60):
        self.duration = duration_seconds
        self.start_time = None
        self.running = False
        self.thread = None
        self.action_submitted = False

    def start(self):
        """Start the countdown timer"""
        self.start_time = time.time()
        self.running = True
        self.action_submitted = False
        self.thread = threading.Thread(target=self._countdown_display, daemon=True)
        self.thread.start()

    def stop(self):
        """Stop the timer"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=1)

    def submit_action(self):
        """Mark action as submitted"""
        self.action_submitted = True
        self.stop()

    def time_remaining(self):
        """Get seconds remaining"""
        if not self.start_time:
            return self.duration

        elapsed = time.time() - self.start_time
        remaining = self.duration - elapsed
        return max(0, remaining)

    def is_expired(self):
        """Check if timer has expired"""
        return self.time_remaining() <= 0

    def _countdown_display(self):
        """Display countdown in terminal (runs in background thread)"""
        while self.running and not self.action_submitted:
            remaining = int(self.time_remaining())

            if remaining <= 0:
                print(f"\r{colorize('⏰ TIME EXPIRED! Auto-passing turn...', Colors.BRIGHT_RED)}", end='', flush=True)
                self.running = False
                break

            # Color based on time remaining
            if remaining > 30:
                color = Colors.GREEN
            elif remaining > 10:
                color = Colors.YELLOW
            else:
                color = Colors.RED

            # Progress bar
            progress = remaining / self.duration
            bar_width = 20
            filled = int(progress * bar_width)
            empty = bar_width - filled
            bar = "[" + "█" * filled + "░" * empty + "]"

            timer_text = f"⏱️  {bar} {remaining}s remaining"
            print(f"\r{colorize(timer_text, color)}", end='', flush=True)

            time.sleep(1)

        # Clear the timer line
        print("\r" + " " * 80 + "\r", end='', flush=True)


class PartyTimer:
    """Manages timers for entire party (multiplayer)"""

    def __init__(self, player_names, duration_seconds=60):
        self.player_names = player_names
        self.duration = duration_seconds
        self.timers = {name: TurnTimer(duration_seconds) for name in player_names}
        self.actions_submitted = {name: False for name in player_names}
        self.start_time = None

    def start_turn(self):
        """Start timers for all players"""
        self.start_time = time.time()
        for timer in self.timers.values():
            timer.start()

    def submit_action(self, player_name):
        """Record that a player submitted their action"""
        if player_name in self.timers:
            self.timers[player_name].submit_action()
            self.actions_submitted[player_name] = True

    def all_submitted(self):
        """Check if all players have submitted"""
        return all(self.actions_submitted.values())

    def get_status(self):
        """Get status of all players"""
        status = {}
        for name in self.player_names:
            status[name] = {
                'submitted': self.actions_submitted[name],
                'time_remaining': self.timers[name].time_remaining()
            }
        return status

    def display_party_status(self):
        """Display all players' timer status"""
        print("\n" + colorize("━" * 60, GameColors.DIVIDER))
        print(colorize("PARTY ACTION STATUS:", Colors.BOLD))
        print(colorize("━" * 60, GameColors.DIVIDER))

        for name in self.player_names:
            remaining = int(self.timers[name].time_remaining())
            submitted = self.actions_submitted[name]

            if submitted:
                status_text = colorize("✅ SUBMITTED", Colors.GREEN)
            elif remaining <= 0:
                status_text = colorize("⏰ EXPIRED", Colors.RED)
            else:
                # Progress bar
                progress = remaining / self.duration
                bar_width = 15
                filled = int(progress * bar_width)
                empty = bar_width - filled
                bar = "[" + "█" * filled + "░" * empty + "]"

                color = Colors.GREEN if remaining > 30 else Colors.YELLOW if remaining > 10 else Colors.RED
                status_text = colorize(f"{bar} {remaining}s", color)

            print(f"  {name:20} {status_text}")

        print(colorize("━" * 60, GameColors.DIVIDER))

    def wait_for_all(self, check_interval=1):
        """Block until all players submit or time expires"""
        while not self.all_submitted():
            time.sleep(check_interval)
            self.display_party_status()

            # Check if all timers expired
            if all(timer.is_expired() for timer in self.timers.values()):
                break

        print(colorize("\n✅ All players ready! Resolving turn...\n", Colors.BRIGHT_GREEN))


# Example usage
if __name__ == "__main__":
    print("\n" + colorize("=" * 60, Colors.BOLD))
    print(colorize("TURN TIMER SYSTEM TEST", Colors.BOLD))
    print(colorize("=" * 60, Colors.BOLD) + "\n")

    # Test 1: Single player timer
    print(colorize("TEST 1: Single Player Timer (10 seconds)", Colors.CYAN))
    timer = TurnTimer(duration_seconds=10)
    timer.start()

    print("\nWaiting 5 seconds, then submitting action...")
    time.sleep(5)
    timer.submit_action()
    print(colorize("\n✅ Action submitted! Timer stopped.\n", Colors.GREEN))

    time.sleep(2)

    # Test 2: Party timer
    print(colorize("\nTEST 2: Party Timer (15 seconds)", Colors.CYAN))
    party = PartyTimer(["Theron", "Lyra", "Ash"], duration_seconds=15)
    party.start_turn()

    # Simulate players submitting at different times
    print("\nSimulating player submissions...")

    time.sleep(3)
    party.submit_action("Theron")
    print(colorize("Theron submitted action!", Colors.GREEN))

    time.sleep(4)
    party.submit_action("Lyra")
    print(colorize("Lyra submitted action!", Colors.GREEN))

    time.sleep(2)
    party.submit_action("Ash")
    print(colorize("Ash submitted action!", Colors.GREEN))

    party.display_party_status()

    print(colorize("\n✅ All tests complete!", Colors.BRIGHT_GREEN))
