#! /bin/bash
xrdb -merge ~/.Xresources &

nm-applet &

setxkbmap -option caps:escape
xbindkeys

.screenlayout/Dual-monitor.sh

~/.scripts/wallpaper

compton --config ~/.config/compton/compton.conf &

redshift -c .config/redshift.conf -l manual &

ckb-next -b &

unclutter &

exec i3
