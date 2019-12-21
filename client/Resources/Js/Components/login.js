document.addEventListener('DOMContentLoaded', function(event) {
    const loginModal = document.getElementById('modal-login');
    const registrationModal = document.getElementById('modal-registration');
    const forgottenModal = document.getElementById('modal-forgotten');
    const emailModal = document.getElementById('modal-email');
    const successModal = document.getElementById('modal-success');

    window.onclick = function (event) {
        switch (event.target) {
            case loginModal:
                toggle('login');
                break;
            case registrationModal:
                toggle('registration');
                break;
            case forgottenModal:
                toggle('forgotten');
                break;
            case emailModal:
                toggle('email');
                break;
            case successModal:
                toggle('success');
                break;
            default:
                break;
        }
    };

    $('#registration').on('submit',function(event){
        event.preventDefault();

        const formData = {
            firstname: $('#firstname').val(),
            middlename: $('#middlename').val(),
            lastname: $('#lastname').val(),
            birthdate: $('#birthdate').val(),
            address: $('#address').val(),
            postcode: $('#postcode').val(),
            telefoonnummer: $('#telefoonnummer').val(),
            email: $('#email-registration').val(),
            interests: $('#interests-registration').val(),
            username: $('#username').val(),
            password: $('#password').val(),
            passwordRepeat: $('#password-repeat').val()
        };

        ajaxRequest('POST', '/api/register', formData, (data, xhr) => {
            if (data.affectedRows > 0) {
                login(formData.username, formData.password);
            } else {
                if (xhr.status === 500) {
                    displayFormError('registration', xhr.responseJSON.error);
                }
            }
        });
    });

    $('#login').on('submit',function(event){
        event.preventDefault();

        login($('#username-login').val(), $('#password-login').val());
    });

    $('#password-forgotten').on('submit',function(event){
        event.preventDefault();

        ajaxRequest('POST', '/api/sendEmail', {email: $('#email-forgotten').val()}, (data, xhr) => {
            if (xhr.status === 500) {
                displayFormError('password-forgotten', xhr.responseJSON.error);
            } else {
                document.getElementById('verify-email').innerHTML = data;
                toggleClass('forgotten', 'email');
            }
        });
    });
});

function toggleClass(firstClass, secondClass) {
    if (secondClass) {
        toggle(firstClass);
        toggle(secondClass);
    } else {
        toggle(firstClass);
    }

    $('#interests-registration').select2({
        placeholder: "     Kies uw interesses"
    });
}

function toggle(className) {
    document.getElementById('modal-' + className).classList.toggle('modal-' + className + '-display');
    document.getElementById('modal-' + className).classList.toggle('modal-' + className + '-hide');
}

function login(username, password) {
    const loginData = {
        username: username,
        password: password
    };

    ajaxRequest('POST', '/api/login', loginData, (data, xhr) => {
        if (xhr.status === 500) {
            displayFormError('login', xhr.responseJSON.error);
        } else {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('socket_connected', 0);
            window.location.reload();
        }
    });
}

function displayFormError(form, errorMessage) {
    $('#' + form + ' .form-error').fadeIn('slow').delay(4000).fadeOut('slow');
    $('.error-text').html(errorMessage);
}
