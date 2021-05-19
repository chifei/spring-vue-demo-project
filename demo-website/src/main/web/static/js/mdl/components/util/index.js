HTMLElement.prototype.addClass = function (name) {
    if (this.classList) {
        this.classList.add(name);
    } else {
        this.className = this.className + " " + name;
    }
    return this;
};

HTMLElement.prototype.removeClass = function (name) {
    if (this.classList) {
        this.classList.remove(name);
    } else {
        this.className = this.className.replace(name, "");
    }
    return this;
};

HTMLElement.prototype.hasClass = function (name) {
    if (this.classList) {
        return this.classList.contains(name);
    } else {
        return this.className.indexOf(name) >= 0;
    }
};

HTMLElement.prototype.hasParentClass = function (name) {
    if (this.hasClass(name)) {
        return true;
    }
    return this.parentElement && this.parentElement.hasParentClass(name);
};

NodeList.prototype.addClass = function (name) {
    for (var i = 0; i < this.length; i += 1) {
        if (this[i].classList) {
            this[i].classList.add(name);
        } else {
            this[i].className = this[i].className + " " + name;
        }
    }
    return this;
};

NodeList.prototype.removeClass = function (name) {
    for (var i = 0; i < this.length; i += 1) {
        if (this[i].classList) {
            this[i].classList.remove(name);
        } else {
            this[i].className = this[i].className.replace(name, "");
        }
    }
    return this;
};

NodeList.prototype.addEventListener = function (name, listener, options) {
    for (var i = 0; i < this.length; i += 1) {
        this[i].addEventListener(name, listener, options);
    }
};

NodeList.prototype.val = function (value) {
    for (var i = 0; i < this.length; i += 1) {
        this[i].value = value;
    }
    return this;
};

NodeList.prototype.html = function (html) {
    for (var i = 0; i < this.length; i += 1) {
        this[i].innerHTML = html;
    }
    return this;
};
NodeList.prototype.css = function (key, value) {
    for (var i = 0; i < this.length; i += 1) {
        this[i].style[key] = value;
    }
    return this;
};

export function CustomCarousel(className, options) {
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
                var items = this.container.querySelectorAll(".glide__slides>*");
                console.log("carousel lenght", items.length)
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

export default { CustomCarousel }