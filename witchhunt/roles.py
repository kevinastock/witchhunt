import re
from enum import Enum


class Category(Enum):
    HOLY = "Holy"
    OFFENSE = "Offense"
    INFORMATION = "Information"
    DEFENSE = "Defense"


def _display_name(cls):
    return re.sub(r"(?!^)(?=[A-Z])", " ", cls.__name__)


class Role:
    def __init__(self):
        pass

    def name(self):
        return _display_name(type(self))

    def description(self):
        return type(self).__doc__


class Priest(Role):
    """Each night, you may check if a target is in the Witch Coven."""

    category = Category.HOLY


class Judge(Role):
    """At the end of any day the players fail to select a target to hang, you
    may privately decide yourself. This hanging ignores extra lives."""

    category = Category.OFFENSE


class Gravedigger(Role):
    """At the start of each night, you learn the cards of anyone who died that
    day."""

    category = Category.INFORMATION


class Apprentice(Role):
    """At the start of the game, you may select Judge or Gravedigger. You learn
    who has that character and take over their duties if they die."""

    category = Category.INFORMATION


class Survivalist(Role):
    """You start the game with an extra life."""

    category = Category.DEFENSE


class DirtyOldBastard(Role):
    """Once per game when your death is announced, you may kill a target."""

    category = Category.OFFENSE


class Gambler(Role):
    """At the start of the game, you may select even or odd. On those nights
    (but not days), you are protected from a kill."""

    category = Category.DEFENSE


class Fanatic(Role):
    """Whenever the Priest checks you, you are secretly notified and gain an
    extra life."""

    category = Category.DEFENSE


class Oracle(Role):
    """At the start of the game, you learn the identity of a random Village
    Peasant."""

    category = Category.INFORMATION


class Watchman(Role):
    """At the end of the first night, you learn the identity of a random
    Village Peasant who did not wake up during the night."""

    category = Category.INFORMATION


class Hunter(Role):
    """The first time a player survives a kill, you may kill a target the
    following night."""

    category = Category.OFFENSE


class Emissary(Role):
    """The first three days and nights, you enjoy unlimited protection from all
    hangings and night kills."""

    category = Category.DEFENSE


class LooseCannon(Role):
    """Before the end of any day, you may reveal this card. Sacrifice yourself
    to end the day and decide who to hang."""

    category = Category.OFFENSE


class Assassin(Role):
    """Once per game during any day (before time is up), you may reveal this
    card and guess the character of a target. If correct, the target is killed.
    If incorrect, you are killed."""

    category = Category.OFFENSE


class Nurse(Role):
    """Once per game during any day (before time is up), you may reveal this
    card and name any non-holy character. If that character is still alive,
    they gain an extra life."""

    category = Category.DEFENSE


class Spiritualist(Role):
    """Once per game during any day (before time is up), you may reveal this
    card and name any dead player. You will privately learn that player's
    cards."""

    category = Category.INFORMATION


class BenevolentOldDame(Role):
    """Once per game when your death is announced, you may give a target other
    than yourself an extra life."""

    category = Category.DEFENSE


class Acolyte(Role):
    """At the start of the game, you learn who has the Priest character."""

    category = Category.HOLY


class Bomber(Role):
    """At the start of the game, you may select a target to receive the Bomb.
    Once per game at the end of any night, you may signal to detonate the Bomb.
    It is removed from the game, and player holding it is killed."""

    category = Category.OFFENSE


class PeepingTom(Role):
    """Once per game, you may observe the private actions of any non-holy
    character. If that character is dead, you may make decisions in their
    place."""

    category = Category.INFORMATION


class FortuneTeller(Role):
    """At the start of the game, select a character. You learn what the
    moderator will say if that character dies at night."""

    category = Category.INFORMATION


class Inquisitor(Role):
    """Each night, you may check a target's character category (such as Holy,
    Offense, Defense, or Information)."""

    category = Category.INFORMATION


roles = {_display_name(cls): cls for cls in Role.__subclasses__()}
