const step = (zh, en, detailZh, detailEn) => ({ title: T(zh, en), detail: T(detailZh, detailEn) });
const PAPERS = [
  {
    id: 'self-refine',
    chapter: 'agent',
    name: 'Self-Refine',
    author: 'Madaan et al.',
    year: '2023',
    arxiv: '2303.17651',
    locator: T('图 1–2 · 算法 1', 'Figs. 1–2 · Algorithm 1'),
    title: T('在同一道题内改答案', 'Revise an answer within one task'),
    body: T(
      '以论文的代码优化任务为例，同一个语言模型先写一个解，再用另一条提示指出可改进之处。第三次调用同时看到初稿和反馈，写出新稿。循环在停止条件满足时交付当前版本。',
      'In the paper’s code-optimization task one language model writes a solution, then critiques it under a different prompt. A third call sees both the draft and feedback and produces a revision. The loop returns the current draft when its stopping rule fires.'
    ),
    evidence: T(
      '作者在七类任务上把多轮版本与同一模型的一次生成比较。生成物的质量可以在这次运行内提升。',
      'Across seven tasks the authors compare revisions with one-shot answers from the same model. That comparison tests the quality of the output produced during a run.'
    ),
    boundary: T(
      '下一道题仍调用原来的模型和提示。单次运行的改稿分数无法测出跨题学习。',
      'The next independent task starts with the same model and prompts. A revision score measures improvement within the current task.'
    ),
    fields: [
      T('对当前草稿的文字反馈', 'A critique of the current draft'),
      T('当前题的修订稿', 'The current task’s revised draft'),
      T('同一模型分三种提示调用', 'One model under three prompts'),
      T('同题初稿与修订稿', 'Initial vs revised answer on one task')
    ],
    steps: [
      step(
        '初稿',
        'Draft',
        '第一次调用得到当前版本，论文示例中是待优化的代码。',
        'The first call produces the candidate, a piece of code in the optimization example.'
      ),
      step(
        '批注',
        'Critique',
        '反馈调用指出具体问题，初稿和批注同时留在这一轮的上下文里。',
        'The feedback call identifies a concrete weakness. Both the critique and draft remain available.'
      ),
      step(
        '修订',
        'Revise',
        '修订调用读两份材料，返回一份替换草稿。',
        'The refiner reads both artifacts and returns a replacement draft.'
      ),
      step(
        '停止或再改',
        'Stop or repeat',
        '停止条件决定交付当前稿或继续批注。下一独立任务会新建上下文。',
        'The stopping rule returns this draft or requests another critique. An independent task starts a fresh context.'
      )
    ],
    handoff: T(
      '留下批注，让下一次重试读到它。Reflexion 把这个动作写进了 Agent。',
      'Keep a critique for the next trial. Reflexion builds that handoff into an agent.'
    )
  },
  {
    id: 'reflexion',
    chapter: 'memory',
    name: 'Reflexion',
    author: 'Shinn et al.',
    year: '2023',
    arxiv: '2303.11366',
    locator: T('图 2–3 · ALFWorld', 'Figs. 2–3 · ALFWorld'),
    title: T('把失败留给下一次重试', 'Leave a failed trial a note for the retry'),
    body: T(
      '在 ALFWorld 文本环境里，Actor 连续执行动作。Evaluator 判断这轮是否完成。失败时，反思模块把结果和轨迹写成一段短记忆。重置环境后，Actor 带着这段记忆再试同一项任务。',
      'In the ALFWorld text environment an actor takes a sequence of actions. An evaluator assesses the attempt. After a failure, a reflection module turns the outcome and trajectory into a short memory. The environment resets and the actor reads the note on its retry.'
    ),
    evidence: T(
      '图 3 在 134 个 ALFWorld 任务上跟踪随重试累计解决的比例。横轴上的每一步都允许再尝试一次。',
      'Figure 3 tracks the cumulative share solved across 134 ALFWorld tasks as retries are allowed. Each tick grants another attempt.'
    ),
    boundary: T(
      '这一实验测试同一任务上的记忆和重试。要检验跨任务经验，还得把记忆交给另一道题。',
      'This experiment tests memory across retries of a task. Cross-task reuse requires delivering a lesson to a different task.'
    ),
    fields: [
      T('环境结果与动作轨迹', 'Environment outcome and trajectory'),
      T('供重试读取的反思记忆', 'An episodic note for a retry'),
      T('Actor、评估与反思模块', 'Actor, evaluator and reflection module'),
      T('ALFWorld 的累计重试成功率', 'Cumulative ALFWorld success across retries')
    ],
    steps: [
      step(
        '尝试',
        'Act',
        'Actor 在环境中行动，轨迹逐步增长。',
        'The actor works in the environment and accumulates a trace.'
      ),
      step(
        '识别失败',
        'Evaluate',
        '环境完成信号或评估器给这一轮一个结果。',
        'An environment signal or evaluator assesses this attempt.'
      ),
      step(
        '写反思',
        'Write a reflection',
        '把失败轨迹和反馈压缩为一段面向下一次行动的建议。',
        'The reflector turns the trace and feedback into advice for a future action.'
      ),
      step(
        '带记忆重试',
        'Retry with memory',
        '环境回到起点，短记忆进入 Actor 的上下文。',
        'The environment resets and the note enters the actor’s context.'
      )
    ],
    handoff: T(
      '换一道题时，怎样找到值得复用的教训？',
      'Once the task changes, which lesson should the agent retrieve?'
    )
  },
  {
    id: 'reasoningbank',
    chapter: 'memory',
    name: 'ReasoningBank',
    author: 'Ouyang et al.',
    year: '2025',
    arxiv: '2509.25140',
    locator: T('图 2 · 表 1', 'Fig. 2 · Table 1'),
    title: T('从成功和失败中提取可检索的策略', 'Retrieve strategies from successes and failures'),
    body: T(
      '新任务先按语义相似度从记忆库取回策略。任务结束后，模型判断轨迹是否成功，从成功路径提炼可复用的做法，从失败路径提炼应躲开的错误。新条目回到同一个库，供后续任务检索。',
      'A new task first retrieves strategies by semantic similarity. After the run a model judges the trajectory, distills reusable practices from successes and pitfalls from failures, and stores new items in the same bank for later tasks.'
    ),
    evidence: T(
      'WebArena 上，Gemini 2.5 Flash 无记忆时成功率为 40.5%，使用 ReasoningBank 时为 48.8%。表 1 中两者的平均交互步数分别为 9.7 和 8.3。',
      'On WebArena, Gemini 2.5 Flash succeeds on 40.5% of tasks without memory and 48.8% with ReasoningBank. Mean interaction steps are 9.7 and 8.3 respectively in Table 1.'
    ),
    boundary: T(
      '写入变多和检索变好可以提高任务表现。论文另用不同采样预算研究 MaTTS，比较时要看清采样设置。',
      'A growing, more useful memory can raise task performance. The separate MaTTS experiments also vary sampling, so their compute setting matters.'
    ),
    fields: [
      T('自评成功与失败的轨迹', 'Self-judged successes and failures'),
      T('跨任务检索的策略条目', 'Retrievable cross-task strategies'),
      T('提取与检索记忆的流程', 'Memory extraction and retrieval'),
      T('同一骨干模型，有无记忆', 'Same backbone, with and without memory')
    ],
    steps: [
      step(
        '按题检索',
        'Retrieve',
        '用当前任务查询历史记忆，只把相关条目送进上下文。',
        'Use the current query to retrieve relevant items and place them in context.'
      ),
      step(
        '完成任务',
        'Run',
        'Agent 依据检索到的策略行动，并保留成功或失败的轨迹。',
        'The agent acts with the retrieved strategies and retains the resulting trace.'
      ),
      step(
        '提炼条目',
        'Distill',
        '判断轨迹结果，把可迁移的策略或失败教训写成记忆条目。',
        'Judge the outcome and distill a reusable strategy or failure lesson.'
      ),
      step(
        '下题取回',
        'Reuse',
        '把条目并入库中，下一项相关任务可以取回。',
        'Consolidate the item. A later related task can retrieve it.'
      )
    ],
    aside: {
      name: 'ACE',
      year: '2025',
      arxiv: '2510.04618',
      text: T(
        '另一个写法是把上下文当作工作手册。ACE 的 Generator 标记条目是否有用，Reflector 提炼经验，Curator 产生局部增量，由程序合并进手册。这里保留的是带编号的条目和修改。',
        'An alternative edits a playbook. ACE’s Generator marks useful entries, the Reflector extracts lessons and the Curator emits localized changes. A deterministic merge updates the numbered entries.'
      )
    },
    handoff: T(
      '如果关掉文字记忆，模型还能把经验带到下道题吗？',
      'Could the lesson survive without a text memory at all?'
    )
  },
  {
    id: 'star',
    chapter: 'weights',
    name: 'STaR',
    author: 'Zelikman et al.',
    year: '2022',
    arxiv: '2203.14465',
    locator: T('图 2 · 表 1', 'Fig. 2 · Table 1'),
    title: T('把经过筛选的理由变成训练数据', 'Turn selected rationales into training data'),
    body: T(
      '模型先为带答案的训练题生成理由和预测。预测正确的理由进入训练集。答错时，把正确答案临时作为提示，请模型重新解释。通过检查的理由移除提示后用于微调，再用更新后的模型生成下一批。',
      'The model produces a rationale and a prediction for labeled training questions. Correct predictions yield training examples. After a miss, the model gets the correct answer as a temporary hint and tries to explain it. Accepted rationales become finetuning targets without the hint. The updated model generates the next batch.'
    ),
    evidence: T(
      'CommonsenseQA 开发集上，GPT-J 直接按答案微调得到 60.0%，STaR 不做提示重生成得到 68.8%，加入这一步后得到 72.5%。',
      'On the CommonsenseQA dev set GPT-J scores 60.0% with direct answer finetuning, 68.8% with STaR without rationalization, and 72.5% with rationalization.'
    ),
    boundary: T(
      '理由通过的是答案检查。正确答案本身不足以保证理由的每一步都成立。筛选规则由研究者设定。',
      'Selection checks the final answer. An accepted rationale can still contain faulty reasoning. The selection procedure is specified by the researchers.'
    ),
    fields: [
      T('已知训练答案与模型预测', 'Known training answers and predictions'),
      T('用自生成理由微调的权重', 'Weights fit to self-generated rationales'),
      T('固定的生成、筛选与微调程序', 'A prescribed generate–filter–finetune loop'),
      T('有无提示重生成的消融', 'Rationalization ablation')
    ],
    steps: [
      step(
        '先预测',
        'Predict',
        '在没有答案提示的情况下生成理由和预测。',
        'Generate a rationale and prediction without revealing the answer.'
      ),
      step(
        '筛选或补提示',
        'Filter or give a hint',
        '正确的进入候选集。失败的训练例得到正确答案提示，再生成理由。',
        'Keep correct predictions. A failed training question gets a correct-answer hint for another rationale.'
      ),
      step(
        '移除提示训练',
        'Train without hints',
        '训练输入只保留题目，合格理由和答案成为目标。',
        'Use the question alone as input and the accepted rationale and answer as the training target.'
      ),
      step(
        '下一轮生成',
        'Generate again',
        '更新后的权重处理下一批问题，再执行同一筛选过程。',
        'The updated weights generate a new batch under the same selection procedure.'
      )
    ],
    handoff: T(
      'STaR 给定了筛选办法。能否用更新后的表现来教模型怎样写更新？',
      'Could the updated model’s performance teach it how to write a better update?'
    )
  },
  {
    id: 'seal',
    chapter: 'weights',
    name: 'SEAL',
    author: 'Zweiger et al.',
    year: '2025',
    arxiv: '2506.10943',
    locator: T('图 1、6 · 表 2', 'Figs. 1, 6 · Table 2'),
    title: T('用更新后的成绩奖励写更新的模型', 'Reward the model for the edit it writes'),
    body: T(
      '以吸收一段新知识为例。模型把段落改写成自编辑训练材料。内层用这些材料微调一份模型，再撤走原段落做问答。外层拿这份模型的成绩奖励产生材料的策略。这里需要分清哪一次训练在吸收知识，哪一次在学习怎样吸收。',
      'For knowledge incorporation, the model turns a passage into self-edit training material. An inner update fits a model on that material, then tests it on questions with the passage removed. An outer training loop rewards the policy that wrote the edit using downstream performance.'
    ),
    evidence: T(
      'Qwen2.5-7B 在单段落 LoRA 设置下，只用原段落微调得 33.5%，用基础模型额外生成材料得 39.7%，经过 SEAL 训练的自编辑得 47.0%。',
      'For Qwen2.5-7B with single-passage LoRA, no-context QA accuracy is 33.5% with the passage alone, 39.7% with base-model synthetic material, and 47.0% with SEAL self-edits.'
    ),
    boundary: T(
      '外层学到了产生自编辑的策略，微调程序仍有预先设定的部分。图 6 还显示，连续写入新段落会损伤早先知识。',
      'The outer loop learns an edit policy within a prescribed training procedure. Figure 6 also finds that sequential edits degrade retention of earlier passages.'
    ),
    fields: [
      T('自编辑后模型的下游问答成绩', 'Downstream QA after applying an edit'),
      T('内层适配权重与外层自编辑策略', 'Adapted weights and a learned edit policy'),
      T('同一模型写材料，外层奖励训练策略', 'A model writes edits and outer rewards train that policy'),
      T('未训练与已训练的自编辑、遗忘测试', 'Untrained vs learned edits and retention tests')
    ],
    steps: [
      step(
        '读段落',
        'Read a passage',
        '用一段待吸收的新文本作为自编辑的条件。',
        'Condition the self-edit on a passage to be incorporated.'
      ),
      step(
        '写材料',
        'Write a self-edit',
        '模型写出从段落推导的陈述，作为小规模微调材料。',
        'The model generates implications of the passage as finetuning material.'
      ),
      step(
        '做内层更新',
        'Apply the inner edit',
        '微调模型后撤走原文，用相关问题检验写入效果。',
        'Fit the model, remove the passage and evaluate the edit with related questions.'
      ),
      step(
        '训练编辑策略',
        'Train the edit policy',
        '将下游效果送回外层，改变以后产生自编辑的策略。',
        'Feed downstream performance to the outer loop to update how future edits are generated.'
      )
    ],
    handoff: T(
      'SEAL 改模型参数。把改动对象换成 Solver 周围的代码，会出现另一种搜索。',
      'Change the target from weights to the software around the Solver and the search takes another form.'
    )
  },
  {
    id: 'meta-harness',
    chapter: 'search',
    name: 'Meta-Harness',
    author: 'Lee et al.',
    year: '2026',
    arxiv: '2603.28052',
    locator: T('图 2 · 表 6', 'Fig. 2 · Table 6'),
    title: T('让提案者翻查每个旧版本的运行记录', 'Let the proposer open the history of every candidate'),
    body: T(
      '论文把每个候选 Harness 的源码、执行轨迹和分数存入文件系统。外层编码 Agent 可以选择读哪次失败、对照哪段实现，然后提交新代码。评测程序运行新 Harness，把结果也存回历史。',
      'Each candidate harness leaves source code, execution traces and scores in a filesystem. An outer coding agent chooses which failures and implementations to inspect, then proposes new code. Evaluation runs that harness and adds its records to the history.'
    ),
    evidence: T(
      '在 200 道 IMO 级数学题上，搜索到的同一个检索 Harness 交给五个留出的模型，相对无检索平均提高 4.7 个百分点。改动对其他 Solver 也有用。',
      'On 200 IMO-level math problems, one discovered retrieval harness improves accuracy by 4.7 percentage points on average across five held-out models versus no retrieval. The artifact transfers to other solvers.'
    ),
    boundary: T(
      '外层 Agent 的可读历史持续增长。表 6 比较的是部署后的 Harness；判断提案者自己是否学得更会改，需要单独比较提案者。',
      'The proposer’s accessible history grows. Table 6 measures the deployed harness. Isolating improvement in the proposer itself would require comparing proposers.'
    ),
    fields: [
      T('全部候选的源码、分数与轨迹', 'Prior candidate code, scores and traces'),
      T('搜索到的 Harness 代码与历史', 'Discovered harness code and search history'),
      T('外层编码 Agent', 'An outer coding agent'),
      T('一个 Harness 迁移到留出的 Solver', 'One harness transfers to held-out solvers')
    ],
    steps: [
      step(
        '打开历史',
        'Open history',
        '每个候选各有一份代码、分数和执行轨迹，提案者按需打开。',
        'Each candidate has its own code, score and traces. The proposer opens selected records.'
      ),
      step(
        '定位问题',
        'Inspect a failure',
        '沿失败轨迹回到生成这段上下文的 Harness 代码。',
        'Trace a failed run back to the harness code that assembled its context.'
      ),
      step(
        '提交新代码',
        'Propose code',
        '外层 Agent 提交一个可执行候选，例如修改数学检索策略。',
        'The outer agent proposes executable code, such as a revised math retrieval strategy.'
      ),
      step(
        '评测并归档',
        'Evaluate and file',
        '在评测任务上运行，源码、轨迹和成绩一起进入历史。',
        'Run the evaluation and file the candidate, traces and scores together.'
      )
    ],
    aside: {
      name: 'AlphaEvolve',
      year: '2025',
      arxiv: '2506.13131',
      text: T(
        '同样由评测筛选代码，产物也可能是任务算法。AlphaEvolve 找到用 48 次标量乘法完成两个 4 × 4 复矩阵相乘的算法。这个结果评测的是矩阵算法；要把它归为改进者进化，还需追踪搜索程序本身发生了什么。',
        'Evaluation can also select a task algorithm. AlphaEvolve found a procedure multiplying two 4 × 4 complex matrices in 48 scalar multiplications. This result evaluates the matrix algorithm. A claim about the searcher would require tracing changes to the search procedure.'
      )
    },
    handoff: T(
      '被找到的新代码，什么时候也有权改写下一代？',
      'When can the code you discover also rewrite the next generation?'
    )
  },
  {
    id: 'godel-machine',
    chapter: 'inherit',
    name: 'Gödel Machine',
    author: 'Schmidhuber',
    year: '2003',
    arxiv: 'cs/0309048',
    locator: T('第 2–4 节 · 切换条件', '§§2–4 · switch condition'),
    title: T('把改写自身的搜索器也放进程序', 'Put the rewrite searcher inside its own program'),
    body: T(
      '这个理论起点包含任务程序、效用目标和一个证明搜索器。搜索器寻找关于候选改写的证明，包括立刻切换比继续搜索更有益的条件。一旦证明成立，程序执行改写，搜索器本身也在可改写范围内。',
      'This theoretical design includes a task program, a utility objective and a proof searcher. It seeks a proof that switching to a candidate rewrite now has higher expected utility than continuing the search. A proved switch can rewrite the searcher itself.'
    ),
    evidence: T(
      '论文在给定公理、效用与可证明性的前提下分析切换规则。检验一个改写的依据是证明义务。',
      'The paper analyzes the switching rule under its axioms, utility and provability assumptions. The warrant for a particular rewrite is a proof obligation.'
    ),
    boundary: T(
      '有益改动能否及时找到证明，是这个设计的实际瓶颈。该理论没有给出现代语言模型的任务分数。',
      'Finding a suitable proof in time is a practical bottleneck. The theoretical result has a different evidentiary status from a measured language-model benchmark.'
    ),
    fields: [
      T('公理下的预期效用证明', 'A proof about expected utility under axioms'),
      T('已证明有益的程序改写', 'A proved self-rewrite'),
      T('程序内的证明搜索器', 'An internal proof searcher'),
      T('理论切换条件', 'A theoretical switching condition')
    ],
    steps: [
      step(
        '定义效用',
        'Specify utility',
        '初始程序描述状态、效用目标和可用公理，证明搜索器属于系统。',
        'The initial program includes the state, utility, axioms and proof searcher.'
      ),
      step(
        '搜索证明',
        'Search for a proof',
        '候选改写可以涉及任务代码，也可以涉及搜索器。',
        'The candidate can target task code or the searcher.'
      ),
      step(
        '检验切换条件',
        'Check the switch',
        '需要比较立即执行改写与继续原搜索的预期效用。',
        'The proof must compare switching now with continuing the existing search.'
      ),
      step(
        '执行改写',
        'Apply a proved rewrite',
        '证明成立才切换。时间和可证明性都会限制哪种更新实际发生。',
        'Switch only when a proof is found. Time and provability constrain which updates occur.'
      )
    ],
    handoff: T(
      '如果把证明义务换成可重复的编码评测，候选能怎样留下？',
      'Replace the proof obligation with repeatable coding evaluation. How should candidate agents survive?'
    )
  },
  {
    id: 'dgm',
    chapter: 'inherit',
    name: 'Darwin Gödel Machine',
    author: 'Zhang et al.',
    year: '2025',
    arxiv: '2505.22954',
    locator: T('图 2–3 · 附录 G', 'Figs. 2–3 · Appendix G'),
    title: T('把子代放进一棵可再次取样的树', 'Archive descendants in a tree you can sample again'),
    body: T(
      '从档案里选一个编码 Agent，让它修改自身代码，得到子代。子代在编码任务上接受测试。可继续探索的版本被加入档案，父代仍可再次被选中。论文发现的新工具与上下文管理也会随代码传给后代。',
      'Sample a coding agent from the archive and let it edit its own code to produce a child. Evaluate the child on coding tasks and archive viable variants. A previous parent remains selectable. Discovered tools and context-management routines are inherited through the agent code.'
    ),
    evidence: T(
      '在完整 Polyglot 基准上，基础 Agent 的 pass@1 为 14.2%，最佳发现版本为 30.7%。这组数是完整基准复评，与搜索时的小样本评测分开。',
      'On the full Polyglot benchmark the base agent reaches 14.2% pass@1 and the best discovered agent 30.7%. These are full-benchmark reevaluations, separate from the smaller evaluations used during search.'
    ),
    boundary: T(
      '同一编码能力同时服务于解决编程题和修改 Agent。只看子代的解题分数，难以拆出这两种能力各自的贡献。图中截取论文档案的实际节点；节点 6 与 24 提供了两种细粒度文件编辑实现。',
      'Coding skill serves both task solving and agent modification. A descendant’s task score alone does not isolate these contributions. The figure traces actual archive nodes. Nodes 6 and 24 offer two implementations of fine-grained file edits.'
    ),
    fields: [
      T('候选编码 Agent 的基准结果', 'Benchmarks of candidate coding agents'),
      T('保留父子关系的 Agent 代码档案', 'An archive of agent code and parentage'),
      T('选中的编码 Agent 修改自身代码', 'A sampled coding agent edits its code'),
      T('子代基准、冻结编辑者与档案消融', 'Descendant scores and editor/archive ablations')
    ],
    steps: [
      step(
        '抽取父代',
        'Sample a parent',
        '档案可以保存多个可用版本。选一个父代进入自修改。',
        'The archive can hold multiple viable versions. Sample a parent for self-modification.'
      ),
      step(
        '生成子代',
        'Create a child',
        '父代改写编码 Agent 的软件，例如工具或上下文管理。底层模型权重冻结。',
        'The parent edits the coding agent’s software, such as tools or context management. Foundation-model weights stay frozen.'
      ),
      step(
        '测试并归档',
        'Test and archive',
        '对子代进行编码评测，将可用版本作为新节点加入档案。',
        'Evaluate the child on coding tasks and add a viable version as a new archive node.'
      ),
      step(
        '从旧枝再出发',
        'Branch again',
        '节点 24 继续生出多个子代。图中只画出其中三个；其它版本仍在原档案中。',
        'Node 24 produces multiple descendants. Three are drawn here and other versions remain in the original archive.'
      )
    ],
    handoff: T(
      '想直接衡量“更会改”的能力，可以把改进程序本身设为输入。',
      'To measure the ability to improve more directly, make the improver program itself the input.'
    )
  },
  {
    id: 'stop',
    chapter: 'improver',
    name: 'STOP',
    author: 'Zelikman et al.',
    year: '2023',
    arxiv: '2310.02304',
    locator: T('算法 1 · 表 1', 'Algorithm 1 · Table 1'),
    title: T('把 Improver 自己作为待改的程序', 'Pass the improver its own source program'),
    body: T(
      '种子 Improver 调模型写出多个程序，用效用函数挑一个。STOP 把这个 Improver 的源码放到它自己的输入位置。给候选 Improver 打分时，要让它们去改下游程序；这样评价的是“写修改的方法”。',
      'A seed improver samples program edits from a language model and selects by utility. STOP places that improver’s own source in its input slot. To grade a candidate improver, run it on downstream programs and score what it produces. This evaluates a method for making edits.'
    ),
    evidence: T(
      '表 1 将在含噪奇偶学习任务上得到的 Improver 转移到其他任务。在 MaxCut 上，种子与所选进化版本的下游效用分别是 58.7% 和 74.2%。',
      'Table 1 transfers an improver selected on learning parity with noise to new tasks. On MaxCut, reported downstream utility is 58.7% for the seed and 74.2% for the evolved improver.'
    ),
    boundary: T(
      '这项递归发生在调用模型的搜索程序中。作者因底层语言模型权重冻结，对“完整 RSI”采用更严格的用法。',
      'Recursion here acts on the search scaffold. The authors reserve a stronger sense of full RSI because the underlying language model remains frozen.'
    ),
    fields: [
      T('候选 Improver 改出程序的效用', 'Utility of programs produced by candidate improvers'),
      T('可重复调用的新 Improver 程序', 'A reusable new improver program'),
      T('当前 Improver 以自身源码为输入', 'The current improver receives its own source'),
      T('种子与进化 Improver 的下游迁移', 'Downstream transfer of seed vs evolved improvers')
    ],
    steps: [
      step(
        '读入自身',
        'Read own source',
        '把当前 Improver 源码放入原本接收待改程序的位置。',
        'Put the current improver’s source in the slot for a target program.'
      ),
      step(
        '生成改进程序',
        'Propose improvers',
        '模型提出候选搜索程序，改变采样、迭代或候选筛选方式。',
        'The model proposes search programs that can change sampling, iteration or selection.'
      ),
      step(
        '让候选去改题',
        'Run candidates on tasks',
        '每个候选先改下游程序，评测器再计量这些产物的效用。',
        'Each candidate edits downstream programs. Their resulting utilities determine its evaluation.'
      ),
      step(
        '接替种子',
        'Reuse the winner',
        '选中的候选成为可再次调用的 Improver，也能拿去改另一类任务。',
        'The selected candidate is a reusable improver and can be tested on another task family.'
      )
    ],
    handoff: T(
      '把求解和生成修改拆成两段代码，就可以单独移植其中一段。',
      'Split solving and editing into two modules, and a transfer experiment can move either one.'
    )
  },
  {
    id: 'hyperagents',
    chapter: 'improver',
    name: 'Hyperagents',
    author: 'Zhang et al.',
    year: '2026',
    arxiv: '2603.19461',
    locator: T('第 3、5.2 节 · 迁移消融', '§§3, 5.2 · transfer ablation'),
    title: T('单独移植 Meta Agent，检验谁在迁移', 'Transplant the meta agent to test what transfers'),
    body: T(
      '一个可编辑程序中放入两个角色。Task Agent 解决目标任务，Meta Agent 能修改 Task Agent 和自身。后代继承两部分。作者把在论文评审或机器人奖励设计中进化的程序带到奥数解答评分任务，并拆开两部分做迁移。',
      'One editable program contains a task agent and a meta agent. The meta agent can modify the task agent and itself. Descendants inherit both. The authors transfer programs evolved in paper review or robotics reward design to Olympiad solution grading, then separate the modules experimentally.'
    ),
    evidence: T(
      '第 5.2 节分别迁移任务模块、元模块和组合版本。论文报告，迁移带来的收益几乎都可归因于元模块。目标任务上的改进能力由此得到更直接的检验。',
      'Section 5.2 transfers the task module, the meta module or both. The authors attribute nearly all the transfer benefit to the meta module. The experiment directly asks which part can generate useful changes in a new domain.'
    ),
    boundary: T(
      '两个角色是程序中的功能分工。这里可以编辑元模块的代码；系统是否持续加速还需要另一个长期实验。',
      'The two roles are functions within one program. Meta-level code is editable here. Continued acceleration is a separate empirical question.'
    ),
    fields: [
      T('子代任务表现与演化历史', 'Descendant task scores and evolution history'),
      T('可编辑的 Task 与 Meta 两段程序', 'Editable task and meta programs'),
      T('Meta Agent 可改两段程序', 'A meta agent able to edit either module'),
      T('单独移植 Meta 或 Task 的跨域消融', 'Cross-domain task-only and meta-only transplants')
    ],
    steps: [
      step(
        '拆开角色',
        'Separate roles',
        '同一个 Hyperagent 程序容纳 Task 与 Meta 两段代码。',
        'The hyperagent program contains separate task and meta modules.'
      ),
      step(
        '产生后代',
        'Make a descendant',
        'Meta Agent 可以改写任一部分，后代继承两份实现。',
        'The meta agent can edit either part. The descendant inherits both implementations.'
      ),
      step(
        '移植元模块',
        'Transplant the meta module',
        '把源领域进化出的 Meta 与目标领域的初始 Task 组合，另设只迁移 Task 的对照。',
        'Pair the source-domain evolved meta module with an initial target task module. A separate control transfers the task module only.'
      ),
      step(
        '测目标领域',
        'Measure transfer',
        '看哪种组合更能产生好用的奥数解答评分 Agent。',
        'Test which combination generates better agents for grading Olympiad solutions.'
      )
    ],
    handoff: T(
      '如果两个角色共用同一组权重，怎样再做这种归因？',
      'What if the two roles share one set of weights? How could we isolate their effects?'
    )
  }
];
const PAPER_CAPTIONS = {
  'self-refine': [
    T('一次批注，怎样改掉草稿里的循环？', 'Can one critique remove a loop from the draft?'),
    T('同一模型先写出逐项累加的程序。', 'The model first writes a loop that adds each term.'),
    T('它换到批评者角色，指出可以直接求和。', 'As critic, it spots a way to compute the sum directly.'),
    T(
      '初稿和批注一起进入修订，循环换成公式。',
      'Given the draft and critique, the refiner replaces the loop with a formula.'
    ),
    T('满足停止条件，交付这一题的修订稿。', 'The stopping rule returns the revision for this task.')
  ],
  reflexion: [
    T('重试同一任务时，Agent 能带走什么？', 'What can the agent carry into its next attempt?'),
    T('Actor 去放置物品，却没有先拿到它。', 'The actor tries to place an object it never picked up.'),
    T('评估器从环境结果发现这次尝试失败。', 'The evaluator detects the failed attempt.'),
    T('反思模块把遗漏的动作写进记忆。', 'The reflector records the missed action in memory.'),
    T(
      '环境重置，Actor 读回记忆，这次先取物。',
      'After reset, the actor reads the note and picks up the object first.'
    )
  ],
  reasoningbank: [
    T('旧任务的经验怎样进入一道新题？', 'How does experience reach a different task?'),
    T('从策略库取出与当前任务相关的条目。', 'Retrieve a relevant item from the strategy bank.'),
    T('执行任务，留下成功和失败两种轨迹。', 'Runs produce successful and unsuccessful trajectories.'),
    T('从两种结果提炼策略，写回库中。', 'Distill lessons from both outcomes and store them.'),
    T('下一道相关任务取出策略，再开始求解。', 'A related new task retrieves a strategy before acting.')
  ],
  star: [
    T('哪些理由能改变下一轮模型的权重？', 'Which rationales get to change the next model?'),
    T(
      '模型先在没有答案提示时生成理由与预测。',
      'The model generates a rationale and an answer without a hint.'
    ),
    T(
      '预测错误时，训练答案为重生成提供提示。',
      'A missed training answer gets a hint for another rationale.'
    ),
    T(
      '去掉提示，用原题与通过筛选的理由微调。',
      'Remove the hint. Train on the original question and accepted rationale.'
    ),
    T('更新后的模型为下一批题生成理由。', 'The updated model generates rationales for the next batch.')
  ],
  seal: [
    T('谁来学会写出更有用的自编辑？', 'Who learns to write a more useful self-edit?'),
    T('新段落交给模型，作为这次自编辑的输入。', 'A new passage becomes input to the self-editing model.'),
    T('模型写出可从段落推出的陈述。', 'The model writes implications of the passage.'),
    T(
      '这些材料更新适配权重，撤走段落再测试。',
      'Train the adapter on the edits, then test without the passage.'
    ),
    T(
      '测试结果奖励编辑策略，影响下次怎样写。',
      'The downstream result rewards the policy that writes future edits.'
    )
  ],
  'meta-harness': [
    T('提案者怎样利用旧版本的失败记录？', 'How does the proposer use a previous failure?'),
    T(
      '外部提案者打开旧候选的代码、轨迹与得分。',
      'The external proposer opens a candidate’s code, trace and score.'
    ),
    T('沿错误轨迹找到当时选入上下文的内容。', 'It inspects the context that led to the failed run.'),
    T(
      '它提交一个改变上下文选择的新 Harness。',
      'It proposes harness code with a different context selector.'
    ),
    T(
      '评测新候选，把源码、轨迹和得分一起存档。',
      'Evaluate the candidate and file its code, trace and score together.'
    )
  ],
  'godel-machine': [
    T('程序在什么条件下能重写自己的搜索器？', 'When can a program rewrite its own searcher?'),
    T(
      '程序包含公理、效用目标，以及搜寻证明的代码。',
      'The program contains axioms, a utility objective and a proof searcher.'
    ),
    T('搜索器寻找允许这次改写的证明。', 'The searcher looks for a proof that licenses a rewrite.'),
    T(
      '证明比较立即切换和继续搜索的预期效用。',
      'The proof compares the utility of switching with continued search.'
    ),
    T(
      '证明成立才切换，搜索器本身也可被改写。',
      'A proved switch installs a program that can include a new searcher.'
    )
  ],
  dgm: [
    T('改过的 Agent，怎样成为下一次改写的父代？', 'How does an edited agent become a parent?'),
    T(
      '从档案里取父代；图中编号来自论文图 3。',
      'Sample a parent. The IDs come from Figure 3 of the paper.'
    ),
    T('父代 4 产生两个独立子代，6 和 20。', 'Parent 4 produces two separate descendants, 6 and 20.'),
    T(
      '子代接受编码评测，作为可再取样的版本入档。',
      'An evaluated child enters the archive and can be sampled again.'
    ),
    T(
      '再次取样节点 24，可以看到 38、47、61 三条分支。',
      'Sampling node 24 again yields branches to 38, 47 and 61.'
    )
  ],
  stop: [
    T(
      '把改进程序自己的源码放进输入，会发生什么？',
      'What happens when the improver receives its own source?'
    ),
    T('当前 Improver 读入自身源码。', 'The current improver takes its own source code as input.'),
    T('它改写自己的搜索策略，产生几个候选 Improver。', 'It proposes several candidate improvers.'),
    T(
      '每个候选先改下游程序，再评测它的产物。',
      'Each candidate edits a downstream program. Its product is then evaluated.'
    ),
    T(
      '被选中的策略成为下一轮的 Improver，决定以后怎样改。',
      'The selected improver can make the edits in the next round.'
    )
  ],
  hyperagents: [
    T('只搬走 Meta 模块，改进能力会跟过去吗？', 'Does improvement ability travel with the meta module?'),
    T(
      '一个程序装有两块代码，Task 解题，Meta 提出改动。',
      'One program contains a task solver and a meta-level editor.'
    ),
    T(
      'Meta 可以改写任一模块，后代继承两份代码。',
      'The meta agent can edit either module. Descendants inherit both.'
    ),
    T(
      '选择源域的模块，把它装进目标域对应的位置。',
      'Transplant the selected source modules into their target-domain slots.'
    ),
    T(
      '在新领域检验这组模块能否生成更好的评分 Agent。',
      'Test whether the new combination produces better grading agents.'
    )
  ]
};
const PAPER_OPTIONS = {
  star: {
    title: T('这次预测', 'Prediction'),
    phase: 1,
    values: [
      ['miss', T('答错', 'Miss')],
      ['correct', T('答对', 'Correct')]
    ]
  },
  dgm: {
    title: T('查看编辑', 'Inspect edit'),
    phase: 2,
    values: [
      ['node6', T('节点 6', 'Node 6')],
      ['node24', T('节点 24', 'Node 24')]
    ]
  },
  hyperagents: {
    title: T('移植', 'Transplant'),
    phase: 2,
    values: [
      ['task', T('Task', 'Task')],
      ['meta', T('Meta', 'Meta')],
      ['both', T('两者', 'Both')]
    ]
  }
};
