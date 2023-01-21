#[cfg(test)]
mod tests {
    pub static ADD :i32 = 3;
    #[test]
    fn it_works() {
        let resultat = 2 + 2 + ADD;
        assert_eq!(resultat, 4);
    }
}