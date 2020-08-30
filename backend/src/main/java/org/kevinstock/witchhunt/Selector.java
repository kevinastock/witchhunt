package org.kevinstock.witchhunt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

public class Selector {
    private static final Logger logger = LoggerFactory.getLogger(Selector.class);

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

    public List<Integer> getSelected() {
        return selected;
    }

    public String getKey() {
        return key;
    }

    public List<String> getActions() {
        return actions;
    }

    private void select(Boolean value, int choice) {
        logger.trace("Setting {} @ {} to {}: was {}", key, choice, value, selected);
        if (value && !selected.contains(choice)) {
            selected.add(choice);
            if (selected.size() > maxSelected) {
                selected.remove(0);
            }
        } else if (!value) {
            selected.remove(Integer.valueOf(choice));
        }
        logger.trace("Now it's {}", selected);

        // Intentionally resend if selected is unchanged - we need to notify sending player that we saw their
        // client id. We could only send to the player that caused this action, but w/e.
        notify.forEach(this::notifyPlayer);
    }

    public void notifyPlayer(Player player) {
        player.sendVersionedData(key, seqId++, selected);
    }
}
