
//TODO:
//Клик по ячейкам - форма ввода слова
//кнопочка проверки у каждого кроссворда, работает на 3 попытки, верные окрашивает зеленой рамкой 
//кнопка завершения у каждого кроссворда

//предустановка генерации - открыть файл слов(+ слова по умолчанию, или + только короткие), 
// ширина, высота, минимум пробелов
//доработать принудительные пробелы 


class CrossWordUI{
    constructor({container, crossword}){
        this.crossword = crossword;
        this._dom = document.createElement("div");
        this._dom.classList.add("ui-crossword");
        this._popupWindow = document.createElement("div");
        this._popupWindow.classList.add("ui-popup");
        this._dom.append(this._popupWindow);
        container.append(this._dom);
        this.verticalCounter = 1;
        this.horizontalCounter = 1;
        this.init();
    }

    init(){
        this.crossword.startGeneration();
    }
    cellIsHovered(gen, row, col){
        let cell = gen[row][col];
        gen.usedWords.forEach(word => {
            if(word.cells.indexOf(cell) >= 0){
                word.cells.forEach(c => {
                    c.el.classList.add("ui-cw-cellactive");
                })
            }
        });
    }
    cellIsOut(gen, row, col){
        let cell = gen[row][col];
        gen.usedWords.forEach(word => {
            if(word.cells.indexOf(cell) >= 0){
                word.cells.forEach(c => {
                    c.el.classList.remove("ui-cw-cellactive");
                })
            }
        });
    }
    cellIsClicked(gen, row, col){
        let cell = gen[row][col];
        let askedWords = [];
        gen.usedWords.forEach(word => {
            if(word.cells.indexOf(cell) >= 0){
                askedWords.push(word);
            }
        });
        console.log(askedWords);
        this.showQuestionAnswerPopup(askedWords);
    }

    showQuestionAnswerPopup(words){
        this._popupWindow.innerHTML = "";
        let _typingSuggestTextEl = document.createElement("div");
        _typingSuggestTextEl.innerText = "Please, type your answer.";
        this._popupWindow.append(_typingSuggestTextEl);
        words.forEach(word=>{
            let hint = document.createElement("p");
            hint.innerText = "For "+ word.orientation + " word:";
            let inputField = document.createElement("input");
            inputField.setAttribute("id","pin");
            inputField.setAttribute("placeholder",word.text.length + " signs");
            inputField.setAttribute("maxlength",word.text.length);
            inputField.setAttribute("size",word.text.length);
            
            this._popupWindow.append(hint,inputField);
        });
        let buttonsDiv = document.createElement("div");
        let doneButton = document.createElement("button");
        let cancelButton = document.createElement("button");
        doneButton.innerText = "Ok";
        cancelButton.innerText = "Cancel";
        cancelButton.addEventListener("click",()=>{this.cancelQuestionAnswerPopup()});
        buttonsDiv.append(doneButton,cancelButton);
        this._popupWindow.append(buttonsDiv);
        this._popupWindow.classList.add("ui-popup-active");
    }
    cancelQuestionAnswerPopup(){
        alert(this._popupWindow)
        this._popupWindow.classList.remove("ui-popup-active");
    }

    render(){
        let _hintText = document.createElement("div");
        _hintText.classList.add("ui-cw-hint");
        _hintText.innerHTML = `Click to the word to type it! Or click <b>"Show"</b> button`;
        this._dom.append(_hintText);
        this.crossword.generations.forEach(gen => {
            let _iteration = document.createElement("div"),
                _matrixWrap = document.createElement("div"),
                _questions = document.createElement("div");
            _iteration.setAttribute("class","ui-cw-iteration");
            _matrixWrap.setAttribute("class","ui-cw-matrixwrap");
            _questions.setAttribute("class","ui-cw-questions");
            for(let i=0; i<gen.length; i++){
                let _row = document.createElement("div");
                _row.setAttribute("class","ui-cw-row");
                for(let j=0; j<gen[i].length; j++){
                    let _cell = document.createElement("div");
                    _cell.setAttribute("class","ui-cw-cell");
                    gen[i][j].el = _cell;
                    _cell.addEventListener("mouseover",()=>{
                        this.cellIsHovered(gen, i, j);
                    });
                    _cell.addEventListener("mouseout",()=>{
                        this.cellIsOut(gen, i, j);
                    });
                    _cell.addEventListener("click",()=>{
                        this.cellIsClicked(gen, i, j);
                    });
                    this.checkBordersAndEmptyCells({
                        element: _cell, 
                        cell: gen[i][j],
                        rightCell: j+1<gen[i].length ? gen[i][j+1] : null,
                        bottomCell: i+1<gen.length ? gen[i+1][j] : null
                    });
                    _row.append(_cell);
                }                
                _matrixWrap.append(_row);
            }

            _iteration.append(_matrixWrap, _questions);
            this._dom.append(_iteration);
            this.renderQuestions(gen, _questions);
            this.verticalCounter = 1;
            this.horizontalCounter = 1;
        });
    }

    /**
     * Закрасить внешние границы слова более заметными.
     * @param {element} htmlElement for cell 
     * @param {cell} объект класса Ячейки кроссворда с буквой 
     * @param {rightCell} ячейка справа если есть
     * @param {bottomCell} ячейка снизу если есть
     */
    checkBordersAndEmptyCells({element, cell, rightCell=null, bottomCell=null}){
        if(cell.val=="0"){
            element.classList.add("ui-cw-cell-empty");
        }
        else{
            element.innerText = cell.val;
            if(cell.verticalStart==0){
                let _smallCount = document.createElement("p");
                _smallCount.classList.add("ui-cw-cell-counter-vert");
                _smallCount.innerText = this.verticalCounter;
                element.append(_smallCount);
                this.verticalCounter++;
            }
            if(cell.horizontStart==0){
                let _smallCount = document.createElement("p");
                _smallCount.classList.add("ui-cw-cell-counter-hor");
                _smallCount.innerText = this.horizontalCounter;
                element.append(_smallCount);
                this.horizontalCounter++;
            }
            if(cell.verticalStart>=0 && cell.horizontStart>=0){
                element.style.border = "1px dashed grey";
            }
            if(cell.verticalStart<=0) 
                element.style.borderTop = "1px solid grey";
            if(!bottomCell || (bottomCell.verticalStart == 0 || bottomCell.verticalStart != cell.verticalStart+1))
                element.style.borderBottom = "1px solid grey";
            if(cell.horizontStart<=0) 
                element.style.borderLeft = "1px solid grey";            
            if(!rightCell || (rightCell.horizontStart == 0 || rightCell.horizontStart != cell.horizontStart+1))
                element.style.borderRight = "1px solid grey";
        }
    }

    renderQuestions(generation, questionsElement){
        if(generation.usedWords.length){
            let _verticalQuestionsElement = document.createElement("div");
            _verticalQuestionsElement.innerText = "Vertical words:";
            let _olVert = document.createElement("ol");
            _verticalQuestionsElement.append(_olVert);
             let _horizontalQuestionsElement = document.createElement("div");
            _horizontalQuestionsElement.innerText = "Horizontal words:";
            let _olHoriz = document.createElement("ol");
            _horizontalQuestionsElement.append(_olHoriz);

            generation.usedWords.forEach(word=>{
                let _li = document.createElement("li");
                _li.innerText = word.text;
                if(word.orientation == "vertical")
                    _olVert.append(_li);
                else 
                    _olHoriz.append(_li);
            });
            questionsElement.append(_verticalQuestionsElement);
            questionsElement.append(_horizontalQuestionsElement);
        }
    }

    inputAnswer(){

    }

    checkAnswers(){

    }
}