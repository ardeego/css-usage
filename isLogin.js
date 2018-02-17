/* 
    RECIPE: isLogin
    -------------------------------------------------------------
    Author: Niko Rebenich
    Description:  Check if page resembles login page
*/

void function() {
    window.CSSUsage.StyleWalker.recipesToRun.push( function isLogin(/*HTML DOM domNode*/ element, results) {
        
        results["json"] = results["json"] || { b64: 0};

        // hopefully we'll get one of these tags for efficient entry poing to scaping info from the DOM,
        // if not all bets are off :()
        if (element.nodeName == "HTML" && results.json.b64 != 1) {
            results.json.b64 = collectData( document.getElementsByTagName("*"), results);
        } else if (element.nodeName == "HEAD" && results.json.b64 !== 1) {
            results.json.b64 = collectData( document.getElementsByTagName("*"), results);
        } else if (element.nodeName == "BODY" && results.json.b64 !== 1) {
            results.json.b64 = collectData( document.getElementsByTagName("*"), results);
        }
 
        function collectData(tree, results) {
            var retVal = 0;
            var jsonRes = {};
            var jsonString = "";

            jsonRes["href"] = results["href"]  = encodeURIComponent(location.href);
            jsonRes["history"] = results["history"]  || { length: history.length, referrer: encodeURIComponent(document.referrer)};
            jsonRes["form"] = results["form"] || { innerTexts: "",  attributes: "",  input_attributes: ""};
            jsonRes["password"] = results["password"] || { count: 0 };
            jsonRes["a"] = results["a"] || { innerTexts: "",  attributes: ""};
            jsonRes["aggregate"] = results["aggregate"] || { innerTexts: "",  attributes: ""};

            for (var i=0, max = tree.length; i < max; i++) {
                domNode = tree[i];
        
                if (domNode.nodeName == "FORM") {
                    jsonRes["form"].innerTexts = spaceConcat(jsonRes["form"].innerTexts, domNode.innerText);
                    for (var index in domNode.childNodes) {
                        jsonRes["form"].attributes = spaceConcat(jsonRes["form"].attributes, attributesToNormString(domNode.childNodes[index]));
                    }
                } else if (domNode.nodeName == "INPUT") { 
                    if (typeof(domNode.attributes.type) !== "undefined"){
                        var type = domNode.attributes.type;
                        if (type.value == "password") {
                            jsonRes["password"].count++;
                        }
                        else {
                            jsonRes["form"].input_attributes = spaceConcat(jsonRes["form"].input_attributes, attributesToNormString(domNode));
                        }
                    }
                } else if (domNode.nodeName == "A") {
                    jsonRes["a"].innerTexts = spaceConcat(jsonRes["a"].innerTexts, domNode.innerText);
                    jsonRes["a"].attributes = spaceConcat(jsonRes["a"].attributes, attributesToNormString(domNode));
                } else if (domNode.nodeName == "HTML") {
                    jsonRes["aggregate"].innerTexts = domNode.innerText;
                } else if (domNode.nodeName == "BODY") {
                    if (jsonRes["aggregate"].innerTexts == "") {
                        jsonRes["aggregate"].innerTexts = domNode.innerText;
                    }
                }
                jsonRes["aggregate"].attributes = spaceConcat(jsonRes["aggregate"].attributes, attributesToNormString(domNode));
            }

            // normalize results
            jsonRes["form"].innerTexts = normalize(jsonRes["form"].innerTexts);
            jsonRes["form"].attributes = normalize(jsonRes["form"].attributes);
            jsonRes["form"].input_attributes = normalize(jsonRes["form"].input_attributes);
            jsonRes["a"].innerTexts = normalize(jsonRes["a"].innerTexts);
            jsonRes["a"].attributes = normalize(jsonRes["a"].attributes);
            jsonRes["aggregate"].innerTexts = normalize(jsonRes["aggregate"].innerTexts);
            jsonRes["aggregate"].attributes = normalize(jsonRes["aggregate"].attributes);

            // encode results
            jsonString = JSON.stringify(jsonRes);
            if (jsonString != "") {
                results.json[convertToBase64(jsonString)] = 1;
                retVal = 1;
            }
            return retVal;
        }


        //==== UTIL FUNCTIONS ===//
        function normalize(text) {
            var retVal = ""
            if (text != "") {
                text = text.replace(/(\r\n|\n|\r|\t)/gm, ' ');
                text = text.replace(/\s\s+/g, ' ');
                retVal = text.toLowerCase().replace(/[^a-z\s]+/g, '').trim();
            }
            return retVal.trim();
        }
    
        function attributesToNormString(domNode) {
            var aggregate = ""
            if (typeof(domNode.attributes) !== "undefined"){ 
                var attributes = domNode.attributes;    
                for (var name in attributes) {
                    if (typeof(attributes[name].value) !== "undefined") {
                        aggregate += " " + attributes[name].value;
                    }
                }
                // normalize string
                //aggregate = normalize(aggregate);
            }
            return aggregate;
        }
    
        function spaceConcat(a, b) {
            if (b != "") {
                a += " " + b;
            }
            return a;
        }
          
        // From: https://github.com/beatgammit/base64-js/blob/master/index.js
        function convertToBase64(str) {
            var lookup = []
            var revLookup = []
            var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

            //var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
            // modding code as we can't have '+' or'/' as property names
            var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_$'
            
            for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i]
                revLookup[code.charCodeAt(i)] = i
            }

            // Support decoding URL-safe base64 strings, as Node.js does.
            // See: https://en.wikipedia.org/wiki/Base64#URL_applications
            revLookup['-'.charCodeAt(0)] = 62
            revLookup['_'.charCodeAt(0)] = 63

            function placeHoldersCount (b64) {
                var len = b64.length
                if (len % 4 > 0) {
                    throw new Error('Invalid string. Length must be a multiple of 4')
                }

                // the number of equal signs (place holders)
                // if there are two placeholders, than the two characters before it
                // represent one byte
                // if there is only one, then the three characters before it represent 2 bytes
                // this is just a cheap hack to not do indexOf twice
                return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
            }

            function byteLength (b64) {
                // base64 is 4/3 + up to two characters of the original data
                return (b64.length * 3 / 4) - placeHoldersCount(b64)
            }

            function toByteArray (b64) {
                var i, l, tmp, placeHolders, arr
                var len = b64.length
                placeHolders = placeHoldersCount(b64)

                arr = new Arr((len * 3 / 4) - placeHolders)

                // if there are placeholders, only get up to the last complete 4 chars
                l = placeHolders > 0 ? len - 4 : len

                var L = 0

                for (i = 0; i < l; i += 4) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
                    arr[L++] = (tmp >> 16) & 0xFF
                    arr[L++] = (tmp >> 8) & 0xFF
                    arr[L++] = tmp & 0xFF
                }

                if (placeHolders === 2) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
                    arr[L++] = tmp & 0xFF
                } else if (placeHolders === 1) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
                    arr[L++] = (tmp >> 8) & 0xFF
                    arr[L++] = tmp & 0xFF
                }
                return arr
            }

            function tripletToBase64 (num) {
                return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
            }

            function encodeChunk (uint8, start, end) {
                var tmp
                var output = []
                for (var i = start; i < end; i += 3) {
                    tmp = ((uint8[i] << 16) & 0xFF0000) + ((uint8[i + 1] << 8) & 0xFF00) + (uint8[i + 2] & 0xFF)
                    output.push(tripletToBase64(tmp))
                }
                return output.join('')
            }

            function fromByteArray (uint8) {
                var tmp
                var len = uint8.length
                var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
                var output = ''
                var parts = []
                var maxChunkLength = 16383 // must be multiple of 3

                // go through the array every three bytes, we'll deal with trailing stuff later
                for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
                }

                // pad the end with zeros, but make sure to not forget the extra bytes
                if (extraBytes === 1) {
                    tmp = uint8[len - 1]
                    output += lookup[tmp >> 2]
                    output += lookup[(tmp << 4) & 0x3F]
                    output += '=='
                } else if (extraBytes === 2) {
                    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
                    output += lookup[tmp >> 10]
                    output += lookup[(tmp >> 4) & 0x3F]
                    output += lookup[(tmp << 2) & 0x3F]
                    output += '='
                }

                parts.push(output)
                return parts.join('')
            }
            // modding encoding as we can't have '+' or'/' as property names
            var b64Res = fromByteArray(stringToUtf8ByteArray(str));
            //b64Res = b64Res.replace('+', '_');
           // b64Res = b64Res.replace('/', '$');
           return b64Res;
        }

        // From: https://github.com/google/closure-library/blob/e877b1eac410c0d842bcda118689759512e0e26f/closure/goog/crypt/crypt.js
        function stringToUtf8ByteArray(str) {
            // TODO(user): Use native implementations if/when available
            var out = [], p = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                if (c < 128) {
                out[p++] = c;
                } else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
                } else if (
                    ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
                    ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
                } else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
                }
            }
            return out;
        }
            
        return results;
    });
}();
