from collections import namedtuple

Connection = namedtuple("Connection", ["address", "username", "password", "is_admin"])
Message = namedtuple("Message", ["address", "update", "close"], defaults=[{}, False])


class Lobby:
    def __init__(self):
        self.name = None
        self.connections = {}
        self.accepting_users = True

    def __repr__(self):
        return f"{self.name=} {self.accepting_users=} {self.connections=}"

    def login(self, address, lobby=None, username=None, password=None):
        """
        A bit special, this method returns (lobby, messages) so the top level function
        can associate this address with a lobby.
        """
        messages = []

        lobby_error = "" if lobby else "Required"
        username_error = "" if username else "Required"
        password_error = "" if password else "Required"
        is_admin = False

        def error():
            messages.append(
                Message(
                    address,
                    {
                        "login_messages": {
                            "lobby": lobby_error,
                            "username": username_error,
                            "password": password_error,
                        },
                    },
                )
            )
            return None, messages

        def finish():
            self.connections[username] = Connection(
                address, username, password, is_admin
            )
            # TODO: add message to everyone that someone has joined the lobby
            # TODO: update admin panel
            # TODO: update game selection actions (admin and non-admin)
            messages.append(
                Message(
                    address,
                    {
                        "logged_in": {
                            "lobby": lobby,
                            "username": username,
                            "password": password,
                        },
                    },
                )
            )
            return self, messages

        if any((lobby_error, username_error, password_error)):
            return error()

        if not self.connections:
            # This is the first connection. Any username/password is valid.
            self.name = lobby  # Needs to be set lazily because defaultdict is dumb
            is_admin = True
            return finish()

        if username not in self.connections:
            if self.accepting_users:
                return finish()
            else:
                lobby_error = "Game in progress, not accepting new users"
                return error()

        if self.connections[username].password != password:
            password_error = "Incorrect password or username already taken"
            return error()

        # Notify the existing connection that it is being disconnected
        messages.append(
            Message(
                self.connections[username].address,
                close="Connected from another device",
            )
        )
        return finish()
