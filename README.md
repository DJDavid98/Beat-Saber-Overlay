# DJDavid98's BSDP Overlay

An overlay for the [BSDataPuller](https://github.com/ReadieFur/BSDataPuller/) Beat Saber Mod for my personal use.

Hover over the bottom left corner of the page to reveal heart rate tracking options. Currently supported options are:

* Bluetooth Low Energy heart rate monitors via the Web Bluetooth API, if the current browser supports it.
    * Tested with Polar H10 in Chrome v110 on Windows 11 22H2
    * Requires using the browser UI to select the desired device, so you will need to use Window Capture and color
      filter, this does not work when used as an OBS Browser Source
    * The device selection is lost when the page is reloaded, and it must be selected again
* Pulsoid API using websockets (requires a paid subscription)
    * After the API key is entered in the dialog it will be preserved across page loads until manually cleared

Future plans:

* include an option to read heart rate data from any arbitrary websocket source
* allow changing the "bouncy" image via URL parameters

## Attributions

* Bluetooth logo: https://commons.wikimedia.org/wiki/File:Bluetooth.svg
* Pulsoid logo is based on the Pulsoid App icon. This project is not affiliated with Pulsoid in any way, shape, or form.
* Bouncy icon made by [KisuPantteri](https://www.twitch.tv/KisuPantteri)
