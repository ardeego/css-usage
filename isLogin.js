/* 
    RECIPE: islogin
    -------------------------------------------------------------
    Author: Niko Rebenich
    Description:  Check if page has password field/form/ is login
*/

window.debugCSSUsage = true


void function () {
    document.addEventListener('DOMContentLoaded', function () {

              // overwrite buggy trim method
              if((''+String.prototype.trim).indexOf("[native code]") == -1) {
                console.warn('Replaced custom trim function with something known to work. Might break website.');
                String.prototype.trim = function() {
                    return this.replace(/^\s+|\s+$/g, '');
                }
            }
        
            var results = {};
            results["href"] = results["href"]  = encodeURIComponent(location.href);
            results["history"] = results["history"]  || { length: history.length, referer: encodeURIComponent(document.referrer)};
            results["form"] = results["form"] || { innerTexts: "",  attributes: "",  input_attributes: ""};
            results["password"] = results["password"] || { count: 0 };
            results["a"] = results["a"] || { innerTexts: "",  attributes: ""};
            results["aggregate"] = results["aggregate"] || { innerTexts: "",  attributes: ""};
        
            var recipeName = "islogin";
            var all = document.getElementsByTagName("*");
            var element = null;
        
            for (var i=0, max = all.length; i < max; i++) {
                element = all[i];
        
                if (element.nodeName == "FORM") {
                    
                    results["form"].innerTexts = spaceConcat(results["form"].innerTexts, element.innerText);
        
                    for (var index in element.childNodes) {
                        results["form"].attributes = spaceConcat(results["form"].attributes, attributesToNormString(element.childNodes[index]));
                    }
                } else if (element.nodeName == "INPUT") { 
                    if (typeof(element.attributes.type) !== "undefined"){
                        var type = element.attributes.type;
                        if (type.value == "password") {
                            results["password"].count++;
                        }
                        else {
                            results["form"].input_attributes = spaceConcat(results["form"].input_attributes, attributesToNormString(element));
                        }
                    }
                } else if (element.nodeName == "A") {
                    results["a"].innerTexts = spaceConcat(results["a"].innerTexts, element.innerText);
                    results["a"].attributes = spaceConcat(results["a"].attributes, attributesToNormString(element));
                } else if (element.nodeName == "HTML") {
                    results["aggregate"].innerTexts = element.innerText;
                } else if (element.nodeName == "BODY") {
                    if (results["aggregate"].innerTexts == "") {
                        results["aggregate"].innerTexts = element.innerText;
                    }
                }
                results["aggregate"].attributes = spaceConcat(results["aggregate"].attributes, attributesToNormString(element));
            }
    
            results["form"].innerTexts = normalize(results["form"].innerTexts);
            results["form"].attributes = normalize(results["form"].attributes);
            results["form"].input_attributes = normalize(results["form"].input_attributes);
            results["a"].innerTexts = normalize(results["a"].innerTexts);
            results["a"].attributes = normalize(results["a"].attributes);
            results["aggregate"].innerTexts = normalize(results["aggregate"].innerTexts);
            results["aggregate"].attributes = normalize(results["aggregate"].attributes);
    
            appendResults(results);
    
            //==== UTIL FUNCTIONS ===//
    
            function normalize(text) {
                var retVal = ""
                if (text != "") {
                    text = text.replace(/(\r\n|\r|\n|\t)+/g, ' ');
                    text = text.replace(/\s\s+/g, ' ');
                    retVal = text.toLowerCase().replace(/[^a-z\s]+/g, '').trim();
                }
                return retVal.trim();
            }
        
            function attributesToNormString(element) {
                var aggregate = ""
                if (typeof(element.attributes) !== "undefined"){ 
                    var attributes = element.attributes;    
                    for (var name in attributes) {
                        if (typeof(attributes[name].value) !== "undefined") {
                            aggregate += " " + attributes[name].value;
                        }
                    }
                    // normalize string
                    aggregate = normalize(aggregate);
                }
                return aggregate;
            }
        
            function spaceConcat(a, b) {
                if (b != "") {
                    a += " " + normalize(b);
                }
                return a;
            }
        
            // add it to the document dom
            function appendResults(results) {
                if (window.debugCSSUsage) console.log("Trying to append");
                var output = document.createElement('script');
                output.id = "css-usage-tsv-results";
                output.textContent = JSON.stringify(results);
                output.type = 'text/plain';
                document.querySelector('head').appendChild(output);
                var successfulAppend = checkAppend();
            }
        
            function checkAppend() {
                if (window.debugCSSUsage) console.log("Checking append");
                var elem = document.getElementById('css-usage-tsv-results');
                if (elem === null) {
                    if (window.debugCSSUsage) console.log("Element not appended");
                }
                else {
                    if (window.debugCSSUsage) console.log("Element successfully found");
                }
            }
    }
    });
}();
