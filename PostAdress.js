 ymaps.ready(init);
        
        let map, selectedAddress = "еще не выбран", currentPlacemark = null;
        
        function init() {
            map = new ymaps.Map('map', {
                center: [55.76, 37.64],
                zoom: 10
                
            });
            map.controls.remove('searchControl')
            

            const searchControl = new ymaps.control.SearchControl({
                options: { 
                    float: 'right', 
                    noPlacemark: false 
                }
            });
            
            map.controls.add(searchControl);
            

            searchControl.events.add('resultselect', function(e) {
                const index = e.get('index');
                searchControl.getResult(index).then(function(result) {
                    updateAddress(result.properties.get('text'), result);
                });
            });

            map.events.add('click', function(e) {
                ymaps.geocode(e.get('coords')).then(function(res) {
                    const geoObject = res.geoObjects.get(0);
                    if (geoObject) {
                        updateAddress(
                            geoObject.properties.get('text') || 'Адрес не определен',
                            new ymaps.Placemark(geoObject.geometry.getCoordinates(), {
                                balloonContent: geoObject.properties.get('text'),
                                iconCaption: geoObject.properties.get('text').split(',')[0]
                            }, { preset: 'islands#blueDotIcon' })
                        );
                    }
                });
            });
            
            function updateAddress(address, placemark) {
                selectedAddress = address;
                document.getElementById('addressText').textContent = address;
                
                if (currentPlacemark) map.geoObjects.remove(currentPlacemark);
                currentPlacemark = placemark;
                map.geoObjects.add(currentPlacemark);
                
                map.setCenter(placemark.geometry.getCoordinates(), 16);
            }
            
            window.getSelectedAddress = () => selectedAddress;
            window.getSelectedCoords = () => currentPlacemark ? currentPlacemark.geometry.getCoordinates() : null;
        }

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const dealId = getUrlParameter('deal_id');

async function sendRequest() {
    try {
        console.log(dealId)
        const response = await fetch('https://functions.yandexcloud.net/d4efcpnv72li3gm1am8u', {
            method: 'POST',
             mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Добавьте необходимые данные, если функция их ожидает
                address: window.getSelectedAddress(),
                dealId: dealId,
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Ответ от Yandex Cloud Function:', data);
        return data;
    } catch (error) {
        console.error('Ошибка:', error);
    }
}
