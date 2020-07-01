package org.kevinstock.witchhunt;

import com.google.common.html.HtmlEscapers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class Lobby {
    private static final String PLAYER_STATUS = "player_status";

    private static final Logger logger = LoggerFactory.getLogger(Lobby.class);

    private final String name;
    private final Map<String, Player> usernameLookup = new HashMap<>();
    private final Map<Player, String> kickPlayer = new HashMap<>();
    private final Map<String, Consumer<Boolean>> actions = new HashMap<>();

    private int day = 0;
    private String phaseIcon = "config";
    private ConfigureGame configuration = new ConfigureGame(this);
    private boolean mutablePlayerList = true;

    public Lobby(String name) {
        this.name = name;
    }

    /*
    Make sure that the values are good enough that if this lobby doesn't exist, we can create it and log this user
    in as the admin.

    All the requireNonNull's here are just to make intellij be quiet because it's analysis doesn't see we'd have already
    returned.

    The unstable api is guava's HtmlEscapers. If this ends up being the only use of guava, just implement it here.
    Or try using proguard: https://github.com/google/guava/wiki/UsingProGuardWithGuava
     */
    @SuppressWarnings("UnstableApiUsage")
    public static boolean basicLoginCheck(ClientConnection client, String lobby, String username, String password) {
        LoginError loginError = new LoginError();

        if (lobby == null || lobby.equals("")) {
            loginError.lobby = "Required";
        }

        if (username == null || username.equals("")) {
            loginError.username = "Required";
        }

        if (password == null || password.equals("")) {
            loginError.password = "Required";
        }

        if (loginError.hasErrors(client)) {
            return false;
        }

        if (!Objects.requireNonNull(lobby).equals(HtmlEscapers.htmlEscaper().escape(lobby))) {
            loginError.lobby = "No html characters";
        }

        if (!Objects.requireNonNull(username).equals(HtmlEscapers.htmlEscaper().escape(username))) {
            loginError.username = "No html characters";
        }

        if (loginError.hasErrors(client)) {
            return false;
        }

        if (lobby.length() > 12) {
            loginError.lobby = "Too long, max 12 characters";
        }

        if (username.length() > 12) {
            loginError.username = "Too long, max 12 characters";
        }

        if (Objects.requireNonNull(password).length() > 60) {
            loginError.password = "Too long, max 60 characters";
        }

        return !loginError.hasErrors(client);
    }

    // Ok yes, I'm just lazy. All the entry methods here are sync because I don't want to worry about race conditions.
    synchronized public void login(ClientConnection client, String username, String password) {
        if (usernameLookup.containsKey(username)) {
            Player existing = usernameLookup.get(username);
            if (existing.getPassword().equals(password)) {
                existing.updateClient(client);
                existing.send("logged_in", new LoggedInMessage(this.name, username, password));
                updatePlayerStatus();
            } else {
                LoginError.passwordError(client, "Username taken / incorrect password");
            }
        } else if (!mutablePlayerList) {
            LoginError.lobbyError(client, "Not accepting new players right now");
        } else {
            Player player = new Player(client, this, username, password);
            usernameLookup.put(username, player);
            configuration.addParticipant(player);
            kickPlayer.put(player, createAction(ignored -> removePlayer(player)));
            if (usernameLookup.size() == 1) {
                player.setAdmin(true);
                configuration.addWriter(player);
            }
            player.send("logged_in", new LoggedInMessage(this.name, username, password));
            player.sendSecretMessage(String.format("Welcome to lobby %s. Your username is '%s' and your password is '%s'.", name, username, password), List.of("join", "username"));
            usernameLookup.values().forEach(p -> p.sendPublicMessage(username + " has joined the lobby.", List.of("join", username)));
            updateAdminButtons();
            updatePlayerStatus();
        }
    }

    synchronized public void set(ClientConnection client, int clientSeqId, String key, boolean value) {
        client.getPlayer().updateLatestClientId(clientSeqId);

        Consumer<Boolean> callback = actions.get(key);
        if (callback == null) {
            logger.error("Unknown action key: {}", key);
        } else {
            callback.accept(value);
        }
    }

    public String getPhaseIcon() {
        return phaseIcon;
    }

    public void setPhaseIcon(String icon) {
        phaseIcon = icon;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public void lockPlayerList() {
        mutablePlayerList = false;
    }

    public List<Buttons.ButtonMessage> getAdminButtons() {
        List<Buttons.ButtonMessage> buttons = new ArrayList<>();

        // TODO: add pause and advance phase buttons as needed

        // TODO: switch to kill player buttons once in game
        kickPlayer.forEach((player, button) -> {
            buttons.add(new Buttons.ButtonMessage("Kick " + player.getUsername(), button));
        });

        return buttons;
    }

    private void updateAdminButtons() {
        usernameLookup.values().forEach(Player::sendAdminButtons);
    }

    public void updatePlayerStatus() {
        List<PlayerStatusMessage> status = usernameLookup
                .values()
                .stream()
                .map(p ->
                        new PlayerStatusMessage(p.getUsername(), p.isConnected(), p.isAlive()))
                .collect(Collectors.toList());
        usernameLookup.values().forEach(p -> p.send(PLAYER_STATUS, status));

        // TODO: Make sure this is called when a player dies
    }

    public void removePlayer(Player player) {
        if (!mutablePlayerList) {
            return;
        }

        kickPlayer.remove(player);
        configuration.removePlayer(player);

        for (String username : usernameLookup.keySet()) {
            if (usernameLookup.get(username).equals(player)) {
                usernameLookup.remove(username);
                break;
            }
        }

        usernameLookup
                .values()
                .forEach(
                        p ->
                                p.sendPublicMessage(
                                        player.getUsername() + " has left the lobby.",
                                        List.of("join", player.getUsername())));
        player.disconnect();
        updateAdminButtons();
    }

    public void resetLobby() {
        actions.clear();
        day = 0;
        phaseIcon = "config";
        mutablePlayerList = true;

        configuration = new ConfigureGame(this);

        usernameLookup.values().forEach(player -> {
            configuration.addParticipant(player);
            if (player.isAdmin()) {
                configuration.addWriter(player);
            }
        });
    }

    public String createAction(Consumer<Boolean> callback) {
        String selector = UUID.randomUUID().toString();
        actions.put(selector, callback);
        return selector;
    }

    private static class LoggedInMessage {
        private final String lobby;
        private final String username;
        private final String password;

        private LoggedInMessage(String lobby, String username, String password) {
            this.lobby = lobby;
            this.username = username;
            this.password = password;
        }
    }

    private static class LoginError {
        String lobby = "";
        String username = "";
        String password = "";

        public static void passwordError(ClientConnection client, String message) {
            LoginError error = new LoginError();
            error.password = message;
            error.hasErrors(client);
        }

        public static void lobbyError(ClientConnection client, String message) {
            LoginError error = new LoginError();
            error.lobby = message;
            error.hasErrors(client);
        }

        public boolean hasErrors(ClientConnection client) {
            boolean error = !(lobby.equals("") && username.equals("") && password.equals(""));
            if (error) {
                client.send("login_messages", this);
            }
            return error;
        }
    }

    private static class PlayerStatusMessage {
        private final String username;
        private final boolean connected;
        private final boolean alive;

        private PlayerStatusMessage(String username, boolean connected, boolean alive) {
            this.username = username;
            this.connected = connected;
            this.alive = alive;
        }
    }
}
