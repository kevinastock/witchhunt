package org.kevinstock.witchhunt;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

public class Selector {
    private final List<Integer> selected = new ArrayList<>();
    private final List<Player> notify;
    private final String key = UUID.randomUUID().toString();
    private final List<String> actions = new ArrayList<>();

    private final int maxSelected;

    private long seqId = 0;

    public Selector(Lobby lobby, int choices, int maxSelected, List<Player> notify) {
        this.maxSelected = maxSelected;
        this.notify = notify; // Intentionally use the list given to us, so parent can modify it

        IntStream.range(0, choices)
                .mapToObj(choice ->
                        lobby.createAction(value -> this.select(value, choice)))
                .forEach(actions::add);
    }


    public String getKey() {
        return key;
    }

    public List<String> getActions() {
        return actions;
    }

    private void select(Boolean value, int choice) {
        if (value && !selected.contains(choice)) {
            selected.add(choice);
            if (selected.size() > maxSelected) {
                selected.remove(0);
            }
        } else if (!value) {
            selected.remove(Integer.valueOf(choice));
        }

        // Intentionally resend if selected is unchanged - we need to notify sending player that we saw their
        // client id. We could only send to the player that caused this action, but w/e.
        for (Player player : notify) {
            player.send("versioned_data", new SelectorMessage(key, selected, seqId++, player.getLatestClientSeqId()));
        }
    }

    private static class SelectorMessage {
        private final String key;
        private final List<Integer> selected;
        private final long sever_seq_id;
        private final long seen_client_seq_id;

        private SelectorMessage(String key, List<Integer> selected, long sever_seq_id, long seen_client_seq_id) {
            this.key = key;
            this.selected = selected;
            this.sever_seq_id = sever_seq_id;
            this.seen_client_seq_id = seen_client_seq_id;
        }
    }
}
