// ==UserScript==
// @name         tvply.me
// @description  Transfers video stream to alternate video players: WebCast-Reloaded, ExoAirPlayer.
// @version      1.0.0
// @match        *://*.tvply.me/sdembed*
// @match        *://*.tvply.me/hdembed*
// @icon         https://www.vipleague.lc/favicon.ico
// @run-at       document-idle
// @homepage     https://github.com/warren-bank/crx-tvply-me/tree/greasemonkey-userscript
// @supportURL   https://github.com/warren-bank/crx-tvply-me/issues
// @downloadURL  https://github.com/warren-bank/crx-tvply-me/raw/greasemonkey-userscript/greasemonkey-userscript/tvply-me.user.js
// @updateURL    https://github.com/warren-bank/crx-tvply-me/raw/greasemonkey-userscript/greasemonkey-userscript/tvply-me.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// https://www.chromium.org/developers/design-documents/user-scripts

var user_options = {
  "script_injection_delay_ms":       0,

  "redirect_to_webcast_reloaded":     true,
  "force_http":                       true,
  "force_https":                      false,

  "skip_SD":                          false,
  "skip_HD":                          false,
  "skip_redirected_encryption_keys":  true,
  "debug_redirected_encryption_keys": 2
}

var payload = function(){
  // ===========================================================================

  var get_referer_url = function() {
    var referer_url
    try {
      referer_url = top.location.href
    }
    catch(e) {
      referer_url = window.location.href
    }
    return referer_url
  }

  var get_webcast_reloaded_url = function(hls_url, vtt_url, referer_url) {
    var encoded_hls_url, encoded_vtt_url, encoded_referer_url, webcast_reloaded_base, webcast_reloaded_url

    encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    encoded_vtt_url       = vtt_url ? encodeURIComponent(encodeURIComponent(btoa(vtt_url))) : null
    referer_url           = referer_url ? referer_url : get_referer_url()
    encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(referer_url)))

    webcast_reloaded_base = {
      "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
      "http":  "http://webcast-reloaded.surge.sh/index.html"
    }

    webcast_reloaded_base = (window.force_http)
                              ? webcast_reloaded_base.http
                              : (window.force_https)
                                 ? webcast_reloaded_base.https
                                 : (hls_url.toLowerCase().indexOf('http:') === 0)
                                    ? webcast_reloaded_base.http
                                    : webcast_reloaded_base.https

    webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_hls_url + (encoded_vtt_url ? ('/subtitle/' + encoded_vtt_url) : '') + '/referer/' + encoded_referer_url
    return webcast_reloaded_url
  }

  var redirect_to_url = function(url) {
    if (!url) return

    try {
      top.location = url
    }
    catch(e) {
      window.location = url
    }
  }

  var process_video_url = function(hls_url, vtt_url) {
    if (hls_url && window.redirect_to_webcast_reloaded) {
      // transfer video stream

      redirect_to_url(get_webcast_reloaded_url(hls_url, vtt_url))
    }
  }

  // ===========================================================================

  var process_scripts = function() {
    var regex = {
      eval_code:  /^.*eval\(\s*(.+)\s*\)/,
      hls_url:    /(?:const|let|var\s+)?(?:playUrl|strmUrl)\s*=\s*['"]([^'"]+)['"]/,
      whitespace: /[\r\n\t]+/g
    }

    var scripts, script, txt, matches, eval_code, hls_url, performs_encryption_key_redirect, debug_msg

    scripts = window.document.querySelectorAll('script:not([src]):not([x-crx-extension])')
    for (var i=0; i < scripts.length; i++) {
      script  = scripts[i]
      txt     = script.innerHTML.replace(regex.whitespace, ' ')
      matches = regex.eval_code.exec(txt)

      if (matches && matches.length) {
        eval_code = matches[1]
        txt       = 'function(){' + txt.replace(matches[0], ";\n" + 'return ' + eval_code + ';') + '}()'

        try {
          txt = eval('(' + txt + ')')

          if (txt && txt.length) {
            txt     = txt.replace(regex.whitespace, ' ')
            matches = regex.eval_code.exec(txt)

            if (matches && matches.length) {
              eval_code = matches[1]
              txt       = 'function(){' + txt.replace(matches[0], ";\n" + 'return ' + eval_code + ';') + '}()'

              try {
                txt = eval('(' + txt + ')')

                if (txt && txt.length) {
                  txt     = txt.replace(regex.whitespace, ' ')
                  matches = regex.hls_url.exec(txt)

                  if (matches && matches.length) {
                    hls_url = window.atob(matches[1])

                    if (hls_url && hls_url.length) {
                      performs_encryption_key_redirect = (txt.indexOf('XMLHttpRequest.prototype.open') >= 0)

                      if (performs_encryption_key_redirect && window.skip_redirected_encryption_keys) {
                        debug_msg = {hls_url: hls_url, encryption_key_redirect: txt}

                        if (typeof window.debug_redirected_encryption_keys === 'number') {
                          switch(window.debug_redirected_encryption_keys) {
                            case 2:
                              window.alert(JSON.stringify(debug_msg, null, 4))
                            case 1:
                              console.warn(debug_msg)
                              break
                          }
                        }
                      }
                      else {
                        process_video_url(hls_url)
                      }
                      break
                    }
                  }
                }
              }
              catch(e){}
            }
          }
        }
        catch(e) {}
      }
    }
  }

  // ===========================================================================

  var process_page = function() {
    var pathname = window.location.pathname

    if (window.skip_SD && (pathname.indexOf('/sdembed') === 0))
      return

    if (window.skip_HD && (pathname.indexOf('/hdembed') === 0))
      return

    process_scripts()
  }

  process_page()
}

var get_hash_code = function(str){
  var hash, i, char
  hash = 0
  if (str.length == 0) {
    return hash
  }
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = ((hash<<5)-hash)+char
    hash = hash & hash  // Convert to 32bit integer
  }
  return Math.abs(hash)
}

var inject_function = function(_function){
  var inline, script, head

  inline = _function.toString()
  inline = '(' + inline + ')()' + '; //# sourceURL=crx_extension.' + get_hash_code(inline)
  inline = document.createTextNode(inline)

  script = document.createElement('script')
  script.appendChild(inline)
  script.setAttribute('x-crx-extension', 'true')

  head = document.head
  head.appendChild(script)
}

var inject_options = function(){
  var _function = [
    'function(){',
      'window.redirect_to_webcast_reloaded'     + ' = ' + user_options['redirect_to_webcast_reloaded'],
      'window.force_http'                       + ' = ' + user_options['force_http'],
      'window.force_https'                      + ' = ' + user_options['force_https'],
      'window.skip_SD'                          + ' = ' + user_options['skip_SD'],
      'window.skip_HD'                          + ' = ' + user_options['skip_HD'],
      'window.skip_redirected_encryption_keys'  + ' = ' + user_options['skip_redirected_encryption_keys'],
      'window.debug_redirected_encryption_keys' + ' = ' + user_options['debug_redirected_encryption_keys'],
    '}'
  ].join("\n")

  inject_function(_function)
}

var bootstrap = function(){
  inject_options()
  inject_function(payload)
}

setTimeout(
  bootstrap,
  user_options['script_injection_delay_ms']
)
