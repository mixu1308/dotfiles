#!/bin/bash

mkdir -p  "${HOME}/.config/dunst"
ln -sf    "${HOME}/.cache/wal/dunstrc"    "${HOME}/.config/dunst/dunstrc"

mkdir -p  "${HOME}/.config/termite"
ln -sf    "${HOME}/.cache/wal/termite"    "${HOME}/.config/termite/config"


# restart dunst

pkill dunst
dunst &


#restart polybar
$HOME/.scripts/launch-polybar.sh
