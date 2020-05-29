package org.kevinstock.witchhunt;

import java.util.*;
import java.util.stream.Collectors;

public class ReactionVoter implements UiComponent {
    private static final int DISTINCT_REACTIONS = 4;
    private static final int ALLOWED_REACTIONS = 1;

    private final String key = UUID.randomUUID().toString();
    private final Lobby lobby;
    private final String title;
    private final List<String> choices;
    private final int maxSelected;
    private final String note;
    private final List<Player> participants;
    private final List<Player> writers;
    private final boolean showReactions;

    private final List<Map<Player, Selector>> reactions = new ArrayList<>();
    private final Selector sharedSelector;
    private final Map<Player, Selector> votes;

    private long seqId = 0;

    // Each player votes independently
    public ReactionVoter(Lobby lobby, String title, String note, List<String> choices, int maxSelected, List<Player> participants) {
        this(lobby, title, note, choices, maxSelected, participants, null, true);
    }

    // All players alter the same selection (unless writers is empty)
    public ReactionVoter(Lobby lobby, String title, String note, List<String> choices, int maxSelected, List<Player> participants, List<Player> writers, boolean showReactions) {
        this.lobby = lobby;
        this.title = title;
        this.note = note;
        this.choices = choices;
        this.maxSelected = maxSelected;
        this.participants = new ArrayList<>(); // Will be populated by addPlayer
        this.writers = writers;
        this.showReactions = showReactions;

        // TODO: yea yea yea, this should really be two classes. idgaf right now
        if (writers != null) {
            sharedSelector = new Selector(lobby, choices.size(), maxSelected, this.participants);
            votes = null;
        } else {
            sharedSelector = null;
            votes = new HashMap<>();
        }

        choices.forEach(x -> reactions.add(new HashMap<>()));
        participants.forEach(this::addParticipant);

        notifyPlayers();
    }

    public void addParticipant(Player player) {
        participants.add(player);
        reactions.forEach(x -> x.put(player, new Selector(lobby, DISTINCT_REACTIONS, ALLOWED_REACTIONS, participants)));

        if (votes != null) {
            votes.put(player, new Selector(lobby, choices.size(), maxSelected, List.of(player)));
        }

        notifyPlayers();
        player.addComponent(this);
    }

    public void addWriter(Player player) {
        if (!participants.contains(player)) {
            throw new IllegalStateException("Can't add writer that isn't already a participant");
        }

        if (!writers.contains(player)) {
            writers.add(player);
        }

        seqId++;
        notifyPlayer(player);
    }

    public void removePlayer(Player player) {
        throw new UnsupportedOperationException();
    }

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public void forceSend(Player player) {
        if (votes != null) {
            votes.values().forEach(x -> x.notifyPlayer(player));
        } else {
            sharedSelector.notifyPlayer(player);
        }

        for (Map<Player, Selector> reaction : reactions) {
            reaction.values().forEach(x -> x.notifyPlayer(player));
        }

        notifyPlayer(player);
    }

    private void notifyPlayers() {
        seqId++;
        participants.forEach(this::notifyPlayer);
    }

    private void notifyPlayer(Player player) {
        player.sendVersionedData(key, seqId, new ReactionVoterMessage(player, this));
    }

    private static class ReactionVoterMessage {
        private final String type;
        private final String title;
        private final String note;
        private final String icon;
        private final String selector;
        private final boolean show_reactions;
        private final int max_selected;
        private final List<ReactionVoterRowMessage> rows;

        public ReactionVoterMessage(Player player, ReactionVoter voter) {
            type = "REACTION_VOTER";
            title = voter.title;
            note = voter.note;
            icon = "skull"; // TODO: make this a parameter of ReactionVoter
            if (voter.sharedSelector == null) {
                selector = voter.votes.get(player).getKey();
            } else {
                selector = voter.sharedSelector.getKey();
            }
            show_reactions = voter.showReactions;
            rows = new ArrayList<>();
            max_selected = voter.maxSelected;

            boolean isWriter = voter.writers != null && voter.writers.contains(player);

            for (int i = 0; i < voter.choices.size(); i++) {
                // what kind of garbage language doesn't have a zip function?
                String selectAction;

                if (voter.sharedSelector != null && isWriter) {
                    selectAction = voter.sharedSelector.getActions().get(i);
                } else if (voter.votes != null) {
                    selectAction = voter.votes.get(player).getActions().get(i);
                } else {
                    selectAction = null;
                }

                Map<String, String> reactions = voter.reactions.get(i).entrySet().stream().collect(Collectors.toMap(
                        e -> e.getKey().getUsername(),
                        e -> e.getValue().getKey()
                ));

                rows.add(new ReactionVoterRowMessage(
                        voter.choices.get(i),
                        selectAction,
                        reactions,
                        voter.reactions.get(i).get(player).getKey(),
                        voter.reactions.get(i).get(player).getActions()
                ));
            }
        }
    }

    private static class ReactionVoterRowMessage {
        private final String choice;
        private final String select_action;
        private final Map<String, String> reactions;
        private final String my_reaction_selector;
        private final List<String> my_reaction_actions; // what a stupid name. I love it.

        private ReactionVoterRowMessage(String choice, String select_action, Map<String, String> reactions, String my_reaction_selector, List<String> my_reaction_actions) {
            this.choice = choice;
            this.select_action = select_action;
            this.reactions = reactions;
            this.my_reaction_selector = my_reaction_selector;
            this.my_reaction_actions = my_reaction_actions;
        }
    }
}
