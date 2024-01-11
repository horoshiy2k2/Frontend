$(document).ready(function() {

    // ===== Длобавление class BODY при загрузке страницы
	$('body').addClass('_load');

	if (navigator.userAgent.indexOf('Mac OS X') != -1) {
		$("body").addClass("mac");
	} else {
		$("body").addClass("pc");
	}

	// === Burger menu
	$(document).on('click', '.burger', function () {
		$(this).toggleClass('active');
		$('.burger-content').slideToggle();
	});

});

