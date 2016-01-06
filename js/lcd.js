/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/bootstrap/bootstrap.d.ts"/>
/// <reference path="../../typings/knockout/knockout.d.ts"/>
var Pixel = (function () {
    function Pixel(val) {
        this.on = ko.observable(val);
    }
    Pixel.prototype.toggle = function () {
        this.on(!this.on());
    };
    return Pixel;
})();
var LcdViewModel = (function () {
    function LcdViewModel() {
        var _this = this;
        this.matrix = [];
        for (var i = 0; i < 8; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < 5; j++) {
                this.matrix[i][j] = new Pixel(false);
            }
        }
        this.numberBase = ko.observable('2');
        this.generatedCode = ko.computed(function () {
            var symbol = [];
            var base = parseInt(_this.numberBase());
            var prefix = _this.getPrefix(base);
            var places = base == 2 ? 5 : 2;
            for (var i = 0; i < 8; i++) {
                var v = 0;
                for (var j = 0; j < 5; j++) {
                    if (_this.matrix[i][j].on()) {
                        v |= 1 << j;
                    }
                }
                symbol.push(prefix + _this.pad(v.toString(base), places));
            }
            var s = [
                'byte customChar[8] = {',
                symbol.join(base == 2 ? ',\r\n' : ', '),
                '};'];
            return s.join(base == 2 ? '\r\n' : '');
        });
    }
    LcdViewModel.prototype.clear = function () {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 5; j++) {
                this.matrix[i][j].on(false);
            }
        }
    };
    LcdViewModel.prototype.invert = function () {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 5; j++) {
                this.matrix[i][j].toggle();
            }
        }
    };
    LcdViewModel.prototype.load = function (symbol) {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 5; j++) {
                this.matrix[i][j].on(symbol[i][j]);
            }
        }
    };
    LcdViewModel.prototype.getPrefix = function (base) {
        switch (base) {
            case 2:
                return '\t0b';
            case 8:
                return '0';
            case 16:
                return '0x';
            default:
                return '';
        }
    };
    LcdViewModel.prototype.pad = function (num, places) {
        while (num.length < places) {
            num = "0" + num;
        }
        return num;
    };
    return LcdViewModel;
})();
// bootstrap prevents Click event, but fires Change
ko.bindingHandlers["bsChecked"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        var newValueAccessor = function () {
            return {
                change: function () {
                    value(element.value);
                }
            };
        };
        ko.bindingHandlers.event.init(element, newValueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if ($(element).val() == ko.unwrap(valueAccessor())) {
            setTimeout(function () {
                $(element).closest('.btn').button('toggle');
            }, 1);
        }
    }
};
ko.applyBindings(new LcdViewModel());
