/**
 * Created by wxji on 2016/4/10.
 */
// define the treegrid component
var vm;
var treegrid = {}

Vue.component('vue-treegrid', function (resolve) {
    resolve({
        template: treegrid.template,
        props: {
            model: Object
        },
        data: function () {
            return {
                selected: false
            }
        },
        computed: {
            isLeaf: function () {
                return this.model.isLeaf
            },
            isOpen: function () {
                return this.selected
            }
        },
        methods: {
            toggle: function () {
                var _this = this;
                _this.selected = !_this.selected
                if (_this.selected && !_this.model.children) {
                    var url = treegrid.suburl.replace(':id', _this.model.id);
                    $.get(url,
                        function (res) {
                            for (var i = 0; i < res.length; i++) {
                                res[i].level = _this.model.level + 1;
                                res[i].levelPx = res[i].level * 20 + (res[i].isLeaf ? 28 : 8) + 'px';
                            }
                            Vue.set(_this.model, 'children', res)
                        }
                    )
                }
            }
        }
    });
});

(function ($) {
    $.fn.treegrid = function (options) {
        var _this = this;
        var head = '<dl class="row">';
        treegrid.template = '<dl class="row">';
        if (options.checked) {
            head += '<dd><input type="checkbox"/></dd>'
            treegrid.template += '<dd><input type="checkbox"/></dd>';
        }
        treegrid.template += '<dd class="col-md-1" v-bind:style="{paddingLeft: model.levelPx}">' +
            '<template v-if="!isLeaf">' +
            '<i v-bind:class="{\'glyphicon-plus\':!isOpen,\'glyphicon-minus\':isOpen}" class="bigger-120 tree-icon" @click="toggle"></i>' +
            '</template>' +
            '{{model.' + options.expandField + '}}</dd>';
        for (var i = 0; i < options.column.length; i++) {
            head += '<dd class="col-md-1"><div>' + options.column[i].title + '</div></dd>';
            if (options.column[i].name != options.expandField) {
                treegrid.template += '<dd class="col-md-1">{{model.' + options.column[i].name + '}}</dd>';
            }
        }
        head += '</dl>'
        _this.prepend(head);
        treegrid.template += '</dl><div v-if="!isLeaf" v-show="isOpen">' +
            '<vue-treegrid v-for="model in model.children" :model="model"></vue-treegrid></div>';
        treegrid.suburl = options.suburl;
        $.get(options.url,
            function (res) {
                for (var i = 0; i < res.length; i++) {
                    res[i].level = 0;
                    res[i].levelPx = res[i].level * 10 + (res[i].isLeaf ? 28 : 8) + 'px';
                }
                vm = new Vue({
                    el: '#' + _this.attr('id'),
                    data: {
                        treeData: {
                            name: 'root', isLeaf: false, children: res
                        }
                    }
                });
            }
        );
    }
})(jQuery);
