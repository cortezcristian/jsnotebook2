angular.module('de.devjs.angular.spotlight').run(['$templateCache', function($templateCache) {
    $templateCache.put('spotlight/directive/spotlightOverlayTemplate.html',
        "<div class=\"ng-spotlight ng-spotlight-overlay\" ng-keydown=\"handleKeyDown($event)\">\n    <div class=\"ng-spotlight-searchbar\">\n        <div class=\"ng-spotlight-icon\">\n            <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"  viewBox=\"0 0 283.753 284.51\" enable-background=\"new 0 0 283.753 284.51\" xml:space=\"preserve\">\n            <path d=\"M281.394,264.378l0.135-0.135L176.24,158.954c30.127-38.643,27.45-94.566-8.09-130.104\n\tc-38.467-38.467-100.833-38.467-139.3,0c-38.467,38.467-38.466,100.833,0,139.299c35.279,35.279,90.644,38.179,129.254,8.748\n\tl103.859,103.859c0.01,0.01,0.021,0.021,0.03,0.03l1.495,1.495l0.134-0.134c2.083,1.481,4.624,2.36,7.375,2.36\n\tc7.045,0,12.756-5.711,12.756-12.756C283.753,269.002,282.875,266.462,281.394,264.378z M47.388,149.612\n\tc-28.228-28.229-28.229-73.996,0-102.225c28.228-28.229,73.996-28.228,102.225,0.001c28.229,28.229,28.229,73.995,0,102.224\n\tC121.385,177.841,75.617,177.841,47.388,149.612z\"/>\n            </svg>\n        </div>\n\n        <input class=\"ng-spotlight-input\" ng-class=\"{'empty': searchTerm.length === 0}\" type=\"text\" placeholder=\"Spotlight-Suche\" ng-model=\"searchTerm\" ng-change=\"search()\" ng-model-options=\"{debounce: 250}\"/>\n\n        <div class=\"ng-spotlight-input-after\" ng-if=\"searchInputInfo.length > 0  && searchTerm.length > 0\">&mdash; {{searchInputInfo}}</div>\n        <div class=\"ng-spotlight-results-icon\" ng-if=\"searchTerm.length > 0\">\n            <img ng-if=\"getIconForType(selectedItem.type).type == 'url'\" class=\"ng-spotlight-item-icon\" ng-src=\"{{getIconForType(selectedItem.type).data}}\" width=\"32\" height=\"32\">\n            <div ng-if=\"getIconForType(selectedItem.type).type == 'css'\" class=\"ng-spotlight-item-icon {{getIconForType(selectedItem.type).data}}\"></div>\n        </div>\n    </div>\n    <div class=\"ng-spotlight-results-panel\" ng-if=\"searchTerm && searchTerm.length > 0 && searchResultsCount > 0\" >\n        <div class=\"ng-spotlight-results-list\" ng-keydown=\"handleKeyDown($event)\">\n            <ul>\n                <li class=\"ng-spotlight-results-category\" ng-repeat=\"searchResult in searchResults\" ng-dblclick=\"openResultCategory()\">\n                    <div class=\"ng-spotlight-results-list-header\">{{searchResult.name}}</div>\n                    <ul>\n                        <li class=\"ng-spotlight-results-list-item\"\n                            ng-repeat=\"resultItem in searchResult.items\"\n                            ng-class=\"{'active': resultItem.active === true}\"\n                            ng-click=\"showResultItem(searchResult.name, $index)\"\n                            ng-dblclick=\"openResultItem()\">\n\n                            <img ng-if=\"getIconForType(resultItem.type).type == 'url'\" class=\"ng-spotlight-item-icon\" ng-src=\"{{getIconForType(resultItem.type).data}}\">\n                            <div ng-if=\"getIconForType(resultItem.type).type == 'css'\" class=\"ng-spotlight-item-icon {{getIconForType(resultItem.type).data}}\"></div>\n\n                            {{resultItem.name}}\n\n                            <span class=\"info\" ng-if=\"resultItem.info\">\n                                &ndash; {{resultItem.info}}\n                            </span>\n                        </li>\n                    </ul>\n                </li>\n            </ul>\n        </div>\n        <div class=\"ng-spotlight-results-detail\">\n            <spotlight-details></spotlight-details>\n        </div>\n    </div>\n</div>");
}]);