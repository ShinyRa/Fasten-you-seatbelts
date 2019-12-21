const server = location.hostname === "127.0.0.1" ? "http://127.0.0.1:1337" : location.hostname === "is106-2.fys-hva.tk" ? "https://is106-2-app.fys-hva.tk/" : "http://pasively.com:1337";   

function ajaxRequest(type, url, body, callback) {
    $.ajax({
        url: server + url,
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(body),
        success: function (data, textStatus, xhr) {
            callback(data, xhr);
        },
        error: function (xhr, status) {
            callback(status, xhr);
        }
    });
}
