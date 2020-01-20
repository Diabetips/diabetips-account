$(".app-remove").click((el) => {
    var app = $(el.target.parentNode.parentNode.parentNode);
    $.post("", { appid: app.find(".appid i")[0].textContent }, () => { location.reload(); }, "json");
});
