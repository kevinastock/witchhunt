# Witchhunt

...

# pre commit checks

python3 -m venv envs/dev
source envs/dev/bin/activate.fish
pip install -r requirements.txt -r requirements-dev.txt
black witchhunt/
flake8 witchhunt/
