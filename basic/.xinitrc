#! /bin/bash
xrdb -merge ~/.Xresources &


setxkbmap -option caps:escape


.screenlayout/Dual-monitor.sh

~/.scripts/wallpaper

compton --config ~/.config/compton/compton.conf &

redshift &

ckb-next -b &

exec i3
