var selected = null;
var select_bool = false;
var map = new Array(8);
let board_ph = document.getElementById("board");
var white = new Array();
var black = new Array();
var white_capture = new Array();
var black_capture = new Array();
var king_black = null;
var king_white = null;
for (var i = 0; i < map.length; i++) {
    map[i] = new Array(8).fill(null);
}
function Pion(y, x, color) {
    this.name = "Pion";
    this.x = x;
    this.y = y;
    this.firstStep = false;
    this.color = color;
    let obj = document.createElement("img");
    this.obj_in_dom = obj;
    if (color == "white") {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/wp.png';
    }
    else {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/bp.png';
    }

    this.getPossibility = function () {
        let possibility = new Array();

        if (this.color == "black") {
            if (map[this.y - 2][this.x - 1] == null) {
                possibility.push([this.y - 1, this.x]);
            }
            if (map[this.y - 3][this.x - 1] == null && !this.firstStep) {
                possibility.push([this.y - 2, this.x]);
            }
            if (map[this.y - 2][this.x - 2] != null && this.color != map[this.y - 2][this.x - 2].color) {
                possibility.push([this.y - 1, this.x - 1]);
            }
            if (map[this.y - 2][this.x] != null && this.color != map[this.y - 2][this.x].color) {
                possibility.push([this.y - 1, this.x + 1]);
            }
        }
        else if (this.color == "white") {
            if (map[this.y][this.x - 1] == null) {
                possibility.push([this.y + 1, this.x]);
            }
            if (map[this.y + 1][this.x - 1] == null && !this.firstStep) {
                possibility.push([this.y + 2, this.x]);
            }
            if (map[this.y][this.x - 2] != null && this.color != map[this.y][this.x - 2].color) {
                possibility.push([this.y + 1, this.x - 1]);
            }
            if (map[this.y][this.x] != null && this.color != map[this.y][this.x].color) {
                possibility.push([this.y + 1, this.x + 1]);
            }
        }
        return possibility;
    }
    document.getElementById(this.y + "" + this.x).appendChild(this.obj_in_dom);
}
function Cavalier(y, x, color) {
    this.name = "Cavalier";
    this.x = x;
    this.y = y;
    this.color = color
    let obj = document.createElement("img");
    if (color == "white") {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/wn.png';
    }
    else {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/bn.png';
    }
    this.obj_in_dom = obj;

    this.getPossibility = function () {
        let possibility = new Array();
        let moves = [[this.y + 1, this.x - 2], [this.y + 1, this.x + 2], [this.y - 1, this.x - 2], [this.y - 1, this.x + 2], [this.y + 2, this.x - 1],
        [this.y + 2, this.x + 1], [this.y - 2, this.x - 1], [this.y - 2, this.x + 1]];
        moves.forEach(move => {
            if (move[0] > 0 && move[0] <= 8 && move[1] > 0 && move[1] <= 8) {
                let block = map[move[0] - 1][move[1] - 1];
                if (block != null && block.color == this.color) {
                    return;
                }
                possibility.push(move);
            }
        });

        return possibility;
    }
    document.getElementById(this.y + "" + this.x).appendChild(this.obj_in_dom);
}
function Fou(y, x, color) {
    this.name = "Fou";
    this.x = x;
    this.y = y;
    this.color = color;
    let obj = document.createElement("img");
    if (color == "white") {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/wb.png';
    }
    else {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/bb.png';
    }
    this.obj_in_dom = obj;
    this.getPossibility = function () {
        let possibility = new Array();
        yi = this.y - 1;
        xi = this.x - 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi--;
            xi--;
        }
        yi = this.y + 1;
        xi = this.x + 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi++;
            xi++;
        }
        yi = this.y + 1;
        xi = this.x - 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi++;
            xi--;
        }
        yi = this.y - 1;
        xi = this.x + 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi--;
            xi++;
        }
        return possibility;
    }
    document.getElementById(this.y + "" + this.x).appendChild(this.obj_in_dom);
}
function Tour(y, x, color) {
    this.name = "Tour";
    this.x = x;
    this.y = y;
    this.color = color;
    this.alreadyMoved = false;
    let obj = document.createElement("img");
    if (color == "white") {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/wr.png';
    }
    else {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/br.png';
    }
    this.obj_in_dom = obj;
    this.getPossibility = function () {
        let possibility = new Array();
        let yi = this.y - 1;
        let xi = this.x;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi--;
        }
        yi = this.y + 1;
        xi = this.x;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi++;
        }
        yi = this.y;
        xi = this.x - 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            xi--;
        }
        yi = this.y;
        xi = this.x + 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            xi++;
        }
        return possibility;
    }
    document.getElementById(this.y + "" + this.x).appendChild(this.obj_in_dom);
}
function Queen(y, x, color) {
    this.name = "Queen";
    this.x = x;
    this.y = y;
    this.color = color;
    let obj = document.createElement("img");
    if (color == "white") {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/wq.png';
    }
    else {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/bq.png';
    }
    this.obj_in_dom = obj;
    document.getElementById(this.y + "" + this.x).appendChild(this.obj_in_dom);
    this.getPossibility = function () {
        let possibility = new Array();
        let yi = this.y - 1;
        let xi = this.x;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi--;
        }
        yi = this.y + 1;
        xi = this.x;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi++;
        }
        yi = this.y;
        xi = this.x - 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            xi--;
        }
        yi = this.y;
        xi = this.x + 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            xi++;
        }
        yi = this.y - 1;
        xi = this.x - 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi--;
            xi--;
        }
        yi = this.y + 1;
        xi = this.x + 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi++;
            xi++;
        }
        yi = this.y + 1;
        xi = this.x - 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi++;
            xi--;
        }
        yi = this.y - 1;
        xi = this.x + 1;
        while (yi > 0 && yi <= 8 && xi > 0 && xi <= 8 && ((map[yi - 1][xi - 1] == null) || (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color))) {
            possibility.push([yi, xi]);
            if (map[yi - 1][xi - 1] != null && map[yi - 1][xi - 1].color != this.color) break;
            yi--;
            xi++;
        }
        return possibility;
    }

}

function King(y, x, color) {
    this.name = "king";
    this.x = x;
    this.y = y;
    this.color = color;
    this.alreadyMoved = false;
    let obj = document.createElement("img");
    if (color == "white") {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/wk.png';
    }
    else {
        obj.src = 'https://www.chess.com/chess-themes/pieces/neo/150/bk.png';
    }
    this.obj_in_dom = obj;

    this.getPossibility = function () {

        let possibility = new Array();
        let moves = [[this.y - 1, this.x], [this.y + 1, this.x], [this.y, this.x - 1], [this.y, this.x + 1], [this.y - 1, this.x - 1], [this.y + 1, this.x + 1], [this.y - 1, this.x + 1], [this.y + 1, this.x - 1]];
        moves.forEach(move => {
            if (move[0] > 0 && move[0] <= 8 && 0 < move[1] && move[1] <= 8 && (map[move[0] - 1][move[1] - 1] == null || this.color != map[move[0] - 1][move[1] - 1].color)) {
                possibility.push(move);
            }
        });
        return possibility;
    }
    document.getElementById(this.y + "" + this.x).appendChild(this.obj_in_dom);
}
function remove_from_list(list, piece) {
    let i = 0;
    while (i < list.length) {
        if (list[i].name == piece.name && list[i].x == piece.x && list[i].y == piece.y) {
            console.log(list[i]);
            list.splice(i, 1);

            break;
        }
        i++;
    }
}
function can_u_move(selected, newY, newX) {
    let old_y = selected.y;
    let old_x = selected.x;
    selected.y = newY;
    selected.x = newX;
    new_case_save = null;
    map[old_y - 1][old_x - 1] = null;
    new_case_save = map[newY - 1][newX - 1];
    if (new_case_save != null) {
        if (new_case_save.color == "white") {
            remove_from_list(white, new_case_save);
        }
        else {
            remove_from_list(black, new_case_save);
        }
    }

    map[newY - 1][newX - 1] = selected;
    if (selected.color == "white") {
        if (check_check_of_white()) {
            selected.y = old_y;
            selected.x = old_x;
            map[old_y - 1][old_x - 1] = selected;
            map[newY - 1][newX - 1] = new_case_save;
            if (new_case_save != null) {
                if (new_case_save.color == "black") {
                    black.push(new_case_save);
                }
                else {
                    white.push(new_case_save);
                }
            }
            return false;
        }
    }
    else {
        if (check_check_of_black()) {
            selected.y = old_y;
            selected.x = old_x;
            map[old_y - 1][old_x - 1] = selected;
            map[newY - 1][newX - 1] = new_case_save;
            if (new_case_save != null) {
                if (new_case_save.color == "black") {
                    black.push(new_case_save);
                }
                else {
                    white.push(new_case_save);
                }
            }
            return false;
        }
    }
    selected.y = old_y;
    selected.x = old_x;
    map[old_y - 1][old_x - 1] = selected;
    map[newY - 1][newX - 1] = new_case_save;
    if (new_case_save != null) {
        if (new_case_save.color == "black") {
            black.push(new_case_save);
        }
        else {
            white.push(new_case_save);
        }
    }

    return true;
}
function move_to(new_y, new_x, selected) {
    if (map[new_y - 1][new_x - 1] != null) {
        if (map[new_y - 1][new_x - 1].color == selected.color) {
            return false;
        }
    }

    if (!can_u_move(selected, new_y, new_x)) {
        return false;
    }

    document.getElementById(selected.y + "" + selected.x).innerHTML = "";
    document.getElementById(new_y + "" + new_x).innerHTML = "";
    document.getElementById(new_y + "" + new_x).appendChild(selected.obj_in_dom);
    selected.y = new_y;
    selected.x = new_x;
    if (selected.name == "Pion") {
        if (!selected.firstStep) {
            selected.firstStep = true;
        }
    }
    return true;
}
function get_black_possibility() {
    var pos = new Array();
    black.forEach(piece => {
        let possi = piece.getPossibility();
        for (let i = 0; i < possi.length; i++) {
            possi[i].push(piece);
        }
        pos = pos.concat(possi);
        //pos = pos.concat(piece.getPossibility());
    });
    return pos;
}
function get_white_possibility() {
    let pos = new Array();
    white.forEach(piece => {
        let possi = piece.getPossibility();
        for (let i = 0; i < possi.length; i++) {
            possi[i].push(piece);
        }
        pos = pos.concat(possi);
    });

    console.log(pos);
    return pos;
}
function check_check_of_black() {
    console.log("Check of black");
    let possi = get_white_possibility();
    console.log(king_black);
    let find = false;
    possi.forEach(one => {
        //console.log(one[0]+ " "+one[1] + " "+king_black.y+ " "+king_black.x);
        if (one[0] == king_black.y && one[1] == king_black.x) {
            find = true;
        }
    });
    return find;
}
function check_check_of_white() {
    let possi = get_black_possibility();
    let find = false;
    possi.forEach(one => {
        if (one[0] == king_white.y && one[1] == king_white.x) {
            find = true;
        }
    });
    return find;
}
function check_mate_of_white() {
    console.log("TEST MATE ");
    console.log(map);
    let possi_white = get_white_possibility();

    let possi_black = get_black_possibility();
    /*black.forEach(piece => {
        possi_black.push([piece.y, piece.x, piece]);
    });*/
    console.log("POSSI WHITE : ");
    console.log(possi_white);
    console.log("POSSI BLACK : ");
    console.log(possi_black);
    let inter = new Array();
    possi_white.forEach(white_move => {
        possi_black.forEach(black_move => {
            if (white_move[0] == black_move[0] && white_move[1] == black_move[1]) {
                inter.push(white_move);
            }
        });
    });
    let a = king_white.getPossibility();
    a.forEach(move => {
        inter.push([a[0], a[1], king_white]);
    })
    console.log("MOVESSSS : ");
    console.log(inter);
    //inter.push(king_white.getPossibility());
    console.log(king_white.getPossibility());

    let is_mate = true;
    inter.forEach(inter_move => {
        console.log(inter_move);
        let save_case = map[inter_move[0] - 1][inter_move[1] - 1];
        console.log("SAVE : ");
        console.log(save_case);
        if (save_case != null && save_case.color == "black") {
            remove_from_list(black, save_case);
        }
        let oldY = inter_move[2].y;
        let oldX = inter_move[2].x;
        inter_move[2].y = inter_move[0];
        inter_move[2].x = inter_move[1];
        map[inter_move[0] - 1][inter_move[1] - 1] = inter_move[2];

        /*console.log("KING WHITE");
        console.log(king_white);*/
        if (check_check_of_white() == false) {
            is_mate = false;
            console.log("OUF");
            console.log(inter_move);
        }
        if (save_case != null) {
            black.push(save_case);
        }
        map[inter_move[0] - 1][inter_move[1] - 1] = save_case;
        inter_move[2].y = oldY;
        inter_move[2].x = oldX;
    });
    return is_mate;
}
function check_mate_of_black() {
    console.log("TEST MATE ");
    console.log(map);
    let possi_black = get_black_possibility();

    let possi_white = get_white_possibility();
    white.forEach(piece => {
        possi_white.push([piece.y, piece.x, piece]);
    });
    console.log("POSSI WHITE : ");
    console.log(possi_white);
    console.log("POSSI BLACK : ");
    console.log(possi_black);
    let inter = new Array();
    possi_white.forEach(white_move => {
        possi_black.forEach(black_move => {
            if (white_move[0] == black_move[0] && white_move[1] == black_move[1]) {
                inter.push(black_move);
            }
        });
    });
    //inter.push(king_black.getPossibility());
    let is_mate = true;
    inter.forEach(inter_move => {
        console.log(inter_move);
        let save_case = map[inter_move[0] - 1][inter_move[1] - 1];
        console.log("SAVE : ");
        console.log(save_case);
        if (save_case != null && save_case.color == "white") {
            remove_from_list(white, save_case);
        }
        let oldY = inter_move[2].y;
        let oldX = inter_move[2].x;
        inter_move[2].y = inter_move[0];
        inter_move[2].x = inter_move[1];
        map[inter_move[0] - 1][inter_move[1] - 1] = inter_move[2];

        /*console.log("KING WHITE");
        console.log(king_white);*/
        if (check_check_of_black() == false) {
            is_mate = false;
            console.log("OUF");
            console.log(inter_move);
        }
        if (save_case != null) {
            white.push(save_case);
        }
        map[inter_move[0] - 1][inter_move[1] - 1] = save_case;
        inter_move[2].y = oldY;
        inter_move[2].x = oldX;
    });
    return is_mate;
}
function build_board() {
    let board = document.getElementById("board");

    for (let i = 0; i < 64; i++) {
        let block = document.createElement("span");
        let color = ((parseInt(i / 8) + 1) % 2) ? ((i % 2) ? "black" : "white") : ((i % 2) ? "white" : "black");

        block.className = "Cases " + color + " " + String.fromCharCode(97 + (i / 8)) + ((i % 8) + 1);
        block.id = "" + parseInt((i / 8) + 1) + "" + parseInt((i % 8) + 1);
        block.innerHTML = "";
        block.style.gridColumn = "" + ((i % 8) + 1) + " / " + ((i % 8) + 2);
        block.style.gridRow = "" + parseInt((i / 8) + 1) + " / " + ((i / 8) + 2);
        board.appendChild(block);
    }
    fill_board();
}
function fill_board() {
    for (let k = 0; k < 8; k++) {
        map[1][k] = new Pion(2, k + 1, "white");
        white.push(map[1][k]);
    }
    for (let k = 0; k < 8; k++) {
        map[6][k] = new Pion(7, k + 1, "black");
        black.push(map[6][k]);
    }

    map[0][1] = new Cavalier(1, 2, "white");
    map[0][6] = new Cavalier(1, 7, "white");
    map[7][1] = new Cavalier(8, 2, "black");
    map[7][6] = new Cavalier(8, 7, "black");
    white.push(map[0][1]);
    white.push(map[0][6]);
    black.push(map[7][1]);
    black.push(map[7][6]);

    map[0][2] = new Fou(1, 3, "white");
    map[0][5] = new Fou(1, 6, "white");
    map[7][2] = new Fou(8, 3, "black");
    map[7][5] = new Fou(8, 6, "black");
    white.push(map[0][2]);
    white.push(map[0][5]);
    black.push(map[7][2]);
    black.push(map[7][5]);

    map[0][0] = new Tour(1, 1, "white");
    map[0][7] = new Tour(1, 8, "white");
    map[7][0] = new Tour(8, 1, "black");
    map[7][7] = new Tour(8, 8, "black");
    white.push(map[0][0]);
    white.push(map[0][7]);
    black.push(map[7][0]);
    black.push(map[7][7]);

    map[0][4] = new Queen(1, 5, "white");
    map[7][4] = new Queen(8, 5, "black");
    white.push(map[0][4]);
    black.push(map[7][4]);

    map[0][3] = new King(1, 4, "white");
    map[7][3] = new King(8, 4, "black");
    king_white = map[0][3];
    king_black = map[7][3];
    white.push(map[0][3]);
    black.push(map[7][3]);
}
build_board();


var possi = null;
document.getElementById("board").addEventListener("click", (event) => {
    let y = parseInt(event.clientY / (board_ph.offsetHeight / 8)) + 1;
    let x = parseInt(event.clientX / (board_ph.offsetWidth / 8)) + 1;

    if (possi != null) {
        possi.forEach(one => {
            console.log("Lost");
            document.getElementById("" + one[0] + "" + one[1]).classList.remove("blue");
        });
        possi = null;
    }
    if (selected != null && map[y - 1][x - 1] != null && ((selected.x == x && selected.y == y) || selected.color == map[y - 1][x - 1].color) && select_bool == true) {
        select_bool = false;
        document.getElementById("" + y + "" + x).style.opacity = "1";
        return;
    }
    console.log(y + " " + x);
    console.log(selected);
    if (select_bool == true) {
        console.log(selected.name);
        let old_x = selected.x;
        let old_y = selected.y;
        possi = selected.getPossibility();
        let find = false;
        possi.forEach(one => {
            if (y == one[0] && x == one[1]) {
                find = true;
            }
        });
        if (find == true && move_to(y, x, selected) == true) {
            if (map[y - 1][x - 1] != null) {
                if (map[y - 1][x - 1].color == "white") {
                    remove_from_list(white, map[y - 1][x - 1]);
                } else {
                    remove_from_list(black, map[y - 1][x - 1])
                }
            }

            document.getElementById("" + old_y + "" + old_x).style.opacity = "1";
            map[selected.y - 1][selected.x - 1] = selected;
            map[old_y - 1][old_x - 1] = null;
            select_bool = false;
            if (selected.color == "black") {
                if (check_check_of_white() == true) {
                    console.log("CHECK");
                    if (check_mate_of_white()) {
                        console.log("MATE BLACK WIN");
                        document.getElementById("modal").style.display = "block";
                        document.getElementById("modal").innerHTML = "Les NOIRS ont Gagné !";
                    }
                }
            }
            else {
                if (check_check_of_black()) {
                    console.log("CHECK");
                    if (check_mate_of_black()) {
                        console.log("MATE WHITE WIN");
                        document.getElementById("modal").style.display = "block";
                        document.getElementById("modal").innerHTML = "Les BLANCS ont Gagné !";
                    }
                }
            }
            if (possi != null) {
                possi.forEach(one => {
                    document.getElementById("" + one[0] + "" + one[1]).classList.remove("blue");
                });
                possi = null;
            }
        }
    }
    else {
        if (map[y - 1][x - 1] != null) {
            selected = map[y - 1][x - 1];
            select_bool = true;
            document.getElementById("" + y + "" + x).style.opacity = "0.9";
            console.log(selected.name);
            possi = selected.getPossibility();
            console.log("POSSSII");
            console.log(possi);
            possi.forEach(one => {
                document.getElementById("" + one[0] + "" + one[1]).classList.add("blue");
            });
        }
    }
});

let socket = new WebSocket("wss://pi-univers.fr/websocketChess/Paul/?name=Paulo");

socket.onopen = function (e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    socket.send("My name is John");
};

socket.onmessage = function (event) {
    console.log(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // par exemple : processus serveur arrêté ou réseau en panne
        // event.code est généralement 1006 dans ce cas
        console.log('[close] Connection died');
    }
};

socket.onerror = function (error) {
    console.log(`[error]`);
};