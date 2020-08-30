package org.kevinstock.witchhunt;

import java.util.*;
import java.util.stream.Collectors;

public class SharedReactionVoter implements UiComponent {
    private final String key = UUID.randomUUID().toString();
    private final ReactionVoter reactionVoter;
    private final List<Player> writers;
    private final Selector sharedSelector;
    private long seqId = 0;

    // All writers alter the same selection
    public SharedReactionVoter(Lobby lobby, String title, String note, ReactionVoter.Icon icon, List<String> choices, int maxSelected, List<Player> participants, List<Player> writers) {
        this.reactionVoter = new ReactionVoter(lobby, title, note, icon, choices, maxSelected, participants, true);

        this.writers = writers;
        sharedSelector = new Selector(lobby, choices.size(), maxSelected, reactionVoter.getParticipants());

        for (Player player : reactionVoter.getParticipants()) {
            player.addComponent(this);
        }

        notifyPlayers();
    }

    public void addParticipant(Player player) {
        reactionVoter.addParticipant(player);

        // need to send this player all the selectors for existing players in case they've selected something
        // The notifyPlayers will duplicate the work of sending this component to this player, but whatever.
        forceSend(player);

        notifyPlayers();
        player.addComponent(this);
    }

    public void removePlayer(Player player) {
        writers.remove(player);
        reactionVoter.removePlayer(player);

        notifyPlayers();
    }

    public void addWriter(Player player) {
        if (!reactionVoter.getParticipants().contains(player)) {
            throw new IllegalStateException("Can't add writer that isn't already a participant");
        }

        if (!writers.contains(player)) {
            writers.add(player);
        }

        seqId++;
        notifyPlayer(player);
    }

    public List<String> getSelections() {
        return sharedSelector.getSelected().stream().map(i -> reactionVoter.getChoices().get(i)).collect(Collectors.toList());
    }

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public void forceSend(Player player) {
        sharedSelector.notifyPlayer(player);
        reactionVoter.forceSend(player);
        notifyPlayer(player);
    }

    private void notifyPlayers() {
        seqId++;
        reactionVoter.getParticipants().forEach(this::notifyPlayer);
    }

    private void notifyPlayer(Player player) {
        player.sendVersionedData(key, seqId, new ReactionVoter.ReactionVoterMessage(player, reactionVoter, sharedSelector.getKey(), writers.contains(player) ? sharedSelector : null));
    }
}