(function () {

    // small card carousel
    var carousel = Carousel(".mdl-card-list:not(.mdl-card-list--large)", {
        type: 'carousel',
        perView: 8,
        breakpoints: {
            1919: {
                perView: 7,
            },
            1599: {
                perView: 6,
            },
            1439: {
                perView: 5,
            },
            800: {
                perView: 3,
            },
            425: {
                perView: 1,
                type: 'slider',
                loop: false,
                peek: { before: 0, after: 100 }
            }
        }
    });
    if (window.window.innerWidth < 768) {
        carousel.enable();
    } else {
        carousel.disable();
    }
    carousel.on('resize', function () {
        if (window.window.innerWidth < 768) {
            carousel.enable();
        } else {
            carousel.disable();
        }
    })

    //large card carousel
    var carousel = Carousel(".mdl-card-list.mdl-card-list--large", {
        type: 'carousel',
        perView: 7,
        breakpoints: {
            1919: {
                perView: 6,
            },
             1599: {
                perView: 5,
            },
            1439: {
                perView: 4,
            },
            800: {
                perView: 3,
            },
            425: {
                perView: 1,
                type: 'slider',
                loop: false,
                peek: { before: 0, after: 100 }
            }
        }
    });
    if (window.window.innerWidth < 768) {
        carousel.enable();
    } else {
        carousel.disable();
    }
    carousel.on('resize', function () {
        if (window.window.innerWidth < 768) {
            carousel.enable();
        } else {
            carousel.disable();
        }
    })
})();