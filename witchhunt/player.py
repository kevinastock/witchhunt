from witchhunt.message import Message

class Player:
    def __init__(self, address, username, password, is_admin, lobby):
        self.address = address
        self.username = username
        self.password = password
        self.is_admin = is_admin
        self.lobby = lobby
        self._logs = []
        self.components = {} # FIXME: wtf should the type be here?

    def update_address(self, address):
        previous = self.address
        self.address = address
        ret = [Message(previous, close="Connect from another device"),
                Message(self.address, {"logs": self._logs})]
        # FIXME: send the new address everything it needs to know (log and components)
        return ret

    def send_log(self, message, visibility, tags):
        # FIXME: add tags for visibility and time_of_day
        # FIXME: get time_of_day and day from lobby
        time_of_day = "night"
        day = 1
        log = {
                "id": self.lobby.seq(),
                "message": message,
                "visibility": visibility,
                "time_of_day": time_of_day,
                "day": day,
                "tags": list(tags),
                }
        self._logs.append(log)
        return [Message(self.address, {"logs": [log]})]
