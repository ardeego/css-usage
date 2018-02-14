/* 
    RECIPE: islogin
    -------------------------------------------------------------
    Author: Niko Rebenich
    Description:  Check if page has password field/form/ is login
*/

window.debugCSSUsage = true


void function () {
    document.addEventListener('DOMContentLoaded', function () {
        var results = {};
        var recipeName = "islogin";

        var all = document.getElementsByTagName("*");
        var element = null;

        for (var i=0, max = all.length; i < max; i++) {
            element = all[i];

            results["form"] = results["form"] || { innerTexts: "",  attributes: "",  input_attributes: ""};
            results["password"] = results["password"] || { count: 0 };
            results["a"] = results["a"] || { innerTexts: "",  attributes: ""};
            results["aggregate"] = results["aggregate"] || { innerTexts: "",  attributes: ""};

            if (element.nodeName == "FORM") {
                
                results["form"].innerTexts = normConcat(results["form"].innerTexts, element.innerText);

                for (var index in element.childNodes) {
                    results["form"].attributes = normConcat(results["form"].attributes, attributesToNormString(element.childNodes[index]));
                }
            } else if (element.nodeName == "INPUT") { 
                if (typeof(element.attributes.type) !== "undefined"){
                    var type = element.attributes.type;
                    if (type.value == "password") {
                        results["password"].count++;
                    }
                    else {
                        results["form"].input_attributes = normConcat(results["form"].input_attributes, attributesToNormString(element));
                    }
                }
            } else if (element.nodeName == "A") {
                results["a"].innerTexts = normConcat(results["a"].innerTexts, element.innerText);
                results["a"].attributes = normConcat(results["a"].attributes, attributesToNormString(element));
            } else if (element.nodeName == "HTML") {
                results["aggregate"].innerTexts = normConcat(results["aggregate"].innerTexts, element.innerText);
            } else if (element.nodeName == "BODY") {
                if (results["aggregate"].innerTexts == "") {
                    results["aggregate"].innerTexts = normConcat(results["aggregate"].innerTexts, element.innerText);
                }
            }
            results["aggregate"].attributes = normConcat(results["aggregate"].attributes, attributesToNormString(element));
        }

        appendResults(results);

        // Add it to the document dom
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

    });
}();
