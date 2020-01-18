#! /bin/bash
xrdb -merge ~/.Xresources &

nm-applet &

setxkbmap -option caps:escape
xbindkeys

.screenlayout/Dual-monitor.sh
##TESLAN
#.screenlayout/DVI-right.sh

~/.scripts/wallpaper

compton --config ~/.config/compton/compton.conf &

redshift -c .config/redshift.conf -l manual &

ckb-next -b &

unclutter &
<<<<<<< HEAD

xscreensaver -no-splash &

=======
xscreensaver -no-splash &
>>>>>>> 049f88c96910d2f9389649de797f0a94ee4d862d
exec i3

