(function () {
    Carousel('.mdl-banner', {
        type: 'carousel',
        startAt: 0,
        perView: 8,
        peek: 100,
        bullet: true,
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
                peek: 100
            },
            425: {
                perView: 1,
                peek: { before: 0, after: 100 }
            }
        }
    });
})();

function Carousel(className, options) {
    function CustomSize(Glide, Components, Events) {
        var CustomSize = {
            done: false,
            mount: function () {
            },

            method: function () {
                console.log('This method has been called on `mount.after` event.')
            }
        }

        Events.on(['build.before', 'resize', 'update'], function () {
            if (window.innerWidth >= 768) {
                var doubleWidth = Components.Sizes.slideWidth * 2 + Components.Gaps.value + 'px';
                var slides = Components.Html.slides;
                var items = Components.Clones.items;
                var doubleCount = 0;
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i].className.indexOf("mdl-card--large") >= 0) {
                        slides[i].style.width = doubleWidth;
                        doubleCount += 1;
                    }
                }
                for (var i = 0; i < items.length; i++) {
                    if (items[i].className.indexOf("mdl-card--large") >= 0) {
                        items[i].style.width = doubleWidth;
                        doubleCount += 1;
                    }
                }
                Components.Html.wrapper.style.width = Components.Sizes.wrapperSize + (doubleCount * Components.Sizes.slideWidth) + (doubleCount * Components.Gaps.value) + "px";
            }
        })

        return CustomSize;
    };
    var banner = {
        glide: null,
        container: document.querySelector(className),
        bulletContainerBefore: '<div class="glide__bullets" data-glide-el="controls[nav]">',
        bulletContainerAfter: '</div>',
        bulletTemplate: '<button class="glide__bullet" data-glide-dir="={{index}}"></button>',
        init: function () {
            if (options.bullet) {
                var html = this.bulletContainerBefore;
                var items = this.container.querySelectorAll(".glide__slide");
                console.log(items.length)
                for (var i = 0; i < items.length; i += 1) {
                    html += this.bulletTemplate.replace("{{index}}", i);
                }
                html += this.bulletContainerAfter;
                this.container.innerHTML += html;
            }
            this.glide = new Glide(className, options).mount({
                CustomSize: CustomSize
            });
            return this;
        },
        on: function (event, callback) {
            this.glide.on(event, function (e) {
                callback(e);
            });
            return this;
        },
        enable: function () {
            this.glide.enable();
        },
        disable: function () {
            this.glide.disable();
        }

    }
    return banner.init();
}