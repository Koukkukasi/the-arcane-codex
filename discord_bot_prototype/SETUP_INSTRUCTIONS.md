# DISCORD BOT SETUP INSTRUCTIONS
**Get The Arcane Codex Running in 10 Minutes**

---

## 📋 PREREQUISITES

✅ Python 3.8+ installed
✅ Discord account
✅ A Discord server where you have admin permissions (or create one)

---

## 🤖 STEP 1: CREATE DISCORD BOT

### 1.1 Go to Discord Developer Portal
https://discord.com/developers/applications

### 1.2 Click "New Application"
- Name: `The Arcane Codex`
- Click "Create"

### 1.3 Go to "Bot" Tab (Left Sidebar)
- Click "Add Bot"
- Click "Yes, do it!"

### 1.4 Get Your Bot Token
- Under "Token" section, click "Reset Token"
- Click "Copy" (SAVE THIS - you'll need it!)
- ⚠️ **NEVER share this token publicly!**

### 1.5 Enable Required Intents
Scroll down to "Privileged Gateway Intents":
- ✅ Enable "MESSAGE CONTENT INTENT"
- ✅ Enable "SERVER MEMBERS INTENT"
- Click "Save Changes"

---

## 🔗 STEP 2: INVITE BOT TO YOUR SERVER

### 2.1 Go to "OAuth2" → "URL Generator" (Left Sidebar)

### 2.2 Select Scopes:
- ✅ `bot`
- ✅ `applications.commands`

### 2.3 Select Bot Permissions:
- ✅ Send Messages
- ✅ Send Messages in Threads
- ✅ Manage Messages
- ✅ Embed Links
- ✅ Read Message History
- ✅ Add Reactions
- ✅ Use Slash Commands

### 2.4 Copy the Generated URL
- Scroll down, copy the URL at bottom
- Paste in browser
- Select your server
- Click "Authorize"

**✅ Bot should now appear in your server (offline)**

---

## 💻 STEP 3: INSTALL DEPENDENCIES

Open terminal/command prompt in `discord_bot_prototype` folder:

```bash
cd C:\Users\ilmiv\ProjectArgent\discord_bot_prototype

# Install required packages
pip install discord.py anthropic
```

---

## 🔑 STEP 4: ADD YOUR BOT TOKEN

### 4.1 Open `discord_bot.py` in text editor

### 4.2 Find this line at the bottom (around line 384):
```python
TOKEN = "YOUR_DISCORD_BOT_TOKEN_HERE"
```

### 4.3 Replace with your actual token:
```python
TOKEN = "MTE5NzYxODM0NTY3ODkwMTIzNA.GxYz_A.abc123..."
```

### 4.4 Save the file

---

## 🚀 STEP 5: RUN THE BOT

```bash
python discord_bot.py
```

**You should see:**
```
🤖 The Arcane Codex#1234 is online!
Ready to run The Arcane Codex!
```

**In Discord, your bot should now show as ONLINE (green dot)** ✅

---

## 🎮 STEP 6: TEST THE BOT

### In your Discord server, type:

```
!help_game
```

**Bot should respond with command list!**

### Start a test game:

```
!start
```

### Join as a character:

```
!join Theron Fighter
```

**Bot should:**
1. Send public message: "✅ Theron the Fighter has joined!"
2. Send you a PRIVATE DM with your character sheet

**⚠️ If you don't get a DM:**
- Go to Server Settings → Privacy Settings
- Enable "Allow direct messages from server members"

### Begin the adventure:

```
!begin
```

**Bot should:**
1. Send public opening scene
2. Send ASYMMETRIC WHISPERS to each player via DM

### Submit an action:

```
!action I flip the table for cover
```

---

## 🧪 TESTING ASYMMETRIC WHISPERS

### Test with 3 players (you can use 3 accounts or test with friends):

**Player 1:** `!join Theron Fighter`
**Player 2:** `!join Lyra Mage`
**Player 3:** `!join Ash Thief`

**Party Leader:** `!begin`

**Check DMs for each character:**
- **Theron** sees combat tactics
- **Lyra** sees magic secrets
- **Ash** sees that Grimsby is lying + hidden escape routes

**Each player gets DIFFERENT information!** 🎉

---

## 🐛 TROUBLESHOOTING

### Bot doesn't respond:
- Check token is correct
- Check bot is ONLINE in Discord
- Check bot has permissions in channel
- Check MESSAGE CONTENT INTENT is enabled

### Bot can't send DMs:
- Check your Privacy Settings
- Server Settings → Privacy Settings
- Enable "Allow direct messages from server members"

### Bot shows offline:
- Check Python script is running
- Check token hasn't expired
- Check internet connection

### Import errors:
```bash
pip install --upgrade discord.py anthropic
```

---

## 📝 AVAILABLE COMMANDS

```
!help_game - Show all commands
!start - Start new game (party leader)
!join <name> <class> - Join party
!begin - Begin adventure (party leader)
!action <what you do> - Submit your action
!whisper @player <message> - Secret message to party member
!party - Show party status
!end - End game (party leader)
```

---

## 🎯 EXAMPLE GAME SESSION

```
You: !start
Bot: Game starting! Use !join to add players.

You: !join Theron Fighter
Bot: ✅ Theron the Fighter has joined!
Bot DM: [Character sheet with skills]

Friend1: !join Lyra Mage
Bot: ✅ Lyra the Mage has joined!

Friend2: !join Ash Thief
Bot: ✅ Ash the Thief has joined!

You: !begin
Bot: [Opening scene - The Soggy Boot tavern]
Bot DM to each player: [DIFFERENT private information!]

You: !action I flip the table for cover
Friend1: !action I grab the oil lamp
Friend2: !action I pick the back door lock

Bot: ⏳ The Chronicler is weaving your fates...
Bot: [Shows all 3 actions publicly]
Bot: [Narrates what happens]
Bot DM: [New asymmetric whispers for next turn]
```

---

## 🔒 SECURITY BEST PRACTICES

### Never commit your token to Git:

Create `.gitignore`:
```
config.json
*.pyc
__pycache__/
.env
```

### Use environment variables (optional but recommended):

```python
import os

TOKEN = os.environ.get('DISCORD_BOT_TOKEN')
```

Then run:
```bash
set DISCORD_BOT_TOKEN=your_token_here
python discord_bot.py
```

---

## 🚀 NEXT STEPS

Once basic bot works:

1. **Add Claude API** for AI-generated responses
2. **Connect to terminal_prototype/game.py** logic
3. **Implement Divine Interrogation** character creation
4. **Add Divine Council** voting system
5. **Implement 4 Revolutionary Dimensions**

---

## 📚 RESOURCES

- Discord.py Documentation: https://discordpy.readthedocs.io/
- Discord Developer Portal: https://discord.com/developers/docs
- Anthropic Claude API: https://docs.anthropic.com/

---

**Status:** ✅ Setup guide complete
**Time to deploy:** ~10 minutes
**Ready for:** Local testing and development
