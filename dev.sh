#!/bin/bash

mkdir -p .dev

ln -sfn "$HOME/.config/spicetify/Themes" .dev/Themes
ln -sfn "$HOME/.config/spicetify/Extensions" .dev/Extensions

echo "done"