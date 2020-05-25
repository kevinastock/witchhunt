import logging
import uuid

from witchhunt.message import Message


class Chooser:
    def __init__(self, lobby, component, choices_count, max_selected, notify):
        self.lobby = lobby
        self.max_selected = max_selected
        self.selected = []
        self.notify = notify  # Expect parent to modify this
        self.id = uuid.uuid4().hex
        self.server_seq_id = 0  # lobby.seq()?
        self.buttons = []

        for i in range(choices_count):
            self.buttons.append(lobby.create_button(component, self.select_factory(i)))

    def select_factory(self, choice):
        def select(value, setter_address, client_seq_id):
            if value and choice not in self.selected:
                self.selected.append(choice)
                if len(self.selected) > self.max_selected:
                    self.selected.pop(0)
                return self.notify_players(setter_address, client_seq_id)

            if not value and choice in self.selected:
                self.selected.remove(choice)
                return self.notify_players(setter_address, client_seq_id)

            # This action didn't actually change anything, but we should still
            # let the client know that we saw their button press so they can
            # see future changes
            return [
                Message(
                    setter_address,
                    {
                        "chooser": {
                            "chooser_id": self.id,
                            "selected": self.selected,
                            "server_seq_id": self.server_seq_id,
                            "seen_client_seq_id": client_seq_id,
                        },
                    },
                ),
            ]

        return select

    def notify_players(self, setter_address, client_seq_id):
        self.server_seq_id = self.lobby.seq()

        ret = []
        for player in self.notify:
            msg = {
                "chooser": {
                    "chooser_id": self.id,
                    "selected": self.selected,
                    "server_seq_id": self.server_seq_id,
                },
            }

            if player.address == setter_address:
                msg["chooser"]["seen_client_seq_id"] = client_seq_id

            ret.append(Message(player.address, msg))

        return ret

    def err(self, value):
        logging.warning("chooser id 'button' called")
