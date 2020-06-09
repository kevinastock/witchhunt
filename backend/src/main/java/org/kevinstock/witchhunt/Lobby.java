package org.kevinstock.witchhunt;

import com.google.common.html.HtmlEscapers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.function.Consumer;

public class Lobby {
    private static final Logger logger = LoggerFactory.getLogger(Lobby.class);

    private final String name;
    private final Map<String, Player> usernameLookup = new HashMap<>();
    private final Map<String, String> kickPlayer = new HashMap<>();
    private final Map<String, Consumer<Boolean>> actions = new HashMap<>();

    private int day = 0;
    private String phaseIcon = "config";
    private ConfigureGame configuration = new ConfigureGame(this);
    private boolean acceptingNewPlayers = true; // TODO: volatile? nah, just make methods called by server sync

    public Lobby(String name) {
        this.name = name;
    }

    // Ok yes, I'm just lazy. All the entry methods here are sync because I don't want to worry about race conditions.
    synchronized public void login(ClientConnection client, String username, String password) {
        if (usernameLookup.containsKey(username)) {
            Player existing = usernameLookup.get(username);
            if (existing.getPassword().equals(password)) {
                existing.updateClient(client);
                existing.send("logged_in", new LoggedInMessage(this.name, username, password));
            } else {
                LoginError.passwordError(client, "Username taken / incorrect password");
            }
        } else if (!acceptingNewPlayers) {
            LoginError.lobbyError(client, "Not accepting new players right now");
        } else {
            Player player = new Player(client, this, username, password);
            usernameLookup.put(username, player);
            configuration.addParticipant(player);
            kickPlayer.put(username, createAction(ignored -> removePlayer(player)));
            if (usernameLookup.size() == 1) {
                player.setAdmin(true);
                configuration.addWriter(player);
            }
            player.send("logged_in", new LoggedInMessage(this.name, username, password));
            updateAdminButtons();
            // TODO: send the player a message with user/lobby/password?
            // TODO: message everyone this player has joined the lobby.
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

    public void setPhaseIcon(String icon) {
        phaseIcon = icon;
    }

    public String getPhaseIcon() {
        return phaseIcon;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public int getDay() {
        return day;
    }

    public void rejectNewPlayers() {
        acceptingNewPlayers = false;
    }

    public List<Buttons.ButtonMessage> getAdminButtons() {
        List<Buttons.ButtonMessage> buttons = new ArrayList<>();

        // TODO: add pause and advance phase buttons as needed

        kickPlayer.forEach((name, button) -> {
            buttons.add(new Buttons.ButtonMessage(name, button));
        });

        return buttons;
    }

    private void updateAdminButtons() {
        usernameLookup.values().forEach(Player::sendAdminButtons);
    }

    public void removePlayer(Player player) {
        // TODO
        updateAdminButtons();
    }

    public void resetLobby() {
        actions.clear();
        day = 0;
        phaseIcon = "config";
        acceptingNewPlayers = true;

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

        public boolean hasErrors(ClientConnection client) {
            boolean error = !(lobby.equals("") && username.equals("") && password.equals(""));
            if (error) {
                client.send("login_messages", this);
            }
            return error;
        }

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
}
