# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH




# Path to your oh-my-zsh installation.
export ZSH="/home/max/.oh-my-zsh"



# Add scripts directory to path
if [ -d "$HOME/.scripts" ] ; then
    PATH="$PATH:$HOME/.scripts"
fi

#decreases the delay of going into vim mode
export KEYTIMEOUT=1


 #Set the Theme
ZSH_THEME="pygmalion"
#ZSH_THEME="agnoster"


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
)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"


# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

bindkey -v

alias -g G='| grep '
alias mk='ssh mkabel@mkabel.me'
alias -s pdf='zathura'
alias pia='/opt/piavpn/bin/pia-client'
alias vim='nvim'
alias da='nohup /home/max/anaconda3/bin/jupyter-notebook &'
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
