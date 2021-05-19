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

(function () {
    // custom drawer
    document.addEventListener("click", function (event) {
        if (event.target.hasParentClass("mdl-layout__drawer-close")) {
            document.querySelector(".mdl-layout__drawer").removeClass("is-visible");
            document.querySelector(".mdl-layout__obfuscator").removeClass("is-visible");
        }
    });

    // custom search form
    SearchForm();
})();

function SearchForm() {
    var Search = {
        scrollThreshold: 80,
        searchShown: false,
        header: document.querySelector(".mdl-layout__header"),
        input: document.querySelectorAll(".mdl-search__input"),
        panel: document.querySelector(".mdl-search__panel"),
        resultList: document.querySelector(".mdl-search__result .mdl-grid"),
        searchIcon: document.querySelectorAll(".mdl-search__input-search"),
        closeBtn: document.querySelectorAll(".mdl-search__input-close"),
        history: document.querySelectorAll(".mdl-search__history"),
        content: document.querySelector(".mdl-layout__content"),
        searchLoading: document.querySelectorAll(".mdl-search__search-loading"),
        searchLoadingSpinner: document.querySelectorAll(".mdl-search__search-loading .mdl-spinner"),
        moreLoadingSpinner: document.querySelector(".mdl-search__more-loading .mdl-spinner"),
        init: function () {
            this.input.addEventListener("focus", function () {
                this.showSearchResult();
            }.bind(this));
            this.input.addEventListener("keyup", function (event) {
                if (event.keyCode == 13) {
                    this.search();
                } else {
                    this.autocomplete(event.target);
                }
            }.bind(this));
            this.closeBtn.addEventListener("click", function () {
                this.hideSearchResult();
            }.bind(this));
            this.header.addEventListener("click", function (event) {
                if (event.target.hasParentClass("mdl-search__header") || event.target.hasParentClass("mdl-search__panel")) {
                    return;
                }
                this.hideSearchResult();
            }.bind(this));
            this.history.addEventListener("click", function (event) {
                this.input.val(event.currentTarget.innerText);
                this.search();
            }.bind(this));
            this.content.addEventListener("scroll", function () {
                if (this.content.scrollTop > 0) {
                    this.header.removeClass("mdl-layout__header--seamed");
                } else {
                    this.header.addClass("mdl-layout__header--seamed");
                }
            }.bind(this));
            this.panel.addEventListener("scroll", function (event) {
                if (this.panel.scrollTop + this.panel.offsetHeight - this.panel.scrollHeight <= this.scrollThreshold) {
                    this.loadMore();
                }
            }.bind(this));
        },
        autocomplete: function (input) {
            var value = input.value;
            if (value) {
                var result = {
                    total: Math.floor(Math.random() * 6),
                    items: []
                }
                for (var i = 0; i < result.total; i += 1) {
                    result.items.push(value + "" + Math.random())
                }
                this.renderAutocomplete(input, result);
            } else {
                this.renderAutocomplete(input, { items: [] });
            }

        },
        renderAutocomplete: function (node, result) {
            var html = "";
            for (var i = 0; i < result.items.length; i += 1) {
                html += '<button class="mdl-search__input-autocomplete-item mdl-button mdl-js-button mdl-js-ripple-effect">' + result.items[i] + '</button>';
            }
            var panel = node.parentElement.querySelector(".mdl-search__input-autocomplete")
            panel.style.height = result.items.length * 42 + "px";
            panel.innerHTML = html;
            panel.querySelectorAll(".mdl-search__input-autocomplete-item").addEventListener("click", function (event) {
                this.input.val(event.target.innerText);

                setTimeout(function () {
                    panel.innerHTML = "";
                    panel.style.height = 0;
                    this.search();

                }.bind(this), 10)
            }.bind(this))
        },
        showSearchResult: function () {
            if (this.searchShown) {
                return;
            }
            this.searchShown = true;
            this.panel.addClass("is-visible");
            this.searchIcon.addClass("hidden");
            this.closeBtn.removeClass("hidden");
            this.header.removeClass("mdl-layout__header--seamed");
        },
        hideSearchResult: function () {
            if (!this.searchShown) {
                return;
            }
            this.searchShown = false;
            this.panel.removeClass("is-visible");
            this.closeBtn.addClass("hidden");
            this.searchIcon.removeClass("hidden");
            this.header.addClass("mdl-layout__header--seamed");
        },
        search: function () {
            //todo: do search here
            if (this.loading) {
                return;
            }
            this.loading = true;
            this.searchLoading.addClass("is-active");
            this.searchLoadingSpinner.addClass("is-active");
            setTimeout(function () {
                this.searchLoading.removeClass("is-active");
                this.searchLoadingSpinner.removeClass("is-active");
                this.loading = false;
            }.bind(this), 3000);
        },
        loadMore: function () {
            if (this.loading) {
                return;
            }
            this.loading = true;
            this.moreLoadingSpinner.addClass("is-active");
            this.mockData();
        },
        mockData: function () {
            var div = document.createElement("div");
            var items = this.resultList.querySelectorAll(".mdl-cell");
            var nodes = [];
            for (var i = 0; i < items.length; i += 1) {
                div.innerHTML = items[i].outerHTML;
                nodes.push(div.firstChild);
            }
            setTimeout(function () {
                for (var i = 0; i < nodes.length; i += 1) {
                    this.resultList.appendChild(nodes[i]);
                }
                this.moreLoadingSpinner.removeClass("is-active");
                this.loading = false;
            }.bind(this), 3000);
        }
    };
    Search.init();

    return Search;
}
