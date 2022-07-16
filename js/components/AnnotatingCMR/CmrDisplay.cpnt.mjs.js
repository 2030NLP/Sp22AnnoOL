import {
  ref, reactive, computed, onMounted, h,
  provide, inject,
  // Transition,
  Teleport,
  v,
  div, span, btn, watch
} from './VueShadow.mjs.js';
import { CMR, BS } from './Shadow.mjs.js';

import {
  ha,
  space,
  text,
  textNone,
  muted,

  opacity100,
  opacity75,
  opacity50,
  opacity25,

  textPink,
  textIndigo,
  textPurple,
  textOrange,
  textTeal,

  textPrimary,
  textSecondary,
  textSuccess,
  textDanger,
  textWarning,
  textInfo,
  textLight,
  textDark,

  labelSpan,
  lightBtn,
  bi,
  ti,
  vr,
  spansJoin,
  modal,
  confirmModal,
} from './BsVueUtils.mjs.js';

import {
  faceFn单个原文片段,
  faceFn单个不连续原文片段,
  faceFn单个不连续原文片段无引号,
  faceFn多个不连续原文片段,
  faceFn单个标签,
  faceFn单个对象,
  faceFn多个对象,
  ctrlTypeFaceFnMap,
  dataFace,
  faceFnObj空间实体,
  faceFnObj事件,
  faceFnObj论元角色关系,
  faceFnObj角色引用,
  faceFnSpan介词,
  faceFnSpan方位词,
  faceFn实体,
  faceFnObj位置特征,
  faceFnObj方向特征,
  faceFnObj朝向特征,
  faceFnObj形状特征,
  faceFnObj距离特征,
  faceFnObj时间特征,
  faceFnObj特征命题,
  faceFnObj共指关系,
  objectTypeFaceFnMap,
  faceFnObj事件角色,
  defaultObjectFace,
  objectFace,
} from './CmrFaces.mjs.js';


const last_of = (array) => {return array[array.length-1]};
const average = list => list.length ? (list.reduce(((aa, bb)=>aa+bb), 0) / list.length) : Infinity;



export default {
  props: ['annotation', 'tokens', 'definition', 'showTips', 'limitHeight'],
  emits: [],
  component: {},
  setup(props, ctx) {


    // 通用 data 开始
    const ref_viewMode = ref("清单模式");
    const reactiveCMR = reactive(new CMR);
    const ref_highlighted_idxes = ref([]);
    const ref_highlighted_obj_id = ref([]);
    // const ref_roleMap = ref({});
    // 通用 data 结束


    // 通用 computed 开始
    const objects = computed(()=>{
      // console.log("更新 objects");
      return props?.annotation?.data?.objects?.sort?.(_methods.按原文顺序排序函数);
    });

    const allIdxes = computed(() => {
      // console.log("更新 allIdxes");
      return v(objects).map(obj=>_methods.获取obj的Idxes(obj)).flat(Infinity);
    });

    const tokenUnits = computed(() => {
      // console.log("更新 tokenUnits");
      const tokens = props?.tokens??[];
      const units = tokens.map((token, idx)=>{
        // console.log([token, idx]);
        return ({
          idx: idx,
          word: token?.to?.word ?? token?.word,
          seg: token?.seg ?? "_",
          // role: localData?.roleMap?.[idx],
          spatial: v(所有空间义高亮的Idxes).includes?.(idx),
          annotated: v(allIdxes)?.includes?.(idx),
          highlighted: v(ref_highlighted_idxes)?.includes?.(idx),
        });
      });
      return units;
    });

    const 所有空间义高亮的tokens = computed(() => {
      // console.log("更新 所有空间义高亮的tokens");
      const that = (props?.tokens??[]).filter(token=>
        (token.autoSpatial && ["f", "s", "dv"].includes(token.pos)) ||
        (_methods.在临时词表中(token) && ["d", "p"].includes(token.pos))
      );
      return that;
    });

    const 所有空间义高亮的Idxes = computed(() => {
      // console.log("更新 所有空间义高亮的Idxes");
      return v(所有空间义高亮的tokens).map(it=>it.idx);
    });
    // 通用 computed 结束


    // 通用 methods 开始
    const _methods = {
      在临时词表中: (token) => {
        // console.log("执行 在临时词表中");
        const list = ["快速", "迅速", "急速", "缓慢", "慢速", "低速", "快快", "慢慢", "缓缓", "到处", "处处", "四处", "随处", "一起", "一齐", "单独", "独自", "健步", "缓步", "大步", "小步", "单向", "双向", "当场", "就近", "当面", "正面", "中途", "顺路", "向", "到", "往", "自", "朝", "在", "距", "经", "从", "由", "沿", "沿着", "朝着", "向着", "对着", "顺着", "通过"];
        if (token.在临时词表中) {return true;};
        let word = token?.to?.word ?? token?.whole ?? token?.word;
        if (word.length==1 && token.seg) {
          return list.includes(word) && token.seg=="S";
        };
        return list.includes(word);
      },
      按原文顺序排序函数: (aa, bb) => {
        // console.log("执行 按原文顺序排序函数");
        const iiaa = _methods.获取obj的Idxes(aa);
        const iibb = _methods.获取obj的Idxes(bb);
        if (!iiaa.length && !iibb.length) {return true;};
        if (!iiaa.length) {return true;};
        if (!iibb.length) {return false;};
        return iiaa[0]==iibb[0] ? (average(iiaa)-average(iibb)) : (iiaa[0]-iibb[0]);
      },
      获取field的Idxeseses: (field) => {
        // console.log("执行 获取field的Idxeseses");
        let idxeseses = [];
        const fn_map = {
          "MB_SPANS": (list)=>{return list.map(it=>it.idxeses);},
        };
        if (field?.value!=null) {
          if (field?.type in fn_map) {
            idxeseses = fn_map[field?.type](field?.value)??[];
          };
        };
        return idxeseses;
      },
      获取field的Idxes: (field) => {
        // console.log("执行 获取field的Idxes");
        let idxes = [];
        const fn_map = {
          "MB_SPANS": (list)=>{return list.map(it=>it.idxeses).flat(Infinity);},
        };
        if (field?.value!=null) {
          if (field?.type in fn_map) {
            let new_idxes = fn_map[field?.type](field?.value)??[];
            idxes = [...idxes, ...new_idxes];
          };
        };
        return idxes;
      },
      获取obj的Idxes: (obj) => {
        // console.log("执行 获取obj的Idxes");
        let idxes = [];
        const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];
        const fn_map = {
          "MB_SPANS": (list)=>{return list.map(it=>it.idxeses).flat(Infinity);},
        };
        for (let slot of slots) {
          if (slot.name in obj && obj?.[slot.name]?.value!=null) {
            let new_idxes = _methods.获取field的Idxes(obj?.[slot.name]);
            idxes = [...idxes, ...new_idxes];

            // 处理事件信息中的idx范围 是一个很特殊的特例
            if (slot.name=="SPE_obj" && obj.type=="propSet_E") {
              const spe_obj = reactiveCMR.get(obj?.SPE_obj?.value);
              if (spe_obj) {
                let new_idxes = spe_obj?.E?.value?.[0]?.idxeses?.[0]??[];
                idxes = [...idxes, ...new_idxes];
              };
            };
          };
        };
        return idxes;
      },
      获取obj中每个Idx的出现次数: (obj) => {
        // console.log("执行 获取obj中每个Idx的出现次数");
        let dict = {};
        const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];
        const fn_map = {
          "MB_SPANS": (list)=>{return list.map(it=>it.idxeses).flat(Infinity);},
        };
        for (let slot of slots) {
          if (slot.name in obj && obj?.[slot.name]?.value!=null) {
            if (obj?.[slot.name]?.type in fn_map) {
              let new_idxes = fn_map[obj?.[slot.name]?.type](obj?.[slot.name]?.value)??[];
              for (let idx of new_idxes) {
                if (!(idx in dict)) {dict[idx]=0;};
                dict[idx]++;
              };
            };
            // 处理事件信息中的idx范围 是一个很特殊的特例
            if (slot.name=="SPE_obj" && obj.type=="propSet_E") {
              const spe_obj = reactiveCMR.get(obj?.SPE_obj?.value);
              if (spe_obj) {
                let new_idxes = spe_obj?.E?.value?.[0]?.idxeses?.[0]??[];
                for (let idx of new_idxes) {
                  if (!(idx in dict)) {dict[idx]=0;};
                  dict[idx]++;
                };
              };
            };
          };
        };
        // console.log(JSON.stringify(dict));
        return dict;
      },
      idxesToTokens: (idxes) => {
        // console.log("执行 idxesToTokens");
        idxes = idxes??[];
        let allTokens = props?.tokens ?? [];
        // console.log("allTokens:");
        // console.log(allTokens);
        if (!allTokens?.length) {
          return [];
        };
        const tokens = idxes.map(idx => allTokens[idx]?.to ?? allTokens[idx] ?? {});
        return tokens;
      },
      idxesToText: (idxes) => {
        // console.log("执行 idxesToText");
        let _tokens = _methods.idxesToTokens(idxes);
        let result = _tokens.map(it => it.word).join("");
        return result;
      },
      idxesToPOSes: (idxes) => {
        // console.log("执行 idxesToPOSes");
        idxes = idxes??[];
        let allTokens = props?.tokens ?? [];
        if (!allTokens?.length) {
          return [];
        };
        return idxes.map(idx => allTokens[idx]?.pos ?? "_");
      },
      tokensToWords: (tokens) => {
        // console.log("执行 tokensToWords");
        // console.log("tokens:");
        // console.log(tokens);
        let words = [];
        let template = {
          text: "",
          pos: "_",
          idxes: [],
          segs: [],
          comp: true,
        };
        let comingWord = Object.assign({}, template);
        const 中间的处理 = (token) => {
          comingWord.text = `${comingWord.text}${token?.to?.word??token?.word??token?.from?.word??""}`;
          comingWord.pos = token?.pos ?? "_";
          if (token.idx!=null) {
            comingWord.idxes.push(token.idx);
          };
          if (token.seg!=null && ["B", "S", "M", "E"].includes(token.seg)) {
            comingWord.segs.push(token.seg);
          };
        };
        const 推词 = () => {
          if (comingWord.text?.length) {
            if (comingWord.segs?.length && (!["B", "S"].includes(comingWord.segs[0]) || !["E", "S"].includes(comingWord.segs[0]))) {
              comingWord.comp = false;
            } else {
              comingWord.comp = true;
            };
            // console.log("comingWord:");
            // console.log(comingWord);
            words.push(comingWord);
          };
        };
        const 新词的处理 = (token) => {
          推词();
          comingWord = Object.assign({}, template);
          中间的处理(token);
        };
        const fnMap = {
          'B': 新词的处理,
          'S': 新词的处理,
          'M': 中间的处理,
          'E': 中间的处理,
        };
        for (let token of tokens) {
          if (token.seg in fnMap) {
            fnMap[token.seg](token);
          } else {
            新词的处理(token);
          };
        };
        推词();
        return words;
      },
      idxesToWords: (idxes) => {
        // console.log("执行 idxesToWords");
        // console.log("idxes:");
        // console.log(JSON.stringify(idxes));
        const tokens = _methods.idxesToTokens(idxes);
        // console.log("tokens:");
        // console.log(tokens);
        const words = _methods.tokensToWords(tokens);
        return words;
      },
      idxesesToWords: (idxeses) => {
        // console.log("执行 idxesesToWords");
        let words = [];
        for (const idxes of idxeses) {
          words = [...words, ..._methods.idxesToWords(idxes)];
        };
        return words;
      },
      获取field中的Words: (field) => {
        // console.log("执行 获取field中的Words");
        return _methods.idxesesToWords(_methods.获取field的Idxeseses(field));
      },
      获取field中的Wordses: (field) => {
        // console.log("执行 获取field中的Wordses");
        const idxeseses = _methods.获取field的Idxeseses(field);
        // console.log("idxeseses:");
        // console.log(JSON.stringify(idxeseses));
        return idxeseses.map(idxes=>_methods.idxesesToWords(idxes));
      },
      获取两个idx之间的文本: (start, end) => {
        // console.log("执行 获取两个idx之间的文本");
        if (start > end) {
          [start, end] = [end, start];
        };
        let idxes = [];
        for (let idx=start; idx<=end; idx++) {
          idxes.push(idx);
        };
        return _methods.idxesToText(idxes);
      },
    };
    // 通用 methods 结束


    // 通用 生命周期 开始
    const _life_methods = {
      cmr_init: () => {
        // console.log("执行 cmr_init");
        reactiveCMR.initDefinition(props?.['definition']);
        const existedObjects = v(objects);
        reactiveCMR.initData({'objects': existedObjects});
      },
      init: () => {
        // console.log("执行 init");
        _life_methods.cmr_init();
        onSortObjectsById();
        _checker_methods.检查错误();
        onSortObjectsByType();
      },
    };
    onMounted(()=>{
      _life_methods.init();
    });
    watch(()=>props?.annotation, ()=>{
      _life_methods.init();
    });
    watch(()=>props?.tokens, ()=>{
      _life_methods.init();
    });
    watch(()=>props?.definition, ()=>{
      _life_methods.init();
    });
    // 通用 生命周期 结束


    const 否定字清单 = "不、非、无、没、否";
    const 否定字正则 = /[不非无没否]/
    const 事件E结尾黑名单 = "来、去、上、下、进、出、回、往、起、到";

    const 介词清单 = "从、由、到、至、经、通过、沿、顺着、过、向、朝、往、在、于、距离、距、离";
    const 首词白名单字典 = {
      'Pl': "在",  // 处所
      // 'Be': "",  // 起点
      'Ed': "到、进",  // 终点
      'Dr': "上、下、进、入、出、回、往、起、来、去、向",  // 方向
      'Or': "朝",  // 朝向
      // 'PPl': "",  // 部件处所
      // 'Pa': "",  // 部位
      // 'Shp': "",  // 形状
      // 'Pt': "",  // 路径
      // 'Ds_Vl': "",  // 距离1
    };
    const 尾词白名单字典 = {
      'Pl': "上、下、里、外、中、前、后、左、右",  // 处所
      'Be': "上、下、里、外、中、前、后、左、右",  // 起点
      'Ed': "上、下、里、外、中、前、后、左、右",  // 终点
      'Dr': "上、下、进、入、出、回、往、起、来、去、向",  // 方向
      // 'Or': "朝",  // 朝向
      // 'PPl': "",  // 部件处所
      // 'Pa': "",  // 部位
      // 'Shp': "",  // 形状
      // 'Pt': "",  // 路径
      // 'Ds_Vl': "",  // 距离1
    };
    const 首词报警介词字典 = {
      'Pl': "从、由、到、至、经、通、沿、顺、往、向、朝、距、离",  // 处所
      'Be': "到、至、经、通、沿、顺、往、向、朝、距、离",  // 起点
      'Ed': "从、由、经、通、沿、顺、往、向、朝、距、离",  // 终点
      'Dr': "在、于、到、至、经、通、沿、顺、距、离",  // 方向
      'Or': "在、于、从、由、到、至、经、通、沿、顺、距、离",  // 朝向
      'PPl': "从、由、到、至、经、通、沿、顺、往、向、朝、距、离",  // 部件处所
      'Pa': "在、于、从、由、到、至、经、通、沿、顺、往、向、朝、距、离",  // 部位
      'Shp': "在、于、从、由、到、至、经、通、沿、顺、往、向、朝、距、离",  // 形状
      'Pt': "在、于、往、向、朝、距、离",  // 路径
      'Ds_Vl': "在、于、从、由、到、至、经、通、沿、顺、往、向、朝",  // 距离1
    };
    const 首尾不能是v的字段 = [
      'Pl', 'Be', 'Ed', 'Dr', 'Or',
      'PPl', 'Pa',
      'Shp',
      'Pt',
      'Ds_Vl',
    ];
    const 要排除的字结尾的字段 = [
      'Pl', 'Be', 'Ed', 'Dr', 'Or',
      'PPl', 'Pa',
      'Shp',
      'Pt',
      'Ds_Vl',
      'E',
      'argS', 'argT', 'argM',
    ];
    const 距离之外的空间信息字段 = [
      'Pl', 'Be', 'Ed', 'Dr', 'Or',
      'PPl', 'Pa',
      'Shp',
      'Pt',
    ];
    const 要选取文本片段的空间信息字段 = [
      'Pl', 'Be', 'Ed', 'Dr', 'Or',
      'PPl', 'Pa',
      'Shp',
      'Pt',
      'Ds_Vl',
    ];
    const 小句分隔符正则 = /[，。；：！？…,\.;:!\?]/;
    const _checker_data = reactive({
      '错误清单': [],
    });
    const _checker_methods = {


      检查漏掉的高亮词: () => {
        // console.log("执行 _checker_methods.检查漏掉的高亮词");
        let 漏掉的idxes = [];
        for (let idx of v(所有空间义高亮的Idxes)) {
          if (!v(allIdxes).includes(idx)) {
            漏掉的idxes.push(idx);
          };
        };
        if (漏掉的idxes.length) {
          const those = 漏掉的idxes.map(idx=>`${_methods.idxesToText([idx])}(${idx})`).join(" ");
          const it = {
            'style': "info",
            'text': `存在未标注的高亮片段：${those}`,
          };
          _checker_data.错误清单.push(it);
        };
      },


      记录错误: (style, text) => {
        const it = {
          'style': style ?? "info",
          'text': text ?? "_",
        };
        _checker_data.错误清单.push(it);
      },


      检查任意字段: (obj, slot, ky) => {
        const idx_txt = `${obj._id??obj.id??"_"}`;
        const slot_face = slot.nameFace??slot.name??"无名字段";
        const arg = obj[ky];
        const list = arg.value ?? [];
        const wordses = _methods.获取field中的Wordses(arg);
        const words = _methods.获取field中的Words(arg);

        // 检查只有一个词且未介词的情况
        if (list?.length) {
          let 结果;
          结果 = wordses.find(wordL => {
            if (wordL.length>1) {return false;};
            const word = wordL[0];
            return word.pos=="p" || 介词清单.split("、").includes(word.text);
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.[0]?.text}”似乎只有介词`
            );
          };
        }

        // 检查含有 否定字清单 中的字
        if (list?.length) {
          const 结果 = list.find(it => (it?.texts??[]).find(txt=>txt.search(否定字正则)>=0));
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.texts?.join(" ")}”含有否定义的字`
            );
          };
        };

        // 检查着了过结尾
        if (list?.length) {
          const 结果 = list.find(it => ["着", "了", "过"].includes(it?.texts?.at?.(-1)?.at?.(-1)));
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: 以“${结果?.texts?.at?.(-1)?.at?.(-1)}”结尾`
            );
          };
        };

        // 检查的字结尾
        if (list?.length && 要排除的字结尾的字段.includes(ky)) {
          const 结果 = list.find(it => ["的"].includes(it?.texts?.at?.(-1)?.at?.(-1)));
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: 以“${结果?.texts?.at?.(-1)?.at?.(-1)}”结尾`
            );
          };
        };

        // 检查首尾动词 旧版
        if (false && list?.length && 首尾不能是v的字段.includes(ky)) {
          // let 结果;
          // 结果 = list.find(it => {
          //   const 首位idx = it?.idxeses?.[0]?.[0];
          //   const 首位text = it?.texts?.[0]?.[0];
          //   let 白名单检查结果 = true;
          //   if (ky in 首词白名单字典) {
          //     白名单检查结果 = !首词白名单字典[ky].split("、").includes(首位text);
          //   };
          //   return _methods.idxesToPOSes([首位idx])?.[0]=="v" && 白名单检查结果;
          // });
          // if (结果) {
          //   _checker_methods.记录错误("warning",
          //     `[${idx_txt}].${slot_face}: “${结果?.texts?.[0]}”似乎以不合适的动词开头`
          //   );
          // };
          // if (words?.length > 1) {
          //   结果 = list.find(it => {
          //     const 末位idx = it?.idxeses?.at?.(-1)?.at?.(-1);
          //     const 末位text = it?.texts?.at?.(-1)?.at?.(-1);
          //     let 白名单检查结果 = true;
          //     if (ky in 尾词白名单字典) {
          //       白名单检查结果 = !尾词白名单字典[ky].split("、").includes(末位text);
          //     };
          //     return _methods.idxesToPOSes([末位idx])?.[0]=="v" && 白名单检查结果;
          //   });
          //   if (结果) {
          //     _checker_methods.记录错误("warning",
          //       `[${idx_txt}].${slot_face}: “${结果?.texts?.at?.(-1)}”似乎以动词结尾`
          //     );
          //   };
          // };
        };

        // 检查首尾动词 新版
        if (list?.length && 首尾不能是v的字段.includes(ky)) {
          // console.log(wordses);
          // console.log(words);
          // console.log(list);
          let 结果;
          // 检查首词
          结果 = wordses.find(wordL => {
            if (!wordL?.comp) {return false;};
            const 首词 = wordL?.[0];
            let 不在白名单中 = true;
            if (ky in 首词白名单字典) {
              不在白名单中 = !首词白名单字典[ky].split("、").includes(首词.text?.[0]);
            };
            return 首词.pos=="v" && 不在白名单中;
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.[0]?.text}”似乎以不合适的动词开头`
            );
          };
          // 检查尾词
          结果 = wordses.find(wordL => {
            if (!wordL?.comp) {return false;};
            if ((wordL?.length??0)<=1) {return false;};
            const 尾词 = wordL?.at?.(-1);
            let 不在白名单中 = true;
            if (ky in 尾词白名单字典) {
              不在白名单中 = !尾词白名单字典[ky].split("、").includes(尾词.text?.at?.(-1));
              console.log(尾词?.text, ky, 不在白名单中);
            };
            return 尾词.pos=="v" && 不在白名单中;
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.at?.(-1)?.text}”似乎以动词结尾`
            );
          };
        };

        // 检查首位语气词助词
        if (list?.length) {
          let 结果;
          结果 = list.find(it => {
            const 首位idx = it?.idxeses?.[0]?.[0];
            return ["y", "u"].includes(_methods.idxesToPOSes([首位idx])?.[0]);
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.texts?.[0]}”似乎以语气词或助词开头`
            );
          };
        };

        // 检查末位介词副词 旧版
        if (false && list?.length) {
          // let 结果;
          // 结果 = list.find(it => {
          //   const 末位idx = it?.idxeses?.at?.(-1)?.at?.(-1);
          //   return ["p", "d"].includes(_methods.idxesToPOSes([末位idx])?.[0]);
          // });
          // if (结果) {
          //   _checker_methods.记录错误("warning",
          //     `[${idx_txt}].${slot_face}: “${结果?.texts?.at?.(-1)}”似乎以介词或副词结尾`
          //   );
          // };
        };

        // 检查末位介词副词 新版
        if (list?.length) {
          let 结果;
          // 检查末位介词副词
          结果 = wordses.find(wordL => {
            if (!wordL?.comp) {return false;};
            if ((wordL?.length??0)<=1) {return false;};
            const 尾词 = wordL?.at?.(-1);
            let 不在白名单中 = true;
            if (ky in 尾词白名单字典) {
              不在白名单中 = !尾词白名单字典[ky].split("、").includes(尾词.text?.at?.(-1));
            };
            return ["p", "d"].includes(尾词.pos) && 不在白名单中;
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.at?.(-1)?.text}”似乎以介词或副词结尾`
            );
          };
        };

        // 检查末位数词代词
        // 需要词数大于1，注意不是直接算字符串长度
        if (words.length>1) {
          let 结果;
          结果 = list.find(it => {
            const 末位idx = it?.idxeses?.at?.(-1)?.at?.(-1);
            return ["m"].includes(_methods.idxesToPOSes([末位idx])?.[0]);
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.texts?.at?.(-1)}”似乎以数词m结尾`
            );
          };
        };
        if (words.length>1 && !["S", "R"].includes(ky)) {
          let 结果;
          结果 = list.find(it => {
            const 末位idx = it?.idxeses?.at?.(-1)?.at?.(-1);
            return ["r"].includes(_methods.idxesToPOSes([末位idx])?.[0]);
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.texts?.at?.(-1)}”似乎以代词r结尾`
            );
          };
        };

        // 检查并置片段的词性（同指关系不用）
        if (list.length>1 && ky!="R") {
          const things = list.map(item => ({
            text: (item.texts??[]).join(" "),
            poses: Array.from(new Set(
              _methods.idxesesToWords(item.idxeses).map(it=>it.pos)
            ))??[],
          }));
          let error = false;
          for (let ii in things) {
            if (!error) {
              let aa = things[ii];
              let aa_poses_text = aa.poses.join("_");
              for (let jj in things) {
                if (ii!=jj && !error) {
                  let bb = things[jj];
                  if (bb.poses==undefined) {
                    console.log(things);
                    console.log([ii, jj, aa, bb]);
                  };
                  let bb_poses_text = bb.poses.join("_");
                  if (aa_poses_text != bb_poses_text) {
                    _checker_methods.记录错误("warning",
                      `[${idx_txt}].${slot_face}: “${aa.text}”的词性(${aa_poses_text})和“${bb.text}”的词性(${bb_poses_text})有差异`
                    );
                    error = true;
                  };
                };
              };
            };
          };
        };
      },


      检查单条错误_STEP: (obj) => {
        const idx_txt = `${obj._id??obj.id??"_"}`;

        // 根据 距离 字段 检查其他字段
        if (obj?.['Ds_Vl']?.value?.length || obj?.['Ds_Dc']?.value?.face?.length) {
          // S字段内 必须是 并置的两个语言成分
          if (obj?.['S']?.value?.length!=2) {
            _checker_methods.记录错误("danger",
              `[${idx_txt}]: 距离字段需要2个并置的实体S`
            );
          };
          // 不能 同时出现 距离之外的空间信息字段
          const 异常字段 = 距离之外的空间信息字段.find(ky=>{
            return ((obj?.[ky]?.value?.length??0)>0);
          });
          if (异常字段) {
            _checker_methods.记录错误("danger",
              `[${idx_txt}]: 距离字段不应该与其他空间信息一起填写，应该单独填写`
            );
          };
        };

        // 逐个字段检查
        let 可用的空间信息字段 = [];
        const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];
        for (let slot of slots) {
          const ky = slot.name;
          const slot_face = slot.nameFace??slot.name??"无名字段";

          if (ky in obj && obj?.[ky]?.value!=null && ["MB_SPANS"].includes(obj?.[ky]?.type)) {

            const arg = obj[ky];
            const list = arg.value ?? [];

            if (要选取文本片段的空间信息字段.includes(ky)) {
              可用的空间信息字段.push(ky);

              // 检查左右邻接词是否高亮，高亮则报警
              const 那些首部idxes = list.map(it=>it?.idxeses?.[0]?.[0]);
              const 那些尾部idxes = list.map(it=>it?.idxeses?.at?.(-1)?.at?.(-1));

              const 那些左邻idxes = 那些首部idxes.map(it=>(it-1));
              const 那些右邻idxes = 那些尾部idxes.map(it=>(it+1));

              // v(所有空间义高亮的Idxes)?.includes?.(idx)
              const 左邻高亮idx = 那些左邻idxes.find(idx=>v(所有空间义高亮的Idxes)?.includes?.(idx));
              const 右邻高亮idx = 那些右邻idxes.find(idx=>v(所有空间义高亮的Idxes)?.includes?.(idx));
              if (左邻高亮idx!=null) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: 左邻高亮词“…${_methods.idxesToText([左邻高亮idx])}”`
                );
              };
              if (右邻高亮idx!=null) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: 右邻高亮词“${_methods.idxesToText([右邻高亮idx])}…”`
                );
              };

            };

            _checker_methods.检查任意字段(obj, slot, ky);

            // 检查参照事件 附近字符
            if (list?.length && ["T_Rf"].includes(ky)) {
              const 那些尾部idxes = list.map(it=>it?.idxeses?.at?.(-1)?.at?.(-1));
              const 要检查的idxes = 那些尾部idxes.map(idx => [idx+1, idx+2]).flat();
              const 要检查的文本 = 要检查的idxes.map(idx => _methods.idxesToText([idx])??"");
              const 结果 = 要检查的文本.find(it=>(it?.search?.(/前|后|时/)??-1)>=0);
              if (结果) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: 后方有“${结果}”，可能是原文时间`
                );
              };
            };

            // 检查事件特例
            if (list?.length && ["E"].includes(ky)) {
              const 结果 = list.find(it => it?.texts?.find?.(text=>(text?.search?.(/直行|转弯|在|位于|居于|位居|地处|处于/)??-1)>=0));
              if (结果) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: 包含排除词`
                );
              };
            };

            // 检查首位是字典中的介词
            if (ky in 首词报警介词字典 && list?.length) {
              const 检查列表 = 首词报警介词字典[ky].split("、");
              const 结果 = list.find(it => 检查列表.includes(it?.texts?.[0]?.[0]));
              if (结果) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: 以“${结果?.texts?.[0]?.[0]}”开头`
                );
              };
            };

            // 检查方向Dr的首尾动词  // 已经改为通用写法，这段不需要了，暂时留着备忘而已
            if (false && list?.length && ky=="Dr") {
              // let 结果;
              // // 检查方向Dr的首位动词
              // 结果 = list.find(it => {
              //   const 首位idx = it?.idxeses?.[0]?.[0];
              //   const 首位text = it?.texts?.[0]?.[0];
              //   return _methods.idxesToPOSes([首位idx])?.[0]=="v" && !可以放在方向Dr开头的动词.includes(首位text);
              // });
              // if (结果) {
              //   _checker_methods.记录错误("warning",
              //     `[${idx_txt}].${slot_face}: “${结果?.texts?.[0]}”似乎以不合适的动词开头`
              //   );
              // };
              // // 检查方向Dr的末位动词
              // 结果 = list.find(it => {
              //   const 末位idx = it?.idxeses?.at?.(-1)?.at?.(-1);
              //   return _methods.idxesToPOSes([末位idx])?.[0]=="v";
              // });
              // if (结果) {
              //   _checker_methods.记录错误("warning",
              //     `[${idx_txt}].${slot_face}: “${结果?.texts?.at?.(-1)}”似乎以动词结尾`
              //   );
              // };
            };

            // 检查方向S和事件E的首位介词
            if (list?.length && ["S", "E"].includes(ky)) {
              let 结果;
              结果 = list.find(it => {
                const 首位idx = it?.idxeses?.[0]?.[0];
                return _methods.idxesToPOSes([首位idx])?.[0]=="p";
              });
              if (结果) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: “${结果?.texts?.[0]}”似乎以介词开头`
                );
              };
            };

            // 检查 事件E 最后一个字符是“来、去、上、下、进、出、回、往、起、到”
            // 事件E结尾黑名单
            if (list?.length && ["E"].includes(ky)) {
              const 结果 = list.find(it => 事件E结尾黑名单.includes(it?.texts?.at?.(-1)?.at?.(-1)));
              if (结果) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: 以“${结果?.texts?.at?.(-1)?.at?.(-1)}”结尾`
                );
              };
            };
          };
        };

        // 检查 严重跨标点句
        // S的开头id 和 P的结尾id之间包含逗号或句号 +
        // P的开头id 和 E的结尾id之间包含逗号或句号 +
        // S的开头id 和 E的结尾id之间包含逗号或句号
        if (
          obj?.["S"]?.value?.length &&
          obj?.["E"]?.value?.length &&
          可用的空间信息字段.length>0
        ) {
          const s_idxes = (obj?.["S"]?.value??[]).map( it=>(it.idxeses??[]) ).flat(Infinity);
          const s_max = Math.max(...s_idxes);
          const s_min = Math.min(...s_idxes);

          const e_idxes = (obj?.["E"]?.value??[]).map( it=>(it.idxeses??[]) ).flat(Infinity);
          const e_max = Math.max(...e_idxes);
          const e_min = Math.min(...e_idxes);

          const p_idxes = 可用的空间信息字段.map(
            ky => (
              (obj?.[ky]?.value??[]).map( it=>(it.idxeses??[]) )
            )
          ).flat(Infinity);
          const p_max = Math.max(...p_idxes);
          const p_min = Math.min(...p_idxes);

          const fn = (aa_max, aa_min, bb_max, bb_min) => {
            const max = Math.max(aa_max, bb_max);
            const min = Math.min(aa_min, bb_min);
            // 下一行的做法不是很精确，把两端的字符也加进来了，
            // 但是因为这两端字符也不应该是标点符号，所以这种不精确的方法也就够用了。
            const text = _methods.获取两个idx之间的文本(min, max);
            // console.log(text);

            return text.search(小句分隔符正则)>=0;
          };

          const test_S_P = fn(s_max, s_min, p_max, p_min);
          const test_S_E = fn(s_max, s_min, e_max, e_min);
          const test_P_E = fn(e_max, e_min, p_max, p_min);
          if (test_S_P&&test_S_E&&test_P_E) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}]: SPE三者之间都有断句标点 严重跨标点句`
            );
          };
        };
      },


      检查单条错误_事件: (obj) => {
        const idx_txt = `${obj._id??obj.id??"_"}`;
        const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];

        for (let slot of slots) {
          const ky = slot.name;
          const slot_face = slot.nameFace??slot.name??"无名字段";
          if (ky in obj && obj?.[ky]?.value!=null && ["MB_SPANS"].includes(obj?.[ky]?.type)) {
            _checker_methods.检查任意字段(obj, slot, ky);
            const arg = obj[ky];
            const list = arg.value ?? [];

            // 检查 argS之外的字段填有并置成分
            if (ky!="argS" && list.length > 1) {
              _checker_methods.记录错误("warning",
                `[${idx_txt}].${slot_face}: 含有并置成分`
              );
            };

            // 检查 字段内为单个词，且 pos = v|d|p
            const words = _methods.获取field中的Words(obj?.[ky]);
            if (words.length==1 && ["v", "dv", "d", "p"].includes(words[0]?.pos)) {
              const word = words[0];
              _checker_methods.记录错误("warning",
                `[${idx_txt}].${slot_face}: 含词性为 ${word.pos} 的词“${word.text}”`
              );
            };

          };
        };

        // 检查 arg0, arg1, arg2 同时为空
        if (!obj?.['arg0']?.value?.length && !obj?.['arg1']?.value?.length && !obj?.['arg2']?.value?.length) {
          _checker_methods.记录错误("danger",
            `[${idx_txt}]: arg0, arg1, arg2 同时为空`
          );
        };
      },


      检查单条错误_同指: (obj) => {
        const idx_txt = `${obj._id??obj.id??"_"}`;
        const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];
        for (let slot of slots) {
          const ky = slot.name;
          const slot_face = slot.nameFace??slot.name??"无名字段";
          if (ky in obj && obj?.[ky]?.value!=null && ["MB_SPANS"].includes(obj?.[ky]?.type)) {
            _checker_methods.检查任意字段(obj, slot, ky);
          };
          const arg = obj[ky];
          const list = arg?.value ?? [];

          // 检查同指
          if (list?.length && ["R"].includes(ky)) {
            // 检查同指为不连续文本的情形
            let 结果;
            结果 = list.find(it => (it?.texts?.length??0) > 1);
            if (结果) {
              _checker_methods.记录错误("pink",
                `[${idx_txt}]: “${结果?.texts?.join?.(" ")}”为不连续文本`
              );
            };
            // 检查同指为介词开头
            结果 = list.find(it => {
              const 首位idx = it?.idxeses?.[0]?.[0];
              return ["p"].includes(_methods.idxesToPOSes([首位idx])?.[0]);
            });
            if (结果) {
              _checker_methods.记录错误("warning",
                `[${idx_txt}].${slot_face}: “${结果?.texts?.[0]}”似乎以介词开头`
              );
            };
            // 检查同指为动词结尾
            结果 = list.find(it => {
              const 末位idx = it?.idxeses?.at?.(-1)?.at?.(-1);
              return ["v"].includes(_methods.idxesToPOSes([末位idx])?.[0]);
            });
            if (结果) {
              _checker_methods.记录错误("warning",
                `[${idx_txt}].${slot_face}: “${结果?.texts?.at?.(-1)}”似乎以动词结尾`
              );
            };
          };
        };
      },


      检查单条错误_特例: (obj) => {
        const idx_txt = `${obj._id??obj.id??"_"}`;
        _checker_methods.记录错误("info", `[${idx_txt}] 特殊情况: ${obj?.Label?.value?.face??"未知情形"}`);
      },


      检查idx出现在多个字段: (obj) => {
        const idx_txt = `${obj._id??obj.id??"_"}`;
        const dict = _methods.获取obj中每个Idx的出现次数(obj);
        const pairs = Object.entries(dict);
        const 出现多次的idxes = pairs.filter(pair => pair[1]>1).map(pair => pair[0]);
        if (出现多次的idxes.length) {
          const those = 出现多次的idxes.map(idx=>`${_methods.idxesToText([idx])}(${idx})`).join(" ");
          _checker_methods.记录错误("danger",
            `[${idx_txt}]: 这些片段在多个字段中出现：${those}`
          );
        };
      },


      检查单条错误: (obj) => {
        // console.log("执行 _checker_methods.检查单条错误");
        _checker_methods.检查idx出现在多个字段(obj);
        const map = {
          'propSet_Sp': _checker_methods.检查单条错误_STEP,
          'propSet_E': _checker_methods.检查单条错误_事件,
          'propSet_S': _checker_methods.检查单条错误_同指,
          'special_Situation': _checker_methods.检查单条错误_特例,
        };
        if (obj.type in map) {
          map[obj.type](obj);
        };
      },
      检查错误: () => {
        // console.log("执行 _checker_methods.检查错误");
        _checker_data.错误清单 = [];
        _checker_methods.检查漏掉的高亮词();
        for (let obj of reactiveCMR.objects) {
          _checker_methods.检查单条错误(obj);
        };
      },
    };

    // render
    const 错误提示区 = (() => {
      // console.log("更新 错误提示区");
      return div({
        'class': [
          "--border rounded my-1 py-1 --px-2",
          {"d-none": !_checker_data.错误清单?.length},
        ],
      }, _checker_data.错误清单.map((it, idx)=>div({
        'key': idx,
        'class': [
          "d-inline-flex gap-1",
          "py-0 px-1 my-1 me-2",
          "border rounded",
          "bg-opacity-25",
          `bg-danger border-danger`,
          "fw-bold",
          // `bg-${it.style} border-${it.style}`,
          "small",
        ],
      }, [it.text])));
    });


    // render
    const 完成状态文本 = (()=>{
      // console.log("更新 完成状态文本");
      const txt = props?.annotation?.needCompletion ? (
        props?.annotation?.completed ?
          span({
            'class': [
              "d-inline-block border rounded py-0 px-1 small fw-normal text-muted",
              {"d-none": !props?.annotation?.needCompletion},
            ],
          }, "已完成的标注") :
          span({
            'class': [
              "d-inline-block border rounded py-0 px-1 small fw-bold text-primary",
              {"d-none": !props?.annotation?.needCompletion},
            ],
          }, "未完成的标注")
      ) :
      span({
        'class': [
          "d-inline-block border rounded py-0 px-1 small fw-bold text-secondary",
          {"d-none": !props?.annotation?.needCompletion},
        ],
      }, "无需检查完成与否");
      return txt;
    });

    // render
    const 文本区 = ()=>{
      // console.log("更新 文本区");
      const that = v(tokenUnits).length ? div({
        'class': ["cmr-display-text", {"d-none": !v(tokenUnits).length}],
      }, v(tokenUnits).map(
        unit=>span({
          'key': `idx-${unit.idx}`,
          'title': unit.idx,
          'class': [
            // `role-${unit.role}`,
            {"spatial": unit.spatial},
            {"annotated": unit.annotated},
            {"highlighted": unit.highlighted},
          ],
        }, unit.word)
      )) : div({
        'class': ["cmr-display-text", {"d-none": v(tokenUnits).length}],
      }, ["(语料待加载)"]);
      // // console.log("更新 文本区 应该结束了");
      return that;
    };

    // render
    const 单个标注结果元件 = (obj) => {
      // console.log("更新 单个标注结果元件");
      const that = btn({
        'class': [
          "d-flex flex-wrap gap-1 flew-row",
          "btn-sm"
        ],
        onClick: ()=>{
          if (v(ref_highlighted_obj_id)==(obj?._id??obj?.id)) {
            ref_highlighted_obj_id.value = -1;
            ref_highlighted_idxes.value = [];
          } else {
            ref_highlighted_obj_id.value = obj?._id??obj?.id;
            ref_highlighted_idxes.value = _methods.获取obj的Idxes(obj);
          };
          console.log(JSON.stringify(obj));
          console.log([_methods.获取obj的Idxes(obj), average(_methods.获取obj的Idxes(obj))]);
        },
      }, [
        span({'class': ["opacity-50 text-blue"]}, obj?._id??obj?.id),
        objectFace(obj, reactiveCMR),
      ], "light");
      return that;
    };

    const limitHeight = ref(props.limitHeight);

    // render
    const 清单模式面板 = (() => {
      // console.log("更新 清单模式面板");
      const that = reactiveCMR.objects.map((obj, idx)=>div({
        'class': "me-2 my-1 d-inline-block",
        'key': idx,
      }, [单个标注结果元件(obj)]));
      const wrap = div({
        'class': [
          "my-1 rounded",
          // {"overflow-h-10em": props.limitHeight},
          v(limitHeight) ? "overflow-h-10em px-2 py-1 border" : null,
        ],
      }, that);
      // console.log("更新 清单模式面板 应该结束了");
      return wrap;
    });



    // 排序按钮组 相关 开始
    // methods
    const onSortObjects = () => {
      reactiveCMR.sortObjectsByType();
      reactiveCMR.objects.sort(_methods.按原文顺序排序函数);
    };
    const onSortObjectsById = () => {
      reactiveCMR.sortObjectsById();
    };
    const onSortObjectsByType = () => {
      reactiveCMR.objects.sort(_methods.按原文顺序排序函数);
      reactiveCMR.sortObjectsByType();
    };
    // render
    const 排序按钮组 = (() => {
      const btns = [
        btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{onSortObjectsByType()},
        }, ["按类型排序"], "light"),
        btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{onSortObjects()},
        }, ["按原文排序"], "light"),
        btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{onSortObjectsById()},
        }, ["按创建顺序排序"], "light"),
        v(limitHeight) ? btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{limitHeight.value=false},
        }, ["展开"], "light") : btn({
          'class': "btn-sm py-0 px-1 text-muted",
          onClick: ()=>{limitHeight.value=true},
        }, ["收起"], "light"),
      ];
      return div({'class': "d-inline-flex gap-1 me-2 my-1"}, btns);
    });
    // 排序按钮组 相关 结束



    return () => {
      // console.log("渲染函数 开始");
      const that = div({'class': "cmr-display text-wrap text-break"}, [
        props?.showTips ? div({'class': ["mb-2"]}, [
          完成状态文本(),
        ]) : null,
        div({'class': ["mb-2"]}, [
          文本区(),
        ]),
        div({'class': ["my-1", {"d-none": v(ref_viewMode)!="清单模式"}]}, [
          清单模式面板(),
          div({}, 排序按钮组()),
        ]),
        props?.showTips ? div({'class': ["my-1"]}, [
          错误提示区(),
        ]) : null,
      ]);
      // console.log("渲染函数 即将 return");
      return that;
    };
  },
};

