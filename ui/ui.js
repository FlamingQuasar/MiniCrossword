class CrossWordUI{
    constructor({container, crossword, questions}){
        this.crossword = crossword;
        this._dom = document.createElement("div");
        this._dom.setAttribute("class","ui-crossword");
        container.append(this._dom);
        this.init();
    }

    init(){
        this.crossword.startGeneration();
    }

    render(){

    }

    inputAnswer(){

    }

    checkAnswers(){

    }
}