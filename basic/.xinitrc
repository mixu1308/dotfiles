#! /bin/bash
xrdb -merge ~/.Xresources &

nm-applet &

setxkbmap -option caps:escape
xbindkeys

.screenlayout/home-layout.sh

~/.scripts/wallpaper

picom --experimental-backends &

redshift -c .config/redshift.conf -l manual &

ckb-next -b &

unclutter &

dunst &

xscreensaver -no-splash &

exec i3

