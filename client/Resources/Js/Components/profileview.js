(function() {
    let partnerId = localStorage.getItem('partner_id');

    //Get user data
    ajaxRequest('POST', '/api/getPartner', {partnerId}, (data, xhr) => {
        if (xhr.status === 200) {
            $('[name]').each((i, _) => {
                switch ($(_).attr('name')) {
                    case 'geboortedatum':
                        if (data.geboortedatum) {
                            let date = data.geboortedatum.split(/[- :]/);
                            $(_).val(date[0] + "-" + date[1] + "-" + date[2]);
                        }
                        break;
                    case 'interesses':
                        $(_).val(JSON.parse(data.interesses).join(', '));
                        break;
                    default:
                        $(_).val(data[$(_).attr('name')]);
                        break;
                }
            });

            let path = (data.profielfoto) ? './Resources/Img/Uploads/user_' + data.UserID + '/' + data.profielfoto : './Resources/Img/default_profile.jpg';
            $('#profile_picture_view').attr('src', path);
        }
    });

    //Trip data
    ajaxRequest('POST', '/api/getPartnerReizen', {partnerId}, (data, xhr) => {
        if (xhr.status === 200 && data.length > 0) {
            data.forEach((reis) => {
                $('table.reis-table tbody').append(
                    "<tr>" +
                    "<td>" + reis.begin_reis + "</td>" +
                    "<td>" + reis.eind_reis + "</td>" +
                    "<td>" + reis.locatie + "</td>" +
                    "</tr>"
                );
            });
        } else {
            $('#no-trips').show();
            $('.reis-table').hide();
        }
    });
    
    //Get match and check if matching status is 2 to hide button
    ajaxRequest('POST', '/api/getMatch', {partnerId, token: sessionStorage.getItem('token')}, (data, xhr) => {
        if (xhr.status === 200 && data.matchingStatus === 2) {
            $('#delete-match').show();
        }
    });
})();

//Delete match
$('#delete-match').on('click', function(event) {
    let confirmDelete = confirm('Weet u zeker dat u deze match wilt verwijderen?');

    if (confirmDelete) {
        ajaxRequest('POST', '/api/deleteMatch', {partnerId: localStorage.getItem('partner_id'), token: sessionStorage.getItem('token')}, (data, xhr) => {
            if (xhr.status === 200) {
                window.location = '#chat';
                window.location.reload();
            }
        });
    }
});
