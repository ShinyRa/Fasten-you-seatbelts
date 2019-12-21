$(document).ready(() => {
    $('#interests-profile').select2({
        placeholder: "Kies uw interesses"
    });

    $('#locatie').select2({
        placeholder: "Bestemming",
        allowClear: true
    });
});

//Get user and trip data and generate it on the profile page
(function() {
    //User data
    ajaxRequest('POST', '/api/getUser', {token: sessionStorage.getItem('token')}, (data, xhr) => {
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
                        $(_).val(JSON.parse(data.interesses)).trigger('change');
                        break;
                    default:
                        $(_).val(data[$(_).attr('name')]);
                        break;
                }
            });
        }
    });

    //Profile picture
    ajaxRequest('POST', '/api/getPicture', {token: sessionStorage.getItem('token')}, (data, xhr) => {
        if (xhr.status === 200) {
            let path = (data[0].profielfoto) ? './Resources/Img/Uploads/user_' + data[0].UserID + '/' + data[0].profielfoto : './Resources/Img/default_profile.jpg';
            $('#profile_picture').attr('src', path);
        }
    });

    //Trip data
    ajaxRequest('POST', '/api/getReizen', {token: sessionStorage.getItem('token')}, (data, xhr) => {
        if (xhr.status === 200 && data.length > 0) {
            data.forEach((reis) => {
                $('table.reis-table tbody').append(
                    "<tr>" +
                        "<td>" + reis.begin_reis + "</td>" +
                        "<td>" + reis.eind_reis + "</td>" +
                        "<td>" + reis.locatie + "</td>" +
                        "<td align='right'><p class='verwijder-reis' id='" + reis.ReisID + "'>×</p></td>" +
                    "</tr>"
                );
            });
        } else {
            $('#no-trips').show();
            $('.reis-table').hide();
        }
    });
})();

//Update profile page info when user clicks on edit button
$('.profile-page .edit').on('click', function(event) {
    let parentName = $(this).parents('div:eq(1)').attr('class');
    let formData = {
        type: parentName,
        token: sessionStorage.getItem('token')
    };

    $('.' + parentName + ' [name]').each((i, _) => {
        formData[$(_).attr('name')] = $(_).val();
    });

    //Switch to separate the form handling on the profile page
    switch (parentName) {
        //Post trip preferences
        case 'TripPreferences':
            ajaxRequest('POST', '/api/addReis', formData, (data, xhr) => {
                if (xhr.status === 200) {
                    alert('Reis toegevoegd!');
                    window.location.reload();
                }
            });
            break;
        //Post password change
        case 'change-password':
            ajaxRequest('POST', '/api/changePassword', formData, (data, xhr) => {
                if (xhr.status === 200) {
                    alert('Wachtwoord gewijzigd!');
                    window.location.reload();
                } else if (xhr.status === 500) {
                    alert(xhr.responseJSON.error);
                }
            });
            break;
        //Default post
        default:
            ajaxRequest('POST', '/api/updateUser', formData, (data, xhr) => {
                if (xhr.status === 200) {
                    alert('Gegevens aangepast!');
                    window.location.reload();
                }
            });
            break;
    }
});

//Sets user inactive and logs out
$('.delete-account').on('click', function(event) {
    let confirmDelete = confirm('Weet u zeker dat u uw account wilt verwijderen?');

    if (confirmDelete) {
        ajaxRequest('POST', '/api/deleteUser', {token: sessionStorage.getItem('token')}, (data, xhr) => {
            if (xhr.status === 200) {
                sessionStorage.removeItem('token');
                window.location.replace('#homepage');
                window.location.reload();
            }
        });
    }
});

//Delete trip
$('.reis-table').on('click', '.verwijder-reis', function(event) {
    let confirmDelete = confirm('Weet u zeker dat u deze reis wilt verwijderen?');
    let reisData = {
        ReisID: $(this).attr('id'),
        token: sessionStorage.getItem('token')
    };

    if (confirmDelete) {
        ajaxRequest('POST', '/api/deleteReis', reisData, (data, xhr) => {
            if (xhr.status === 200) {
                alert('Reis verwijderd!');
                window.location.reload();
            }
        });
    }
});

//Upload picture
function savePicture(){
    let save = confirm('Weet u zeker dat u deze foto wilt uploaden?');

    if(save){
        let file = document.getElementById('file-select').files;
        let formData = new FormData();

        if (file.length === 0) {
            alert('Selecteer een bestand om te uploaden');
            return;
        }

        formData.append('file', file[0], file[0].name);
        formData.append('token', sessionStorage.getItem('token'));
        formData.append('server', server === "https://is106-2-app.fys-hva.tk/");

        $.ajax({
            url: server + '/api/uploadPicture',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                alert(data);
                window.location.reload();
            },
            error: function(error) {
                console.log(error);
            }
        });
    }

}
