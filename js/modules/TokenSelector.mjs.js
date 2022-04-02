// modifiedAt: 2022-03-15

class TokenSelector {
  constructor(selection) {
    this.selection = selection;
    // this.selection = reactive({
    //   isSelecting: false,
    //   start: null,
    //   end: null,
    //   end: null,
    //   array: [],
    //   again: false,
    //   hasDown: false,
    // });
  }
  static new(selection) {
    return new TokenSelector(selection);
  }


  clear(tokenList) {
    if (!this?.selection?.array?.length) {return;};
    Object.assign(this.selection, {
      isSelecting: false,
      start: null,
      end: null,
      end: null,
      array: [],
      again: false,
      hasDown: false,
    });
    for (let tkn of tokenList) {
      if (tkn._ctrl != null) {
        Object.assign(tkn._ctrl, {
          selecting: false,
          selected: false,
        })
      };
    };
  }

  onMouseDown(token, event, tokenList) {
    // console.log(['mouseDown', token.word]);
    //
    if (event.buttons == 2) {
      console.log("右键");
      return;
    };
    //
    if (this.selection.hasDown) {
      return;
    };
    //
    if (this.selection.again) {
      if (this.selection.start != this.selection.current) {
        this.selection.again = false;
      };
    };
    //
    this.selection.hasDown = true;
    for (let tkn of tokenList) {
      tkn._ctrl = tkn._ctrl ?? {};
      tkn._ctrl.selected = false;
    };
    token._ctrl.selecting = true;
    //
    this.selection.isSelecting = true;
    this.selection.start = token.idx;
    this.selection.current = token.idx;
    this.selection.end = null;
  }

  onMouseEnter(token, tokenList) {
    // console.log(['mouseEnter', token.word]);
    if (!this.selection.isSelecting) { return; };
    this.selection.current = token.idx;
    let [aa, bb] = [this.selection.start, this.selection.current];
    if (bb < aa) {
      [bb, aa] = [aa, bb];
    };
    let array = []
    for (let idx = aa; idx<=bb; idx++) {
      array.push(idx);
      for (let tkn of tokenList) {
        tkn._ctrl.selecting = (array.includes(tkn.idx));
      };
    };
  }

  onMouseOut(token) {
    this.selection.current = null;
    // console.log(['mouseOut', token.word]);
  }

  onMouseUp(token, tokenList) {
    // console.log(['mouseUp', token.word]);
    //
    if (this.selection.start == null) {return;};
    if (this.selection.start == this.selection.current) {
      if (!this.selection.again) {
        this.selection.again = true;
        return;
      };
      this.selection.again = false;
    };
    //
    //
    this.selection.end = token.idx;
    let [aa, bb] = [this.selection.start, this.selection.end];
    if (bb < aa) {
      [bb, aa] = [aa, bb];
    };
    this.selection.isSelecting = false;
    this.selection.array = [];
    for (let idx = aa; idx<=bb; idx++) {
      this.selection.array.push(idx);
      for (let tkn of tokenList) {
        if (this.selection.array.includes(tkn.idx)) {
          // tkn._ctrl = tkn._ctrl ?? {};
          tkn._ctrl.selecting = false;
          tkn._ctrl.selected = true;
        }
      };
    };
    this.selection.hasDown = false;
    // console.log(this.selection.array);
  }





  getReplacedToken(idx, tokenList) {
    return tokenList[idx]?.replaced ? tokenList[idx]?.to?.word : tokenList[idx].word;
  }
  getOriginToken(idx, tokenList) {
    return tokenList[idx].word;
  }

  selectedReplacedText(tokenList) {
    if (!this.selection?.array?.length) {return "";};
    const text = this.selection.array.map(idx => this.getReplacedToken(idx, tokenList)).join("");
    return text;
  }

  selectedOriginText(tokenList) {
    if (!this.selection?.array?.length) {return "";};
    const text = this.selection.array.map(idx => this.getOriginToken(idx, tokenList)).join("");
    return text;
  }


}

export default TokenSelector;
