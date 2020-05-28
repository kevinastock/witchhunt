package org.kevinstock.witchhunt;

import com.google.gson.Gson;
import org.java_websocket.WebSocket;
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
        // TODO: I think send throws exceptions when conn is closed? Have this catch everything and just log problems?
        String msg = gson.toJson(Map.of(action, o));
        logger.info("Sending to [{}]: {}", conn.getRemoteSocketAddress(), msg);
        conn.send(msg);
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
}
