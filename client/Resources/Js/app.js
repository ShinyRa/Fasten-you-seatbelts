'use strict';

(function () {
    function init() {
        const router = new Router([
            new Route('homepage', 'Views/Homepage/index.html', 'Resources/Js/Components/homepage.js', true),
            new Route('about', 'Views/About/index.html', './'),
            new Route('chat', 'Views/Chat/index.html', 'Resources/Js/Components/chat.js'),
            new Route('login', 'Views/Login/index.html', ''),
            new Route('matching', 'Views/Matching/index.html', 'Views/Matching/script.js'),
            new Route('profile', 'Views/Profilepage/index.html', 'Resources/Js/Components/profile.js'),
            new Route('profileview', 'Views/Profilepage/profileview.html', 'Resources/Js/Components/profileview.js'),
            new Route('requests', 'Views/MatchingRequests/index.html', 'Views/MatchingRequests/script.js')
        ]);
    }
    init();
} ());
