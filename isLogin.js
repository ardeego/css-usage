void function() {
    window.CSSUsage.StyleWalker.recipesToRun.push( function isLogin(/*HTML DOM Element*/ element, results) {
        if (element.nodeName == "INPUT") { 
            if (typeof(element.attributes.type) !== "undefined"){
                var type = element.attributes.type;
                if (type.value == "password") {
                    results["password"] = results["password"] || { count: 0 };
                    results["password"].count++;
                    //var loginForm = filterAttribute(element.form.attributes, ["login", "signup", "password"])
                    
                } else if (type == "submit") {
                    /**/
                }

                // The property exists
            }
        } 
        return results;
    });
}();
