class VersionedData:
    def __init__(self, lobby, key, data, notify):
        self.lobby = lobby
        self.key = key
        self.data = data
        self.notify = list(notify)
        self.seq_id = 0

    def update_data(self, data):
        self.data = data
        self.seq_id = self.lobby.seq()
        self._send_updates()

    def add_player(self, player):
        self.notify.append(player)
        self._send_updates()

    def _send_updates(self):
        for player in self.notify:
            self.lobby.push_msg(
                player.address,
                {
                    "versioned_data": {
                        "key": self.key,
                        "data": self.data,
                        "server_seq_id": self.seq_id,
                        "seen_client_seq_id": player.latest_client_seq_id,
                    }
                },
            )
