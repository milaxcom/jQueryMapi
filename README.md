jQueryMapi 
==============

###[Демо-страница](http://milaxcom.github.io/jQueryMapi/demo/) | [Скачать](https://github.com/milaxcom/jQueryMapi/archive/gh-pages.zip)

Модуль jQuery Mapi предназначен для инициализации карт на основе JSON-объекта, карты. Поддерживаемые системы: Яндекс.Карты (RUS), Google Maps (MULTI), 2GIS (RUS).

######Модуль тестировался только в Google Chrome с jQuery 1.11.1 ввиду недостатка времени.

####Преимущества
- Предустановленные, наиболее популярные настройки карт.
- Генерация идентичных карт с использованием разных провайдеров, что дает возможность быстро менять провайдеров, если один из них не показывает нужные объекты или не удовлетворяет заказчика.
- Данные подгружаются из внешнего файла, что дает возможность легко собрать модуль для CMS.

###Подключение

```html
<script type="text/javascript" src="js/jquery-1.11.1.min.js"></script>
<script type="text/javascript" src="/jquery.mapi.js"></script>
```

Подключение API провайдеров (требуется подключение только необходимых API).
```html
<script type="text/javascript" src="http://api-maps.yandex.ru/2.1/?lang=ru_RU"></script>
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3&language=ru"></script>
<script type="text/javascript" src="http://maps.api.2gis.ru/2.0/loader.js?pkg=basic" data-id="dgLoader"></script>
```


###Использование

Для использования требуется добавить тегу class ```quick-tips```. При этом контент сообщения по-умолчанию будет браться из атрибута ```quick-tips```, а если атрибут отсутствует — с помощью функции .html().

```html
<!-- #1 -->
<div class="quick-tips" quick-tips="From left border"></div>
<!-- #2 -->
<div class="quick-tips">From left border</div>
```

#####Второй метод использования — это назначение своего класса и задание опций.

```html
<!-- HTML -->
<div class="my-hint" quick-tips="From left border"></div>
```

```js
/* JavaScript */
QuickTips(".my-hint", { "color" : "#FF0000", "background-color" : "#FFF" });
```

#####Опции можно так же задавать прямо в атрибутах.
```html
<!-- HTML -->
<div class="quick-tips" quick-tips="From left border" quick-tips-color="#FF0000" quick-tips-background-color="#FFFFFF"></div>
```

#####Доступные опции перечислены в объекте [QuickTips.defaultOptions](https://github.com/milaxcom/jQueryQuickTips/blob/gh-pages/jquery.quicktips.js).

#####Среди опций есть калбеки

- before (до отображения)
- after (после отображения)
- hide (после скрытия)

Пример использования before приведен на [демо странице](http://milaxcom.github.io/jQueryQuickTips/demo/). В центральном сообщении отображается текущее время.

#####Handler можно вызвать прямо из атрибута.
```html
<!-- HTML -->
<div class="quick-tips" quick-tips="From left border" quick-tips-before="myfunction"></div>
```
В данном примере калбек before исполнит функцию глобальной видимости ```myfunction()```.