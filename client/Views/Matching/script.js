function getMatches(map) {
    return `<div class="match-container" id="match-container-${map.matchId}">
                <a href="#profileview" onclick="localStorage.setItem('partner_id', ${map.userId})" class="match-picture">
                    <img src="${map.profilePicture}">
                </a>
                <div class="match-info1">
                    <label><b>Naam: </b>${map.name}</label>
                    <label><b>Leeftijd: </b>${map.age}</label>
                    ${map.adres ? '<label><b>Woont op: </b>' + map.adres + ' </label>' : ''}
                    ${map.startDate ? '<label><b>Begin datum: </b>' + map.startDate + ' </label>' : ''}
                    ${map.endDate ? '<label><b>Eind datum: </b>' + map.endDate + ' </label>' : ''}
                    ${map.location ? '<label><b>Naar: </b>' + map.location + ' </label>' : ''}

                </div>
                <div class="match-button">
                    <a onclick="confirmMatch(${map.userId}, 1, ${map.matchId})"><img src="https://i.ibb.co/25n39K0/icons8-checkmark-50.png" alt="icons8-checkmark-50" border="0"></a>
                    <a onclick="confirmMatch(${map.userId}, 0, ${map.matchId})"><img src="https://i.ibb.co/HtxwPjV/icons8-delete-50-1.png" alt="icons8-delete-50-1" border="0"></a>
                </div>
            </div>`
}

//Hier wordt data gefilterd
function sortData(data, value) {
    //Hoogste match percentage als eerste
    if (value === "matchingDesc") {
        data.sort((a, b) => parseFloat(b.matchingPrecent) - parseFloat(a.matchingPrecent));
    }
    else if (value === "ageAsc") {
        data.sort((a, b) => parseFloat(b.age) - parseFloat(a.age));
    }
    else if (value === "ageDesc") {
        data.sort((a, b) => parseFloat(a.age) - parseFloat(b.age));
    }

    return data;
}

//Maak stukjes HTML voor de maching pagina
function generateMatchingContent() {
    //Main matching container waar alle HTML ingaat
    let mainDiv = document.getElementById("matching-container");

    //Matching filter elementen
    let sortingFilter = document.getElementById("filter-sorting").value;
    let locationFilter = document.getElementById("filter-locatie").value;
    let startDateFilter = document.getElementById("filter-starting-date");
    let endDateFilter = document.getElementById("filter-ending-date");

    //Reset de main div voor nieuwe HTML
    mainDiv.innerHTML = "";

    //Check of er op locatie wordt gefilterd of niet
    if (locationFilter && locationFilter !== "undefined") {
        //Voeg dag filters toe
        startDateFilter.classList.remove("hidden");
        endDateFilter.classList.remove("hidden");

        //Haal matches op voor een speciefieke bestemming
        ajaxRequest('POST', '/api/getMatches/' + locationFilter, {token: sessionStorage.getItem('token')}, (data, xhr) => {
            if (xhr.status === 200) {
                //Sorteer data
                data = sortData(data, sortingFilter);

                //Ga over elke match heen
                for (let i = 0; i < data.length; i++) {
                    data[i].matchId = i;

                    if (startDateFilter.value) {
                        //Als er een start datum is ingevult en hij is eerder dan die ingevoerde datum sla deze loop itteratie over
                        if (new Date(data[i].startDate).getTime() < new Date(startDateFilter.value).getTime()) {
                            continue;
                        }
                    }
                    if (endDateFilter.value) {
                        //Als er een eind datum is ingevult en hij is later dan die ingevoerde datum sla deze loop itteratie over
                        if (new Date(data[i].endDate).getTime() > new Date(endDateFilter.value).getTime()) {
                            continue;
                        }
                    }

                    //Maak HTML van de user info en voeg het toe aan de pagina
                    $(mainDiv).append(getMatches(data[i]));
                }

                //Als er geen data wordt gevonden geef de gebruiker een uitleg
                if (data.length === 0) {
                    $(mainDiv).append(`
                            <div class="empty-match-container">
                                <p>Er zijn geen resultaten gevonden op deze bestemming!</p>
                            </div>`
                    );
                }
            }
        });
    }
    else {
        //Haal beide dag filters weg
        startDateFilter.classList.add("hidden");
        endDateFilter.classList.add("hidden");

        //Haal alle matches op
        ajaxRequest('POST', '/api/getMatches/general', {token: sessionStorage.getItem('token')}, (data, xhr) => {
            if (xhr.status === 200) {
                //Sorteer data met gekozen filter
                data = sortData(data, sortingFilter);

                //Ga over elke match heen
                for (let i = 0; i < data.length; i++) {
                    data[i].matchId = i;

                    //Maak HTML van de user info en voeg het toe aan de pagina
                    $(mainDiv).append(getMatches(data[i]));
                }

                //Als er geen data wordt gevonden geef de gebruiker een uitleg
                if (data.length === 0) {
                    $(mainDiv).append(`
                            <div class="empty-match-container">
                                <p>Er zijn geen resultaten gevonden!</p>
                            </div>`
                    );
                }
            }
        });
    }
}

function confirmMatch(userId, action, matchId) {
    //Voeg match toe aan de database
    ajaxRequest('POST', '/api/addMatch', {
        userId2: userId,
        action,
        token: sessionStorage.getItem('token')
    }, (data, xhr) => {
        //Als dit is gelukt hide de match-container
        if (xhr.status === 200) {
            document.getElementById("match-container-" + matchId).classList.add("hidden")
        }
    });
}

function expandContainer(e, maxHeight) {
    let element = $(e).parent()[0];

    if (element.style.height === '2.3rem') {
        element.style.height = maxHeight + "rem";
        element.style.overflow = "scroll"
    } else {
        element.style.height = '2.3rem';
        element.style.overflow = "hidden"
    }
}

function selectTrip(locatie, beginReis, eindReis, tripId) {
    let tripElem = document.getElementById("trip-container-" + tripId);
    let locationFilter = document.getElementById("filter-locatie");
    let startDateFilter = document.getElementById("filter-starting-date");
    let endDateFilter = document.getElementById("filter-ending-date");
    let activeElems = document.querySelectorAll(".destenation-container .active");

    if (tripElem.classList.contains("active")) {
        locationFilter.value = "undefined";
        startDateFilter.value = null;
        endDateFilter.value = null;

        tripElem.classList.remove("active");

        generateMatchingContent();
    }
    else {
        locationFilter.value = locatie;
        startDateFilter.value = beginReis;
        endDateFilter.value = eindReis;

        for (let i = 0; i < activeElems.length; i++) {
            activeElems[i].classList.remove("active");
        }

        tripElem.classList.add("active");

        generateMatchingContent();
    }
}

function generateTripsContent(map) {
    return `
        <div onclick="selectTrip('${map.locatie}' , '${map.begin_reis}', '${map.eind_reis}', ${map.ReisID})" id="trip-container-${map.ReisID}" class="trip-container">
            <div class="trip-header">
                <h1>${map.locatie}</h1>
            </div>   
            <div class="trip-information">
                <div id="trip-start-date"><label>Reis begint op: ${map.begin_reis}</label></div>
                <div id="trip-end-date"><label>Reis eindigt op: ${map.eind_reis}</label></div>
            </div>
        </div>
    `
}

function getUserTrips(){
    ajaxRequest('POST', '/api/getReizen', {token: sessionStorage.getItem('token')}, (data, xhr) => {
        if (xhr.status === 200) {
            let mainDiv = document.getElementById("destenation-container");

            if (data) mainDiv.innerHTML = "";

            for (let i = 0; i < data.length; i++) {
                $(mainDiv).append(generateTripsContent(data[i]));
            }
        }
    });
}

getUserTrips();

generateMatchingContent();
