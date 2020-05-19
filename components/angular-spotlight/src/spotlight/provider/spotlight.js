angular.module('de.devjs.angular.spotlight')
    .provider("AngularSpotlight", function () {
        var _iconConfig = iconConfig();
        var _detailsTemplateConfig = detailsTemplateConfig();

        // === LE PUBLIC API ====================
        return {
            search: function () {
                throw "You have to implement a search function using AngularSpotlightProvider!";
            },
            addIcons: _iconConfig.addIcons,
            addTemplates: _detailsTemplateConfig.addTemplates,
            $get: ['$http', '$q', function ($http, $q) {
                var that = this;
                return {
                    search: that.search($http, $q),
                    getIconDescriptorForType: _iconConfig.getIconForType,
                    getTemplateForType: _detailsTemplateConfig.getTemplateForType
                };
            }]
        };

        // === LE HELPER ====================
        function iconConfig() {
            var icons = {
                'default': 'fa fa-file'
            };

            function addIcons(iconDescriptors) {
                Object.keys(iconDescriptors)
                    .forEach(function (iconKey) {
                        icons[iconKey.toLowerCase()] = iconDescriptors[iconKey];
                    });
            }

            function getIconForType(type) {
                var icon = icons[(type || 'default').toLowerCase()] || icons['default'];

                return {
                    data: icon,
                    type: guessType(icon)
                };

                function guessType(icon) {
                    var icon = icon.toLowerCase();
                    if (icon.indexOf('http') === 0 || icon.indexOf('data:') === 0) {
                        return 'url';
                    } else {
                        return 'css';
                    }
                }
            }

            return {
                addIcons: addIcons,
                getIconForType: getIconForType
            }
        }

        function detailsTemplateConfig() {
            var detailsTemplates = {
                'default': '<div class="ng-spotlight-results-detail-default"><img ng-if="getIconForType(selectedItem.type).type == \'url\'" class="ng-spotlight-item-icon" ng-src="{{getIconForType(selectedItem.type).data}}" width="64" height="64"><div ng-if="getIconForType(selectedItem.type).type == \'css\'" class="ng-spotlight-item-icon {{getIconForType(selectedItem.type).data}}"></div><div class="name">{{selectedItem.name}}</div></div>'
            };

            function addTemplates(templateDescriptors) {
                Object.keys(templateDescriptors)
                    .forEach(function (templateKey) {
                        detailsTemplates[templateKey.toLowerCase()] = templateDescriptors[templateKey];
                    });
            }

            function getTemplateForType(type) {
                return detailsTemplates[(type || 'default').toLowerCase()] || detailsTemplates['default'];
            }

            return {
                addTemplates: addTemplates,
                getTemplateForType: getTemplateForType
            }
        }
    });
