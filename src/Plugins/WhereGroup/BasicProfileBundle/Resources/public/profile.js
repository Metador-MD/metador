var userinput = false;

$(document).ready(function() {
    $('form').ajaxForm({
        target: '#myResultsDiv'
    });

    $(".-js-user-input").change(function() {
        userinput = true;
    });

    window.onbeforeunload = function () {
        if (userinput) {
            return 'verlassen?';
        }
    }
});
