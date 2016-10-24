/*
PresetInputValue plugin
Version: 0.1
Author: Alexey Timofeev
-----------------------
Инициализация плагина :
      $("input").PresetInputValue();
      в самом input должен быть параметр data-preset="['Размер','Цвет']"
     или
      $("input").PresetInputValue({data:['Размер','Цвет']});

*/
(function () {



    var methods = {
        init: function (options) {

            // Создаём настройки по-умолчанию, расширяя их с помощью параметров, которые были переданы
            var settings = $.extend({
                'data' : false, // по умолчанию data берется из аттрибута data-preset
                'wrapperClass' : 'wrapper-list' //класс для контейнера значений
            }, options);

            var wrapper = $('<div class="'+settings.wrapperClass+'"></div>');

            var thisElements = this;

            //плагин должен возвращать this для поддержки цепочек вызова.
            return thisElements.each(function () {

                var input = $(this);

                var data = input.data("piv");

                //если плагин уже инициализирован, переходим к следующему элементу
                if (!data) {

                    var data = input.data("preset");

                    if (settings.data !== false) {
                        data = settings.data;
                    }

                    //инициализируем параметры
                    input.data("piv", {
                        settings: settings,
                        data : data
                    });

                    input.bind('input.PresetInputValue', methods.onChange);


                    //строим элемент контейнер для подсказок

                    //проверяем, есть ли уже контейнер?
                    input.siblings("." + settings.wrapperClass).remove();

                    // добавляем контейнер
                    input.after(wrapper);
                    input.data("piv").wrappElement = input.siblings("." + settings.wrapperClass);

                    wrapper.on("click", "li", function() {
                        input.val($(this).text());
                        wrapper.removeClass("active");
                    });

                    input.keydown(function (event) {
                        var lis = wrapper.find("ul li");
                        //console.log(event.which);
                        switch (event.which) {
                            case 40: // Down
                                event.preventDefault();
                                lis.PresetInputValue('nextLi');
                                break;
                            case 38: // Up
                                event.preventDefault();
                                lis.PresetInputValue('prevLi');
                                break;
                            case 13: // Enter
                                event.preventDefault();
                                var hoverLi = lis.filter(".hover");
                                if (hoverLi.length !== 0) {
                                    hoverLi.PresetInputValue('choiceLi',input);
                                } else {
                                    lis.first().PresetInputValue('choiceLi',input);
                                }
                                wrapper.removeClass("active");
                                break;
                            default:
                        }
                    });

                    // закрыть по клику вне элемента
                    $(document).click(function (event) {
                        if ($(event.target).closest(input.siblings(wrapper)).length) return;
                        input.siblings(wrapper).removeClass("active");
                        event.stopPropagation();
                    });

                }


            });
        },
        onChange: function () {
            var resHtml = $("<ul></ul>");
            var input = $(this);
            var inputValue = input.val();

            var wrapper = input.data("piv").wrappElement;

            if (inputValue.length >= 1) {

                var arrRes = input.PresetInputValue('like', input.data("piv").data, inputValue);

                if (arrRes.length > 0) {
                    arrRes.forEach(function(item) {
                        var li = $("<li>" + item + "</li>");
                        resHtml.append(li);
                    });
                    wrapper.html(resHtml);
                    wrapper.addClass("active");
                } else {
                    wrapper.removeClass("active");
                }

            } else {
                wrapper.removeClass("active");
            }
        },
        like: function (arr, search) {

            var result = [];

            arr.forEach(function (item, i) {
                if (item.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                    result.push(item);
                }
            });

            return result;
        },
        nextLi: function () {
            var lis = this;
            var hoverLi = lis.filter(".hover");
            if (hoverLi.length === 0) {
                lis.first().PresetInputValue('addClass');
            } else {
                hoverLi.PresetInputValue('removeClass');
                if (lis.last().get(0) === hoverLi.get(0)) {
                    lis.first().PresetInputValue('addClass');
                } else {
                    hoverLi.next().first().PresetInputValue('addClass');
                }
            }
        },
        prevLi: function () {
            var lis = this;
            var hoverLi = lis.filter(".hover");
            if (hoverLi.length === 0) {
                lis.last().PresetInputValue('addClass');
            } else {
                hoverLi.PresetInputValue('removeClass');
                if (lis.first().get(0) == hoverLi.get(0)) {
                    lis.last().PresetInputValue('addClass');
                } else {
                    hoverLi.prev().PresetInputValue('addClass');
                }
            }
        },
        choiceLi:function(input) {
            var li = this;
            input.val(li.text());
        },
        addClass:function() {
            this.addClass("hover");
        },
        removeClass: function () {
            this.removeClass("hover");
        },
        show: function () {

        },
        hide: function () {

        },
        update: function (content) {

        },
        destroy: function () {
            return this.each(function () {
                var input = $(this);
                input.initPlugin = false;
                input.unbind('.PresetInputValue');
                input.siblings("." + input.data("piv").settings.wrapperClass).remove();
            });
        }
    };

    $.fn.PresetInputValue = function (method) {

        //маппинг по методам
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.PresetInputValue');
        }

    }

})(jQuery);
