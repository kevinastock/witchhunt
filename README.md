# Witchhunt


## Frontend

Make sure you have `yarn` installed.

Get all the dependencies:

    yarn install

Give it a try:

    yarn dev # start the front end

If you make some changes, run the pre-commit hooks:

    scripts/pre-commit


## Backend

Point intellij at backend/ and hope for the best :shrug:

I think I'm using a java14 feature. Gradle will hopefully handle that for you,
but idk. Let me know.

Shut down is also a mess - the intellij shutdown button does not let the
process exit correctly, so you have to wait a while for the port to be release
before it can start up again.
