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
        //если horizontStart не -1, значит слово по горизонтали
        this.horizontStart = horizontStart; 
        //если verticalStart не -1 значит слово по вертикали
        this.verticalStart = verticalStart;
        //буква на пересечении слов, ее больше нельзя задействовать в словах
        this.onCross = false;
    }
}
class Crossword{
    /**
     * Передаем размеры матрицы и все варианты слов
     * @param {rows} заданное количество строк кроссворда
     * @param {cols} заданное количество столбцов кроссворда
     * @param {words} общий список слов-вариантов
     * @param {genLimit} максимальное число сгенерированных вариантов
     * @param {showLog} флаг показа console.log
     */
    constructor({rows,cols,words,genLimit=100,showLog=false}){
        this.rows = rows;
        this.cols = cols;
        this.words = [];
        this.genLimit = genLimit;
        this.showLog = showLog;

        this.cost = 0; // "ценность" кроссворда выше, если больше пересечений слов
        // ведем счетчик букв в словах которые хотим разместить
        this.totalLettersCount = 0;
        // Первоначальная фильтрация слов - берем только те, которые хотя бы влезут
        words.map(word => 
                word.length <= rows && word.length <= cols?
                    (this.words.push(word), this.totalLettersCount += word.length): "");
        // Создание первоначальной пустой матрицы
        this.createEmptyMatrix();
    }
    createEmptyMatrix(){
        this.usedLettersCount = 0;
        this.matrix = [];
        for(let i=0; i<this.rows; i++){
            let row = [];
            for(let j=0; j<this.cols; j++){
                row.push(new Cell({val:'0'}));
            }
            this.matrix.push(row);
        }
       /* this.matrix = Array.from({ length: this.rows }, 
                    () => Array(this.cols).fill(
                        new Cell({val:'0'})));*/
    }
    getMatrix(){
        let index = 0;
        let arr = Array.from({ length: this.rows }, 
                    () => new Array(...this.matrix[index++]));
        return arr;
    }
    shuffleWords(){ //Использует случайные индексы для обмена элементами массива.
        for (let i = 0; i < this.words.length; i++) { 
            let index = Math.floor(Math.random() * this.words.length); 
            const temp = this.words[i];
            this.words[i] = this.words[index];
            this.words[index] = temp;
        }
    }
    startGeneration(){
        while(this.genLimit>0){
            this.genLimit--;
            let wordIndex = 0;
            this.backtrack(wordIndex);
            
            if(this.showLog){
                let fullMatrix = this.getMatrix();
                let onlyValuesArray = [];
                for(let i=0; i<fullMatrix.length; i++){
                    let row = fullMatrix[i];
                    let valuesRow = [];
                    for(let j=0; j<row.length; j++){
                        valuesRow.push(row[j].val);
                    }
                    onlyValuesArray.push(valuesRow);
                }
                console.log(onlyValuesArray);
            }
            this.createEmptyMatrix();
            this.shuffleWords(); 
        }
    }
    backtrack(wordIndex){
        if (wordIndex === this.words.length) {
            return true;
        }        
        const word = this.words[wordIndex];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let randomOrientationChoose = Math.random();
                // Попробовать разместить слово горизонтально
                if (randomOrientationChoose>0.5 
                    && this.canPlaceWordHorizontal(word, row, col)
                ){
                    let previous = this.placeWordHorizontalReturnPrev(word, row, col);
                    if (this.usedLettersCount>=this.totalLettersCount ||
                        this.backtrack(wordIndex + 1)
                    ){
                        return true;
                    }
                    // Убрать слово если из-за него не полезет следующее
                    this.placeWordHorizontalReturnPrev(previous, row, col); 
                } 
                // Попробовать разместить слово вертикально
                else if(randomOrientationChoose<=0.5 &&
                    this.canPlaceWordVertical(word, row, col)
                ){
                    this.placeWordVertical(word,row,col);
                    if (this.usedLettersCount>=this.totalLettersCount ||
                        this.backtrack(wordIndex + 1)
                    ){
                        return true;
                    }// Убрать слово если из-за него не полезет следующее
                    //this.placeWordVertical(Array(word.length).fill('0'), row, col); 
                }
            }
        }       
        return false;
    }
    canPlaceWordHorizontal(word, row, col){
        if(col + word.length > this.cols) 
            return false;
        for(let i=0; i<word.length; i++){
            if(this.matrix[row][col+i].val !== '0' &&  // проверяем чтов клетке не пусто
               this.matrix[row][col+i].val !== word[i] // либо в клетке нет той же буквы
            )
                return false;
        }
        return true;
    }
    placeWordHorizontalReturnPrev(word, row, col){
        let prevoiousWord = "";
        for(let i=0; i< word.length; i++){
            prevoiousWord += this.matrix[row][col + i].val;
            if(this.matrix[row][col + i].val != word[i] && word[i]!=0) 
                this.usedLettersCount++;
            this.matrix[row][col + i].val = word[i];
        }
        return prevoiousWord;
    }
    canPlaceWordVertical(word, row, col) {
        if (row + word.length > this.rows) 
            return false;
        for (let i = 0; i<word.length; i++) {
            if (this.matrix[row + i][col].val !== '0' &&  // проверяем что в клетке не пусто
                this.matrix[row+i][col].val !== word[i] // или нет пересечения с той же буквой
            ) 
                return false;
        }
        return true;
    }
    placeWordVertical(word, row, col) {
        for (let i = 0; i<word.length; i++) {
            if(this.matrix[row+i][col].val != word[i] && word[i]!=0) 
                this.usedLettersCount++;
            this.matrix[row+i][col].val = word[i];
        }
    }
}



 
    // Заполнение пустых клеток
    /*for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (horizontalGrid[i][j] === 0 && verticalGrid[i][j] === 0) {
                if (emptyCells > 0) {
                    horizontalGrid[i][j] = -1; // Обозначаем пустые клетки
                    verticalGrid[i][j] = -1; // Если надо, можно также для вертикальных
                    emptyCells--;
                }
            }
        }
    }*/

// Пример использования
const words = ["cat", "bar", "bra", "crab", "art", "bat", "rat", "hat", "mat", "cap", "med", "mad", "dad", "mom", "old", "odd", "don", "node"];
const size = { rows: 5, cols: 5 };
const emptyCells = 5;

const cr = new Crossword({
    rows:size.rows, 
    cols:size.cols, 
    words:words, 
    empty:emptyCells,
    genLimit: 3,
    showLog: true
});
console.log(cr.getMatrix());
cr.startGeneration();
//console.log(cr.getMatrix());
