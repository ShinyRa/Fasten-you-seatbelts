function generateRequestContent(map) {
    return `<div class="request-container" id="request-container-${map.MatchID}">
                <a href="#profileview" onclick="localStorage.setItem('partner_id', ${map.userId})" class="request-picture">
                    <img src="${map.profilePicture}">
                </a>
                <div class="request-info1">
                    <label><b>Naam: </b>${map.name}</label>
                    <label><b>Leeftijd: </b>${map.age}</label>
                    ${map.adres ? '<label><b>Woont op: </b>' + map.adres + ' </label>' : ''}
                </div>
                <div class="request-button">
                    <a onclick="confirmMatch(2, ${map.MatchID})"><img src="https://i.ibb.co/25n39K0/icons8-checkmark-50.png" alt="icons8-checkmark-50" border="0"></a>
                    <a onclick="confirmMatch(0, ${map.MatchID})"><img src="https://i.ibb.co/HtxwPjV/icons8-delete-50-1.png" alt="icons8-delete-50-1" border="0"></a>
                </div>
            </div>`
}

function confirmMatch(action, matchId){
    //Add match
    ajaxRequest('POST', '/api/updateRequest', {action, matchId, token: sessionStorage.getItem('token')}, (data, xhr) => {
        //Hide match
        if (xhr.status === 200) {
            document.getElementById("request-container-" + matchId).classList.add("hidden")
        }
    });
}

function getRequests() {
    ajaxRequest('POST', '/api/getRequests', {token: sessionStorage.getItem('token')}, (data, xhr) => {
        if (xhr.status === 200) {
            let mainDiv = document.getElementById("requestsWrapper");

            for (let i = 0; i < data.length; i++) {
                $(mainDiv).append(generateRequestContent(data[i]));
            }

            if(data.length === 0){
                $(mainDiv).append(`
                    <div class="empty-request-container">
                        <p>Er zijn op dit moment geen uitnodigingen beschikbaar!</p>
                    </div>`
                );
            }
        }
    });
}

getRequests();
