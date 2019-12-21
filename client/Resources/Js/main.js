$(document).ready(() => {
	// Only show navigation bar and logout button to logged in users
	ajaxRequest('POST', '/api/authenticate', {token: sessionStorage.getItem('token')}, (data, xhr) => {
		if (xhr.status === 200) {
			$('nav').show();
			$('.login-button').hide();
			$('.logout-button').show();
			$('#login-mobile').hide();
			$('#logout-mobile').show();
		}
	});
});