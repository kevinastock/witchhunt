package org.kevinstock.witchhunt;

import java.util.*;
import java.util.stream.Collectors;

// TODO: add a minimum number of selections, and initial selections parameter,
// if only minimum are selected, clicking again does not unselect.
// useful for advancedRules and handicap in configure game
public class ReactionVoter {
    private static final int DISTINCT_REACTIONS = 4;
    private static final int ALLOWED_REACTIONS = 1;
    private final Lobby lobby;
    private final String title;
    private final List<String> choices;
    private final int maxSelected;
    private final String note;
    private final List<Player> participants;
    private final boolean showReactions;
    private final String icon;
    private final List<Map<Player, Selector>> reactions = new ArrayList<>();

    // All players alter the same selection (unless writers is null)
    public ReactionVoter(Lobby lobby, String title, String note, Icon icon, List<String> choices, int maxSelected, List<Player> participants, boolean showReactions) {
        this.lobby = lobby;
        this.title = title;
        this.note = note;
        this.icon = icon.icon;
        this.choices = choices;
        this.maxSelected = maxSelected;
        this.participants = new ArrayList<>(); // Will be populated by addPlayer
        this.showReactions = showReactions;

        // TODO: if showReactions == false, don't setup all the reactions anyways

        choices.forEach(ignored -> reactions.add(new HashMap<>()));
        participants.forEach(this::addParticipant);
    }

    public void addParticipant(Player player) {
        participants.add(player);
        reactions.forEach(x -> x.put(player, new Selector(lobby, DISTINCT_REACTIONS, ALLOWED_REACTIONS, participants)));
    }

    public void removePlayer(Player player) {
        participants.remove(player);
        reactions.forEach(x -> x.remove(player));
    }

    public void forceSend(Player player) {
        for (Map<Player, Selector> reaction : reactions) {
            reaction.values().forEach(x -> x.notifyPlayer(player));
        }
    }

    public List<Player> getParticipants() {
        return participants;
    }

    public List<String> getChoices() {
        return choices;
    }

    @SuppressWarnings("UnusedDeclaration")
    public enum Icon {
        SKULL("skull"),
        SHUFFLE("random"),
        CHECK("check"),
        BOMB("bomb"),
        BAN("ban"),
        TARGET("crosshairs"),
        DICE("dice"),
        LIFE("heart"),
        JUDGE("gavel"),
        ;

        private final String icon;

        Icon(String icon) {
            this.icon = icon;
        }
    }

    @SuppressWarnings({"FieldCanBeLocal", "UnusedDeclaration", "MismatchedQueryAndUpdateOfCollection"})
    public static class ReactionVoterMessage {
        private final String type;
        private final String title;
        private final String note;
        private final String icon;
        private final String selector;
        private final boolean show_reactions;
        private final int max_selected;
        private final List<ReactionVoterRowMessage> rows;

        public ReactionVoterMessage(Player player, ReactionVoter voter, Selector primarySelector) {
            this(player, voter, primarySelector.getKey(), primarySelector);
        }

        public ReactionVoterMessage(Player player, ReactionVoter voter, String primarySelectorKey, Selector primarySelector) {
            type = "REACTION_VOTER";
            title = voter.title;
            note = voter.note;
            icon = voter.icon;
            selector = primarySelectorKey;
            show_reactions = voter.showReactions;
            rows = new ArrayList<>();
            max_selected = voter.maxSelected;

            for (int i = 0; i < voter.choices.size(); i++) {
                // what kind of garbage language doesn't have a zip function?
                String selectAction;

                if (primarySelector != null) {
                    selectAction = primarySelector.getActions().get(i);
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

    @SuppressWarnings({"FieldCanBeLocal", "UnusedDeclaration", "MismatchedQueryAndUpdateOfCollection"})
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
