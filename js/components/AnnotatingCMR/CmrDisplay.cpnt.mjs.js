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


Array.prototype.last = function() {return this[this.length-1]};
const average = list => list.length ? (list.reduce(((aa, bb)=>aa+bb), 0) / list.length) : Infinity;



export default {
  props: ['annotation', 'tokens', 'definition'],
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
      获取obj的Idxes: (obj) => {
        // console.log("执行 获取obj的Idxes");
        let idxes = [];
        const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];
        const fn_map = {
          "MB_SPANS": (list)=>{return list.map(it=>it.idxeses).flat(Infinity);},
        };
        for (let slot of slots) {
          if (slot.name in obj && obj?.[slot.name]?.value!=null) {
            if (obj?.[slot.name]?.type in fn_map) {
              let new_idxes = fn_map[obj?.[slot.name]?.type](obj?.[slot.name]?.value)??[];
              idxes = [...idxes, ...new_idxes];
            };
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
      idxesToTokens: (idxes) => {
        // console.log("执行 idxesToTokens");
        idxes = idxes??[];
        let allTokens = props?.tokens ?? [];
        if (!allTokens?.length) {
          return [];
        };
        return idxes.map(idx => allTokens[idx]?.to ?? allTokens[idx] ?? {});
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
        onSortObjectsByType();
        _checker_methods.检查错误();
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
      'Pl', 'Be', 'Ed', '--Dr', 'Or',
      'PPl', 'Pa',
      'Shp',
      'Pt',
      'Ds_Vl',
    ];
    const 可以放在方向Dr开头的动词 = "上、下、进、出、回、往、起，来、去";
    const 要排除的字结尾的字段 = [
      'Pl', 'Be', 'Ed', 'Dr', 'Or',
      'PPl', 'Pa',
      'Shp',
      'Pt',
      'Ds_Vl',
      'E',
      'argS', 'argT', 'argM',
    ];
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
        // 检查着了过结尾
        if (list?.length) {
          const 结果 = list.find(it => ["着", "了", "过"].includes(it?.texts?.at?.(-1)?.at?.(-1)));
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: 以“${结果?.texts?.at?.(-1)?.at?.(-1)}”结尾，可能有误`
            );
          };
        };
        // 检查以的字结尾
        if (list?.length && 要排除的字结尾的字段.includes(ky)) {
          const 结果 = list.find(it => ["的"].includes(it?.texts?.at?.(-1)?.at?.(-1)));
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: 以“${结果?.texts?.at?.(-1)?.at?.(-1)}”结尾，可能有误`
            );
          };
        };
        // 检查首尾动词
        if (list?.length && 首尾不能是v的字段.includes(ky)) {
          let 结果;
          结果 = list.find(it => {
            const 首位idx = it?.idxeses?.[0]?.[0];
            return _methods.idxesToPOSes([首位idx])?.[0]=="v";
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.texts?.[0]}”似乎以动词开头，可能有误`
            );
          };
          结果 = list.find(it => {
            const 末位idx = it?.idxeses?.at?.(-1)?.at?.(-1);
            return _methods.idxesToPOSes([末位idx])?.[0]=="v";
          });
          if (结果) {
            _checker_methods.记录错误("warning",
              `[${idx_txt}].${slot_face}: “${结果?.texts?.at?.(-1)}”似乎以动词结尾，可能有误`
            );
          };
        };
      },


      检查单条错误_STEP: (obj) => {
        const idx_txt = `${obj._id??obj.id??"_"}`;
        const slots = reactiveCMR?.typeDict?.[obj?.type]?.slots??[];
        for (let slot of slots) {
          const ky = slot.name;
          const slot_face = slot.nameFace??slot.name??"无名字段";
          if (ky in obj && obj?.[ky]?.value!=null && ["MB_SPANS"].includes(obj?.[ky]?.type)) {
            _checker_methods.检查任意字段(obj, slot, ky);
            const arg = obj[ky];
            const list = arg.value ?? [];

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
                  `[${idx_txt}].${slot_face}: 包含排除词，可能有误`
                );
              };
            };
            // 检查首位是字典中的介词
            if (ky in 首词报警介词字典 && list?.length) {
              const 检查列表 = 首词报警介词字典[ky].split("、");
              const 结果 = list.find(it => 检查列表.includes(it?.texts?.[0]?.[0]));
              if (结果) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: 以“${结果?.texts?.[0]?.[0]}”开头，可能有误`
                );
              };
            };
            // 检查方向Dr的首位动词
            if (list?.length && ky=="Dr") {
              let 结果;
              结果 = list.find(it => {
                const 首位idx = it?.idxeses?.[0]?.[0];
                const 首位text = it?.texts?.[0]?.[0];
                return _methods.idxesToPOSes([首位idx])?.[0]=="v" && !可以放在方向Dr开头的动词.includes(首位text);
              });
              if (结果) {
                _checker_methods.记录错误("warning",
                  `[${idx_txt}].${slot_face}: “${结果?.texts?.[0]}”似乎以不合适的动词开头，可能有误`
                );
              };
            };
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
            if (ky!="argS" && list.length > 1) {
              _checker_methods.记录错误("warning",
                `[${idx_txt}].${slot_face}: 含有并置成分`
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

          // 检查同指为不连续文本的情形
          if (list?.length && ["R"].includes(ky)) {
            const 结果 = list.find(it => (it?.texts?.length??0) > 1);
            if (结果) {
              _checker_methods.记录错误("pink",
                `[${idx_txt}]: “${结果?.texts?.join?.(" ")}”为不连续文本`
              );
            };
          };
        };
      },


      检查单条错误_特例: (obj) => {
        _checker_methods.记录错误("info", `特殊情况：${obj?.Label?.value?.face??"未知情形"}`);
      },


      检查单条错误: (obj) => {
        // console.log("执行 _checker_methods.检查单条错误");
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
          "--border rounded my-2 py-1 --px-2",
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

    // render
    const 清单模式面板 = (() => {
      // console.log("更新 清单模式面板");
      const that = reactiveCMR.objects.map((obj, idx)=>div({
        'class': "me-2 my-1 d-inline-block",
        'key': idx,
      }, [单个标注结果元件(obj)]));
      // console.log("更新 清单模式面板 应该结束了");
      return that;
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
      ];
      return div({'class': "d-inline-flex gap-1 mx-2"}, btns);
    });
    // 排序按钮组 相关 结束



    return () => {
      // console.log("渲染函数 开始");
      const that = div({'class': "cmr-display text-wrap text-break"}, [
        div({'class': ["mb-2"]}, [
          完成状态文本(),
          排序按钮组(),
        ]),
        div({'class': ["mb-2"]}, [
          文本区(),
        ]),
        div({'class': ["mb-2"]}, [
          错误提示区(),
        ]),
        div({'class': ["my-1", {"d-none": v(ref_viewMode)!="清单模式"}]}, [
          清单模式面板(),
        ]),
      ]);
      // console.log("渲染函数 即将 return");
      return that;
    };
  },
};

