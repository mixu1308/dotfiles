#! /bin/bash
xrdb -merge ~/.Xresources &
xrandr --setprovideroutputsource modesetting NVIDIA-0
xrandr --auto


nm-applet &

setxkbmap -option caps:escape
xbindkeys
#xmodmap .config/xmodmap/xmodmap.cfg
xset r rate 200 30 &
xsetroot -cursor_name left_ptr &
wmname LG3D &

#.screenlayout/home-layout.sh

~/.scripts/wallpaper


redshift -c .config/redshift.conf -l manual &

ckb-next -b &

unclutter &

dunst &

xscreensaver -no-splash &

picom --experimental-backends &

sxhkd &

keepassxc &

exec bspwm 

