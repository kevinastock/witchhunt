import html
import logging
import secrets

from collections import defaultdict

from witchhunt.configuregame import ConfigureGame
from witchhunt.message import Message
from witchhunt.player import Player


class Lobby:
    def __init__(self):
        self.name = None
        self.players = []
        self.accepting_users = True
        self.backend = ConfigureGame(self)
        self.seq_id = 0
        self.button_callbacks = {}
        self.components = defaultdict(set)

    def __repr__(self):
        return f"{self.name=} {self.accepting_users=} {self.players=}"

    def seq(self):
        self.seq_id += 1
        return self.seq_id

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

        def finish(previous_login=None):
            # Notify the existing player that it is being disconnected
            if previous_login:
                messages.extend(previous_login.update_address(address))
            else:
                messages.extend(self.backend.player_join(username, is_admin))
                # TODO: add message to everyone that someone has joined the lobby
                # TODO: update admin panel
                # TODO: update game selection actions (admin and non-admin)
                self.players.append(Player(address, username, password, is_admin, self))
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

        if not self.players:
            # This is the first player. Any username/password is valid.
            self.name = lobby  # Needs to be set lazily because defaultdict is dumb
            is_admin = True
            return finish()

        previous_login = [p for p in self.players if p.username == username]
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

        return finish(previous_login)

    def click_button(self, address, field, value, client_seq_id):
        # value is needed here because we don't want to blindly toggle the callback,
        # we should have the user say what they expect to happen
        ret = []
        try:
            callback = self.button_callbacks[field]
        except KeyError:
            logging.warning("Unknown button clicked: " + field)
            return ret

        ret.extend(callback(value, address, client_seq_id))
        return ret

    def create_button(self, component, callback):
        while True:
            private_id = secrets.token_hex(6)
            if private_id not in self.button_callbacks:
                break
        self.button_callbacks[private_id] = callback
        self.components[component].add(private_id)
        return private_id

    def destroy_component(self, component):
        for private_id in self.components[component]:
            del self.button_callbacks[private_id]
        del self.components[component]
