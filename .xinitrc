#! /bin/bash
setxkbmap -option caps:escape
[[ -f ~/.Xresources ]] && xrdb -merge ~/.Xresources
exec i3


