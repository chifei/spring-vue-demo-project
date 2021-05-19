(function () {
    var content = document.querySelector(".mdl-layout__content");
    var header = document.querySelector(".mdl-layout__header");
    content.addEventListener("scroll", function () {
        if (content.scrollTop >= header.offsetHeight) {
            header.addClass("mdl-layout__header--show-title");
        } else {
            header.removeClass("mdl-layout__header--show-title");
        }
    })
})();