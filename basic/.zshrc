# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH




# Path to your oh-my-zsh installation.
export ZSH="/home/max/.oh-my-zsh"
export TERM="xterm-256color"
export EDITOR='nvim'
export FZF_BASE="/usr/bin/fzf"

# Add scripts directory to path
if [ -d "$HOME/.scripts" ] ; then
    PATH="$PATH:$HOME/.scripts"
fi

#decreases the delay of going into vim mode
export KEYTIMEOUT=1


 #Set the Theme
ZSH_THEME="alanpeabody"


# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"


# Uncomment the following line to enable command auto-correction.
 ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
 COMPLETION_WAITING_DOTS="true"




# Which plugins would you like to load?
# Standard plugins can be found in ~/.oh-my-zsh/plugins/*
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
  git
  archlinux
  sudo
  dirhistory
  systemd
  tmux
  fzf
  zsh-autosuggestions
)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

cat ~/.cache/wal/sequences
# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
#bindkey -v

bindkey '^ ' autosuggest-accept
alias -g G='| grep '
alias mk='ssh mkabel'
alias tsln='ssh teslan' 
alias xclip="xclip -selection c"
alias -s pdf='zathura'
alias pia='/opt/piavpn/bin/pia-client'
alias vim='nvim'
alias ivim='vim /home/max/.config/sxhkd/sxhkdrc'
alias bvim='vim /home/max/.config/bspwm/bspwmrc'
alias ssys='sudo systemctl'
alias cp='rsync -avh'
alias powah="upower -i `upower -e |grep 'BAT'`"
alias ls='exa'
alias cat='bat'
alias find='fd'


gitall() {
    git add .
    if [ "$1" != "" ] # or better, if [ -n "$1" ]
    then
        git commit -m "$1"
    else
        git commit -m update
    fi
    git push
}


PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}$%b "
export VISUAL=nvim;
export EDITOR=nvim;
