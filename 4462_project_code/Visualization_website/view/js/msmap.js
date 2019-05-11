// https://docs.microsoft.com/zh-tw/azure/azure-maps/index

var subscriptionKey = "lKMPEz7AMTnD7pUdYcyuQf5m8-L9vQMAem5ixZ-ArSM";
var map = new atlas.Map("map", {
    "subscription-key": subscriptionKey,
    center: [-118.270293, 34.039737],
    zoom: 14
});

/* Search Info Panel */
var searchInfoPanelBody = document.getElementById("search-info");

/* Search */
var searchLayerName = "search-pins";
var searchPins = [];
var searchPopup = new atlas.Popup();
map.addPins(searchPins, {
    name: searchLayerName,
    cluster: false,
    icon: "pin-round-darkblue"
});


function boundingBoxOfPositions(positions) {
    var swLon = 180;
    var swLat = 90;
    var neLon = -180;
    var neLat = -90;

    for (i = 0; i < positions.length; i++) {
        var position = positions[i];

        if (position[0] < swLon) {
            swLon = position[0];
        }

        if (position[1] < swLat) {
            swLat = position[1];
        }

        if (position[0] > neLon) {
            neLon = position[0];
        }

        if (position[1] > neLat) {
            neLat = position[1];
        }
    }

    return [swLon, swLat, neLon, neLat];
}

function buildPoiPopupContent(poiProperties) {
    var poiTitleBox = document.createElement("div");
    poiTitleBox.classList.add("poi-title-box", "font-segoeui-b");
    poiTitleBox.innerText = poiProperties.name || poiProperties.address;

    var poiInfoBox = document.createElement("div");
    poiInfoBox.classList.add("poi-info-box", "font-segoeui");

    if (poiProperties.address) {
        var poiAddressInfo = document.createElement("div");
        poiAddressInfo.classList.add("info", "location");

        poiAddressInfo.innerText = poiProperties.address;

        poiInfoBox.appendChild(poiAddressInfo);
    }

    if (poiProperties.phone) {
        var poiPhoneInfo = document.createElement("div");
        poiPhoneInfo.classList.add("info", "phone");

        poiPhoneInfo.innerText = poiProperties.phone;

        poiInfoBox.appendChild(poiPhoneInfo);
    }

    if (poiProperties.url) {
        var linkElement = document.createElement("a");
        linkElement.classList.add("info", "website");

        linkElement.href = "http://" + poiProperties.url;
        linkElement.innerText = poiProperties.url;

        var poiUrlInfo = document.createElement("div");
        poiUrlInfo.appendChild(linkElement);

        poiInfoBox.appendChild(poiUrlInfo);
    }

    var poiContentBox = document.createElement("div");
    poiContentBox.classList.add("poi-content-box");
    poiContentBox.appendChild(poiTitleBox);
    poiContentBox.appendChild(poiInfoBox);

    return poiContentBox;
}

map.addEventListener("click", searchLayerName, function (event) {
    var pin = event.features[0];

    searchPopup.setPopupOptions({
        position: pin.geometry.coordinates,
        content: buildPoiPopupContent({
            name: pin.properties.name,
            address: pin.properties.address,
            phone: pin.properties.phone,
            url: pin.properties.url
        })
    });

    searchPopup.open(map);
});

var shouldChangeCamera = false;
function searchResultsHandler() {
    searchPins = [];
    searchInfoPanelBody.innerHTML = "";
    searchPopup.close();

    if (this.readyState === 4 && this.status === 400) {
        map.addPins(searchPins, {
            name: searchLayerName,
            overwrite: true
        });
    }

    if (this.readyState === 4 && this.status === 500) {
        window.alert("Problem with search service.");
    }

    if (this.readyState === 4 && this.status === 200) {
        var response = JSON.parse(this.responseText);

        var geographyResults = response.results.filter(function (result) { return result.type === "Geography" }) || [];
        var addressResults = response.results.filter(function (result) { return result.type === "Point Address" }) || [];
        var poiResults = response.results.filter(function (result) { return result.type === "POI" }) || [];

        if (geographyResults.length !== 0) {
            geographyResults.sort(function (a, b) { return b.score - a.score });
            var geographyBestResult = geographyResults[0];

            searchPins = geographyResults.map(function (geographyResult) {
                var geographyPosition = [geographyResult.position.lon, geographyResult.position.lat];
                return new atlas.data.Feature(new atlas.data.Point(geographyPosition), {
                    address: geographyResult.address.freeformAddress
                });
            });

            if (shouldChangeCamera) {
                map.setCameraBounds({
                    bounds: [
                        geographyBestResult.viewport.topLeftPoint.lon,
                        geographyBestResult.viewport.btmRightPoint.lat,
                        geographyBestResult.viewport.btmRightPoint.lon,
                        geographyBestResult.viewport.btmRightPoint.lat
                    ]
                });

                map.setCamera({
                    center: [
                        geographyBestResult.position.lon,
                        geographyBestResult.position.lat
                    ],
                    zoom: map.getCamera().zoom - 1
                });
            }
        } else if (addressResults.length !== 0) {
            addressResults.sort(function (a, b) { return b.score - a.score });
            var addressBestResult = addressResults[0];

            var addressPosition = [
                addressBestResult.position.lon,
                addressBestResult.position.lat
            ];

            if (shouldChangeCamera) {
                map.setCamera({
                    center: addressPosition,
                    zoom: 18
                });
            }

            searchPins = [
                new atlas.data.Feature(new atlas.data.Point(addressPosition), {
                    address: addressBestResult.address.freeformAddress
                })
            ];
        } else if (poiResults.length !== 0) {
            searchPins = poiResults.map(function (poiResult) {
                var poiPosition = [poiResult.position.lon, poiResult.position.lat];
                return new atlas.data.Feature(new atlas.data.Point(poiPosition), {
                    name: poiResult.poi.name,
                    phone: poiResult.poi.phone,
                    url: poiResult.poi.url,
                    address: poiResult.address.freeformAddress
                });
            });

            if (shouldChangeCamera) {
                map.setCameraBounds({
                    bounds: boundingBoxOfPositions(poiResults.map(function (poi) {
                        return [poi.position.lon, poi.position.lat]
                    }))
                });

                map.setCamera({
                    zoom: Math.min(map.getCamera().zoom - 1, 18)
                });
            }
        } else {
            var noResultListItemElement = document.createElement("li");

            var noResultsHeaderElement = document.createElement("h4");
            noResultsHeaderElement.innerText = "No Results Returned";

            var noResultsDetailsElement = document.createElement("p");
            noResultsDetailsElement.innerText = "Check spelling or add more details - city, country, or zip code";

            noResultListItemElement.appendChild(noResultsHeaderElement);
            noResultListItemElement.appendChild(noResultsDetailsElement);

            searchInfoPanelBody.appendChild(noResultListItemElement);
        }

        //pin searchPin
        console.log(searchPins);
        for (i = 0; i < searchPins.length; i++) {
            var searchPin = searchPins[i];

            var resultListItemElement = document.createElement("li");
            resultListItemElement.dataset.lon = searchPin.geometry.coordinates[0];
            resultListItemElement.dataset.lat = searchPin.geometry.coordinates[1];
            resultListItemElement.dataset.search = (searchPin.properties.name) ? searchPin.properties.name
                + ", " + searchPin.properties.address : searchPin.properties.address;

            if (searchPin.properties.name) {
                resultListItemElement.dataset.name = searchPin.properties.name;
            }

            var resultListItemHeadingElement = document.createElement("div");
            resultListItemHeadingElement.classList.add("title", "font-segoeui-b");
            resultListItemHeadingElement.innerText = searchPin.properties.name || searchPin.properties.address;
            resultListItemElement.appendChild(resultListItemHeadingElement);

            if (searchPin.properties.address) {
                resultListItemElement.dataset.address = searchPin.properties.address;

                var resultListItemAddressElement = document.createElement("div");
                resultListItemAddressElement.classList.add("info", "font-segoeui");
                resultListItemAddressElement.innerText = searchPin.properties.address;
                resultListItemElement.appendChild(resultListItemAddressElement);
            }

            if (searchPin.properties.phone) {
                resultListItemElement.dataset.phone = searchPin.properties.phone;

                var resultListItemPhoneElement = document.createElement("div");
                resultListItemPhoneElement.classList.add("info", "font-segoeui");
                resultListItemPhoneElement.innerText = "phone: " + searchPin.properties.phone;
                resultListItemElement.appendChild(resultListItemPhoneElement);
            }

            if (searchPin.properties.url) {
                resultListItemElement.dataset.url = searchPin.properties.url;

                var resultListItemUrlElement = document.createElement("div");
                resultListItemUrlElement.classList.add("info", "font-segoeui");
                var linkElement = document.createElement("a");
                linkElement.href = "http://" + searchPin.properties.url;
                linkElement.innerText = searchPin.properties.url;
                resultListItemUrlElement.appendChild(linkElement);
                resultListItemElement.appendChild(resultListItemUrlElement);
            }

            resultListItemElement.addEventListener("mouseover", function (event) {
                searchPopup.setPopupOptions({
                    position: [this.dataset.lon, this.dataset.lat],
                    content: buildPoiPopupContent({
                        name: this.dataset.name,
                        address: this.dataset.address,
                        phone: this.dataset.phone,
                        url: this.dataset.url
                    })
                });

                searchPopup.open(map);
            });

            resultListItemElement.addEventListener("click", function (event) {
                shouldChangeCamera = true;
                document.getElementById("search-input").value = this.dataset.search;
                search(searchResultsHandler);
            });

            searchInfoPanelBody.appendChild(resultListItemElement);
        }

        map.addPins(searchPins, {
            name: searchLayerName,
            overwrite: true
        });
        //End pin searchPin
    }
};

var search = function (responseHandler) {
    var searchInputValue = document.getElementById("search-input").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = responseHandler;

    var url = "https://atlas.microsoft.com/search/fuzzy/json?";
    url += "&api-version=1.0";
    url += "&query=" + searchInputValue;
    url += "&subscription-key=" + subscriptionKey;
    url += "&lat=" + map.getCamera().center[1];
    url += "&lon=" + map.getCamera().center[0];

    xhttp.open("GET", url, true);
    xhttp.send();
}

var searchInput = document.getElementById("search-input");
searchInput.addEventListener("keyup", function (e) {
    shouldChangeCamera = (e.keyCode === 13) ? true : false;
    search(searchResultsHandler);
});

// Logic For Zoom In Button
var plusZoomElement = document.createElement("div");
plusZoomElement.classList.add("zoom", "font-segoeui-b");
plusZoomElement.id = "zoom-plus";
plusZoomElement.innerText = "+";
document.body.appendChild(plusZoomElement);
plusZoomElement.addEventListener("click", function (event) {
    var currZoom = map.getCamera().zoom;
    map.setCamera({
        zoom: currZoom + 1
    });
});

// Logic For Zoom Out Button
var minusZoomElement = document.createElement("div");
minusZoomElement.classList.add("zoom", "font-segoeui-b");
minusZoomElement.id = "zoom-minus";
minusZoomElement.innerText = "-";
document.body.appendChild(minusZoomElement);
minusZoomElement.addEventListener("click", function (event) {
    var currZoom = map.getCamera().zoom;
    map.setCamera({
        zoom: currZoom - 1
    });
});
