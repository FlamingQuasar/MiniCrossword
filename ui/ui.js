
//TODO:

//предустановка генерации - открыть файл слов(+ слова по умолчанию, или + только короткие)


class CrossWordUI{
    constructor({container, crossword}){
        this._dom = document.createElement("div");
        this._dom.classList.add("ui-crossword");
        this._popupWindow = document.createElement("div");
        this._popupWindow.classList.add("ui-popup");
        container.append(this._dom);
        
        this.init(crossword);
    }

    init(crossword){
        this.crossword = crossword;
        this.verticalCounter = 1;
        this.horizontalCounter = 1;
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

    checkCrossword(gen){
        gen.forEach(row=>{
            row.forEach(cell=>{
                if(cell.val != "0" && cell.val != cell.el.innerText)
                    cell.el.classList.add("ui-cw-cell-error");
            })
        });
    }

    solveCrossword(gen){
        this.verticalCounter = 1;
        this.horizontalCounter = 1;
        gen.forEach(row=>{
            row.forEach(cell=>{
                if(cell.val != "0"){
                    cell.el.innerText = cell.val;
                    cell.el.classList.remove("ui-cw-cell-error");
                    this.elementAddWordIndexesIfNeeded(cell.el, cell);
                }
            })
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
        let answers = [];
        words.forEach((word,index)=>{
            let hint = document.createElement("p");
            hint.innerText = "For "+ word.orientation + " word:";
            let inputField = document.createElement("input");
            inputField.setAttribute("id","pin");
            inputField.setAttribute("placeholder",word.text.length + " signs");
            inputField.setAttribute("maxlength",word.text.length);
            inputField.setAttribute("size",word.text.length);
            word.cells.forEach(cell=>{
                if(cell.el.innerText != "_" && cell.el.innerText.length==1){
                    inputField.value+=cell.el.innerText;
                }
            })
            
            inputField.addEventListener("focusout",(el)=>{
                let val = el.target.value;
                let answer = {text:val, orientation:word.orientation};
                answers[index]=answer;
            })
            this._popupWindow.append(hint,inputField);
        });
        let buttonsDiv = document.createElement("div");
        let doneButton = document.createElement("button");
        let cancelButton = document.createElement("button");
        doneButton.innerText = "Ok";
        doneButton.addEventListener("click",()=>{this.saveQuestionAnswerPopup(answers,words)})
        cancelButton.innerText = "Cancel";
        cancelButton.addEventListener("click",()=>{this.cancelQuestionAnswerPopup()});
        buttonsDiv.append(doneButton,cancelButton);
        this._popupWindow.append(buttonsDiv);
        this._popupWindow.classList.add("ui-popup-active");
    }

    saveQuestionAnswerPopup(answers,words){
        words.forEach(word=>{
            answers.forEach(answer =>{
                if(answer.orientation == word.orientation){
                    for(let i=0; i<word.cells.length; i++){
                        if(answer.text[i]){
                            word.cells[i].el.classList.remove("ui-cw-cell-error");
                            word.cells[i].el.innerText = answer.text[i];
                            //this.elementAddWordIndexesIfNeeded(word.cells[i].el, word.cells[i]);
                        }
                    }
                }
            })
        });
        this._popupWindow.classList.remove("ui-popup-active");
    }

    cancelQuestionAnswerPopup(){
        this._popupWindow.classList.remove("ui-popup-active");
    }

    render(){
        this._dom.innerHTML = "";
        this._dom.append(this._popupWindow);
        let _generationOptions = document.createElement("div");
        _generationOptions.classList.add("ui-cw-options");
        let _optionsText = document.createElement("p");
        _optionsText.innerText = "Setup crossword generator options:";

        let _inputGenerationsNumberLabel =  document.createElement("label");
        let _inputGenerationsNumber = document.createElement("input");
        _inputGenerationsNumber.setAttribute("type","number");
        _inputGenerationsNumber.setAttribute("placeholder","Number");
        _inputGenerationsNumber.setAttribute("value","4");
        _inputGenerationsNumber.setAttribute("min",1);
        _inputGenerationsNumberLabel.append(_inputGenerationsNumber);
        _inputGenerationsNumberLabel.innerHTML+=" Number of crosswords";

        let _inputWidthLabel =  document.createElement("label");
        let _inputWidth = document.createElement("input");
        _inputWidth.setAttribute("type","number");
        _inputWidth.setAttribute("placeholder","Number");
        _inputWidth.setAttribute("value","6");
        _inputWidth.setAttribute("min",3);
        _inputWidthLabel.append(_inputWidth);
        _inputWidthLabel.innerHTML+=" Width";

        let _inputHeightLabel =  document.createElement("label");
        let _inputHeight = document.createElement("input");
        _inputHeight.setAttribute("type","number");
        _inputHeight.setAttribute("placeholder","Number");
        _inputHeight.setAttribute("value","5");
        _inputHeight.setAttribute("min",3);
        _inputHeightLabel.append(_inputHeight);
        _inputHeightLabel.innerHTML+=" Height";
        let words = ["cat", "cop", "top", "bar", "bra", "crab", "art", "bat", "rat", "hat", "mat", "cap", "med", "mad", "dad", "mom", "old", "odd", "don", "node"];
            
        let _generateButton = document.createElement("button");
        _generateButton.innerText="Generate!";
        _generateButton.addEventListener("click",()=>{
            const crossword = new Crossword({
                rows: _inputHeight.value, 
                cols: _inputWidth.value, 
                words: words, 
                empty: 5,
                genLimit: _inputGenerationsNumber.value,
                showLog: true
            });
            this.init(crossword);
            this.render();
        });
        _generationOptions.append(_optionsText,_inputGenerationsNumberLabel,_inputWidthLabel,_inputHeightLabel,_generateButton);
       
        let _hintText = document.createElement("div");
        _hintText.classList.add("ui-cw-hint");
        _hintText.innerHTML = `Click to the word to type it, then "Check"! Or click <b>"Solve"</b> button`;
        this._dom.append(_generationOptions,_hintText);
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
            let _controlButtonsDiv = document.createElement("div");
            _controlButtonsDiv.classList.add("ui-cw-buttons");
            let _checkButton = document.createElement("button");
            let _solveButton = document.createElement("button");
            _checkButton.innerText = "Check";
            _checkButton.addEventListener("click",()=>{
                this.checkCrossword(gen);
            });
            _solveButton.innerText = "Solve";
            _solveButton.addEventListener("click",()=>{
                this.solveCrossword(gen);
            });
            _controlButtonsDiv.append(_checkButton,_solveButton);
            _matrixWrap.append(_controlButtonsDiv);
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
            element.innerHTML = "<b style='opacity:0'>_</b>";
            this.elementAddWordIndexesIfNeeded(element, cell);
           
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

    elementAddWordIndexesIfNeeded(element,cell){
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