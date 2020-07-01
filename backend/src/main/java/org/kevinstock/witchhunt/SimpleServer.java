package org.kevinstock.witchhunt;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SimpleServer extends WebSocketServer {
    private static final Logger logger = LoggerFactory.getLogger(SimpleServer.class);

    private final Gson gson = new Gson();

    private final Map<String, Lobby> lobbies = new ConcurrentHashMap<>();
    private final Map<InetSocketAddress, ClientConnection> connections = new ConcurrentHashMap<>();

    public SimpleServer(InetSocketAddress address) {
        super(address);
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("new connection to " + conn.getRemoteSocketAddress());
        connections.put(conn.getRemoteSocketAddress(), new ClientConnection(conn));
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("closed " + conn.getRemoteSocketAddress() + " with exit code " + code + " additional info: " + reason);
        ClientConnection client = connections.remove(conn.getRemoteSocketAddress());
        // TODO: we should notify something the client has disconnected so players can be informed a player is not online
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        // TODO: simulate latency here to observe how beautiful the client is
        System.out.println("received message from " + conn.getRemoteSocketAddress() + ": " + message);

        ClientConnection client = connections.get(conn.getRemoteSocketAddress());

        JsonObject o = JsonParser.parseString(message).getAsJsonObject();
        switch (o.get("action").getAsString()) {
            case "login":
                LoginMessage loginMessage = gson.fromJson(o.get("data"), LoginMessage.class);
                if (client.getLobby() != null) {
                    logger.error(String.format("Extra attempt to login from %s: %s", conn.getRemoteSocketAddress(), message));
                } else if (Lobby.basicLoginCheck(client, loginMessage.getLobby(), loginMessage.getUsername(), loginMessage.getPassword())) {
                    Lobby lobby = lobbies.computeIfAbsent(loginMessage.getLobby(), Lobby::new);
                    lobby.login(client, loginMessage.getUsername(), loginMessage.getPassword());
                }
                break;
            case "set":
                SetMessage setMessage = gson.fromJson(o.get("data"), SetMessage.class);
                Lobby lobby = client.getLobby();
                if (lobby == null) {
                    logger.error(String.format("Unexpect set message before login from %s: %s", conn.getRemoteSocketAddress(), message));
                } else {
                    lobby.set(client, setMessage.getClientSeqId(), setMessage.getKey(), setMessage.getValue());
                }
                break;
            default:
                throw new RuntimeException("TODO");
        }
    }

    @Override
    public void onMessage(WebSocket conn, ByteBuffer message) {
        System.out.println("received ByteBuffer from " + conn.getRemoteSocketAddress());
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        System.err.println("an error occurred on connection " + conn.getRemoteSocketAddress() + ":" + ex);
    }

    @Override
    public void onStart() {
        System.out.println("server started successfully");
    }

    private static class LoginMessage {
        private String lobby;
        private String username;
        private String password;

        public String getLobby() {
            return lobby;
        }

        public String getUsername() {
            return username;
        }

        public String getPassword() {
            return password;
        }
    }

    private static class SetMessage {
        private int client_seq_id;
        private String key;
        private boolean value;

        public int getClientSeqId() {
            return client_seq_id;
        }

        public String getKey() {
            return key;
        }

        public boolean getValue() {
            return value;
        }
    }
}