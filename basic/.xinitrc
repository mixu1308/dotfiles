#! /bin/bash
xrdb -merge ~/.Xresources &

nm-applet &

setxkbmap -option caps:escape
xbindkeys
xset r rate 200 30 &
xsetroot -cursor-name left_ptr &

#.screenlayout/home-layout.sh

~/.scripts/wallpaper


redshift -c .config/redshift.conf -l manual &

ckb-next -b &

unclutter &

dunst &

xscreensaver -no-splash &

#picom --experimental-backends &

sxhkd &

exec bspwm 

