# DJDavid98's Beat Saber Overlay

An overlay created by [DJDavid98] for the [BSDataPuller] and [BeatSaberPlus] mods.

[DJDavid98]: https://djdavid98.art

[BSDataPuller]: https://github.com/ReadieFur/BSDataPuller/

[BeatSaberPlus]: https://github.com/hardcpp/BeatSaberPlus

## Features

> [!IMPORTANT]
> Some customization options refer to "query parameters" which is a technical term for values in a
> URL that are denoted by a starting `?` character and a `&` between individual values. If you want
> to provide multiple options at once, be sure to use the format `?param1=value1&param2=value2&…`
>
> "Deprecated" means the functionality might still work bit it is not actively maintained, and it is
> subject for removal in the future. You should avoid using it, and if you are currently using it,
> switch to the suggested alternatives.

### Live Map Data

The overlay works with either of the two mods. In order to use a specific one as the data source,
add the `source` query parameter with the data source's code as the value. Available codes:

* `BSDP` - BSDataPuller (default, supports all features)
* `BSPlus` - BeatSaberPlus (unreliable BSR IDs, no ranked stars)
* `MOCK` - Virtual source which uses pre-defined events (for testing)
* `OFF` - **Deprecated**, please use `disabled=beat-saber-root`, see the [Customizable UI] section

[Customizable UI]: #customizable-ui

While playing, the current song will appear in the top-right corner along with some supplemental
information like difficulty, length, ranked stars and PP. Additionally, an accuracy graph and the
currently selected modifiers are displayed.

#### Automatic BRB Scene Switching

If given advanced access to OBS through the browser source settings, the overlay will automatically
switch between two scenes called `Main` and `BRB`, the first is used while the overlay connection is
open, and the second in any other case. If you don't want this behavior, do not grant advanced
access to the browser source.

### Heart Rate

Heart rate tracking can be configured by hovering over the bottom left corner of the page. Currently
supported options
are:

* Bluetooth Low Energy heart rate monitors via the Web Bluetooth API
    * The button is only shown if the current browser supports it
    * Tested with Polar H10 in Chrome v110 on Windows 11 22H2
    * Requires using the browser UI to select the desired device, so you will need to use Window
      Capture and color filter, this does not work when used as an OBS Browser Source
    * The device selection is lost when the page is reloaded, and it must be selected again
* Pulsoid API using websockets (requires a paid subscription)
    * After the API key is entered in the dialog it will be preserved across page loads until
      manually cleared
* Any arbitrary Websocket source
    * You can provide a host URL and optionally path to the JSON object data
    * Without a path the socket data is treated as plaintext numbers

### Customizable UI

Customizable may be a stretch, but basically, if there's an element on the overlay that you do not
want to see from the list below, you can use the `disable` query parameter, and provide a list of
comma-separated values to hide those elements and save the processing power needed to render them.

Nesting means an element is part of another, so if you hide the element higher on the list, it will
cause ones below it to also not render.

* `background-root` - the checkered background (automatically hidden inside OBS Browser Sources)
* `beat-saber-root` - wraps all components related to Beat Saber
    * `connection-root` - displays connection status with the chosen Beat Saber live data source
    * `beat-saber-additional-data-root` - additional data about the currently playing map
        * `beat-saber-accuracy-graph-root` - combined accuracy, energy, and miss graph
        * `beat-saber-modifiers-root` - list of currently active modifiers
* `chat-root` - chat overlay integrated with [DoubleColonBot]
* `heart-rate-root` - displays the components related to heart rate tracking
    * `bouncy-root` - my personal bouncy animation videos that changes speed depending on heart rate
* `credits-root` - my personal logo linking to my website & a local clock, swapping on a timer

If you are not me, you most likely want to use at least this to remove elements specific to me:

```
credits-root,bouncy-root,chat-root
```

You can also remove these elements via custom CSS, but this parameter is not simply hiding the
elements visually, it's also not doing any of the data processing associated with them. For example,
if you hide `heart-rate-root`, that effectively disables all code in the overlay related to getting
and displaying heart rate data, saving you some CPU resources.

> [!NOTE]
> Regarding `credits-root`, you are more than welcome to remove it to avoid confusing your viewers
> with my logo. If you end up using it in your own streams, all I would ask you to consider is to
> include a note about where you got this overlay from, both to let others find it too and also out
> of courtesy for my work on this entirely custom overlay page.
>
> If you are wondering what links to use, you can link to
> * my Twitch channel: https://www.twitch.tv/djdavid98
> * the GitHub page of this overlay: https://github.com/DJDavid98/Beat-Saber-Overlay
> * my website: https://djdavid98.art
>
> Crediting is not mandatory, I will not go after you if you don't do it, but as a community we
> should be striving to lift each other up, and I very much feel like it's mutually beneficial to
> credit your fellow creators and developers who make what you do possible, and I myself try to live
> by that as well.

[DoubleColonBot]: https://github.com/DJDavid98/DoubleColonBot

## Attributions

<!-- Keep in sync with SettingsPageCredits.tsx -->

If I'm going to ask others to credit me for my work, you can bet that I'm going to credit everyone
whose work I myself used during the creation of this overlay.

* Bluetooth logo: https://commons.wikimedia.org/wiki/File:Bluetooth.svg
* Pulsoid logo is based on the Pulsoid App icon. This project is not affiliated with Pulsoid in any
  way, shape, or form.
* Bouncy icon made by [KisuPantteri](https://www.twitch.tv/KisuPantteri)
* Beat Saber UI font: [Teko](https://fonts.google.com/specimen/Teko)
* Overlay UI font: [Kalam](https://fonts.google.com/specimen/Kalam)

### Appreciation

Thanks to the individuals below for their contributions towards making this overlay the best it can
possibly be through any combination of constructive feedback, improvement ideas, code contributions,
and generally being sources of inspiration:

* [Gosha](https://github.com/Gosha)
* [MinnieFops](https://www.twitch.tv/minniefops)
* [TheBlackParrot](https://www.twitch.tv/theblackparrot)
