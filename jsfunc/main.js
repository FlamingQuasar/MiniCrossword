class Word{

}
class Cell{
    /**
     * Создание Ячейки с буквой слова (по горизонтали, вертикали, или пустотой)
     * @param {row} позиция по вертикали 
     * @param {col} позиция по горизонтали 
     * @param {val} значение ячейки - буква или 0
     * @param {horizontStart} оступ вправо (целое положительное) к началу слова
     * @param {verticalStart} оступ вверх (целое положительное) к началу слова
     */
    constructor({row, col, val=0, horizontStart=-1, verticalStart=-1}){
        this.row = row;
        this.col = col;
        this.val = val;
        this.horizontStart = horizontStart;
        this.verticalStart = verticalStart;
    }
}
class Crossword{
    /**
     * Передаем размеры матрицы и все варианты слов
     * @param {rows} заданное количество строк кроссворда
     * @param {cols} заданное количество столбцов кроссворда
     * @param {words} общий список слов-вариантов
     * @param {genLimit} максимальное число сгенерированных вариантов
     */
    constructor({rows,cols,words,genLimit=100}){
        this.rows = rows;
        this.cols = cols;
        this.words = [];
        this.genLimit = genLimit;
        this.matrix = [];
        this.cost = 0; // "ценность" кроссворда выше, если больше пересечений слов
        // ведем счетчик букв в словах которые хотим разместить
        this.totalLettersCount = 0;
        this.usedLettersCount = 0;
        // Первоначальная фильтрация слов - берем только те, которые хотя бы влезут
        words.map(word => 
                word.length <= rows && word.length <= cols?
                    (this.words.push(word), this.totalLettersCount += word.length): "");
        // Создание первоначальной пустой матрицы
        /*for(let i=0; i<this.rows; i++){
            let row = [];
            for(let j=0; j<this.cols; j++){
                row.push(0);
            }
            this.matrix.push(row);
        }*/
        // Создание первоначальной пустой матрицы
        this.matrix = Array.from({ length: this.rows }, 
                    () => Array(this.cols).fill(0));
    }
    getMatrix(){
        return new Array(...this.matrix);
    }
    backtrack(wordIndex){
        if (wordIndex === this.words.length) {
            return true;
        }
        const word = this.words[wordIndex];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Попробовать разместить слово горизонтально
                if (this.canPlaceWordHorizontal(word, row, col)) {
                    this.placeWordHorizontal(word, row, col);
                    if (this.usedLettersCount>=this.totalLettersCount ||
                        this.backtrack(wordIndex + 1)
                    ) 
                        return true;
                    // Убрать слово если из-за него не полезет следующее
                    this.placeWordHorizontal(Array(word.length).fill(0), row, col); 
                }
            }
        }
        return false;
    }
    canPlaceWordHorizontal(word, row, col){
        if(col + word.length > this.cols) 
            return false;
        for(let i=0; i<word.length; i++){
            if(this.matrix[row][col+i] !== 0 &&  // проверяем чтов  клетке пусто
                this.matrix[row][col+i] !== word[i] // либо в клетке такая же буква
            )
                return false;
        }
        return true;
    }
    placeWordHorizontal(word, row, col){
        for(let i=0; i< word.length; i++){
            if(this.matrix[row][col + i] != word[i] && word[i]!=0) 
                this.usedLettersCount++;
            this.matrix[row][col + i] = word[i];
        }
    }
}




// Пример использования
const words = ["cat", "bat", "rat", "hat", "mat", "cap", "med"];
const size = { rows: 5, cols: 5 };
const emptyCells = 5;

const cr = new Crossword({rows:size.rows, cols:size.cols, words:words, empty:emptyCells});
console.log(cr.getMatrix());
cr.backtrack(0);
console.log(cr.getMatrix());


//const crossword = createCrossword(words, size.rows, size.cols, emptyCells);
//console.log("Vertical Grid:", crossword.verticalGrid);
//console.log("Horizontal Grid:", crossword.horizontalGrid);