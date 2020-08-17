$(document).ready(function() {
    $('input[name="timezone"]').val(Intl.DateTimeFormat().resolvedOptions().timeZone);
});
