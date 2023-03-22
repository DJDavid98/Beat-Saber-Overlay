# DJDavid98's BSDP Overlay

An overlay for the [BSDataPuller](https://github.com/ReadieFur/BSDataPuller/)
and [BeatSaberPlus](https://github.com/hardcpp/BeatSaberPlus) mods for my personal use.

## Features

The overlay works with either of the two mods, but in order to use BSDataPuller (which now appears to be unmaintained)
as the data source add `?bsdp` to the URL. BeatSaberPlus is used as the default source.

While playing, the current song will appear in the top-right corner along with some supplemental information like
difficulty, length, ranked stars and PP. Additionally, an accuracy graph and the currently selected modifiers are
displayed.

If given advanced access to OBS through the browser source settings, the overlay will automatically switch between two
scenes called `Main` and `BRB`, the first is used while the overlay connection is open, and the second in any other
case. If you don't want this behavior, do not grant advanced access to the browser source.

Heart rate tracking can be configured by hovering over the bottom left corner of the page. Currently supported options
are:

* Bluetooth Low Energy heart rate monitors via the Web Bluetooth API
    * The button is only shown if the current browser supports it
    * Tested with Polar H10 in Chrome v110 on Windows 11 22H2
    * Requires using the browser UI to select the desired device, so you will need to use Window Capture and color
      filter, this does not work when used as an OBS Browser Source
    * The device selection is lost when the page is reloaded, and it must be selected again
* Pulsoid API using websockets (requires a paid subscription)
    * After the API key is entered in the dialog it will be preserved across page loads until manually cleared

## Future plans

* include an option to read heart rate data from any arbitrary websocket source
* allow changing the "bouncy" image via URL parameters

## Attributions

* Bluetooth logo: https://commons.wikimedia.org/wiki/File:Bluetooth.svg
* Pulsoid logo is based on the Pulsoid App icon. This project is not affiliated with Pulsoid in any way, shape, or form.
* Bouncy icon made by [KisuPantteri](https://www.twitch.tv/KisuPantteri)
