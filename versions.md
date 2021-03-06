

- `22-0721-1245`
  - 1、✅ 更新审核员标注员配对名单的机制。
- `22-0721-1140`
  - 1、🐞 fix 审核页不能计算未标注的语料的时间导致无法加载的 bug。
- `22-0721-0030`
  - 1、✅ 修订的时候按表格获取标注员名单。
- `22-0720-2225`
  - 1、🐞 fix 修订模式顶部还有审核与修订按钮，可能导致套娃。
- `22-0720-2220`
  - 1、🐞 fix 审核页没有加载语料时后台报错。
- `22-0720-2150`
  - 一系列和审核相关的功能
    - 1、✅ 审核信息区域显示修订信息。
    - 2、✅ 根据修订情况和未完成情况影响审核页的排序。
    - 3、✅ 在审核模式下直接修订。
    - 4、✅ 在审核模式下修改审核意见。
- `22-0720-1510`
  - 一系列和审核相关的功能
    - 1、✅ 审核信息区域显示修订信息。
    - 2、✅ 根据修订情况和未完成情况影响审核页的排序。
- `22-0720-1125`
  - 1、✅ 可以显示具体到小条目的修改记录，且会记录操作人员。
- `22-0719-2230`
  - 1、✅ 记录具体到小条目（但不是字段）的编辑量。
- `22-0716-2105`
  - 1、🔔 左右与高亮词相邻时报警。
  - 2、🔔 含有否定义的字时报警。
  - 3、✅ 限制标注结果高度（可以手动展开或收起）。
- `22-0715-1350`
  - 1、✅ 独立的示例页面。
- `22-0715-1210`
  - 1、🐞 fix 审核页没有 warning 了。
- `22-0714-2030`
  - 1、🔔 简化示例页布局。
- `22-0714-1500`
  - 1、🔔 介词清单 = "从、由、到、至、经、通过、沿、顺着、过、向、朝、往、在、于、距离、距、离"。任何字段，如果只有一个词，其pos为p，或者其text属于上述介词清单，则报警。
- `22-0714-1445`
  - 1、🔔 修正一些检查规则。
- `22-0713-1820`
  - 1、🔔 同指关系不检查词性异同。
  - 2、✅ 原文显示词性。
- `22-0712-0315`
  - 1、🔔 完成全部检查规则（最后一条：严重跨标点句）。
- `22-0711-2345`
  - 1、🔔 增加一些检查。
- `22-0711-1420`
  - 1、🔔 增加一些检查。
- `22-0711-1140`
  - 1、🔔 增加一些检查。
- `22-0711-1105`
  - 1、🐞 fix 的字检查重复。
  - 2、🔔 空间字段中的动词检查。
- `22-0711-1026`
  - 1、🔔 事件E排除词增加。
- `22-0711-1001`
  - 1、🔔 一律红色加粗警示。
- `22-0711-0945`
  - 1、🔔 增加许多检查项目。
- `22-0711-0140`
  - 1、✅ 开放特殊情况标注。
  - 2、🔔 增加许多检查项目。
- `22-0710-1150`
  - 1、✅ 开放事件标注。
- `22-0709-____`
  - 1、🔔 参照时间不是["之前", "之后", "之时", "之间"]时，不允许出现参照事件。
- `22-0708-1640`
  - 1、✅ 示例模式隐藏操作区
- `22-0707-2255`
  - 1、🔔 非“S”字段第一个字符若为["把", "被", "将", "的"]之一，则提示。
- `22-0707-2045`
  - 1、🚧 完善查询工作量的接口（不包括 task0）
- `22-0707-1755`
  - 1、✅ Schema微调：F位置移动
- `22-0707-1615`
  - 1、✅ 优化显示效果
- `22-0707-1110`
  - 1、✅ 隐藏示例模式的审核意见
  - 2、✅ 回显默认按类型、原文顺序排序
  - 3、✅ 示例模式不会跳转到非首条语料
- `22-0706-2330`
  - 1、✅ 提供禁用新增某类标注的功能
- `22-0706-2317`
  - 1、✅ 示例模式标题栏变成蓝色
- `22-0706-2020`
  - 1、🚧 开放查看示例的按钮
- `22-0706-1935`
  - 1、🚧 完善查询工作量的接口（不包括 task0）
- `22-0706-1825`
  - 1、🚧 完善查询工作量的接口（不包括 task0）
- `22-0706-1125`
  - 1、🐞 fix 回显不及时的 bug。
- `22-0706-1040`
  - 1、🐞 fix 有时标注内容不显示的 bug。
- `22-0705-2350`
  - 1、🔔 参照时间为“之时”“之前”“之后”“之间”，必须同时有参照事件。参照时间为“之间”，需要两个参照事件（即并置字段值）。“原文时间”与“参照时间”互斥。
  - 2、🔔 “处所”字段第一个字符若为["从", "由", "经", "往", "向", "朝", "到", "至"]之一，则提示。
  - 3、🔔 “事件”字段最后一个字符若为["来", "去"]之一，则提示。
  - 4、🔔 “事件”字段第一个字符若为["把", "被", "将", "的"]之一，则提示。
  - 5、🔔 文本字段首尾若为",.，。;:；：——-=_!！?？/\\~"之一，则提示。
- `22-0705-2125`
  - 1、🚧 提供查询工作量的接口(标注、审核分开)（不包括 task0）
- `22-0704-1745`
  - 1、✅ 修改字面“精标”至“task3”
- `22-0704-0040`
  - 1、✅ 回显支持排序
- `22-0703-2156`
  - 1、🔔 事件信息没有arg系列也会有红字提示
- `22-0703-2152`
  - 1、✅ 同指关系信息回显改进
- `22-0703-1640`
  - 1、✅ 同指关系信息增加 F 字段
  - 2、🔔 事件信息没有事件E（填写的时候是“谓词来源”）的时候会有红字提示
  - 3、🔔 STEP中没有S信息或P信息时会有红字提示
  - 4、🔔 同指关系信息中成员数量少于2时会有红字提示
- `22-0703-0630`
  - 1、✅ 标注后的回显，高亮已标注部分及选中部分
  - 2、✅ 按原文排序的算法优化
- `22-0702-1615`
  - 1、🐞 解除不能保存空值的限制
- `22-0702-1500`
  - 1、🐞 删去多余的“同指关系来源”字段
- `22-0702-1115`
  - 1、✅ 为一个面板添加「保存」按钮，一键保存所有字段
  - 2、✅ 事件谓词标注方式改为选择已有的STEP作为来源
- `22-0701-1650`
  - 1、🐞 fix 同指关系显示不出来的bug
- `22-0630-1242`
  - 1、✅ 点击来自task2的参考信息后可以选中内容，方便填写
- `22-0630-0415`
  - 1、✅ 初步实现来自task2的参考信息显示
- `22-0630-0322`
  - 1、✅ 接通后端task2参考信息的接口
- `22-0628-2350`
  - 1、✅ 调整字面表述(Schema)
- `22-0628-1627`
  - 1、✅ 调整字面表述
  - 2、✅ 添加分割线
- `22-0628-1520`
  - 1、🐞 fix 无默认值的字段无法添加的bug
- `22-0628-1258`
  - 1、🐞 fix 布尔值默认值设置失败的bug
- `22-0628-1230`
  - 1、✅ 调整字面表述
- `22-0627-2300`
  - 1、✅ 鼠标移到文本片段上，会显示在文中的序号，以便区分同形片段
  - 2、✅ Schema 更新（PPl, Pa, F, T 等）
  - 3、✅ 按三种方法排序的功能
  - 4、✅ 显示标注条目的序号（从0开始计，删除内容时不会重排序号）
  - 5、🐞 fix 拷贝无效的bug
  - 6、🐞 fix 删除字段时可能显示错乱的bug
- `22-0627-0216`
  - 1、✅ 标注面板的排序（倒序）
  - 2、✅ 给字段分组（用间隔的形式）
  - 3、✅ 不常用的字段默认不列出，可手动添加；字段可删除，删除后需手动添加
  - 4、✅ 字段控件默认直接进入编辑步骤，方便填写
  - 5、✅ 新增各类标注对象可直接点击按钮，而不用在下拉框中选择类型，简化操作
  - 6、✅ 面板可以收起/展开，查看更方便；克隆和删除按钮合并到标题栏
  - 7、✅ 文字表述调整、界面简化
  - 8、⚠️ 对于字段值为空但显示出来的情况，要求标注者将其直接删除
  - 1、🚧 左边空白区域显示来自 task2 参考标注信息，并且提供方便填入标注区的一些按钮之类。
  - 2、🚧 完成标注后的回显（因为回显组件与审核页是共用的，所以如果不做的话审核页也无法查看结果），计划做两种视图（可切换），一种是和标注时一样的，一种是转换成评测需要的元组列表格式之后的。
- `22-0625-0425`
  - task3 功能完善 保存
- `22-0624-0425`
  - task3 功能完善 保存
- `22-0623-1920`
  - 分配任务页显示已选人数
  - fix 分配任务页按标签分配的逻辑
- `22-0622-1635`
  - 可以设置审核通过率统计界限
- `22-0621-2230`
  - 添加「导出用户信息」按钮
- `22-0621-2200`
  - 修改标注页排序逻辑
    - 更新前：审核通过但有修改意见的语料与其他审核通过的语料都被排列到了队列最前面，不方便查找。（标注者首先看到的并不是队列第一条，而是队列中首个审核未通过的）
    - 更新后：不论是否通过，只要有审核意见的都放一起；进页面显示第一条有审核意见或未通过的，如果没有，就显示第一条未标注的，如果还没有，就显示总的第一条。
- `22-0621-0115`
  - 筛选的部分的统计
- `22-0620-1800`
  - 新增职级显示
  - 新增版本显示
- `22-0617-2210`
  - fix 审核数值计算错误
- `22-0617-1515`
  - 显示任务批次
- `22-0617-0420`
  - 优化显示审核后的修改情况
  - 显示近期修改的数量
  - 按照最后标注时间排序
  - 按照需要复审的数量排序
- `22-0616-2256`
  - 留言板代码块高度减小
- `22-0616-1753`
  - 标注页也显示审核员姓名
  - 分配情况默认筛选全部
- `22-0614-1210`
  - 显示参与人数和完成人数
- `22-0614-1150`
  - 显示筛选人数
  - 增加按完成情况筛选
- `22-0614-1114`
  - fix 统计公式错误
- `22-0614-0528`
  - task3 保存
- `22-0613-0500`
  - task3 保存
  - 统计页更完善
  - 筛选退出人员完善
    - BUG: 如果没有刷新全部数据而只是刷新用户表，可能出现已退出的用户的标注显示不全的情况
- `22-0611-2340`
  - 审核页大幅增强筛选功能
- `22-0611-1414`
  - 审核页可以给用户添加 tag 了
- `22-0611-1345`
  - 改进 task2 完成和提示机制
- `22-0610-1537`
  - 分配任务时可以更灵活地筛选
- `22-0610-1430`
  - 分配任务时可以按名单更灵活地筛选
- `22-0610-1409`
  - 分配任务时可以按名单筛选
- `22-0610-0204`
  - task3 保存
- `22-0609-0255`
  - task3 保存
  - task2 提醒时间加长
- `22-0608-2030`
  - 左右比例 1:1
- `22-0608-1845`
  - 去除 task2 提示
- `22-0607-2222`
  - 适应单字 token
- `22-0607-2112`
  - 适应单字 token
- `22-0605-2050`
  - 图标改文字
- `22-0604-2335`
  - 修复标注 idx 异常 bug
- `22-0604-1700`
  - 去除 task2 中不适用的提示
- `22-0603-2345`
  - 标注结果回显显示 names
- `22-0603-2312`
  - task2 fix typo
  - 审核页面完善统计表述
- `22-0603-1134`
  - task2 检查 P 是否只有方位词
- `22-0602-1745`
  - 完善 task2 界面提示
- `22-0602-1046`
  - 修复 bug
- `22-0602-1035`
  - task2 检查 P E 的词性
- `22-0602-0944`
  - 更新 task2 提示
- `22-0601-1100`
  - task2 检查 P 是否为单字
  - 语料文本可按 from 字段显示信息
- `22-0530-2210`
  - 可以删除单条标注了
  - 调整 task2 提示
- `22-0530-1655`
  - fix 填好又删掉的空会造成「完成」按钮无法点击
- `22-0530-0030`
  - 文本框内 Badge 的行距
- `22-0530-0011`
  - 补充提示
- `22-0529-2339`
  - fix 无标注的时候点标注详情会出错
- `22-0529-2100`
  - task2 提醒
  - 修改标注结果显示样式
- `22-0529-1934`
  - 旧版 task2 不对非管理员显示
- `22-0527-1520`
  - 新版 task2 对语义冲突选中的文本片段数量做了针对性的检查
- `22-0526-0100`
  - 新版 task2 可设置选项最少填几个框
- `22-0525-1325`
  - 新版 task2 标注
- `22-0518-1956`
  - 修复标注不换行的问题
- `22-0518-1150`
  - 切换任务后自动刷新
- `22-0518-1100`
  - 审核通过的也可以修改
  - 复审样式改变
- `22-0515-0204`
  - 标注模块进一步模块化
- `22-0514-2320`
  - 可以选择不连续片段
- `22-0510-0031`
  - fix 分配任务时不能改变是否收回未完成的任务
- `22-0509-2304`
  - 分配任务时，不用 currTask 筛选用户了
- `22-0509-1650`
  - task2 标注完成时做一些基础检查
  - 添加 切换任务类型 按钮
- `22-0507-2152`
  - 初步实现类似去年的 task2 标注模式（有很多坑）
- `22-0507-0142`
  - 标注页编辑区组件化（add, modify, delete 等模式未测试）
  - schema 常识类表述 微调

