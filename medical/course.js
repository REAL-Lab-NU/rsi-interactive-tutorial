'use strict';
const paperURL = 'https://arxiv.org/html/2611.26806v1';
const citation = (id, zh, en) => ({ url: paperURL + '#' + id, label: T(zh, en) });
const clinical = [
  lesson(
    'base-agent',
    T('一次病历查询', 'A chart query'),
    T('算一天的血糖，要翻多久的病历？', 'How much of the chart counts as one day?'),
    T(
      '蓝帽子叫 Solver。陪它做一道模拟病历题，先选出该用的记录，再看论文里的那次尝试。',
      'Meet the solver in the blue cap. Choose the records for a simulated chart query, then watch the attempt reported in the paper.'
    ),
    [
      beat(
        '读题',
        'Read the task',
        '题目要算过去 24 小时的平均血糖。你会把哪段时间的记录交给 Solver？',
        'The task asks for average glucose over the last 24 hours. Which records would you hand to the solver?'
      ),
      beat(
        '翻病历',
        'Open the chart',
        'Solver 请工具查病历。抽屉一打开，取出来的记录覆盖了整整一年。',
        'The solver asks a tool to search the chart. The drawer opens and a full year of observations comes back.'
      ),
      beat(
        '算平均',
        'Take the average',
        '题目要的是一天，Solver 却把整年的记录都拿去算平均。查询工具查到了数据，接下来漏了一步筛选。',
        'The tool found the records. The solver averaged the entire year and skipped the filter that would have kept only the last day.'
      ),
      beat(
        '找原因',
        'Find the slip',
        '现在知道错在哪了。下一幕打开 Solver 的工具包，看看这一步可以放在哪里。',
        'We found the missing step. Open the solver’s toolkit in the next scene to see where a reminder could live.'
      )
    ],
    {
      visual: 'window',
      ref: citation('A10.F13', '图 13 · 血糖时间窗', 'Figure 13 · glucose window'),
      options: [
        {
          key: 'window',
          kind: 'switch',
          label: T('你会取哪段记录？', 'Which records would you use?'),
          values: [
            ['day', T('过去 24 小时', 'Last 24 hours')],
            ['year', T('过去一年', 'Full year')]
          ]
        }
      ],
      note: [
        T('一次失败怎样读？', 'What happened in this attempt?'),
        T(
          '图 13 讲的是模拟工作流。作者报告，Solver 单独运行时取了一年的血糖记录求平均。题目要求最近 24 小时。你可以先选一个时间窗，再打开病历看论文报告的运行。图中的记录仅示意时间范围。',
          'Figure 13 describes a simulated workflow. The solver acting alone averaged a year of glucose records when the task required the last 24 hours. You can choose a window before opening the chart to inspect the reported run. The illustrated records represent time ranges.'
        )
      ]
    }
  ),
  lesson(
    'harness',
    T('打开工具包', 'Open the toolkit'),
    T('模型决定查病历，谁来打开抽屉？', 'The model wants a record. Who fetches it?'),
    T(
      '一个能做事的 agent 由模型和 harness 组成。点开包里的三件东西，看模型的一句话怎样变成一次查询。',
      'An agent combines a model with a harness. Open the three pieces of its toolkit to see how a request becomes a chart lookup.'
    ),
    [
      beat(
        '做决定',
        'Decide',
        '模型读题，选了一个动作：查血糖记录。包里的运行程序负责把它的请求真正执行出来。',
        'The model reads the task and chooses an action. Its harness runs the software that turns “look up glucose” into a tool call.'
      ),
      beat(
        '读指令',
        'Read instructions',
        '粉色的小纸条是指令。任务、工具说明、已有技能都会放进上下文，帮助模型决定下一步。',
        'The pink slip carries instructions. The harness places the task, tool descriptions and available skills in the model’s context.'
      ),
      beat(
        '用工具',
        'Use a tool',
        '放大镜代表病历查询工具。运行程序调用工具，再把查到的记录交还给模型。',
        'The magnifier is the record-query tool. The runtime calls it and hands its observations back to the model.'
      ),
      beat(
        '存方法',
        'Keep a skill',
        '文件夹代表工作流记忆。经过检验的技能或工具可以存进去，同类任务还会再用到。',
        'The folder is workflow memory. A tested skill or tool can live here and help with another task in the same workflow.'
      )
    ],
    {
      visual: 'anatomy',
      ref: citation('S2.F4', '图 4 · 技能、工具和记忆', 'Figure 4 · skills, tools and memory'),
      options: [
        {
          key: 'part',
          kind: 'switch',
          label: T('打开一件看看', 'Inspect a piece'),
          values: [
            ['prompt', T('指令', 'Instructions')],
            ['tool', T('工具', 'Tool')],
            ['memory', T('记忆', 'Memory')]
          ]
        }
      ],
      note: [
        T('Harness 在这篇论文里指什么？', 'What does harness mean here?'),
        T(
          '广义的 harness 是包在模型外的运行软件，管理指令、上下文、工具调用、观察和记忆。论文的基础条件 H₀ 已能使用模拟环境的基本工具。候选医疗 harness 给这个基础条件增加工作流专用技能或工具。工具包是对软件职责的插画。',
          'The wider harness is the software around the model. It manages instructions, context, tool calls, observations and memory. The paper’s base condition H₀ already has the basic environment tools. A candidate medical harness adds a workflow-specific skill or tool. The illustrated toolkit stands for these software responsibilities.'
        )
      ]
    }
  ),
  lesson(
    'si',
    T('给 Solver 写技能', 'Write a solver skill'),
    T('怎样让下一次查询记得先筛时间？', 'How can the next query remember the time filter?'),
    T(
      '同一个模型换上粉帽子，成为写技能的 Improver。跟着那张蓝色技能卡，看它回到谁的手里。',
      'The same model puts on the pink cap to write as the improver. Follow the blue skill card and see whose work it changes.'
    ),
    [
      beat(
        '读失败',
        'Read the trace',
        'Improver 读到尝试记录和结果反馈。题目要一天，实际却用了整年。',
        'The improver reads attempts and their outcome feedback. The question asked for a day and the solver used a year.'
      ),
      beat(
        '写技能',
        'Write a skill',
        '粉帽子写下一条可以复用的步骤：按题目筛出时间窗，再求平均。现在把卡交给 Solver。',
        'The pink cap writes a reusable step. Filter to the requested time window, then average. The card goes to the solver.'
      ),
      beat(
        '重跑',
        'Try it again',
        '蓝帽子用这张卡重新查询。较早的记录退出了计算，留下的是最近 24 小时的值。',
        'The blue cap reruns the query with the card. Older observations drop out, leaving only values from the last 24 hours.'
      ),
      beat(
        '带到下次',
        'Use it next time',
        '图 13 里，这次平均值算对了。把这套做法留给下一次任务，就是自我改进（Self-Improvement，SI）。',
        'Figure 13 reports the correct average this time. Giving the solver a better reusable way to work illustrates self-improvement (SI).'
      )
    ],
    {
      visual: 'filter',
      ref: citation('A10.F13', '图 13 · 带技能重跑', 'Figure 13 · rerun with a skill'),
      note: [
        T('这张卡从哪里来？', 'Where did this card come from?'),
        T(
          '图 13 的技能来自测试批次中的失败。测试时模型权重固定，改变的是 Solver 运行时拿到的技能。两顶帽子表示论文中的两种角色，它们调用同一个模型。要看怎样训练提出修改的能力，请看下一幕。',
          'In Figure 13 the skill was written from failures in the test batch. Model weights are fixed at test time. The solver receives a new skill when it runs. The two hats represent two roles calling one model. The next scene returns to training, where the ability to propose edits can change.'
        )
      ]
    }
  ),
  lesson(
    'training',
    T('训练 Improver', 'Train the improver'),
    T('写技能的那个角色，怎样也学得更好？', 'How does the skill writer get better, too?'),
    T(
      '回到训练时。让同一个 Solver 跑同一批题，换上候选技能。跟着奖励，看技能的效果最终教给了谁。',
      'Go back to training. Run the same solver on matched tasks with candidate harnesses. Follow the reward back to the model that wrote them.'
    ),
    [
      beat(
        '跑起点',
        'Get a baseline',
        '先在基础条件 H₀ 下跑一批题。Solver 把成功和失败的尝试连同反馈交给 Improver。',
        'Run a task batch with the base harness H₀. The solver passes selected successful and failed attempts, with feedback, to the improver.'
      ),
      beat(
        '写候选',
        'Write candidates',
        '同一个模型换到写作者的提示，提出几份候选技能或工具。每份候选都交回 Solver 试用。',
        'With the writer’s prompt, the shared model proposes candidate skills or tools. The solver tries each candidate.'
      ),
      beat(
        '测增益',
        'Measure the gain',
        '把候选和 H₀ 放在匹配的题目上比较。候选带来的评分变化，就是给这次修改的反馈。',
        'Compare the candidate and H₀ on matched tasks. The change in score tells us what this edit contributed.'
      ),
      beat(
        '教回模型',
        'Teach the writer',
        '两种奖励一起更新共享模型。下一轮写技能的能力也受训练，这就是递归自我改进（RSI）。',
        'Both rewards update the shared model. They train the model that will write the next edit. This is recursive self-improvement (RSI).'
      )
    ],
    {
      visual: 'training',
      ref: citation('S2.F2', '图 2 · 公式 5、7', 'Figure 2 · Eqs. 5 and 7'),
      note: [
        T('为什么能说在改进 Improver？', 'Why does this improve the improver?'),
        T(
          '同一组权重分别按 Solver 和 Improver 的提示运行。写作者读到轨迹和结果反馈，参考答案对它隐藏。每份候选对基础条件的增益进入写作者的训练奖励，评分综合任务结果、过程检查、病例类型平衡与长度惩罚。两种角色的奖励联合更新共享权重。每个工作流还维护自己的 harness 记忆。',
          'One set of weights runs with separate solver and improver prompts. The writer receives traces and outcome feedback, with reference answers hidden. Its training reward reflects each candidate’s gain over baseline. Scoring combines outcome and process, balances case types and penalizes excessive length. Both rewards train the shared weights. Each workflow also maintains its own harness memory.'
        )
      ]
    }
  ),
  lesson(
    'fixed-solver',
    T('固定 Solver 做对照', 'Keep the solver fixed'),
    T('怎么单独检验写作者的进步？', 'How can we test the writer’s contribution?'),
    T(
      '选定一位 Solver，把它固定下来。三根柱子用了同一个 Solver，可以比较不同写作者提供的 harness。',
      'Choose a solver and hold it fixed. All three bars use that solver, so you can compare what different harness writers contributed.'
    ),
    [
      beat(
        '固定 Solver',
        'Fix the solver',
        '小锁表示 Solver 保持固定。选单里的四种条件分别对应论文图 5a 的四组对照。',
        'The lock holds the solver fixed. The selector gives the four comparisons from Figure 5a.'
      ),
      beat(
        '看起点',
        'Read the baseline',
        '先读 H₀。它给出只用基础条件时，这个 Solver 做对任务的比例。',
        'Start with H₀. It gives the share of tasks solved with the base harness alone.'
      ),
      beat(
        '换写作者',
        'Swap writers',
        '蓝条和粉条使用不同写作者给出的 harness。Solver 相同，条长表示任务成功率。',
        'The blue and pink bars use harnesses from different writers. The solver is identical. Bar length shows task success.'
      ),
      beat(
        '比差值',
        'Read the gain',
        '读两位写作者相差的百分点。换一个固定 Solver，看看这项比较是否仍然成立。',
        'Read the gap between writers in percentage points. Change the fixed solver and check whether the comparison still holds.'
      )
    ],
    {
      visual: 'controls',
      ref: citation('S3.F5', '图 5a · 四组固定 Solver 对照', 'Figure 5a · four fixed-solver comparisons'),
      options: [
        {
          key: 'solver',
          kind: 'select',
          label: T('固定的 Solver', 'Fixed solver'),
          values: MEDICAL_CONTROLS.map((c) => [
            c.id,
            T(
              c.backbone + ' · ' + (c.role === 'base' ? '基础模型' : 'GRPO Solver'),
              c.backbone + ' · ' + (c.role === 'base' ? 'Base agent' : 'GRPO solver')
            )
          ])
        }
      ],
      note: [
        T('怎样读成功率和差值？', 'How do the success rates and gains relate?'),
        T(
          '三根柱子使用相同的骨干和 Solver 训练状态。后两根比较 GRPO 写作者和 MedicalRSI 写作者提供的 harness。成功率沿用论文柱上的整数，百分点差值沿用论文标出的更高精度数值。这些比较来自受测模型和模拟工作流。',
          'The bars share a backbone and solver training state. The last two compare harnesses from the GRPO and MedicalRSI writers. Success rates use the rounded bar labels in the paper. Percentage-point gains use the paper’s higher-precision annotations. The comparisons cover the tested models and simulated workflows.'
        )
      ]
    }
  ),
  lesson(
    'unseen',
    T('换个工作流', 'Try a new workflow'),
    T('第一次遇见的工作流，还能写出有用的技能吗？', 'Can the writer help on a workflow it has never seen?'),
    T(
      '训练结束了。翻到图 9 的另一个模拟个案，一起数一数带上新技能前后通过了几项检查。',
      'Training is over. Turn to a separate simulated case in Figure 9 and count the checks passed before and after a new skill.'
    ),
    [
      beat(
        '数第一次',
        'Count the first run',
        '第一次只通过 11 项中的 2 项。Solver 漏掉时间窗和两项操作。',
        'Only two of eleven checks passed on the first run. The solver missed the time window and two actions.'
      ),
      beat(
        '写新技能',
        'Write a fresh skill',
        'Improver 读这个工作流自己的失败，给 Solver 一张包含时间范围、决策条件和后续操作的技能卡。',
        'The improver reads this workflow’s own failures and writes a skill covering the time window, decision rule and follow-up actions.'
      ),
      beat(
        '再数一次',
        'Count again',
        '带技能重跑，纸上的检查标记逐个变绿。图 9 报告，这一个案例通过了全部 11 项。',
        'On the rerun, the checks turn green. Figure 9 reports that this case passed all eleven with the skill.'
      ),
      beat(
        '看改动',
        'Locate the edit',
        '测试时权重已经固定。训练教会模型怎样写技能，在这里真正改变这次执行的是一张新技能卡。',
        'Weights stay fixed at test time. Training taught the model how to write skills. Here, a newly written skill changes the run.'
      )
    ],
    {
      visual: 'checks',
      ref: citation('S3.F9', '图 9 · 未见工作流个案', 'Figure 9 · held-out case'),
      note: [
        T('例子和总体实验分别说明什么？', 'What do the case and the benchmark tell us?'),
        T(
          '这一幕是图 9 的独立模拟个案。2/11 和 11/11 计的是单个案例通过的检查。上一幕图 5a 的百分数统计多项任务的成功率。表 1 列出完整基准结果。',
          'This is the separate simulated case in Figure 9. The counts 2/11 and 11/11 are checks passed in one case. Percentages in Figure 5a measure success across tasks. Table 1 reports the benchmark results.'
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
    [T('从一道题开始', 'Start with one task'), clinical.slice(0, 3).map((s) => s.id)],
    [T('走进论文实验', 'Inside the paper'), clinical.slice(3).map((s) => s.id)]
  ],
  defaults: { solver: 'q-base', window: '', part: '' },
  aliases: {
    medicalrsi: 'training',
    rsi: 'training',
    case: 'unseen',
    fig5: 'fixed-solver',
    agent: 'base-agent'
  }
};
