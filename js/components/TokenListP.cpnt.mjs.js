import {  h  } from '../modules_lib/vue_3.2.31_.esm-browser.prod.min.js';

const TokenListP = {
  props: ["tokens", "showreplaced", "showtitle"],
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

    const list = ["向", "到", "往", "自", "至", "朝", "在", "距", "于", "与", "同", "和", "随", "跟", "经", "从", "由", "沿", "使", "把", "以", "用", "被", "沿着", "朝着", "向着", "随着", "对着", "通过", "经由", "顺着", "距离", "连同", "靠着", "快速", "急速", "迅速", "疾速", "火速", "飞速", "稳步", "缓缓", "慢速", "缓慢", "低速", "急剧", "缓慢", "到处", "处处", "四处", "随处", "随地", "四下", "一起", "一道", "一齐", "单独", "大步", "阔步", "健步", "缓步", "快步", "急步", "疾步", "齐步", "单向", "双向", "当场", "现场", "当面", "正面", "实地", "就近", "中途", "顺路"];

    const inList = (token) => {
      let word = token?.to?.word ?? token?.word;
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
          'title' : this.showtitle ? `idx: ${token.idx}\npos: ${token.pos}${token?.to?.word?.length?'\norigin: '+token.word:''}` : null,
          'data-title' : `idx: ${token.idx}\npos: ${token.pos}${token?.to?.word?.length?'\norigin: '+token.word:''}`,
          'data-idx' : token.idx,
          'data-pos' : token.pos,
          'data-auto-dverb' : token?.autoDVerb,
          'data-auto-entity' : token.autoEntity,
          'data-auto-spatial' : token.autoSpatial,
          'data-in-list' : this.inList(token),
          'data-selecting' : token?._ctrl?.selecting,
          'data-selected' : token?._ctrl?.selected,
          'data-replaced' : token?.to?.word?.length ? true : false,
          'data-word' : token.word,
          'data-to-word' : token?.to?.word,
          'onMousedown' : (evt)=>{this.onTknDown(token, evt)},
          'onMouseenter' : (evt)=>{this.onTknEnter(token, evt)},
          'onMouseout' : (evt)=>{this.onTknOut(token, evt)},
          'onMouseup' : (evt)=>{this.onTknUp(token, evt)},
        }, [
          this.showreplaced ? (token?.to?.word ?? token.word) : (token.word),
        ],
      )),
    );
  },
};

export default TokenListP;

