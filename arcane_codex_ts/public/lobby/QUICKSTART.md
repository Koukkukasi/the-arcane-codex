# Multiplayer Lobby Quick Start

## Accessing the Lobby

Open your browser to:
```
http://localhost:5000/lobby/
```

## Creating a Party

1. Enter a party name in the "Party Name" field
2. Select max players (2-6) from the dropdown
3. Check "Public Party" if you want it listed publicly
4. Click "CREATE PARTY"
5. Share the 6-digit party code with friends

## Joining a Party

### By Code
1. Enter the 6-digit party code
2. Click "JOIN PARTY"

### From Public List
1. Click "BROWSE PUBLIC PARTIES"
2. Click on any party to join

## In the Lobby

### Select Your Role
Click on one of the role cards:
- **Warrior** - Tank and melee damage
- **Mage** - Arcane spellcaster
- **Rogue** - Stealth and precision
- **Healer** - Support and restoration

### Use Chat
- Type messages in the chat input
- Press Enter or click "Send"
- See system messages for player events

### Ready Up
- Click "READY" when you're ready to start
- As host, click "START GAME" once everyone is ready

## Starting the Game

1. All players must mark themselves as ready
2. Host clicks "START GAME"
3. Game session is created
4. All players are redirected to the game

## Connection Status

Watch the status indicator:
- 🟢 **CONNECTED** - You're connected to the server
- 🟡 **CONNECTING** - Attempting to connect
- 🔴 **DISCONNECTED** - Connection lost

## Player List

The player list shows:
- Player names
- **[HOST]** badge for party host
- **[YOU]** badge for yourself
- **[OFFLINE]** for disconnected players
- ✓ Ready status
- ○ Not ready status

## Features

### Auto-save Identity
Your player ID and name are saved automatically in your browser.

### Auto-reconnect
If disconnected, you'll automatically rejoin your party when connection is restored.

### Host Transfer
If the host leaves, the next player becomes host automatically.

## Keyboard Shortcuts

- **Enter** in chat input → Send message
- **Enter** in party code input → Join party

## Tips

1. **Party Codes**: Use uppercase letters and numbers only (I, O, 0, 1 excluded for clarity)
2. **Chat Limit**: Messages are limited to 200 characters
3. **Ready Status**: You can toggle ready status on/off before starting
4. **Public Parties**: Only public parties appear in the browse list
5. **Auto-cleanup**: Inactive parties are cleaned up after 2 hours

## Troubleshooting

### Can't connect to server
- Check that the server is running
- Verify you're using the correct URL
- Check browser console for errors

### Can't join party
- Verify the party code is correct (6 characters)
- Party may be full
- Party may have been disbanded

### Chat not working
- Ensure you're in a party
- Check your connection status
- Verify messages aren't empty

### Ready button not working
- You must be in a party
- All players must ready up before host can start
- Check connection status

## Development Mode

In development, the lobby uses minimal authentication (player ID only).

In production, JWT tokens are required for Socket.IO connections.

## Browser Requirements

- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- localStorage enabled
- WebSocket support

## Support

For issues or questions, check:
- Browser console for errors
- Server logs for backend issues
- Network tab for API call failures
