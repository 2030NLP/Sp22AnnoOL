import {  h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const TokenListP = {
  props: ["tokens", "showreplaced", "showfrom", "showtitle"],
  emits: ["tkn-down", "tkn-enter", "tkn-out", "tkn-up"],
  setup(props, ctx) {
    const onTknDown = (token, event) => {
      // console.log(token, event);
      ctx.emit('tkn-down', {token, event});
    };
    const onTknEnter = (token, event) => {
      // console.log(token, event);
      ctx.emit('tkn-enter', {token, event});
    };
    const onTknOut = (token, event) => {
      // console.log(token, event);
      ctx.emit('tkn-out', {token, event});
    };
    const onTknUp = (token, event) => {
      // console.log(token, event);
      ctx.emit('tkn-up', {token, event});
    };

    const list = ["快速", "迅速", "急速", "缓慢", "慢速", "低速", "快快", "慢慢", "缓缓", "到处", "处处", "四处", "随处", "一起", "一齐", "单独", "独自", "健步", "缓步", "大步", "小步", "单向", "双向", "当场", "就近", "当面", "正面", "中途", "顺路", "向", "到", "往", "自", "朝", "在", "距", "经", "从", "由", "沿", "沿着", "朝着", "向着", "对着", "顺着", "通过"];

    const inList = (token) => {
      if (token.inList) {return true;};
      let word = token?.to?.word ?? token?.whole ?? token?.word;
      if (word.length==1 && token.seg) {
        return list.includes(word) && token.seg=="S";
      };
      return list.includes(word);
    };

    return { onTknDown, onTknEnter, onTknOut, onTknUp, inList };
  },
  render() {
    return h(
      'p', {'class': "p"},
      this.tokens.map(token => h(
        'span', {
          'key' : token.idx,
          'class' : {
            'token': true,
            'right-space': true,
            'should-notice': token.word=='前'||token.word=='后',
          },
          'title' : this.showtitle ? `idx: ${
            token.idx
          }\npos: ${
            token.pos
          }${
            token?.to?.word?.length?'\norigin: '+token.word:''
          }${
            token?.from?.word?.length?'\nfrom: '+token.from.word:''
          }` : null,
          'data-title' : `idx: ${token.idx}\npos: ${token.pos}${token?.to?.word?.length?'\norigin: '+token.word:''}`,
          'data-idx' : token.idx,
          'data-pos' : token.pos,
          'data-seg' : token.seg??"_",
          'data-auto-dverb' : token?.autoDVerb,
          'data-auto-entity' : token.autoEntity,
          'data-auto-spatial' : token.autoSpatial,
          'data-in-list' : this.inList(token),
          'data-selecting' : token?._ctrl?.selecting,
          'data-selected' : token?._ctrl?.selected,
          'data-replaced' : token?.to?.word?.length ? true : token?.from!=null ? true : false,
          'data-word' : token.word,
          'data-to-word' : token?.to?.word,
          'data-from-word' : token?.from?.word,
          'data-from-whole' : token?.from?.whole,
          'onMousedown' : (evt)=>{this.onTknDown(token, evt)},
          'onMouseenter' : (evt)=>{this.onTknEnter(token, evt)},
          'onMouseout' : (evt)=>{this.onTknOut(token, evt)},
          'onMouseup' : (evt)=>{this.onTknUp(token, evt)},
        }, [
          this.showreplaced ? (token?.to?.word ?? token.word)
            : this.showfrom ? (token?.from?.word ?? token.word)
            : (token.word),
        ],
      )),
    );
  },
};

export default TokenListP;

