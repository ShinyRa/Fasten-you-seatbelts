$(document).ready(() => {
    ajaxRequest('POST', '/api/authenticate', {token: sessionStorage.getItem('token')}, (data, xhr) => {
        if (xhr.status === 200) {
            $('.button-3d').hide();
        }
    });
});