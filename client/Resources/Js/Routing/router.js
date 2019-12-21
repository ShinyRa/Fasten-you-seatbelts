'use strict';

function Router(routes) {
    try {
        if (!routes) {
            throw 'error: routes param is mandatory';
        }
        this.constructor(routes);
        this.init();
    } catch (e) {
        console.error(e);   
    }
}

Router.prototype = {
    routes: undefined,
    rootElem: undefined,
    constructor: function (routes) {
        this.routes = routes;
        this.rootElem = document.getElementById('app');
    },
    init: function () {
        let r = this.routes;
        (function(scope, r) { 
            window.addEventListener('hashchange', function (e) {
                scope.hasChanged(scope, r);
            });
        })(this, r);
        this.hasChanged(this, r);
    },
    hasChanged: function(scope, r){
        let length = r.length;

        if (window.location.hash.length > 0) {
            for (let i = 0; i < length; i++) {
                let route = r[i];
                if (route.isActiveRoute(window.location.hash.substr(1))) {
                    if ((route.name === "requests" || $('.profile-page').length) || (route.name === "matching") && $('.chatContainer').length) {
                        $('#app').animate({left: 1 * $(window).width() + "px"}, 300, () => {
                            $('#app').animate({left: -1 * $(window).width() + "px"}, 0, () => {
                                scope.goToRoute(route.htmlName, route);
                            });
                        });
                    }
                    else{
                        $('#app').animate({ left: -1 * $(window).width() + "px"}, 300, () => {
                            $('#app').animate({ left: 1 * $(window).width() + "px"}, 0, () => {
                                scope.goToRoute(route.htmlName, route);
                            });
                        });
                    }

                }
            }
        } else {
            for (let i = 0; i < length; i++) {
                let route = r[i];
                if(route.default) {
                    scope.goToRoute(route.htmlName, route);
                }
            }
        }
    },
    goToRoute: function (htmlName, route) {
        (function(scope) { 
            let url = htmlName,
                xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    scope.rootElem.innerHTML = this.responseText;
                    $('#app').animate({ left: 0 + 'px'});
                    $.getScript(route.javascript);

                    for(let i = 0; i < $(".menu-item").length; i++){
                        if($(".menu-item")[i].hash.substr(1) === route.name){
                            $(".menu-item")[i].className = "menu-item active";
                        }
                        else{
                            $(".menu-item")[i].className = "menu-item";
                        }
                    }
                }
            };
            xhttp.open('GET', url, true);
            xhttp.send();
        })(this);
    }
};