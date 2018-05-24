var eventName;
var KEY = "?ts=1&apikey=d92575fb645d421c9199398b0814ee26&hash=81f81b4409078c6f4c68f29fab98978b";
//var KEY = "?ts=1&apikey=7e704b2ecd024f62dc85df72b021527d&hash=3ea586f112e67bf98358bb2a4737aad2";
var url;
var chars = [[]];
var events = [];
var thumbs = [];

$(document).ready(function () {
    $.getJSON("src/marvel_events.json",
        function (data) {
            events = data;
            for (var i = 0; i < 74; i++) {
                chars[data[i].title] = data[i].characters.items;
                thumbs[data[i].title] = data[i].thumbnail.path + "/standard_fantastic.jpg";
            }
        })
})

//found event - showed it
$(document).ready(function () {
    //вызывается вместе с построением графа и таймлайна
    $("#findButton").click(function showAllFound() {
        var workspace = $("main").children("#moreEvents").children(".grid").children(".col-1-1");
        $("div.event").remove();
        var name = document.getElementById("inputID").value;
        events.forEach(function (event, i, events) {
                if (event.title.substr(0, name.length).toLocaleLowerCase() == name.toLocaleLowerCase()) {
                    workspace.append("<div class= 'event' onclick='chosenEvent(" + i + ")'>" +
                        "<img class='thumb' style='float: left; margin: 10px;height: 100px;" +
                        "width: 100px;' src=" + thumbs[event.title] + ">" +
                        "<h5 class='title' style='font-weight: bold'>" + event.title + "</h5>" +
                        "<p class ='description'>" + event.description + "</p></div>")
                }
            }
        );
    })
})
;

//начинаем работать с ивентами
var next_event;
var prev_event;
var cur_event;

function chosenEvent(num) {

    document.getElementById('timeline').style.display = 'block';
    document.getElementsByClassName('events')[0].style.display = 'block';

    currentEvent(events[num]);
    if (events[num].next)
        $.getJSON(events[num].next.resourceURI + KEY, nextEvent);

    else {
        document.getElementById('next').src = "img/NotYet.png";
        document.getElementsByClassName('event_title')[2].innerText = "";
    }

    if (events[num].previous)
        $.getJSON(events[num].previous.resourceURI + KEY, previousEvent);
    else {
        document.getElementById('prev').src = "img/NotYet.png";
        document.getElementsByClassName('event_title')[0].innerText = "";
    }
}

function previousEvent(data) {
    prev_event = data.data;
    document.getElementById('prev').src = thumbs[prev_event.results[0].title];
    document.getElementsByClassName('event_title')[0].innerText = prev_event.results[0].title;
}

function currentEvent(data) {
    cur_event = data;
    document.getElementById('cur').src = thumbs[cur_event.title];
    document.getElementsByClassName('event_title')[1].innerText = cur_event.title;
}

function nextEvent(data) {
    next_event = data.data;
    document.getElementById('next').src = thumbs[next_event.results[0].title];
    document.getElementsByClassName('event_title')[2].innerText = next_event.results[0].title;
}

var chosen_event;
var char_pic;

$(document).ready(function () {
    $(".main_event").click(
        //по клику на cобытие на визуализации "порядок" открываем информацию
        function showIinfo() {
            var src = $(this).children(".thumbnail").attr('src');
            var name = $(this).children(".event_title").text();
            $("#timeline").prepend(
                "<div class='zoomer'>" +
                "<h1 class='zoomed_title' >" + name + "</h1>" +
                "<img class='zoomed_img' src='" + src + "'/>" +
                "<p class='zoomed_description'>" + chosen_event.description + "</p>" +
                "</div>");
            //после картинки добавляем персонажей
            $(".zoomer").append(
                "<div class='grid'>" +
                "<div class='col-1-1'>" +
                "<div class='characters'>" +
                "<h1 class='zoomed_title' style='margin-top: 10px'> Characters </h1>" +
                "</div></div></div>");
            for (var i = 0; i < chars[chosen_event.title].length; i++)
                $.getJSON(chars[chosen_event.title][i].resourceURI + KEY, getCharacter)

            $(".zoomer").fadeIn(1000);
            $(".zoomer").click(function () {
                $(".zoomer").fadeOut(1000);
                setTimeout(function () {
                    $(".zoomed_title").remove();
                    $(".zoomed_description").remove();
                    $(".characters").remove();
                    $(".zoomer").remove()
                }, 100)
            });
        });
})
;

//получаем ссылку на необходимого персонажа из json файла и выводим его в поле для персонажей
function getCharacter(chosen) {
    char_pic = chosen.data.results[0].thumbnail.path + "/standard_medium.jpg";
    $(".characters").append("<div class='character'>" +
        "<img src=" + char_pic + ">" +
        "<h3 class='character_name'>" + chosen.data.results[0].name + "</h3></div> ");
}