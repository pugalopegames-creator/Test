Carrion Spider Multi-Player Signaling Server

Replace your previous signaling server with this version.

Render:
Build command: npm install
Start command: npm start

The host can keep the room open while any number of players join with the same room code.
Architecture: star topology. Each guest has one WebRTC connection to the host; the host relays
other players' public positions/profiles over data channels.

There is no hard-coded player cap, but practical capacity depends on the host device/network,
browser WebRTC limits, and your hosting/network conditions.
