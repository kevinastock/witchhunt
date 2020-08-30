package org.kevinstock.witchhunt;

import java.util.*;

public class IndividualReactionVoter implements UiComponent {
    private final String key = UUID.randomUUID().toString();
    private final ReactionVoter reactionVoter;
    private final Map<Player, Selector> votes;
    private long seqId = 0;

    // Each player votes independently
    public IndividualReactionVoter(Lobby lobby, String title, String note, ReactionVoter.Icon icon, List<String> choices, int maxSelected, List<Player> participants, boolean showReactions) {
        reactionVoter = new ReactionVoter(lobby, title, note, icon, choices, maxSelected, participants, showReactions);

        votes = new HashMap<>();
        for (Player player : reactionVoter.getParticipants()) {
            votes.put(player, new Selector(lobby, choices.size(), maxSelected, List.of(player)));
            player.addComponent(this);
        }

        notifyPlayers();
    }

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public void forceSend(Player player) {
        votes.values().forEach(x -> x.notifyPlayer(player));
        reactionVoter.forceSend(player);
        notifyPlayer(player);
    }

    private void notifyPlayers() {
        seqId++;
        reactionVoter.getParticipants().forEach(this::notifyPlayer);
    }

    private void notifyPlayer(Player player) {
        player.sendVersionedData(key, seqId, new ReactionVoter.ReactionVoterMessage(player, reactionVoter, votes.get(player)));
    }
}
