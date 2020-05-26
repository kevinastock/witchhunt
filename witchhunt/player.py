class Player:
    def __init__(self, address, username, password, is_admin, lobby):
        self.address = address
        self.username = username
        self.password = password
        self.is_admin = is_admin
        self.lobby = lobby
        self.logs = []
        self.components = {}  # FIXME: wtf should the type be here?
        # a set of strings (uuids) of versioned data that the client needs to know about

    def update_address(self, address):
        previous = self.address
        self.address = address
        self.lobby.push_msg(previous, close="Connect from another device")
        self.lobby.push_msg(address, {"logs": self.logs})
        # FIXME: send the new address components

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
        self.logs.append(log)
        self.lobby.push_msg(self.address, {"logs": [log]})
