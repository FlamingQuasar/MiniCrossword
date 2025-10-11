class CrossWordUI{
    constructor({container, crossword, questions}){
        this.crossword = crossword;
        this._dom = document.createElement("div");
        this._dom.setAttribute("class","ui-crossword");
        container.append(this._dom);
        this.verticalCounter = 1;
        this.horizontalCounter = 1;
        this.init();
    }

    init(){
        this.crossword.startGeneration();
    }

    render(){
        console.log(this.crossword.generations);
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

    inputAnswer(){

    }

    checkAnswers(){

    }
}