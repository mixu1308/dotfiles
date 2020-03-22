#!/bin/bash

mkdir -p  "${HOME}/.config/dunst"
ln -sf    "${HOME}/.cache/wal/dunstrc"    "${HOME}/.config/dunst/dunstrc"

mkdir -p  "${HOME}/.config/termite"
ln -sf    "${HOME}/.cache/wal/termite"    "${HOME}/.config/termite/config"

mkdir -p  "${HOME}/.config/rofi"
ln -sf    "${HOME}/.cache/wal/rofi"    "${HOME}/.config/rofi/config.rasi"

# restart dunst

pkill dunst
dunst &

# restart picom
pkill picom
picom --experimental-backends &



#restart polybar
#$HOME/.scripts/launch-polybar.sh
