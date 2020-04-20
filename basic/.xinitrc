#! /bin/bash
xrdb -merge ~/.Xresources &

nm-applet &

setxkbmap -option caps:escape
xbindkeys

.screenlayout/home-layout.sh

~/.scripts/wallpaper


redshift -c .config/redshift.conf -l manual &

ckb-next -b &

unclutter &

dunst &

xscreensaver -no-splash &

picom --experimental-backends &

exec i3 

