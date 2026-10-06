Carrion Spider Quick Connect Signaling Server

1. Upload this folder to a Node.js host (Render works).
2. Build command: npm install
3. Start command: npm start
4. Use the host's secure WebSocket URL in the game:
   https://example.onrender.com -> wss://example.onrender.com
5. Both players enter the same room code.
   Host clicks QUICK HOST; Player 2 clicks QUICK JOIN.

The server only exchanges WebRTC offer/answer messages. Game-state traffic is peer-to-peer after connection.
