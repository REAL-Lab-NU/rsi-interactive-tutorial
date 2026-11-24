'use strict';
function dayBeats() {
  return [
    beat(
      '读取目标',
      'Read the brief',
      '主持人请 Solver 策划社区开放日。两场活动都要办，房间、时间和优先级由它安排。',
      'The organizer asks the solver to program an open day. Both sessions must run. The solver chooses rooms and times to fit the brief.'
    ),
    beat(
      '查可用资源',
      'Inspect resources',
      '模型决定查订场表。Harness 调用场地和排班工具，把房间容量、可订时段和同一位领队的值班记录送回来。',
      'The model asks for bookings. Its harness runs the venue and roster tools and returns room limits, time slots and the shared host.'
    ),
    beat(
      '试排方案',
      'Draft a schedule',
      'Solver 把修理课放在大厅、版画课放在工坊。两个房间都有空，版画课却在修理课结束前就开始了。',
      'The solver puts Repair in the hall and Print in the studio. Both rooms are available, but Print starts before Repair ends.'
    ),
    beat(
      '检查执行条件',
      'Check feasibility',
      '排班检查发现同一位领队要同时在两处。日志保留了目标、工具返回值、方案和失败原因，供 Improver 查看。',
      'The roster check catches a double-booked host. The trace keeps the brief, tool results, proposed schedule and failed check for the improver.'
    )
  ];
}
const INTRO = [
  lesson(
    'base-agent',
    T('Agent 做任务', 'Agent at work'),
    T('给社区排一个开放日', 'Plan a community open day'),
    T(
      '两场活动、两间场地、一位领队。你给出目标，Solver 自己查资源、试排，再检查方案能否执行。',
      'Two sessions, two rooms, one host. You set the goal. The solver inspects resources, drafts a schedule and checks whether it can run.'
    ),
    dayBeats(),
    {
      visual: 'plan',
      options: [goalOption],
      note: [
        T('开放式任务', 'An open-ended task'),
        T(
          '成功需要满足硬约束，也要说明取舍。场地不可重订、领队至少需要 15 分钟换场。满足这些条件后，多留名额和多留准备时间都是合理目标。本教程的时段和容量是构造的示例，动画在本地计算排程。',
          'Success combines constraints and preferences. Rooms cannot be double-booked and the host needs at least 15 minutes for setup. Once those conditions hold, more seats and more setup time are both reasonable goals. The bookings and capacities are illustrative. The page calculates the schedules locally.'
        )
      ]
    }
  ),
  lesson(
    'harness',
    T('拆开 Harness', 'Inside the harness'),
    T('一个 Agent 里有什么？', 'What is inside an agent?'),
    T(
      'Solver 用模型选下一步。包在模型外面的运行程序叫 harness，它让这些决定能在真实任务里执行。',
      'The solver uses a model to choose its next action. The software around it, called a harness, turns those decisions into actions in a task.'
    ),
    [
      beat(
        '模型',
        'Model',
        '模型读到“策划开放日”，决定先了解有哪些房间和人手。一次模型调用只负责这一步判断。',
        'The model reads the brief and decides to inspect rooms and staff. One model call makes this decision.'
      ),
      beat(
        '指令与上下文',
        'Instructions',
        'Harness 把目标、规则和相关记录组装成模型这次能看到的上下文。改变优先级，模型收到的任务也随之变化。',
        'The harness assembles the goal, constraints and relevant records into the context for this call.'
      ),
      beat(
        '工具与观察',
        'Tools',
        '模型请求查询场地，Harness 执行调用，把容量和空闲时段作为观察放回上下文。',
        'The model requests a venue lookup. The harness executes it and returns capacity and availability as an observation.'
      ),
      beat(
        '控制与记忆',
        'Control & memory',
        'Harness 还负责重试、终止和保留记录。工具、检查规则、工作流与可复用记忆都可以被改动。',
        'The harness also handles retries, stopping and retained records. Its tools, checks, workflow and reusable memory can all be edited.'
      )
    ],
    {
      visual: 'anatomy',
      note: [
        T('用两个角色读论文', 'Two roles for reading a paper'),
        T(
          'Solver 做任务。Improver 读取运行结果并提出修改。如果 Improver 也是 Agent，它同样有 model 和 harness。两种角色可以共用模型，也可以分开部署。有些方法用固定程序承担修改或筛选工作。',
          'The solver acts on the task. The improver reads the outcome and proposes edits. An agent acting as improver also has a model and a harness. The two roles can share a model or run separately. In some methods a fixed procedure edits or selects candidates.'
        )
      ]
    }
  ),
  lesson(
    'si',
    T('SI 改 Solver', 'SI updates the solver'),
    T('把一次冲突写成可复用的规则', 'Turn a clash into a reusable rule'),
    T(
      '选择你看重的目标，也试试让大厅被临时预订。Solver 会重新查找还能实现目标的安排。',
      'Choose a priority, then try a surprise hall booking. The solver replans around the rooms and times that are still available.'
    ),
    [
      beat(
        '读运行记录',
        'Read the trace',
        '原方案让一位领队同时主持两场。Improver 从实际冲突找到需要改变的环节。',
        'The original plan double-books the host. The improver locates the missing check in the trace.'
      ),
      beat(
        '写入规则',
        'Write a check',
        'Improver 给 Solver 的 harness 加一条换场规则。共享领队的场次要留出至少 15 分钟。',
        'The improver adds a check to the solver harness. Sessions sharing the host must allow at least 15 minutes for setup.'
      ),
      beat(
        '按目标重排',
        'Replan',
        'Solver 先剔除冲突时段，再按你的目标给可用方案排序。大厅被临时预订时，它会改查工坊的空档。',
        'The solver discards clashes and ranks openings against your goal. If the hall gets booked, it looks for a remaining studio slot.'
      ),
      beat(
        '下次继续用',
        'Keep the check',
        '后续活动可以再次调用这条检查。Solver 的运行方法发生了持久变化，这一轮属于自我改进（SI）。',
        'Future events can reuse the check. The solver’s procedure has changed beyond this answer. This is self-improvement (SI).'
      )
    ],
    {
      visual: 'si',
      options: [goalOption, bookingOption],
      note: [
        T('下一轮保留了什么？', 'What survives the round?'),
        T(
          '重新排好今天的场次只改变今天的成品。把领队检查装入 Solver 的 harness，下一场活动也能调用它。这里只更新 Solver，Improver 仍沿用原先读日志、写规则的做法。',
          'Rearranging today’s sessions changes today’s artifact. Installing a host check in the solver harness gives the next event a reusable procedure. Only the solver is updated here. The improver continues to propose rules the same way.'
        )
      ]
    }
  ),
  lesson(
    'rsi',
    T('RSI 改 Improver', 'RSI updates the improver'),
    T('让写规则的人学会怎样写规则', 'Can the rule writer learn?'),
    T(
      '把排程经验带到社区音乐夜。这次共用的是音响，搬运和调试需要 45 分钟。',
      'Plan a community music night. Its shared PA kit takes 45 minutes to move and set up.'
    ),
    [
      beat(
        '比较以往改法',
        'Compare prior edits',
        '在练习活动里，Improver 对比“一律留 15 分钟”和“先查共享资源的准备时间”。两条规则在开放日都奏效，遇到准备时间更长的展台才分出差别。',
        'In practice events the improver compares a universal 15-minute rule with looking up the shared resource’s setup time. Both work for the open day. They differ at an exhibit that takes longer to prepare.'
      ),
      beat(
        '更新改进策略',
        'Update the writer',
        '试用结果更新 Improver 自己的 harness。以后先辨认共享资源，查它的约束，再写规则。',
        'Edit outcomes update the improver’s own harness. Identify the shared resource and look up its requirements before writing a rule.'
      ),
      beat(
        '给新活动写规则',
        'Write the next rule',
        '固定 Solver 和音乐夜的候选时段，切换 Improver。原写作者复用 15 分钟，新写作者查清单后给音响留出 45 分钟。',
        'Hold the solver and openings fixed. The original writer reuses 15 minutes. The updated writer checks the PA manifest and specifies 45.'
      ),
      beat(
        '试用下一份修改',
        'Test the edit',
        '排演按音响的真实耗时检验新方案。上轮修改的效果改变了这次怎样写规则，这一层反馈就是 RSI。',
        'The rehearsal tests the PA setup time. Earlier edits changed how this new rule was written. That feedback closes the RSI loop.'
      )
    ],
    {
      visual: 'rsi',
      options: [writerOption, goalOption],
      note: [
        T('怎样检验写规则的能力？', 'How do we test the writer?'),
        T(
          '固定 Solver、任务、候选时段和评估器，只更换 Improver。若优先选择最宽裕的时段，两个版本都可能通过。一个成功排程不足以证明 Improver 变强，要观察它在新约束下提出什么规则，以及这条规则的效果。这是教学模拟。',
          'Hold the solver, tasks, openings and evaluator fixed and change only the writer. With the longest-buffer preference both versions can pass. A single successful schedule does not establish a better improver. Inspect the rule proposed under a new constraint and test its effect. This is a teaching simulation.'
        )
      ]
    }
  )
];
const paperRoles = {
  'self-refine': [
    T('生成与修订答案', 'Drafts and revises'),
    T('同一模型写批注', 'Same model critiques'),
    T('本题草稿', 'Current draft')
  ],
  reflexion: [
    T('Actor 执行动作', 'Actor takes actions'),
    T('反思模块读失败', 'Reflector reads failures'),
    T('重试记忆', 'Retry memory')
  ],
  reasoningbank: [
    T('检索策略并执行', 'Retrieves and acts'),
    T('提炼成功与失败经验', 'Distills lessons'),
    T('跨任务记忆', 'Cross-task memory')
  ],
  star: [
    T('生成理由和答案', 'Generates rationales'),
    T('固定程序筛选并训练', 'Fixed filter and training'),
    T('Solver 权重', 'Solver weights')
  ],
  seal: [
    T('用编辑后的模型答题', 'Answers after fine-tuning'),
    T('模型写训练材料', 'Writes training data'),
    T('自编辑策略', 'Self-edit policy')
  ],
  'meta-harness': [
    T('用候选 Harness 解题', 'Runs a candidate harness'),
    T('外部提案者写代码', 'External code proposer'),
    T('Solver harness', 'Solver harness')
  ],
  'godel-machine': [
    T('执行任务程序', 'Runs the task program'),
    T('内置搜索器寻找证明', 'Searches for proofs'),
    T('可包含搜索器的程序', 'Program, possibly searcher')
  ],
  dgm: [
    T('编码 Agent 解题', 'Solves coding tasks'),
    T('父代编辑自身代码', 'Parent edits its code'),
    T('子代 Agent 代码', 'Descendant agent code')
  ],
  stop: [
    T('运行下游程序', 'Runs downstream programs'),
    T('用自身源码生成改法', 'Edits its own source'),
    T('Improver 程序', 'Improver program')
  ],
  hyperagents: [
    T('Task 模块求解', 'Task module solves'),
    T('Meta 模块改两者', 'Meta module edits both'),
    T('Task 或 Meta 代码', 'Task or meta code')
  ]
};
const paperLessons = PAPERS.map((s) => {
  const opt = PAPER_OPTIONS[s.id];
  return lesson(
    s.id,
    T(s.name, s.name),
    T(s.name, s.name),
    PAPER_CAPTIONS[s.id][0],
    s.steps.map((st, i) => ({ label: st.title, text: PAPER_CAPTIONS[s.id][i + 1] })),
    {
      paper: s,
      visual: 'paper',
      roles: paperRoles[s.id],
      options: opt ? [{ key: s.id, label: opt.title, values: opt.values }] : [],
      source: s.locator
    }
  );
});
const COURSE = {
  kind: 'general',
  edition: T('通用教程', 'General tutorial'),
  lessons: [...INTRO, ...paperLessons],
  groups: [
    [T('从 Agent 到 RSI', 'From agent to RSI'), INTRO.map((s) => s.id)],
    [T('论文图谱', 'Research atlas'), ['atlas']]
  ],
  defaults: {
    priority: 'capacity',
    availability: 'open',
    writer: 'learned',
    star: 'miss',
    dgm: 'node24',
    hyperagents: 'meta'
  },
  aliases: {
    cover: 'atlas',
    reader: 'base-agent',
    experiments: 'base-agent',
    agent: 'base-agent',
    loop: 'base-agent',
    parts: 'harness',
    evolution: 'reflexion',
    memory: 'reflexion',
    updates: 'star',
    weights: 'star',
    search: 'meta-harness',
    inherit: 'godel-machine',
    versions: 'dgm',
    improver: 'rsi',
    tests: 'compare',
    limits: 'compare',
    sources: 'compare'
  }
};
