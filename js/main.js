class Word{
    constructor({orientation="vertical", text=""}){
        this.orientation = orientation;
        this.cells = [];
        this.guesed = false;
        this.text = text;
    }
}

class Cell{
    /**
     * Создание Ячейки с буквой слова (по горизонтали, вертикали, или пустотой)
     * @param {val} значение ячейки - буква или 0
     * @param {horizontStart} оступ вправо (целое положительное) к началу слова
     * @param {verticalStart} оступ вверх (целое положительное) к началу слова
     */
    constructor({val=0, horizontStart=-1, verticalStart=-1}){
        this.val = val;
        this.answer = "";
        //если horizontStart не -1, значит слово по горизонтали
        this.horizontStart = horizontStart; 
        //если verticalStart не -1 значит слово по вертикали
        this.verticalStart = verticalStart;
        //буква на пересечении слов, ее больше нельзя задействовать в словах
        this.isOnCross = false;
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

        // если используем useCrossingRule то нельзя делать слова внутри слов
        this.useCrossingRule = true;
        this.usedWords = [];

        this.cost = 0; // "ценность" кроссворда выше, если больше пересечений слов
        // ведем счетчик букв в словах которые хотим разместить
        this.totalLettersCount = 0;
        // Первоначальная фильтрация слов - берем только те, которые хотя бы влезут
        words.map(word => 
                word.length <= rows && word.length <= cols?
                    (this.words.push(word), this.totalLettersCount += word.length): "");
        // Создание первоначальной пустой матрицы
        this.createEmptyMatrix();
        this.generations = [];
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
        return Array.from({ length: this.rows }, 
                    () => new Array(...this.matrix[index++]));
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
            
            let fullMatrix = this.getMatrix();
            if(this.showLog){
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
                let vertWords = "", horWords = "";
                this.usedWords.forEach(word=>word.orientation=="vertical"?
                                                vertWords+=word.text+",":horWords+=word.text+",");
                console.log("Vertical words:"+vertWords);
                console.log("Horizontal words:"+horWords);
            }
            fullMatrix.usedWords = this.usedWords;
            this.generations.push(fullMatrix);

            this.usedWords = [];
            this.createEmptyMatrix();
            this.shuffleWords(); 
        }
    }

    findUsedWordIndex(word){
        for(let i=0; i<this.usedWords.length; i++){
            if(this.usedWords[i].text == word)
                return i;
        }
        return -1;
    }

    backtrack(wordIndex){
        while(this.findUsedWordIndex(this.words[wordIndex]) >= 0)
        {
            wordIndex++;
        }

        let word = this.words[wordIndex];
        if (wordIndex >= this.words.length || 
            this.findUsedWordIndex(word)>=0 ) {
            return true;
        }

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let randomOrientationChoose = Math.random();
                // Попробовать разместить слово горизонтально
                if (randomOrientationChoose>0.5 
                    && this.canPlaceWordHorizontal(word, row, col)
                ){
                    if(this.findUsedWordIndex(word)<0){
                        this.placeWordHorizontal(word, row, col);
                        if (this.usedLettersCount>=this.totalLettersCount ||
                            this.backtrack(wordIndex + 1)
                        ){         
                            return true;
                        }
                    } 
                } 
                // Попробовать разместить слово вертикально
                else if(randomOrientationChoose<=0.5 &&
                    this.canPlaceWordVertical(word, row, col)
                ){
                    if(this.findUsedWordIndex(word)<0){
                        this.placeWordVertical(word,row,col);
                        if (this.usedLettersCount>=this.totalLettersCount ||
                            this.backtrack(wordIndex + 1)
                        ){
                            return true;
                        }
                    }
                    
                }
            }
        }       
        return false;
    }

    canPlaceWordHorizontal(word, row, col){
        if(col + word.length > this.cols) 
            return false;
        for(let i=0; i<word.length; i++){
            if((this.matrix[row][col+i].val !== '0' &&  // проверяем что в клетке не пусто
               this.matrix[row][col+i].val !== word[i]) || //  в клетке нет той же буквы
               this.matrix[row][col+i].horizontStart != -1 //в клетке буква из уже горизонтального слова
            )
                return false;
        }
        return true;
    }

    // Разместить слово по горизонтали
    placeWordHorizontal(word, row, col){
        let _word = new Word({orientation:"horizontal", text:word});
        this.usedWords.push(_word);
        for(let i=0; i< word.length; i++){
            let _cell = this.matrix[row][col + i];
            if(_cell.val != word[i] && word[i]!=0) 
                this.usedLettersCount++;
            _cell.val = word[i];
            _cell.horizontStart = i;
            _word.cells.push(_cell);
        }
    }

    canPlaceWordVertical(word, row, col) {
        if (row + word.length > this.rows) 
            return false;
        for (let i = 0; i<word.length; i++) {
            if ((this.matrix[row + i][col].val !== '0' &&  // проверяем что в клетке не пусто
                this.matrix[row+i][col].val !== word[i])  || // и нет пересечения с той же буквой
                this.matrix[row+i][col].verticalStart != -1 //и в клетке буква уже вертикального слова
            )
            return false;
        }
        return true;
    }

    // Разместить слово по вертикали и вернуть значения ячеек до выставления слова
    placeWordVertical(word, row, col) {
        let _word = new Word({orientation:"vertical", text:word});
        this.usedWords.push(_word);
        for (let i = 0; i<word.length; i++) {
            let _cell = this.matrix[row+i][col];
            if(_cell.val != word[i] && word[i]!=0) 
                this.usedLettersCount++;
            _cell.val = word[i];
            _cell.verticalStart = i;
            _word.cells.push(_cell);
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


