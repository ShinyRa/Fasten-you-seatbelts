'use stict';

function Route(name, htmlName, javascript, defaultRoute) {
    try {
        if(!name || !htmlName) {
            throw 'error: name and htmlName params are mandatories';
        }
        this.constructor(name, htmlName,javascript, defaultRoute);
    } catch (e) {
        console.error(e);
    }
}

Route.prototype = {
    name: undefined,
    htmlName: undefined,
    default: undefined,
    javascript: undefined,
    constructor: function (name, htmlName, javascript, defaultRoute) {
        this.name = name;
        this.htmlName = htmlName;
        this.default = defaultRoute;
        this.javascript = javascript;
    },
    isActiveRoute: function (hashedPath) {
        return hashedPath.replace('#', '') === this.name; 
    }
};