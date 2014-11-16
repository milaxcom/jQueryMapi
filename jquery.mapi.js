/*
 * jQueryMapi v1.1
 *
 * Copyright 2014 Milax
 * http://www.milax.com/
 *
 * Author
 * Maksim Gusakov
 */

/* Стартовый метод. По-умолчанию запускает загрузку данных. Можно указать ID элемента для инициализации конкретной карты. */
var mapi 					= function ( id ) {

	/* Поиск по ID и инициализация */
	if ( typeof id == "string" ) {
		mapi.findInit( id );
		/* Прерывание в случае поиска */
		return id;
	}

	mapi.storage 				= [];

	var storageUrl 				= $("meta[name='mapi:storage-url']").attr("content");

	/* Загрузка данных */
	if ( storageUrl )
		$.ajax({
			data 					: { "request" : "*" },
			url 					: storageUrl,
			dataType 				: "JSON",
			success 				: function ( data ) {
				mapi.storage 		= data;
				mapi.autoInit();
			}
		});

};

/* Проверяет готовность API к использованию */
mapi.ready 					= function ( name ) {

	var providers 				= {
		yandex						: (typeof ymaps 	== "undefined") ? false : true,
		google 						: (typeof google 	== "undefined") ? false : true,
		dblgis 						: (typeof DG 		== "undefined") ? false : true
	};

	/* Если запрос шел на конкретного провайдера */
	if (typeof name != "undefined")
		return providers[ name ];

	return providers;

};

/* Метод ждет загрузки нужных библиотек и инициирует загрузку карт */
mapi.autoInit 				= function ( provider ) {

	/* Ветка инициализации карт по провайдеру (с поиском в массиве) */
	if ( typeof provider != "undefined" ) {
		for ( var key in mapi.storage) {
			/* Инициализация карт, которые соответствуют условию */
			if ( 
				(mapi.storage[key].provider == provider)
				&& (typeof mapi.storage[key].done == "undefined")
			) {
				/* mapi.autoInit срабатывает только на элементах с классом .mapi */
				$element 		= $("#" + mapi.storage[key].id);
				if ( $element.length && $element.hasClass("mapi") )
					mapi.init ( mapi.storage[ key ] );
			}
		}
		/* Прерывание */
		return provider;
	}

	/* Ветка проверки на загрузку тех API, которые еще не были загружены */

	/* Маркер необходимости рекурсивного запуска метода */
	refresh 					= false;
	/* Статус загрузки модулей */
	ready 						= mapi.ready();

	/* Получаем список используемых провайдеров */
	if ( typeof mapi.uniqueProviderList == "undefined" )
		mapi.uniqueProvider();

	for ( var key in mapi.uniqueProviderList) {
		/* Проверка производится только для не инициализированных модулей */
		if (!mapi.uniqueProviderList[ key ]) {
			if ( ready[key] ) {
				/* Инициализация */
				mapi.autoInit( key );
				mapi.uniqueProviderList[ key ] = true;
			} else {
				/* Устанавливаем маркер на рекурсивный запуск метода */
				refresh 		= true;
			}
		}
	}

	/* Рекурсивная загрузка */
	if (refresh)
		setTimeout(mapi.autoInit, 300);

};

/* Собирает объект провайдерв, которые используются среди mapi.storage (служит для проверки) */
mapi.uniqueProvider 		= function () {

	var providers 				= {};

	for (var key in mapi.storage) {
		if ( typeof providers[ mapi.storage[key].provider ] == "undefined" )
			providers[ mapi.storage[key].provider ] = false;
	}

	mapi.uniqueProviderList 	= providers;

};

/* Метод инициализации карт, вызывает инициализацию по провайдеру */
mapi.init 					= function ( mapData ) {

	var $mapcontainer 			= $("#" + mapData.id);

	/* Прерывание, если ID на странице не существует или их больше одного */
	if ( $mapcontainer.length != 1 ) return false;

	/* Инициализация карты */
	var map 					= mapi[mapData.provider]( mapData );

	/* Добавление балунов на карту */
	mapi[mapData.provider].addBalloons.call( map, mapData );

	/* Маркеры означающий, что карта загружена */
	mapData.done 				= true;
	$mapcontainer.addClass("mapi-ready");

};

/* Ищет заданный ID наборе данных и производит инициализацию карты */
mapi.findInit 				= function ( id ) {

	for( var key in mapi.storage) {
		if (mapi.storage[key].id == id) {
			/* Инициализируем карту, если API загружен */
			if (mapi.ready(mapi.storage[key].provider))
				mapi.init(mapi.storage[key]);
		} 
	}

};

/* Инициализация Яндекс.Карты */
mapi.yandex 				= function ( mapData ) {

	/* Параметры карты */
	var state 					= {
		center 						: mapData.center,
		zoom 						: mapData.zoom[0],
		behaviors 					: ["drag"],
		controls 					: ["fullscreenControl", "typeSelector"]
	};

	/* Опции карты */
	var options 				= {
		maxZoom 					: mapData.zoom[1],
		minZoom 					: mapData.zoom[2]
	};

	/* Инициализация карты */
	var map 					= new ymaps.Map(mapData.id, state, options);

	return map;
};

mapi.yandex.addBalloons 	= function ( mapData ) {

	var balloons 				= [];
	var content 				= "";

	for (var key in mapData.places) {

		/* Создаем балун */
		content 				= mapi.balloonContentBuild( mapData.places[key].content );
		balloons[key] 			= new ymaps.Placemark(mapData.places[key].position, { balloonContentBody : content });

		/* Добавляем балун на карту */
		this.geoObjects.add( balloons[key] );

	}

	return balloons;

};

/* Инициализация карты Google Maps */
mapi.google 				= function ( mapData ) {

	/* Опции карты */
	var options 				= {
		center 						: mapi.google.pos2latlng( mapData.center ),
		zoom 						: mapData.zoom[0],
		maxZoom 					: mapData.zoom[1],
		minZoom 					: mapData.zoom[2],
		disableDoubleClickZoom 		: true,
		disableDefaultUI 			: true,
		mapTypeControl 				: true,
		scrollwheel 				: false
	};

	/* Инициализация карты */
	var map 					= new google.maps.Map(document.getElementById(mapData.id), options);

	return map;
};

mapi.google.addBalloons 	= function ( mapData ) {
	
	var balloons 					= [];
	var infowindows 				= [];
	var clickevent 					= [];
	var content 					= "";
	var _thisMap 					= this;

	for (var key in mapData.places) {

		/* Создание контента */
		content 					= mapi.balloonContentBuild( mapData.places[key].content );

		/* Создание инф. окна */
		infowindows[key]			= new google.maps.InfoWindow({ content : content });

		/* Добавление метки на карту */
		balloons[key] 				= new google.maps.Marker({
		    position 				: mapi.google.pos2latlng( mapData.places[key].position ),
		    map 					: this
		});
		balloons[key].infowindow 	= infowindows[key];

		/* Добавление события при клике на метку */
		google.maps.event.addListener(balloons[key], 'click', mapi.google.openinfo);

	}

	return balloons;

};

/* Метод конвертации позиции для гугла */
mapi.google.pos2latlng 		= function ( pos ) {
	return new google.maps.LatLng( pos[0], pos[1] );
};

/* Открытие балуна на карте */
mapi.google.openinfo 		= function () {
	this.infowindow.open(this.map , this );
};

/* Инициализация карты 2Gis */
mapi.dblgis 				= function ( mapData ) {

	/* Опции карты */
	var options 				= {
		center 						: mapData.center,
		zoom 						: mapData.zoom[0],
		maxZoom 					: mapData.zoom[1],
		minZoom 					: mapData.zoom[2],
		doubleClickZoom 			: false,
		zoomControl 				: false,
		scrollWheelZoom 			: false
	};

	/* Инициализация карты */
	var map 					= DG.map(mapData.id, options);

	return map;
};

mapi.dblgis.addBalloons 	= function ( mapData ) {

	var balloons 				= [];
	var content 				= "";

	for (var key in mapData.places) {

		/* Создаем балун */
		content 				= mapi.balloonContentBuild( mapData.places[key].content );
		balloons[key] 			= DG.marker(mapData.places[key].position).bindPopup(content);

		/* Добавляем балун на карту */
		balloons[key].addTo( this );

	}

	return balloons;
};

/* Собираем HTML блок для отображения в инф. окне */
mapi.balloonContentBuild 			= function ( contentData ) {

	var html 					= "";

	for (var key in contentData) {
		if (typeof contentData[key] != "undefined")
			html 						+= '<div class="mapi-' + key + '">' + contentData[key] + '</div>';
	}

	return html;

};

$(mapi);

(function($) {

	/**
	 * Launch-метод.
	 * @this	$jq		this		Контейнер (обязательно наличие ID)
	 * @return	void
	 */
	$.fn.mapi = function( ) {

		var id 			= $(this).attr("id");

		/* Прерывание, если ID отсутствует */
		if (typeof id == "undefined") return false;

		mapi.findInit( id );

	};

})(jQuery);