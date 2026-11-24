'use strict';
const paperURL = 'https://arxiv.org/html/2611.26806v1';
const citation = (id, zh, en) => ({ url: paperURL + '#' + id, label: T(zh, en) });
const clinical = [
  lesson(
    'base-agent',
    T('Agent 与任务', 'Agent and task'),
    T('一次病历查询怎样出错？', 'Where did a chart query go wrong?'),
    T(
      '模拟任务只问过去 24 小时的平均血糖。沿着 Solver 的一次查询，看一整年的记录是在哪一步进了答案。',
      'The simulated task asks for average glucose over the last 24 hours. Follow one query to see where a full year of records entered the answer.'
    ),
    [
      beat(
        '接收任务',
        'Read the task',
        '模型看到了限定的时间范围，准备查询观察记录。Solver 是执行这项任务的角色。',
        'The model receives the requested time window and prepares a records query. The solver is the role doing the task.'
      ),
      beat(
        '发出查询',
        'Query the record',
        'Harness 提供查询接口并执行调用。这次查询取回一整年的血糖记录。',
        'The harness supplies the record-query interface and executes the call. This lookup returns a year of glucose observations.'
      ),
      beat(
        '聚合记录',
        'Aggregate',
        'Solver 在返回的记录上求平均，没有先筛出过去 24 小时。图里的点只示意时间范围。',
        'The solver averages the returned observations before filtering to 24 hours. The dots illustrate time coverage.'
      ),
      beat(
        '读到失败',
        'Read the failure',
        '评测反馈定位到时间窗。轨迹显示缺少过滤步骤，Improver 可以据此写一条可复用的技能。',
        'Outcome feedback exposes the window error. The trajectory shows where filtering was missing, giving the improver evidence for a reusable skill.'
      )
    ],
    {
      visual: 'window',
      ref: citation('A10.F13', '图 13 · 血糖时间窗', 'Figure 13 · glucose window'),
      note: [
        T('怎样读这个个案', 'How to read this case'),
        T(
          '图 13 是论文报告的模拟工作流个案。作者给出的关键差别是过去一年与过去 24 小时。动画里的观察点按示意位置绘制。',
          'Figure 13 is a simulated workflow case from the paper. The reported distinction is a year versus the last 24 hours. The observation dots are illustrative.'
        )
      ]
    }
  ),
  lesson(
    'harness',
    T('拆开 Harness', 'Inside the harness'),
    T('给模型一个能工作的环境', 'Give the model a working environment'),
    T(
      '模型选择行动。Harness 组织指令、病历上下文和可用工具，执行调用，把观察和评测记录送回。',
      'The model chooses actions. Its harness organizes instructions, chart context and tools, executes calls and returns observations and evaluation records.'
    ),
    [
      beat(
        '模型',
        'Model',
        'Solver 角色下，模型读任务并决定查询观察记录。',
        'As solver, the model reads the task and chooses an observation lookup.'
      ),
      beat(
        '指令与上下文',
        'Instructions',
        'Harness 把任务、工具说明以及这个工作流已有的技能放入模型上下文。',
        'The harness places the task, tool descriptions and any stored workflow skill into context.'
      ),
      beat(
        '工具与观察',
        'Tools',
        '模型请求查询，运行程序调用模拟病历环境，再把返回记录呈给模型。',
        'The runtime executes the requested call in the simulated records environment and returns its observations to the model.'
      ),
      beat(
        '控制与记忆',
        'Control & memory',
        '工作流记忆可以保存一条更好的技能或一个工具。下一次 Solver 执行同类任务时可以再次使用。',
        'Workflow memory can keep a better skill or tool. The solver can use it again on another task of the same workflow.'
      )
    ],
    {
      visual: 'anatomy',
      ref: citation('S2.F4', '图 4 · 技能、工具和记忆', 'Figure 4 · skills, tools and memory'),
      note: [
        T('两种语境里的 harness', 'Two uses of harness'),
        T(
          '教程用 harness 指模型周围的运行程序。论文里 H₀ 是基础条件；候选医疗 harness 增添这个工作流专用的技能或工具。即使以 H₀ 运行，Solver 也能调用环境里的基础工具。',
          'In the tutorial, harness means the software around a model. The paper uses H₀ for the base condition. A candidate medical harness adds a workflow-specific skill or tool. The solver still has its basic environment tools under H₀.'
        )
      ]
    }
  ),
  lesson(
    'si',
    T('SI 写入技能', 'SI writes a skill'),
    T('这个错误能教给下一次查询什么？', 'What can the next query learn?'),
    T(
      '同一个模型换到 Improver 角色，读工作流的运行记录，给 Solver 写一条先限制时间窗、再聚合的技能。',
      'The same model takes the improver role, reads workflow traces and writes a solver skill that filters the window before aggregation.'
    ),
    [
      beat(
        '读轨迹',
        'Read the trace',
        '任务限定 24 小时，查询结果却覆盖一年。Improver 读到这个工作流的一组尝试和结果反馈。',
        'The task requests 24 hours while the query covers a year. The improver reads a batch of workflow attempts with outcome feedback.'
      ),
      beat(
        '写候选技能',
        'Propose a skill',
        '候选技能规定先按题目所给时间范围过滤，再计算聚合值。',
        'The candidate skill calls for filtering to the requested window before computing the aggregate.'
      ),
      beat(
        '同题重跑',
        'Rerun the task',
        '使用这份 harness，Solver 在同一工作流选中最近 24 小时的记录。',
        'With that harness the solver selects the last 24 hours of records on the same workflow.'
      ),
      beat(
        '复用技能',
        'Reuse the skill',
        '图 13 中，Solver 随后报告正确的平均值。复用的是 Solver 的工作方法，这就说明了 SI 层。',
        'In Figure 13 the solver then reports the correct average. Reuse of the solver procedure illustrates the SI layer.'
      )
    ],
    {
      visual: 'filter',
      ref: citation('A10.F13', '图 13 · 同一工作流', 'Figure 13 · same workflow'),
      note: [
        T('测试时改哪里？', 'What changes at test time?'),
        T(
          '训练结束后，论文冻结权重。遇到没有存储技能的新工作流，Improver 根据该工作流的尝试写候选 harness。这个测试时个案展示了技能的效果，训练时的递归更新见下一幕。',
          'After training the paper freezes weights. For a workflow with no stored skill, the improver writes candidate harnesses from attempts on that workflow. This test-time case shows the effect of a skill. The next scene shows the recursive update during training.'
        )
      ]
    }
  ),
  lesson(
    'training',
    T('RSI 联合训练', 'RSI during training'),
    T('同一个模型怎样学会写更好的修改？', 'How does one model learn to write better edits?'),
    T(
      'MedicalRSI 在训练时把同一个模型分别当作 Solver 和 Improver。候选 harness 给固定 Solver 带来的增益，成为写作者的奖励。',
      'During training MedicalRSI calls one model as both solver and improver. Each candidate harness earns its writer the gain it gives the solver.'
    ),
    [
      beat(
        '从基础条件开始',
        'Run the baseline',
        'Solver 在 H₀ 下跑一批任务。选出的成功和失败轨迹连同结果反馈交给 Improver；写作者看不到参考答案。',
        'The solver runs a task batch under H₀. Selected successes and failures plus outcome feedback reach the improver, without reference answers.'
      ),
      beat(
        '提出候选',
        'Propose candidates',
        '共享模型切到 Improver 提示，给同一工作流写出多份候选技能或工具。每份候选装给 Solver 重跑。',
        'The shared model switches to the improver prompt and writes candidate skills or tools for the workflow. The solver reruns it with each candidate.'
      ),
      beat(
        '测配对增益',
        'Measure gain',
        '在匹配的任务上比较候选和 H₀。评分结合任务结果与过程检查，按病例类型平均，再扣除过长文本的惩罚。',
        'Compare each candidate to H₀ on matched tasks. Scoring combines outcome and process, balances case types and penalizes overly long text.'
      ),
      beat(
        '更新共享权重',
        'Update shared weights',
        'Solver 的任务奖励和 Improver 的增益奖励进入同一训练目标。下一轮，两种角色都调用更新后的模型。每个工作流另存表现更好的 harness。',
        'Task rewards and harness-gain rewards train the same weights. Both roles use the updated model next round. Workflow memory separately retains a better harness.'
      )
    ],
    {
      visual: 'training',
      ref: citation('S2.F2', '图 2 · 公式 5、7', 'Figure 2 · Eqs. 5 and 7'),
      note: [
        T('递归发生在哪里？', 'Where does recursion enter?'),
        T(
          'Solver 把候选用于下一次解题，这是第一条更新路径。候选的配对效果又训练产生候选的模型，改变下一轮如何写技能或工具。这是这篇论文中“改进改进者”的具体实现。',
          'Using a candidate on future tasks is the first update path. Its paired effect also trains the model that generates candidates, changing how that model writes future skills or tools. This is the paper’s implementation of improving the improver.'
        )
      ]
    }
  ),
  lesson(
    'fixed-solver',
    T('固定 Solver 对照', 'Fixed-solver test'),
    T('怎么知道写作者变强了？', 'How do we know the writer improved?'),
    T(
      '选定一个 Solver。三根柱用同一 Solver 运行，分别使用基础条件、GRPO Improver 写的 harness 和 MedicalRSI 写的 harness。',
      'Choose one solver. All three bars use that solver, with the base condition, a GRPO-written harness and a MedicalRSI-written harness.'
    ),
    [
      beat(
        '固定 Solver',
        'Fix the solver',
        '保持骨干和 Solver 训练状态一致。切换上方选项可以分别查看论文图 5a 的四个对照。',
        'Keep the backbone and solver training state fixed. Use the selector to inspect the four comparisons in Figure 5a.'
      ),
      beat(
        '基础条件',
        'Solver alone',
        '第一根柱是 Solver 单独运行时的任务成功率。',
        'The first bar is task success with the solver alone.'
      ),
      beat(
        '相同 Solver，换写作者',
        'Swap the writer',
        '其余两根柱只更换 harness 写作者。现在比较的是两种写作者给同一 Solver 带来的帮助。',
        'The other two bars change the harness writer. They compare how much help each writer gives the same solver.'
      ),
      beat(
        '读配对差值',
        'Read the difference',
        '配对差值取论文图中标注的原始精度。柱上成功率已取整，两者相减可能与标注差值略有不同。',
        'The paired gain uses the precision printed in the paper. The bar labels are rounded, so their displayed subtraction can differ slightly.'
      )
    ],
    {
      visual: 'controls',
      ref: citation('S3.F5', '图 5a · 同一 Solver 的四组对照', 'Figure 5a · four fixed-solver comparisons'),
      options: [
        {
          key: 'solver',
          kind: 'select',
          label: T('固定的 Solver', 'Fixed solver'),
          values: MEDICAL_CONTROLS.map((c) => [
            c.id,
            T(
              c.backbone + ' · ' + (c.role === 'base' ? '基础模型' : 'GRPO Solver'),
              c.backbone + ' · ' + (c.role === 'base' ? 'Base agent' : 'GRPO Solver')
            )
          ])
        }
      ],
      note: [
        T('实验回答的问题', 'What the control isolates'),
        T(
          '将同一 Solver 分别与两种写作者配对，直接检验写出的 harness 是否更有用。结论限于论文中这些模拟工作流、骨干与写作者对照。',
          'Pairing the same solver with two writers directly tests the usefulness of their harnesses. The comparison is specific to the simulated workflows, backbones and writers evaluated here.'
        )
      ]
    }
  ),
  lesson(
    'unseen',
    T('未见工作流', 'Unseen workflow'),
    T('换到训练时没见过的工作流', 'Try a workflow held out of training'),
    T(
      '图 9 给出一个独立的模拟工作流个案。训练已结束，权重固定，Improver 从这个工作流自己的失败里写出一份新 harness。',
      'Figure 9 follows a separate simulated workflow held out of training. Weights are frozen. The improver writes a new harness from failures on that workflow.'
    ),
    [
      beat(
        '第一次尝试',
        'First attempt',
        '基础 Solver 漏掉了时间窗和两项操作，11 项检查通过 2 项。',
        'The base solver misses the time window and two actions. It passes 2 of 11 checks.'
      ),
      beat(
        '从失败写技能',
        'Write from failures',
        'Improver 把该工作流的失败写成技能，覆盖时间范围、决策条件和后续操作。',
        'The improver writes a workflow skill covering the time window, decision rule and follow-up actions.'
      ),
      beat(
        '带技能重跑',
        'Rerun with skill',
        '同一模拟工作流重跑，论文报告的这一个案例通过了全部 11 项检查。',
        'Rerunning the simulated workflow with the skill passes all 11 checks in this reported case.'
      ),
      beat(
        '区分证据',
        'Read the evidence',
        '2/11 到 11/11 是个案检查数。上一幕的百分数衡量固定 Solver 时写作者带来的任务成功率差异。',
        '2/11 to 11/11 counts checks in one case. The previous scene’s percentages compare task success for different writers with a fixed solver.'
      )
    ],
    {
      visual: 'checks',
      ref: citation('S3.F9', '图 9 · 未见工作流个案', 'Figure 9 · held-out case'),
      note: [
        T('测试时适应', 'Test-time adaptation'),
        T(
          '训练学到提出 harness 的能力。测试时沿用这组权重，适应新工作流靠写技能或工具。论文的完整跨任务结果另见表 1。',
          'Training learns how to propose harnesses. At test time the weights are fixed and new workflows are addressed through skills or tools. Table 1 reports the broader benchmark results.'
        )
      ],
      links: [
        citation('S3.T1', '表 1 · 完整基准', 'Table 1 · full benchmark'),
        { url: 'https://github.com/REAL-Lab-NU/MedicalRSI', label: T('论文仓库', 'Paper repository') }
      ]
    }
  )
];
const COURSE = {
  kind: 'medical',
  edition: T('MedicalRSI 论文导读', 'MedicalRSI paper walkthrough'),
  lessons: clinical,
  groups: [
    [T('概念引入', 'Concepts'), clinical.slice(0, 3).map((s) => s.id)],
    [T('论文实验', 'Inside the paper'), clinical.slice(3).map((s) => s.id)]
  ],
  defaults: { solver: 'q-base' },
  aliases: {
    medicalrsi: 'training',
    rsi: 'training',
    case: 'unseen',
    fig5: 'fixed-solver',
    agent: 'base-agent'
  }
};
