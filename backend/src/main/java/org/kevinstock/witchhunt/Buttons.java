package org.kevinstock.witchhunt;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class Buttons implements UiComponent {
    private final String key;
    private final List<String> messages;
    private final List<String> actions;

    public Buttons(Lobby lobby, List<String> messages, List<Consumer<Boolean>> callbacks) {
        this(lobby, messages, callbacks, List.of());
    }

    public Buttons(Lobby lobby, List<String> messages, List<Consumer<Boolean>> callbacks, List<Player> participants) {
        this(lobby, UUID.randomUUID().toString(), messages, callbacks, participants);
    }

    public Buttons(Lobby lobby, String key, List<String> messages, List<Consumer<Boolean>> callbacks, List<Player> participants) {
        this.key = key;
        this.messages = messages;
        this.actions = callbacks.stream().map(lobby::createAction).collect(Collectors.toList());

        participants.forEach(this::addParticipant);
    }

    public void addParticipant(Player player) {
        forceSend(player);
        player.addComponent(this);
    }

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public void forceSend(Player player) {
        player.sendVersionedData(key, 0, new ButtonsMessage(this));
    }

    private static class ButtonsMessage {
        private final String type;
        private final List<ButtonMessage> buttons;

        private ButtonsMessage(Buttons buttons) {
            type = "BUTTONS";
            this.buttons = new ArrayList<>();
            for (int i = 0; i < buttons.actions.size(); i++) {
                this.buttons.add(new ButtonMessage(buttons.messages.get(i), buttons.actions.get(i)));
            }
        }
    }

    public static class ButtonMessage {
        private final String message;
        private final String action;
        // TODO: colors?

        public ButtonMessage(String message, String action) {
            this.message = message;
            this.action = action;
        }
    }
}
