import uuid

from witchhunt.chooser import Chooser

REACTIONS = 4
SELECTABLE_REACTIONS = 1


# TODO: should this also handle non-reaction voting?
# FIXME: icon
class ReactionVoter:
    def __init__(
        self, lobby, title, choices, max_selected, participants, writers, note
    ):
        """
        if writers is empty, each participant will cast their own vote.
        if writers has anyone in it, they will all interact with the same buttons,
        and all participants will see the output of that chooser
        """
        self.lobby = lobby
        self.title = title
        self.choices = choices
        self.max_selected = max_selected
        self.participants = []  # will be populated by calls to add_participant
        self.writers = list(writers)
        self.note = note
        self.component = uuid.uuid4().hex
        self.server_seq_id = 0

        self.primary_choosers = []
        for _ in range(max(len(writers), 1)):
            self.primary_choosers.append(
                Chooser(lobby, self.component, len(choices), max_selected, participants)
            )

        self.reactions = []
        for _ in choices:
            self.reactions.append([])
        for player in participants:
            self.add_participant(player)

    def add_participant(self, player):
        # for when a new player joins during role picking, and maybe when
        # peeping tom wakes up
        self.participants.append(player)
        for reaction in self.reactions:
            reaction.append(
                Chooser(
                    self.lobby,
                    self.component,
                    REACTIONS,
                    SELECTABLE_REACTIONS,
                    self.participants,
                )
            )

    def add_writer(self, player):
        if not self.writers:
            raise Exception("Can't add a writer")
        self.writers.append(player)

    def notify_players(self):
        pass
