package org.kevinstock.witchhunt;

import org.kevinstock.witchhunt.roles.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

public class ConfigureGame {
    private static final String ENABLED = "Enabled";
    private static final String DISABLED = "Disabled";

    private static final String VILLAGERS = "Villagers";
    private static final String NONE = "None";
    private static final String WITCHES = "Witches";

    private static final LinkedHashMap<String, Class<? extends Role>> ROLES = new LinkedHashMap<>();
    static {
        ROLES.put(Priest.NAME, Priest.class);
        ROLES.put(Judge.NAME, Judge.class);
        ROLES.put(Gravedigger.NAME, Gravedigger.class);
        ROLES.put(Apprentice.NAME, Apprentice.class);
        ROLES.put(Survivalist.NAME, Survivalist.class);
        ROLES.put(DirtyOldBastard.NAME, DirtyOldBastard.class);
        ROLES.put(Gambler.NAME, Gambler.class);
        ROLES.put(Fanatic.NAME, Fanatic.class);
        ROLES.put(Oracle.NAME, Oracle.class);
        ROLES.put(Watchman.NAME, Watchman.class);
        ROLES.put(Hunter.NAME, Hunter.class);
        ROLES.put(Emissary.NAME, Emissary.class);
        ROLES.put(LooseCannon.NAME, LooseCannon.class);
        ROLES.put(Assassin.NAME, Assassin.class);
        ROLES.put(Nurse.NAME, Nurse.class);
        ROLES.put(Spiritualist.NAME, Spiritualist.class);
        ROLES.put(BenevolentOldDame.NAME, BenevolentOldDame.class);
        ROLES.put(Acolyte.NAME, Acolyte.class);
        ROLES.put(Bomber.NAME, Bomber.class);
        ROLES.put(PeepingTom.NAME, PeepingTom.class);
        ROLES.put(FortuneTeller.NAME, FortuneTeller.class);
        ROLES.put(Inquisitor.NAME, Inquisitor.class);
    }

    private final ReactionVoter roles;
    private final ReactionVoter advancedRules;
    private final ReactionVoter handicap;
    private final Buttons startGame;

    public ConfigureGame(Lobby lobby) {
        roles = new ReactionVoter(
                lobby,
                "Roles",
                "",
                ReactionVoter.Icon.CHECK,
                new ArrayList<>(ROLES.keySet()),
                ROLES.size(),
                new ArrayList<>(),
                new ArrayList<>(),
                true
        );

        advancedRules = new ReactionVoter(
                lobby,
                "Advanced rules",
                "",
                ReactionVoter.Icon.CHECK,
                List.of(ENABLED, DISABLED),
                1,
                new ArrayList<>(),
                new ArrayList<>(),
                true
        );

        handicap = new ReactionVoter(
                lobby,
                "Handicap",
                "",
                ReactionVoter.Icon.CHECK,
                List.of(VILLAGERS, NONE, WITCHES),
                1,
                new ArrayList<>(),
                new ArrayList<>(),
                true
        );

        startGame = new Buttons(lobby,
                List.of("Start game"),
                List.of(this::attemptStartGame)
        );
    }

    public void addParticipant(Player player) {
        roles.addParticipant(player);
        advancedRules.addParticipant(player);
        handicap.addParticipant(player);
    }

    public void addWriter(Player player) {
        roles.addWriter(player);
        advancedRules.addWriter(player);
        handicap.addWriter(player);
        startGame.addParticipant(player);
    }

    public void removePlayer(Player player) {
        roles.removePlayer(player);
        advancedRules.removePlayer(player);
        handicap.removePlayer(player);
    }

    private void attemptStartGame(Boolean ignored) {
        // FIXME
    }
}
