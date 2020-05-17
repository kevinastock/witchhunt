import html

from collections import namedtuple

from witchhunt.configuregame import ConfigureGame

Connection = namedtuple("Connection", ["address", "username", "password", "is_admin"])
Message = namedtuple("Message", ["address", "update", "close"], defaults=[{}, False])


class Lobby:
    def __init__(self):
        self.name = None
        self.address_lookup = {}
        self.accepting_users = True
        self.backend = ConfigureGame(self)
        self.version_counter = 0

    def __repr__(self):
        return f"{self.name=} {self.accepting_users=} {self.address_lookup=}"

    def version(self):
        self.version_counter += 1
        return self.version_counter

    def connections(self):
        return list(self.address_lookup.values())

    def login(self, address, lobby=None, username=None, password=None):
        """
        A bit special, this method returns (lobby, messages) so the top level function
        can associate this address with a lobby.
        """
        username = html.escape(username)

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
            self.address_lookup[address] = Connection(
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

        if len(username) > 12:
            username_error = "Too long"

        if len(lobby) > 10:
            lobby_error = "Too long"

        if lobby != html.escape(lobby):
            lobby_error = "No html characters"

        if any((lobby_error, username_error, password_error)):
            return error()

        if not self.address_lookup:
            # This is the first connection. Any username/password is valid.
            self.name = lobby  # Needs to be set lazily because defaultdict is dumb
            is_admin = True
            return finish()

        previous_login = [c for c in self.connections() if c.username == username]
        if not previous_login:
            if self.accepting_users:
                # FIXME: notify the backend a player has joined
                return finish()
            else:
                lobby_error = "Game in progress, not accepting new users"
                return error()

        assert len(previous_login) == 1
        previous_login = previous_login[0]

        if previous_login.password != password:
            password_error = "Incorrect password or username already taken"
            return error()

        # Notify the existing connection that it is being disconnected
        del self.address_lookup[previous_login.address]
        messages.append(
            Message(
                previous_login.address,
                close="Connected from another device",
            )
        )
        return finish()

    def event(self, address, action, data):
        """
        A message from client `address`.

        Returns a [Message]
        """
        # FIXME: what do we do if the address isn't actually in this lobby? Shouldn't happen, but.
        sender = self.address_lookup[address]
        # Yikes. Should validate action is a value I expect.
        return getattr(self.backend, action, self._invalid_action)(client=client, **data)

    def _invalid_action(self, client, **kwargs):
        # TODO: notify the user something went wrong? disconnect them?
        return []
