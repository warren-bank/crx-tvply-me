### [tvply.me](https://github.com/warren-bank/crx-tvply-me/tree/greasemonkey-userscript)

[Userscript](https://github.com/warren-bank/crx-tvply-me/raw/greasemonkey-userscript/greasemonkey-userscript/tvply-me.user.js) to run in:
* the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) web browser extension for Chrome/Chromium

Its purpose is to:
* transfer video streams in embedded iframes hosted by _tvply.me_ to the top-level tool on the [Webcast-Reloaded](https://github.com/warren-bank/crx-webcast-reloaded) external [website](https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html)
  - mainly for use with:
    * _Google Chromecast_
    * [_ExoAirPlayer_](https://github.com/warren-bank/Android-ExoPlayer-AirPlay-Receiver)
    * [_HLS-Proxy_](https://github.com/warren-bank/HLS-Proxy)

#### Notes:

* on sites containing an embedded _tvply.me_ iframe
  - depending on your particular browser, the Chromium extension may not be allowed to redirect the parent window
    * in this case, the URL of the parent window needs to be added to a whitelist that allows this action:
      - open: `chrome://settings/content/popups`
      - next to _Allow_, click: `Add`
      - enter the domain for the site hosting the iframe
        * examples:
          - `https://embedstream.me:443`
          - `https://www.vipleague.lc:443`
          - `https://mlbstream.me:443`
          - `http://3d.freestreams-live1.com:80`

* after the video has been redirected to [WebCast-Reloaded](https://github.com/warren-bank/crx-webcast-reloaded) [external website](https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html)
  - the in-browser HTML5 player won't work
    * server response does not include permissive CORS HTTP headers
  - _Google Chromecast_
    * will work _if_ encryption keys don't require redirection to an alternate server
      - ex: most of the SD (standard definition) streams
  - [_HLS-Proxy_](https://github.com/warren-bank/HLS-Proxy)
    * can be used to reimplement encryption key URL redirection
      - writing a custom hook function requires knowledge of coding in javascript
    * can proxy the modified stream to any standard video player that supports HLS
      - including _Google Chromecast_ and [_ExoAirPlayer_](https://github.com/warren-bank/Android-ExoPlayer-AirPlay-Receiver)

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
