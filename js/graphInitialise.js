(function render() {
    var Renderer = function (canvas) {
        var canvas = $(canvas).get(0);
        var ctx = canvas.getContext("2d");
        var particleSystem;
        var changed;
        var that = {
            init: function (system) {
                //начальная инициализация
                particleSystem = system;
                particleSystem.screenSize(canvas.width, canvas.height);
                particleSystem.screenPadding(80);
                that.initMouseHandling();
            },

            redraw: function () {
                //действия при перересовке
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                $("#findButton").click(function () {
                    changed = true;
                });

                particleSystem.eachEdge(	//отрисуем каждую грань
                    function (edge, pt1, pt2) {
                        ctx.strokeStyle = "rgba(0,0,0,1)";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(pt1.x, pt1.y);
                        ctx.lineTo(pt2.x, pt2.y);
                        ctx.stroke();
                    });

                particleSystem.eachNode(	//теперь каждую вершину
                    function (node, pt) {
                        if (node.data.image) {
                            node.data.imageob = new Image()
                            node.data.imageob.src = node.data.image
                        }
                        var imageob = node.data.imageob;
                        ctx.drawImage(imageob, pt.x, pt.y, 20, 20);
                        ctx.fillStyle = "red";
                        ctx.font = 'italic 13px sans-serif';
                        ctx.fillText(node.name, pt.x + 8, pt.y + 8); //пишем имя у каждой точки
                    });
            },

            initMouseHandling: function () {	//события с мышью
                var dragged = null;			//вершина которую перемещают
                var handler = {
                    clicked: function (e) {	//нажали
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        dragged = particleSystem.nearest(_mouseP);
                        if (dragged && dragged.node !== null) {
                            dragged.node.fixed = true;	//фиксируем её
                        }
                        $(canvas).bind('mousemove', handler.dragged);
                        $(window).bind('mouseup', handler.dropped);
                        return false;

                    },
                    dragged: function (e) {	//перетаскиваем вершину
                        var pos = $(canvas).offset();
                        var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

                        if (dragged && dragged.node !== null) {
                            var p = particleSystem.fromScreen(s);
                            dragged.node.p = p;	//тянем вершину за нажатой мышью
                        }

                        return false;
                    },
                    dropped: function (e) {	//отпустили
                        if (dragged === null || dragged.node === undefined) return;	//если не перемещали, то уходим
                        if (dragged.node !== null) dragged.node.fixed = false;	//если перемещали - отпускаем
                        dragged = null; //очищаем
                        $(canvas).unbind('mousemove', handler.dragged); //перестаём слушать события
                        $(window).unbind('mouseup', handler.dropped);
                        _mouseP = null;
                        return false;
                    }
                }
                // слушаем события нажатия мыши
                $(canvas).mousedown(handler.clicked);
            },
        }
        return that;
    };
    var events = [];
    var concurrences = [];
    var chars = [[]];
    var edges = [];
    var nodes = [];
    var file;
    var counte = 0;
    var countn = 0;
    $(document).ready(function () {
        $.getJSON("src/marvel_events.json",
            function (data) {
                file = data;
                var date = null;
                for (var i = 0; i < 74 * 74; i++)
                    edges[i] = {};
                for (var i = 0; i < 74; i++) {
                    concurrences[i] = {};
                    events[i] = {title: data[i].title};
                    chars[i] = data[i].characters.items;
                }
            })
    })
    $(document).ready(function () {
        $("#findButton").click(
            function buildGraph() {

                counte = 0;
                countn = 0;
                nodes = [];
                edges = [];

                var name = document.getElementById("inputID").value;
                var data = document.getElementById("start_year");
                var start = new Date(data.options[data.selectedIndex].text);
                data = document.getElementById("end_year")
                var end = new Date(data.options[data.selectedIndex].text);
                //проходим по всем возможным парам без повторений
                for (var i = 0; i < 74; i++) {
                    if (events[i].title.substr(0, name.length).toLocaleLowerCase() == name.toLocaleLowerCase()) {
                        nodes[countn++] =
                            {
                                title: file[i].title,
                                id: i
                            };
                        for (var j = i; j < 74; j++) {
                            concurrences[i][file[j].title] = [];
                            //ищем совпадения по персонажам и проверяем временные рамки
                            chars[i].forEach(function (char1) {
                                chars[j].forEach(function (char2) {
                                    //   если есть дата
                                    if (start && end) {
                                        if (file[i].end && file[j].start && (+(new Date(file[i].end.substr(0, 10))) <= +end) && (+(new Date(file[j].start.substr(0, 10))) >= +start) && (char1.name == char2.name)) {
                                            edges[counte++] = {
                                                from: events[i].title,
                                                to: events[j].title
                                            };
                                            concurrences[i][file[j].title] = char1.name;
                                        }
                                    } else if (char1.name == char2.name) { // нет даты
                                        edges[counte++] = {
                                            from: events[i].title,
                                            to: events[j].title
                                        };
                                        concurrences[i][file[j].title] = char1.name;
                                    }

                                });
                            });
                        }
                    }
                }
                sys = arbor.ParticleSystem(1000000); // создаём систему
                sys.parameters({gravity: false, dt: 0.2, stiffness: 1000});
                sys.renderer = Renderer("#viewport");

                nodes.forEach(function (node, i) {
                    sys.addNode(node.title, {
                        id: node.id,
                        image: file[i].thumbnail.path + "/standard_small.jpg"
                    });//добавляем вершину
                })

                edges.forEach(function (edge) {
                    sys.addEdge(sys.getNode(edge.from), sys.getNode(edge.to));	//добавляем грань
                });

            }
        )
    });
})(this.jQuery);