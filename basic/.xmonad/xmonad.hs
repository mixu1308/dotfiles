-- IMPORTS
import XMonad
import Data.Monoid
import System.Exit
import XMonad.Hooks.ManageDocks
import XMonad.Util.SpawnOnce            --SpawnOnOnce
import XMonad.Actions.SpawnOn           --SpawnOn
import XMonad.Util.Run                  -- Used for xmproc xmobar
import XMonad.Hooks.SetWMName           -- fixes hava issues with tiling WM
import XMonad.Hooks.EwmhDesktops        -- fixes fullscreen issues
import XMonad.Util.Cursor               -- set default cursor
import Graphics.X11.ExtraTypes.XF86     -- Adds nonstandard keys (mute, volume,brightness)
import XMonad.Util.EZConfig             -- makes config of keys ez
import XMonad.Util.NamedScratchpad      -- Adds named scratchpad support
import XMonad.Actions.CopyWindow        -- Adds option to pin window to all workspaces


-- Layout Imports
import XMonad.Layout.Spacing            --Adds gaps
import XMonad.Layout.NoBorders          -- makes it possible to remove borders for fullscreen
import XMonad.Layout.MultiToggle        -- Toggle layout
import XMonad.Layout.MultiToggle.Instances
import XMonad.Layout.Tabbed
import XMonad.Layout.TwoPane

import qualified XMonad.StackSet as W
import qualified Data.Map        as M

-- The preferred terminal program, which is used in a binding below and by
-- certain contrib modules.
--
myTerminal      = "termite"
myBrowser       = "firefox"

-- Whether focus follows the mouse pointer.
myFocusFollowsMouse :: Bool
myFocusFollowsMouse = True

-- Whether clicking on a window to focus also passes the click to the window
myClickJustFocuses :: Bool
myClickJustFocuses = False

-- Width of the window border in pixels.
--
myBorderWidth   = 3


-- modMask lets you specify which modkey you want to use. The default
-- is mod1Mask ("left alt").  You may also consider using mod3Mask
-- ("right alt"), which does not conflict with emacs keybindings. The
-- "windows key" is usually mod4Mask.
--
myModMask       = mod4Mask

-- The default number of workspaces (virtual screens) and their names.
-- By default we use numeric strings, but any string may be used as a
-- workspace name. The number of workspaces is determined by the length
-- of this list.
--
-- A tagging example:
--
-- > workspaces = ["web", "irc", "code" ] ++ map show [4..9]
--
myWorkspaces    = ["1","2","3","4","5","6","7","8","9"] ++ (map snd myExtraWorkspaces)
myExtraWorkspaces = [("xK_0","0")]

-- Border colors for unfocused and focused windows, respectively.
--
myNormalBorderColor  = "#1b2229"
myFocusedBorderColor = "#6986a0"

------------------------------------------------------------------------
--Scratchpads

scratchpads = 
    [   NS "ranger" spawnRanger findRanger dropdownPosition
    ,   NS "terminal" spawnTerminal findTerminal centerFloatPos
    ]

    where
    spawnRanger     = "termite --name=ranger -e ranger"
    findRanger      = resource =? "ranger"

    spawnTerminal   = "termite --name=scratchpad -e tmux"
    findTerminal    = resource =? "scratchpad"

    dropdownPosition= customFloating $ W.RationalRect 0 0 1 0.4
    centerFloatPos  = customFloating $ W.RationalRect (1/6) (1/11) (2/3) (4/5)

------------------------------------------------------------------------
-- Key bindings. Add, modify or remove key bindings here.
--
shortKeys c = mkKeymap c $

    -- launch a terminal
    [ ("M-S-<Return>"       , spawn myTerminal)

    , ("M-<Backspace>"      , spawn "./.scripts/power-menu.sh")

    -- application keybindings
    --browser
    , ("M-S-w"              , spawnHere myBrowser )

    -- launch dmenu
    , ("M-d"                , spawn "dmenu_run")

    -- launch gmrun
    , ("M-S-p"              , spawn "gmrun")

    -- close focused window
    , ("M-q"                , kill)

     -- Rotate through the available layout algorithms
    , ("M-<Space>"          , sendMessage NextLayout)

    -- Reset Layout
    --, ("M-S-<Space>"        , setLayout $ XMonad.layoutHook conf)

    --  Reset the layouts on the current workspace to default
    --, ("M-S-<Space>"        , setLayout $ XMonad.layoutHook conf)

    -- Resize viewed windows to the correct size
    , ("M-S-n"                , refresh)
    -- Dmenu mount and unmount disks
    , ("M-m"                , spawn "./.scripts/dmenu-mount.sh")
    , ("M-S-m"              , spawn "./.scripts/dmenu-umount.sh")

    -- Move focus to the next window
    , ("M-<Tab>"            , windows W.focusDown)

    -- Move focus to the next window
    , ("M-j"                , windows W.focusDown)

    -- Move focus to the previous window
    , ("M-k"                , windows W.focusUp  )

    -- Move focus to the master window
    , ("M-n"                , windows W.focusMaster  )

    -- Swap the focused window and the master window
    , ("M-<Return>"         , windows W.swapMaster)

    -- Swap the focused window with the next window
    , ("M-S-j"              , windows W.swapDown  )

    -- Swap the focused window with the previous window
    , ("M-S-k"              , windows W.swapUp    )

    -- Shrink the master area
    , ("M-h"                , sendMessage Shrink)

    -- Expand the master area
    , ("M-l"                , sendMessage Expand)

    -- Push window back into tiling
    , ("M-t"                , withFocused $ windows . W.sink)

    -- Pin window to all workspaces
    , ("M-p"                , windows copyToAll)
    , ("M-S-p"              , killAllOtherCopies)

    -- Increment the number of windows in the master area
    , ("M-,"                , sendMessage (IncMasterN 1))

    -- Deincrement the number of windows in the master area
    , ("M-."                , sendMessage (IncMasterN (-1)))


    --MEDIA CONTROL
    , ("<XF86AudioRaiseVolume>", spawn "pactl set-sink-volume @DEFAULT_SINK@ +2%")
    , ("<XF86AudioLowerVolume>", spawn "pactl set-sink-volume @DEFAULT_SINK@ -2%")
    , ("<XF86AudioMute>"       , spawn "pactl set-sink-mute @DEFAULT_SINK@ toggle")

    , ("<XF86MonBrightnessUp>" , spawn "light -A 5 -s 'sysfs/backlight/auto'")
    , ("<XF86MonBrightnessDown>", spawn "light -U 5 -s 'sysfs/backlight/auto'")
    -- Screenshot
    , ("<Print>"              , spawn "maim  -sou | xclip -selection clipboard -t 'image/png'")
    , ("M-f"                , sendMessage $ Toggle NBFULL)


    -- SCRATCHPADS
    , ("M-e"                , namedScratchpadAction scratchpads "ranger")
    , ("M-u"                , namedScratchpadAction scratchpads "terminal")




    -- Toggle the status bar gap
    -- Use this binding with avoidStruts from Hooks.ManageDocks.
    -- See also the statusBar function from Hooks.DynamicLog.
    --
    -- , ((modm              , xK_b     ), sendMessage ToggleStruts)

    -- Quit xmonad
    , ("M-S-q", io (exitWith ExitSuccess))

    -- Restart xmonad
    , ("M-S-c", spawn "xmonad --recompile; xmonad --restart")

    -- Run xmessage with a summary of the default keybindings (useful for beginners)
    , ("M-S-/", spawn ("echo \"" ++ help ++ "\" | xmessage -file -"))
    ]

longKeys conf@(XConfig {XMonad.modMask = modm}) = M.fromList $
    --
    -- mod-[1..9], Switch to workspace N
    -- mod-shift-[1..9], Move client to workspace N
    --
    [((m .|. modm, k), windows $ f i)
        | (i, k) <- zip (XMonad.workspaces conf) [xK_1 .. xK_9]
        , (f, m) <- [(W.view, 0), (W.shift, shiftMask)]]
    ++

    --
    -- mod-{w,e,r}, Switch to physical/Xinerama screens 1, 2, or 3
    -- mod-shift-{w,e,r}, Move client to screen 1, 2, or 3
    --
    [((m .|. mod1Mask, key), screenWorkspace sc >>= flip whenJust (windows . f))
        | (key, sc) <- zip [xK_w, xK_e, xK_r] [0..]
        , (f, m) <- [(W.view, 0), (W.shift, shiftMask)]]


   --check xmonad arch wiki for how to ,cause this shit don't work and I don't know why
   -- ++
   -- [((modm, key), windows $ W.greedyView ws)
   --     | (key,ws) <- myExtraWorkspaces]
   -- ++ 
   -- [((modm .|. shiftMask, key), windows $ W.shift ws)
   --     | (key,ws) <- myExtraWorkspaces]



myKeys  conf             = (shortKeys conf) <+> (longKeys conf)



------------------------------------------------------------------------
-- Mouse bindings: default actions bound to mouse events
--
myMouseBindings (XConfig {XMonad.modMask = modm}) = M.fromList $

    -- mod-button1, Set the window to floating mode and move by dragging
    [ ((modm, button1), (\w -> focus w >> mouseMoveWindow w
                                       >> windows W.shiftMaster))

    -- mod-button2, Raise the window to the top of the stack
    , ((modm, button2), (\w -> focus w >> windows W.shiftMaster))

    -- mod-button3, Set the window to floating mode and resize by dragging
    , ((modm, button3), (\w -> focus w >> mouseResizeWindow w
                                       >> windows W.shiftMaster))

    -- you may also bind events to the mouse scroll wheel (button4 and button5)
    ]

-- Layouts:

-- You can specify and transform your layouts by modifying these values.
-- If you change layout bindings be sure to use 'mod-shift-space' after
-- restarting (with 'mod-q') to reset your layout state to the new
-- defaults, as xmonad preserves your old layout settings by default.
--
-- The available layouts.  Note that each layout is separated by |||,
-- which denotes layout choice.
--
myLayout    = fullScreenToggle 
            $ avoidStruts 
            $ standardLayout
    where
        standardLayout      =   tiled ||| Mirror tiled ||| simpleTabbed ||| twoWindow
    
        fullScreenToggle    = mkToggle (single NBFULL)

        -- default tiling algorithm partitions the screen into two panes
        tiled       = spacing 9 
                    $ Tall 1 (3/100) (1/2)
        twoWindow   = avoidStruts $ TwoPane (3/100) (1/2)


------------------------------------------------------------------------
-- Window rules:

-- Execute arbitrary actions and WindowSet manipulations when managing
-- a new window. You can use this to, for example, always float a
-- particular program, or have a client always appear on a particular
-- workspace.
--
-- To find the property name associated with a program, use
-- > xprop | grep WM_CLASS
-- and click on the client you're interested in.
--
-- To match on the WM_NAME, you can use 'title' in the same way that
-- 'className' and 'resource' are used below.
--
myManageHook = 
            manageSpawn
     <+>    manageSpecific
     <+>    (namedScratchpadManageHook scratchpads)

    where
        manageSpecific = composeAll
            [ className =? "MPlayer"        --> doFloat
            , className =? "Gimp"           --> doFloat
            , className =? "Pavucontrol"    --> doFloat
            , className =? "discord"        --> doShift "9"
            , resource  =? "desktop_window" --> doIgnore
            , resource  =? "kdesktop"       --> doIgnore ]

------------------------------------------------------------------------
-- Event handling

-- * EwmhDesktops users should change this to ewmhDesktopsEventHook
--
-- Defines a custom handler function for X Events. The function should
-- return (All True) if the default handler is to be run afterwards. To
-- combine event hooks use mappend or mconcat from Data.Monoid.
--
myEventHook = docksEventHook
        <+> handleEventHook def

------------------------------------------------------------------------
-- Status bars and logging

-- Perform an arbitrary action on each internal state change or X event.
-- See the 'XMonad.Hooks.DynamicLog' extension for examples.
--
myLogHook = return ()

------------------------------------------------------------------------
-- Startup hook

-- Perform an arbitrary action each time xmonad starts or is restarted
-- with mod-q.  Used by, e.g., XMonad.Layout.PerWorkspace to initialize
-- per-workspace layout choices.
--
-- By default, do nothing.
myStartupHook = do
        ewmhDesktopsStartup     --might be useless
        spawnOnOnce "6" "thunderbird "
        spawnOnOnce "7" "telegram-desktop "
        spawnOnOnce "8" (myBrowser ++ " --new-window web.whatsapp.com")
        spawnOnOnce "9" ("chromium --new-window soundcloud.com")
        spawnOnOnce "9" "discord --start-minimized"
        setWMName "LG3D"                                            --used to fix java apps
        setDefaultCursor xC_left_ptr

------------------------------------------------------------------------
-- Now run xmonad with all the defaults we set up.

-- Run xmonad with the settings you specify. No need to modify this.
--
main = do
    xmproc <- spawnPipe "xmobar -x 0"
    xmonad $ docks $ ewmh defaults

-- A structure containing your configuration settings, overriding
-- fields in the default config. Any you don't override, will
-- use the defaults defined in xmonad/XMonad/Config.hs
--
-- No need to modify this.
--
defaults = def {
      -- simple stuff
        terminal           = myTerminal,
        focusFollowsMouse  = myFocusFollowsMouse,
        clickJustFocuses   = myClickJustFocuses,
        borderWidth        = myBorderWidth,
        modMask            = myModMask,
        workspaces         = myWorkspaces,
        normalBorderColor  = myNormalBorderColor,
        focusedBorderColor = myFocusedBorderColor,

      -- key bindings
        keys               = myKeys,
        mouseBindings      = myMouseBindings,

      -- hooks, layouts
        layoutHook         = myLayout,
        manageHook         = myManageHook,
        handleEventHook    = myEventHook,
        logHook            = myLogHook,
        startupHook        = myStartupHook
    }

-- | Finally, a copy of the default bindings in simple textual tabular format.
help :: String
help = unlines ["The default modifier key is 'alt'. Default keybindings:",
    "",
    "-- launching and killing programs",
    "mod-Shift-Enter  Launch xterminal",
    "mod-p            Launch dmenu",
    "mod-Shift-p      Launch gmrun",
    "mod-Shift-c      Close/kill the focused window",
    "mod-Space        Rotate through the available layout algorithms",
    "mod-Shift-Space  Reset the layouts on the current workSpace to default",
    "mod-n            Resize/refresh viewed windows to the correct size",
    "",
    "-- move focus up or down the window stack",
    "mod-Tab        Move focus to the next window",
    "mod-Shift-Tab  Move focus to the previous window",
    "mod-j          Move focus to the next window",
    "mod-k          Move focus to the previous window",
    "mod-m          Move focus to the master window",
    "",
    "-- modifying the window order",
    "mod-Return   Swap the focused window and the master window",
    "mod-Shift-j  Swap the focused window with the next window",
    "mod-Shift-k  Swap the focused window with the previous window",
    "",
    "-- resizing the master/slave ratio",
    "mod-h  Shrink the master area",
    "mod-l  Expand the master area",
    "",
    "-- floating layer support",
    "mod-t  Push window back into tiling; unfloat and re-tile it",
    "",
    "-- increase or decrease number of windows in the master area",
    "mod-comma  (mod-,)   Increment the number of windows in the master area",
    "mod-period (mod-.)   Deincrement the number of windows in the master area",
    "",
    "-- quit, or restart",
    "mod-Shift-q  Quit xmonad",
    "mod-q        Restart xmonad",
    "mod-[1..9]   Switch to workSpace N",
    "",
    "-- Workspaces & screens",
    "mod-Shift-[1..9]   Move client to workspace N",
    "mod-{w,e,r}        Switch to physical/Xinerama screens 1, 2, or 3",
    "mod-Shift-{w,e,r}  Move client to screen 1, 2, or 3",
    "",
    "-- Mouse bindings: default actions bound to mouse events",
    "mod-button1  Set the window to floating mode and move by dragging",
    "mod-button2  Raise the window to the top of the stack",
    "mod-button3  Set the window to floating mode and resize by dragging"]
