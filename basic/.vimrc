set path+=**		"Lets vim look everywhere for files
set nocompatible 	"You're not vi act like it
filetype plugin on	"File manager
syntax on
set number
set relativenumber
set tabstop=4		"Tabs turn into 4 space when opening file 
set expandtab		"Tabs become just 4 spaces
set cursorline		"Sets a horizontal line where the cursor is 
filetype indent on      " load filetype-specific indent files
set lazyredraw          " redraw only when we need to.
set showmatch		"Highlight Matching
set incsearch           " search as characters are entered
set hlsearch            " highlight matches
set foldenable
set foldlevelstart=10   " open most folds by default
set foldnestmax=10      " 10 nested fold max
set foldmethod=indent   " fold based on indent level


"Keybindings


nmap <S-Enter> O<Esc>j
nmap <CR> o<Esc>k
nnoremap <space> za
" toggle gundo
nnoremap <leader>u :GundoToggle<CR>

autocmd BufWritePost config.h,config.def.h !sudo make install


"Vim-Plug
call plug#begin('~/.vim/plugged')
Plug 'vim-airline/vim-airline'
Plug 'lervag/vimtex'
call plug#end()
