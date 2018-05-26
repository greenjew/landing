
$(document).ready(function () {


    $(".").click(
        //по клику открываем информацию
        function showIinfo() {
            var src = $(this).children(".thumbnail").attr('src');
            var name = $(this).children(".event_title").text();
            $("#timeline").prepend(
                "<div class='zoomer'>" +
                "<h1 class='zoomed_title' >" + name + "</h1>" +
                "<img class='zoomed_img' src='" + src + "'/>" +
                "<p class='zoomed_description'>" + + "</p>" +
                "</div>");
            //после картинки добавляем персонажей
            $(".zoomer").append(
                "<div class='grid'>" +
                "<div class='col-1-1'>" +
                "<div class='characters'>" +
                "<h1 class='zoomed_title' style='margin-top: 10px'> Characters </h1>" +
                "</div></div></div>");

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
