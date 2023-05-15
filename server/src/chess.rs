#[derive(Clone)]
pub enum Piece{
    Pion(Pion),
    Cavalier(Cavalier),
    Fou(Fou),
    Tour(Tour),
    Dame(Dame),
    Roi(Roi),
}

#[derive(Clone)]
pub struct Pion {
    x : i8,
    y : i8,
}
#[derive(Clone)]
pub struct Cavalier {
    x : i8,
    y : i8,
}
#[derive(Clone)]
pub struct Fou {
    x : i8,
    y : i8,
}
#[derive(Clone)]
pub struct Tour {
    x : i8,
    y : i8,
}
#[derive(Clone)]
pub struct Dame {
    x : i8,
    y : i8,
}
#[derive(Clone)]
pub struct Roi {
    x : i8,
    y : i8,
    already_move : bool,
}
impl Pion {
    fn get_possibility() {

    }
}
impl Cavalier {
    fn get_possibility() {

    }
}
impl Fou {
    fn get_possibility() {

    }
}
impl Tour {
    fn get_possibility() {

    }
}
impl Dame {
    fn get_possibility() {

    }
}
impl Roi {
    fn get_possibility() {

    }
}