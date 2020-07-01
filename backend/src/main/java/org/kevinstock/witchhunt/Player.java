package org.kevinstock.witchhunt;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Player {
    private static final String ADMIN_BUTTONS = "admin_buttons";
    private final List<LogMessage> logs = new ArrayList<>();
    private final String username;
    private final String password;
    private final Lobby lobby;
    // TODO: components should have a priority so this displays nicely
    private final List<UiComponent> components = new ArrayList<>();
    private long seqId = 0;
    private long latestClientSeqId = 0;
    private long logIds = 0;
    private boolean isAdmin = false;
    // This could be a list of clients so someone can log in multiple times,
    // but I think a few places assume there's only one client per player.
    private ClientConnection client;

    public Player(ClientConnection client, Lobby lobby, String username, String password) {
        this.lobby = lobby;
        this.username = username;
        this.password = password;
        this.client = client;
        this.client.setPlayer(this);
    }

    public void disconnect() {
        this.client.close("Kicked from lobby");
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void updateClient(ClientConnection client) {
        this.client.close("Connected from another device");
        this.client = client;
        this.client.setPlayer(this);

        this.client.send("logs", logs);
        components.forEach(c -> c.forceSend(this));
        sendComponents();
        latestClientSeqId = 0; // TODO: or send client current value? needed if there's a list of clients.

        sendAdminButtons();
    }

    public Lobby getLobby() {
        return lobby;
    }

    public void sendPublicMessage(String message, List<String> tags) {
        List<String> allTags = new ArrayList<>(tags);
        allTags.add("public");
        sendMessageHelper(message, "public", allTags);
    }

    public void sendSecretMessage(String message, List<String> tags) {
        List<String> allTags = new ArrayList<>(tags);
        allTags.add("secret");
        sendMessageHelper(message, "secret", allTags);
    }

    // TODO: add helpers for other visibilities? role, witches, angel, demon,

    private void sendMessageHelper(String message, String visibility, List<String> tags) {
        String dayPhase = lobby.getPhaseIcon();
        int day = lobby.getDay();
        tags.add(dayPhase);
        tags.add(String.format("day %d", day));
        LogMessage msg = new LogMessage(logIds++, message, visibility, dayPhase, day, tags);
        logs.add(msg);
        client.send("logs", List.of(msg));
    }

    public void updateLatestClientId(int clientSeqId) {
        latestClientSeqId = Math.max(clientSeqId, latestClientSeqId);
    }

    public long getLatestClientSeqId() {
        return latestClientSeqId;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public void sendAdminButtons() {
        if (!isAdmin) {
            return;
        }

        send(ADMIN_BUTTONS, lobby.getAdminButtons());
    }

    public List<UiComponent> getComponents() {
        return components;
    }

    public void addComponent(UiComponent component) {
        components.add(component);
        sendComponents();
    }

    public void removeComponent(UiComponent component) {
        components.remove(component);
        sendComponents();
    }

    private void initComponents() {
        for (UiComponent component : components) {
        }
    }

    private void sendComponents() {
        sendVersionedData(
                "components",
                seqId++,
                components.stream().map(UiComponent::getKey).collect(Collectors.toList())
        );
    }

    public void sendVersionedData(String key, long dataSeqId, Object data) {
        send("versioned_data", new VersionedData(key, data, dataSeqId, latestClientSeqId));
    }

    public void send(String action, Object o) {
        client.send(action, o);
    }

    private static class VersionedData {
        private final String key;
        private final Object data;
        private final long server_seq_id;
        private final long seen_client_seq_id;

        private VersionedData(String key, Object data, long server_seq_id, long seen_client_seq_id) {
            this.key = key;
            this.data = data;
            this.server_seq_id = server_seq_id;
            this.seen_client_seq_id = seen_client_seq_id;
        }
    }

    private static class LogMessage {
        private final long id;
        private final String message;
        private final String visibility;
        private final String day_phase;
        private final int day;
        private final List<String> tags;

        private LogMessage(long id, String message, String visibility, String day_phase, int day, List<String> tags) {
            this.id = id;
            this.message = message;
            this.visibility = visibility;
            this.day_phase = day_phase;
            this.day = day;
            this.tags = tags;
        }
    }
}
