from witchhunt.roles import roles

# from witchhunt.teams import Team
from witchhunt.message import V

# FIXME: move this to it's own file
# FIXME: this needs to be based on the new buttons & components setup
# class Reactions:
#    def __init__(self, title, choices, max_selections=1):
#        self.title = title
#        self.max_selections = max_selections
#        self.selections = {choice: False for choice in choices}
#        self.reactions = {choice: {} for choice in choices}
#            # {choice : {user: reaction}}
#
#    def select(self, client, choice, select):
#        pass
#
#    def react(self, client, choice, opinion):
#        if opinion:
#            self.reactions[choice][client.username] = opinion
#        else:
#            del self.reactions[choice][client.username]
#
#    def reactions(self, selected):
#        ret = {}
#        for choice, reacts in self.reactions.items():
#            r = {
#                    'choice': choice,
#                    'selected': selected[choice],
#                    'strong_yes': [],
#                    'yes': [],
#                    'no': [],
#                    'strong_no': [],
#                }
#            for player, opinion in reacts.items():
#                r[opinion].append(player)
#            ret[choice] = r
#        return ret


class ConfigureGame:
    def __init__(self, lobby):
        self.lobby = lobby
        self.roles = {role: False for role in roles}
        # self.reactions = Reactions(roles.keys())
        self.advanced_rules = True
        self.handicap = None

    def player_join(self, username, is_admin):
        ret = []
        # TODO: privately message the player a list of players
        # TODO: include a link to share with other players?
        # TODO: send actions to everyone
        for player in self.lobby.players:
            # message everyone else that this player has joined
            ret.extend(
                player.send_log(
                    f"{username} has joined the lobby.", V.PUBLIC, [username]
                )
            )
        return ret

    # def set_advanced_rules(self, client, enabled):
    #    if client.is_admin:
    #        self.advanced_rules = enabled
    #        return self._update_actions()
    #    return []

    # def set_role(self, client, role, select):
    #    if client.is_admin:
    #        self.roles[role] = select
    #        return self._update_actions()
    #    return []

    # def set_handicap(self, client, choice):
    #    if client.is_admin:
    #        self.handicap = choice
    #        return self._update_actions()
    #    return []

    # def react(self, client, role, opinion):
    #    self.reactions.react(client, role, opinion)

    # TODO: start_game (clear actions, set lobby.backend)

    # def _update_actions(self):
    #    messages = []
    #    actions = {
    #            # TODO: Make the roles choices a reaction table so people
    #            # can voice preferences
    #            "roles": None,
    #            "advanced_rules": self.advanced_rules,
    #            "handicap": self.handicap,
    #            "version": lobby.version(),
    #    }
