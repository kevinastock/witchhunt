package org.kevinstock.witchhunt;

import com.google.gson.Gson;
import org.java_websocket.WebSocket;
import org.java_websocket.exceptions.WebsocketNotConnectedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class ClientConnection {
    private static final Logger logger = LoggerFactory.getLogger(ClientConnection.class);
    private final Gson gson = new Gson();

    private final WebSocket conn; // Try not to expose this - have sends some through this class
    private Player player;

    public ClientConnection(WebSocket conn) {
        this.conn = conn;
    }

    // Probably shouldn't be used much, but the server needs to know a bit about lobbies, so it's here.
    public Lobby getLobby() {
        if (player != null) {
            return player.getLobby();
        }
        return null;
    }

    public void send(String action, Object o) {
        String msg = gson.toJson(Map.of(action, o));
        logger.info("Sending to [{}]: {}", conn.getRemoteSocketAddress(), msg);
        try {
            conn.send(msg);
        } catch (WebsocketNotConnectedException ignored) {
            // If we can't send to someone, sucks for them. They'll get up to date data when they log back in.
        }
    }

    public void close(String message) {
        conn.close(1000, message);
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public boolean isConnected() {
        return conn.isOpen();
    }

    public void notifyClosed() {
        Lobby lobby = getLobby();
        if (lobby != null) {
            lobby.updatePlayerStatus();
        }
    }
}
