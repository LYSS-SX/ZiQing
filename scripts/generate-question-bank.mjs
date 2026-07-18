/**
 * Generate graded question bank + vocabulary book.
 * No artificial small caps — expands all word lists into practice items.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outQ = path.join(__dirname, '../src/renderer/src/content/questions.json')
const outV = path.join(__dirname, '../src/renderer/src/content/vocabulary.json')

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function distractors(word, pool, n = 3) {
  const others = pool.filter((w) => w !== word)
  return shuffle(others).slice(0, n)
}

// ─── Core word lists (word, zh, pos?, level) ─────────────────────────
const BASIC_A1 = [
  ['apple', '苹果', 'n', 'A1'], ['banana', '香蕉', 'n', 'A1'], ['cat', '猫', 'n', 'A1'],
  ['dog', '狗', 'n', 'A1'], ['bird', '鸟', 'n', 'A1'], ['fish', '鱼', 'n', 'A1'],
  ['sun', '太阳', 'n', 'A1'], ['moon', '月亮', 'n', 'A1'], ['star', '星星', 'n', 'A1'],
  ['water', '水', 'n', 'A1'], ['milk', '牛奶', 'n', 'A1'], ['bread', '面包', 'n', 'A1'],
  ['rice', '米饭', 'n', 'A1'], ['egg', '鸡蛋', 'n', 'A1'], ['book', '书', 'n', 'A1'],
  ['pen', '钢笔', 'n', 'A1'], ['bag', '包', 'n', 'A1'], ['desk', '书桌', 'n', 'A1'],
  ['chair', '椅子', 'n', 'A1'], ['door', '门', 'n', 'A1'], ['window', '窗户', 'n', 'A1'],
  ['car', '汽车', 'n', 'A1'], ['bus', '公共汽车', 'n', 'A1'], ['bike', '自行车', 'n', 'A1'],
  ['home', '家', 'n', 'A1'], ['school', '学校', 'n', 'A1'], ['friend', '朋友', 'n', 'A1'],
  ['family', '家庭', 'n', 'A1'], ['mom', '妈妈', 'n', 'A1'], ['dad', '爸爸', 'n', 'A1'],
  ['boy', '男孩', 'n', 'A1'], ['girl', '女孩', 'n', 'A1'], ['baby', '婴儿', 'n', 'A1'],
  ['hand', '手', 'n', 'A1'], ['eye', '眼睛', 'n', 'A1'], ['ear', '耳朵', 'n', 'A1'],
  ['nose', '鼻子', 'n', 'A1'], ['mouth', '嘴', 'n', 'A1'], ['foot', '脚', 'n', 'A1'],
  ['head', '头', 'n', 'A1'], ['hair', '头发', 'n', 'A1'], ['face', '脸', 'n', 'A1'],
  ['red', '红色的', 'adj', 'A1'], ['blue', '蓝色的', 'adj', 'A1'], ['green', '绿色的', 'adj', 'A1'],
  ['yellow', '黄色的', 'adj', 'A1'], ['black', '黑色的', 'adj', 'A1'], ['white', '白色的', 'adj', 'A1'],
  ['big', '大的', 'adj', 'A1'], ['small', '小的', 'adj', 'A1'], ['happy', '开心的', 'adj', 'A1'],
  ['sad', '伤心的', 'adj', 'A1'], ['hot', '热的', 'adj', 'A1'], ['cold', '冷的', 'adj', 'A1'],
  ['good', '好的', 'adj', 'A1'], ['bad', '坏的', 'adj', 'A1'], ['new', '新的', 'adj', 'A1'],
  ['old', '旧的/老的', 'adj', 'A1'], ['one', '一', 'num', 'A1'], ['two', '二', 'num', 'A1'],
  ['three', '三', 'num', 'A1'], ['four', '四', 'num', 'A1'], ['five', '五', 'num', 'A1'],
  ['hello', '你好', 'int', 'A1'], ['bye', '再见', 'int', 'A1'], ['yes', '是', 'adv', 'A1'],
  ['no', '不', 'adv', 'A1'], ['please', '请', 'adv', 'A1'], ['thanks', '谢谢', 'n', 'A1'],
  ['run', '跑', 'v', 'A1'], ['walk', '走', 'v', 'A1'], ['eat', '吃', 'v', 'A1'],
  ['drink', '喝', 'v', 'A1'], ['sleep', '睡觉', 'v', 'A1'], ['play', '玩', 'v', 'A1'],
  ['read', '读', 'v', 'A1'], ['write', '写', 'v', 'A1'], ['see', '看见', 'v', 'A1'],
  ['hear', '听见', 'v', 'A1'], ['go', '去', 'v', 'A1'], ['come', '来', 'v', 'A1'],
  ['sit', '坐', 'v', 'A1'], ['stand', '站', 'v', 'A1'], ['open', '打开', 'v', 'A1'],
  ['close', '关闭', 'v', 'A1'], ['love', '爱', 'v', 'A1'], ['like', '喜欢', 'v', 'A1'],
  ['want', '想要', 'v', 'A1'], ['need', '需要', 'v', 'A1'], ['have', '有', 'v', 'A1'],
  ['day', '天/白天', 'n', 'A1'], ['night', '夜晚', 'n', 'A1'], ['morning', '早上', 'n', 'A1'],
  ['afternoon', '下午', 'n', 'A1'], ['evening', '傍晚', 'n', 'A1'], ['today', '今天', 'n', 'A1'],
  ['tomorrow', '明天', 'n', 'A1'], ['yesterday', '昨天', 'n', 'A1'], ['time', '时间', 'n', 'A1'],
  ['name', '名字', 'n', 'A1'], ['number', '数字', 'n', 'A1'], ['color', '颜色', 'n', 'A1'],
  ['food', '食物', 'n', 'A1'], ['fruit', '水果', 'n', 'A1'], ['animal', '动物', 'n', 'A1'],
  ['tree', '树', 'n', 'A1'], ['flower', '花', 'n', 'A1'], ['rain', '雨', 'n', 'A1'],
  ['snow', '雪', 'n', 'A1'], ['wind', '风', 'n', 'A1'], ['ball', '球', 'n', 'A1'],
  ['game', '游戏', 'n', 'A1'], ['music', '音乐', 'n', 'A1'], ['phone', '电话', 'n', 'A1'],
  ['computer', '电脑', 'n', 'A1'], ['city', '城市', 'n', 'A1'], ['country', '国家', 'n', 'A1']
]

const BASIC_A2 = [
  ['library', '图书馆', 'n', 'A2'], ['teacher', '老师', 'n', 'A2'], ['student', '学生', 'n', 'A2'],
  ['homework', '家庭作业', 'n', 'A2'], ['breakfast', '早餐', 'n', 'A2'], ['lunch', '午餐', 'n', 'A2'],
  ['dinner', '晚餐', 'n', 'A2'], ['weather', '天气', 'n', 'A2'], ['season', '季节', 'n', 'A2'],
  ['spring', '春天', 'n', 'A2'], ['summer', '夏天', 'n', 'A2'], ['autumn', '秋天', 'n', 'A2'],
  ['winter', '冬天', 'n', 'A2'], ['beautiful', '美丽的', 'adj', 'A2'], ['important', '重要的', 'adj', 'A2'],
  ['interesting', '有趣的', 'adj', 'A2'], ['difficult', '困难的', 'adj', 'A2'], ['easy', '容易的', 'adj', 'A2'],
  ['busy', '忙碌的', 'adj', 'A2'], ['free', '空闲的/免费的', 'adj', 'A2'], ['early', '早的', 'adj', 'A2'],
  ['late', '晚的', 'adj', 'A2'], ['because', '因为', 'conj', 'A2'], ['before', '在…之前', 'prep', 'A2'],
  ['after', '在…之后', 'prep', 'A2'], ['between', '在…之间', 'prep', 'A2'], ['during', '在…期间', 'prep', 'A2'],
  ['always', '总是', 'adv', 'A2'], ['usually', '通常', 'adv', 'A2'], ['often', '经常', 'adv', 'A2'],
  ['sometimes', '有时', 'adv', 'A2'], ['never', '从不', 'adv', 'A2'], ['practice', '练习', 'v/n', 'A2'],
  ['study', '学习', 'v', 'A2'], ['learn', '学会', 'v', 'A2'], ['teach', '教', 'v', 'A2'],
  ['help', '帮助', 'v', 'A2'], ['listen', '听', 'v', 'A2'], ['speak', '说', 'v', 'A2'],
  ['talk', '谈话', 'v', 'A2'], ['ask', '问', 'v', 'A2'], ['answer', '回答', 'v/n', 'A2'],
  ['remember', '记住', 'v', 'A2'], ['forget', '忘记', 'v', 'A2'], ['think', '想/认为', 'v', 'A2'],
  ['know', '知道', 'v', 'A2'], ['understand', '理解', 'v', 'A2'], ['believe', '相信', 'v', 'A2'],
  ['decide', '决定', 'v', 'A2'], ['choose', '选择', 'v', 'A2'], ['buy', '买', 'v', 'A2'],
  ['sell', '卖', 'v', 'A2'], ['pay', '支付', 'v', 'A2'], ['cost', '花费', 'v', 'A2'],
  ['travel', '旅行', 'v', 'A2'], ['visit', '参观/拜访', 'v', 'A2'], ['arrive', '到达', 'v', 'A2'],
  ['leave', '离开', 'v', 'A2'], ['return', '返回', 'v', 'A2'], ['station', '车站', 'n', 'A2'],
  ['airport', '机场', 'n', 'A2'], ['hospital', '医院', 'n', 'A2'], ['hotel', '酒店', 'n', 'A2'],
  ['restaurant', '餐厅', 'n', 'A2'], ['market', '市场', 'n', 'A2'], ['shop', '商店', 'n', 'A2'],
  ['street', '街道', 'n', 'A2'], ['address', '地址', 'n', 'A2'], ['ticket', '票', 'n', 'A2'],
  ['money', '钱', 'n', 'A2'], ['price', '价格', 'n', 'A2'], ['job', '工作', 'n', 'A2'],
  ['work', '工作', 'v/n', 'A2'], ['office', '办公室', 'n', 'A2'], ['meeting', '会议', 'n', 'A2'],
  ['email', '电子邮件', 'n', 'A2'], ['message', '消息', 'n', 'A2'], ['photo', '照片', 'n', 'A2'],
  ['video', '视频', 'n', 'A2'], ['internet', '互联网', 'n', 'A2'], ['weekend', '周末', 'n', 'A2'],
  ['holiday', '假期', 'n', 'A2'], ['party', '聚会', 'n', 'A2'], ['hobby', '爱好', 'n', 'A2'],
  ['sport', '运动', 'n', 'A2'], ['health', '健康', 'n', 'A2'], ['doctor', '医生', 'n', 'A2'],
  ['nurse', '护士', 'n', 'A2'], ['problem', '问题', 'n', 'A2'], ['question', '问题', 'n', 'A2'],
  ['idea', '想法', 'n', 'A2'], ['plan', '计划', 'n', 'A2'], ['reason', '原因', 'n', 'A2'],
  ['result', '结果', 'n', 'A2'], ['example', '例子', 'n', 'A2'], ['sentence', '句子', 'n', 'A2'],
  ['word', '单词', 'n', 'A2'], ['language', '语言', 'n', 'A2'], ['English', '英语', 'n', 'A2'],
  ['Chinese', '中文/中国的', 'n/adj', 'A2'], ['grammar', '语法', 'n', 'A2'], ['vocabulary', '词汇', 'n', 'A2'],
  ['pronounce', '发音', 'v', 'A2'], ['conversation', '对话', 'n', 'A2'], ['carefully', '小心地', 'adv', 'A2'],
  ['environment', '环境', 'n', 'A2'], ['challenge', '挑战', 'n', 'A2'], ['future', '未来', 'n', 'A2'],
  ['past', '过去', 'n', 'A2'], ['present', '现在/礼物', 'n', 'A2'], ['experience', '经验/经历', 'n', 'A2']
]

const BASIC_B1 = [
  ['achievement', '成就', 'n', 'B1'], ['advantage', '优势', 'n', 'B1'], ['advice', '建议', 'n', 'B1'],
  ['agree', '同意', 'v', 'B1'], ['although', '虽然', 'conj', 'B1'], ['appear', '出现', 'v', 'B1'],
  ['apply', '申请/应用', 'v', 'B1'], ['argue', '争论', 'v', 'B1'], ['attention', '注意力', 'n', 'B1'],
  ['available', '可用的', 'adj', 'B1'], ['average', '平均的', 'adj', 'B1'], ['avoid', '避免', 'v', 'B1'],
  ['benefit', '益处', 'n', 'B1'], ['career', '职业', 'n', 'B1'], ['cause', '导致/原因', 'v/n', 'B1'],
  ['community', '社区', 'n', 'B1'], ['compare', '比较', 'v', 'B1'], ['complain', '抱怨', 'v', 'B1'],
  ['complete', '完成/完整的', 'v/adj', 'B1'], ['consider', '考虑', 'v', 'B1'], ['continue', '继续', 'v', 'B1'],
  ['create', '创造', 'v', 'B1'], ['culture', '文化', 'n', 'B1'], ['curious', '好奇的', 'adj', 'B1'],
  ['develop', '发展', 'v', 'B1'], ['difference', '差异', 'n', 'B1'], ['discuss', '讨论', 'v', 'B1'],
  ['education', '教育', 'n', 'B1'], ['effect', '影响/效果', 'n', 'B1'], ['effort', '努力', 'n', 'B1'],
  ['encourage', '鼓励', 'v', 'B1'], ['energy', '能量/精力', 'n', 'B1'], ['especially', '尤其', 'adv', 'B1'],
  ['expect', '期望', 'v', 'B1'], ['explain', '解释', 'v', 'B1'], ['express', '表达', 'v', 'B1'],
  ['familiar', '熟悉的', 'adj', 'B1'], ['focus', '专注', 'v', 'B1'], ['foreign', '外国的', 'adj', 'B1'],
  ['goal', '目标', 'n', 'B1'], ['improve', '提高', 'v', 'B1'], ['include', '包括', 'v', 'B1'],
  ['increase', '增加', 'v', 'B1'], ['independent', '独立的', 'adj', 'B1'], ['influence', '影响', 'n/v', 'B1'],
  ['information', '信息', 'n', 'B1'], ['instead', '代替', 'adv', 'B1'], ['interview', '面试/采访', 'n', 'B1'],
  ['introduce', '介绍', 'v', 'B1'], ['invent', '发明', 'v', 'B1'], ['issue', '问题/议题', 'n', 'B1'],
  ['knowledge', '知识', 'n', 'B1'], ['manage', '管理', 'v', 'B1'], ['measure', '测量/措施', 'v/n', 'B1'],
  ['mention', '提到', 'v', 'B1'], ['method', '方法', 'n', 'B1'], ['opportunity', '机会', 'n', 'B1'],
  ['opinion', '观点', 'n', 'B1'], ['organize', '组织', 'v', 'B1'], ['patient', '有耐心的/病人', 'adj/n', 'B1'],
  ['perform', '表演/表现', 'v', 'B1'], ['prefer', '更喜欢', 'v', 'B1'], ['prepare', '准备', 'v', 'B1'],
  ['prevent', '防止', 'v', 'B1'], ['product', '产品', 'n', 'B1'], ['progress', '进步', 'n', 'B1'],
  ['protect', '保护', 'v', 'B1'], ['provide', '提供', 'v', 'B1'], ['purpose', '目的', 'n', 'B1'],
  ['quality', '质量', 'n', 'B1'], ['realize', '意识到', 'v', 'B1'], ['receive', '收到', 'v', 'B1'],
  ['recommend', '推荐', 'v', 'B1'], ['reduce', '减少', 'v', 'B1'], ['relate', '相关', 'v', 'B1'],
  ['// remove invalid', '', '', ''], // placeholder removed below
  ['require', '需要', 'v', 'B1'], ['research', '研究', 'n/v', 'B1'], ['respect', '尊重', 'n/v', 'B1'],
  ['responsible', '负责的', 'adj', 'B1'], ['result', '结果', 'n', 'B1'], ['science', '科学', 'n', 'B1'],
  ['society', '社会', 'n', 'B1'], ['solution', '解决方案', 'n', 'B1'], ['succeed', '成功', 'v', 'B1'],
  ['suggest', '建议', 'v', 'B1'], ['support', '支持', 'v/n', 'B1'], ['system', '系统', 'n', 'B1'],
  ['technology', '科技', 'n', 'B1'], ['therefore', '因此', 'adv', 'B1'], ['traditional', '传统的', 'adj', 'B1'],
  ['training', '训练', 'n', 'B1'], ['value', '价值', 'n', 'B1'], ['various', '各种各样的', 'adj', 'B1']
].filter((x) => x[0] && !x[0].startsWith('//'))

const BASIC_B2 = [
  ['academic', '学术的', 'adj', 'B2'], ['accurate', '准确的', 'adj', 'B2'], ['analyze', '分析', 'v', 'B2'],
  ['approach', '方法/接近', 'n/v', 'B2'], ['appropriate', '合适的', 'adj', 'B2'], ['approximately', '大约', 'adv', 'B2'],
  ['assess', '评估', 'v', 'B2'], ['assume', '假定', 'v', 'B2'], ['attitude', '态度', 'n', 'B2'],
  ['authority', '权威', 'n', 'B2'], ['aware', '意识到的', 'adj', 'B2'], ['capability', '能力', 'n', 'B2'],
  ['circumstance', '情况', 'n', 'B2'], ['coherent', '连贯的', 'adj', 'B2'], ['complex', '复杂的', 'adj', 'B2'],
  ['component', '组成部分', 'n', 'B2'], ['concept', '概念', 'n', 'B2'], ['conclude', '得出结论', 'v', 'B2'],
  ['conduct', '进行/行为', 'v/n', 'B2'], ['consequence', '后果', 'n', 'B2'], ['consistent', '一致的', 'adj', 'B2'],
  ['context', '语境/背景', 'n', 'B2'], ['contrast', '对比', 'n/v', 'B2'], ['contribute', '贡献', 'v', 'B2'],
  ['controversy', '争议', 'n', 'B2'], ['convince', '说服', 'v', 'B2'], ['criteria', '标准', 'n', 'B2'],
  ['critical', '关键的/批判的', 'adj', 'B2'], ['debate', '辩论', 'n/v', 'B2'], ['demonstrate', '证明/演示', 'v', 'B2'],
  ['derive', '源自', 'v', 'B2'], ['despite', '尽管', 'prep', 'B2'], ['distinct', '明显不同的', 'adj', 'B2'],
  ['distribute', '分配', 'v', 'B2'], ['diverse', '多样的', 'adj', 'B2'], ['economy', '经济', 'n', 'B2'],
  ['efficient', '高效的', 'adj', 'B2'], ['eliminate', '消除', 'v', 'B2'], ['emerge', '出现', 'v', 'B2'],
  ['emphasize', '强调', 'v', 'B2'], ['enable', '使能够', 'v', 'B2'], ['enhance', '增强', 'v', 'B2'],
  ['ensure', '确保', 'v', 'B2'], ['establish', '建立', 'v', 'B2'], ['evaluate', '评价', 'v', 'B2'],
  ['evidence', '证据', 'n', 'B2'], ['expand', '扩展', 'v', 'B2'], ['expose', '使暴露', 'v', 'B2'],
  ['factor', '因素', 'n', 'B2'], ['feature', '特征', 'n', 'B2'], ['framework', '框架', 'n', 'B2'],
  ['function', '功能', 'n', 'B2'], ['generate', '产生', 'v', 'B2'], ['global', '全球的', 'adj', 'B2'],
  ['hypothesis', '假设', 'n', 'B2'], ['identify', '识别', 'v', 'B2'], ['illustrate', '说明', 'v', 'B2'],
  ['impact', '影响', 'n', 'B2'], ['implement', '实施', 'v', 'B2'], ['imply', '暗示', 'v', 'B2'],
  ['indicate', '表明', 'v', 'B2'], ['individual', '个人/个体的', 'n/adj', 'B2'], ['innovation', '创新', 'n', 'B2'],
  ['integrate', '整合', 'v', 'B2'], ['interpret', '解释', 'v', 'B2'], ['invest', '投资', 'v', 'B2'],
  ['involve', '涉及', 'v', 'B2'], ['justify', '证明…正当', 'v', 'B2'], ['maintain', '维持', 'v', 'B2'],
  ['major', '主要的', 'adj', 'B2'], ['mechanism', '机制', 'n', 'B2'], ['motivate', '激励', 'v', 'B2'],
  ['obtain', '获得', 'v', 'B2'], ['outcome', '结果', 'n', 'B2'], ['overall', '总体的', 'adj', 'B2'],
  ['perspective', '视角', 'n', 'B2'], ['phenomenon', '现象', 'n', 'B2'], ['policy', '政策', 'n', 'B2'],
  ['potential', '潜在的/潜力', 'adj/n', 'B2'], ['previous', '先前的', 'adj', 'B2'], ['principle', '原则', 'n', 'B2'],
  ['procedure', '程序', 'n', 'B2'], ['process', '过程', 'n', 'B2'], ['promote', '促进', 'v', 'B2'],
  ['propose', '提议', 'v', 'B2'], ['range', '范围', 'n', 'B2'], ['relevant', '相关的', 'adj', 'B2'],
  ['rely', '依赖', 'v', 'B2'], ['significant', '显著的', 'adj', 'B2'], ['source', '来源', 'n', 'B2'],
  ['specific', '具体的', 'adj', 'B2'], ['strategy', '策略', 'n', 'B2'], ['structure', '结构', 'n', 'B2'],
  ['theory', '理论', 'n', 'B2'], ['transfer', '转移', 'v', 'B2'], ['trend', '趋势', 'n', 'B2'],
  ['valid', '有效的', 'adj', 'B2'], ['vary', '变化', 'v', 'B2']
]

const ALL_WORDS = [...BASIC_A1, ...BASIC_A2, ...BASIC_B1, ...BASIC_B2]
const wordPool = ALL_WORDS.map((w) => w[0])

const dialogues = [
  { prompt: 'How are you today?', promptZh: '朋友问：你今天好吗？你应选：', answer: "I'm fine, thank you.", answerZh: '我很好，谢谢。', wrong: ['I am 12 years old.', 'It is a pen.', 'Goodbye forever.'] },
  { prompt: 'What would you like?', promptZh: '服务员问：您想要点什么？', answer: "I'd like a latte, please.", answerZh: '我想要一杯拿铁，谢谢。', wrong: ['I live in Beijing.', 'My name is Tom.', 'See you tomorrow.'] },
  { prompt: 'Where is the subway?', promptZh: '有人问路：地铁在哪里？合适回答：', answer: 'Go straight and turn left.', answerZh: '直走然后左转。', wrong: ['I like apples.', 'It is Monday.', 'Open your book.'] },
  { prompt: 'May I speak to Anna?', promptZh: '电话：我可以和 Anna 通话吗？', answer: 'Speaking. This is Anna.', answerZh: '我就是，我是 Anna。', wrong: ['I am a student.', 'Nice to meet you.', 'How much is it?'] },
  { prompt: "You're late.", promptZh: '你迟到了，道歉可以说：', answer: "Sorry I'm late. There was traffic.", answerZh: '抱歉我迟到了，路上堵车。', wrong: ['I hate this class.', 'Give me money.', 'Who are you?'] },
  { prompt: 'Anything else?', promptZh: '还需要别的吗？', answer: "No, that's all. Thanks.", answerZh: '不用了，就这些，谢谢。', wrong: ['I am tall.', 'Close the door.', 'What is your job?'] },
  { prompt: 'Do you want to watch a movie?', promptZh: '要不要一起看电影？（委婉拒绝）', answer: "I'd love to, but I have homework.", answerZh: '很想去，但我有作业。', wrong: ['You are wrong.', 'I never sleep.', 'Buy me a car.'] },
  { prompt: 'Can I try this on?', promptZh: '我能试穿吗？店员应说：', answer: 'Sure, the fitting room is over there.', answerZh: '当然，试衣间在那边。', wrong: ['I am hungry.', 'It is raining.', 'Call the police.'] },
  { prompt: 'May I come in?', promptZh: '迟到进教室应对老师说：', answer: 'May I come in?', answerZh: '我可以进来吗？', wrong: ['Where is my money?', 'I quit.', 'Turn off the light.'] },
  { prompt: 'Thank you for your help.', promptZh: '感谢帮助后，对方说 You are welcome. 你可回应：', answer: 'Have a nice day!', answerZh: '祝你今天愉快！', wrong: ['I am a banana.', 'Stop talking.', 'Give me five.'] },
  { prompt: 'What time is it?', promptZh: '现在几点？', answer: "It's three o'clock.", answerZh: '三点整。', wrong: ['I am a chair.', 'Close your eyes.', 'Blue is color.'] },
  { prompt: 'How much is this?', promptZh: '这个多少钱？', answer: "It's ten dollars.", answerZh: '十美元。', wrong: ['I am fine.', 'See you.', 'Open it.'] },
  { prompt: 'Where do you live?', promptZh: '你住在哪里？', answer: 'I live near the park.', answerZh: '我住在公园附近。', wrong: ['I am apple.', 'No idea forever.', 'Close window.'] },
  { prompt: 'Can you help me?', promptZh: '你能帮我吗？', answer: 'Of course, what do you need?', answerZh: '当然，你需要什么？', wrong: ['Go away now.', 'I never help.', 'Buy milk only.'] },
  { prompt: 'Nice to meet you.', promptZh: '很高兴认识你。', answer: 'Nice to meet you too.', answerZh: '我也很高兴认识你。', wrong: ['I am angry.', 'No meeting.', 'Stop hello.'] },
  { prompt: 'Could you repeat that?', promptZh: '你能再说一遍吗？', answer: 'Sure. I said the meeting is at five.', answerZh: '当然。我说会议在五点。', wrong: ['Never repeat.', 'I forget words.', 'Silent only.'] },
  { prompt: 'Are you free tonight?', promptZh: '今晚有空吗？', answer: 'Sorry, I am busy tonight.', answerZh: '抱歉，我今晚很忙。', wrong: ['I am a desk.', 'Open the box.', 'Count to three.'] },
  { prompt: 'What is your favorite food?', promptZh: '你最喜欢的食物是什么？', answer: 'I like noodles.', answerZh: '我喜欢面条。', wrong: ['I am blue.', 'No food ever.', 'Close shop.'] },
  { prompt: 'Have a good weekend!', promptZh: '周末愉快！', answer: 'You too!', answerZh: '你也是！', wrong: ['Never weekend.', 'I am sad only.', 'Stop happy.'] },
  { prompt: 'How was your day?', promptZh: '你今天过得怎么样？', answer: 'It was pretty good, thanks.', answerZh: '挺不错的，谢谢。', wrong: ['I am a train.', 'No day.', 'Delete all.'] }
]

const topics = [
  { mapId: 'campusport', tier: 3, prompt: 'Introduce your major or school in English.', promptZh: '用英语简单介绍你的专业/学校。', keywords: ['student', 'study', 'school', 'like', 'learn'], sample: 'I am a student. I study English at school and I like learning new words.', sampleZh: '我是学生。我在学校学英语，喜欢学新单词。' },
  { mapId: 'campusport', tier: 3, prompt: 'Describe your ideal day briefly.', promptZh: '简短描述你理想的一天。', keywords: ['morning', 'friend', 'happy', 'day'], sample: 'In the morning I read books. After class I meet friends. I feel happy.', sampleZh: '早上我读书，课后见朋友，感觉很开心。' },
  { mapId: 'campusport', tier: 3, prompt: 'Invite a classmate to study together.', promptZh: '邀请同学一起自习，说出邀请句。', keywords: ['study', 'together', 'library', 'free'], sample: 'Are you free this afternoon? Shall we study together in the library?', sampleZh: '你下午有空吗？我们一起去图书馆自习好吗？' },
  { mapId: 'campusport', tier: 3, prompt: 'Talk about the weather and your mood.', promptZh: '谈论天气与心情。', keywords: ['weather', 'sunny', 'feel', 'today'], sample: 'Today the weather is sunny and warm. I feel energetic.', sampleZh: '今天天气晴朗温暖，我感到精力充沛。' },
  { mapId: 'campusport', tier: 3, prompt: 'Introduce a hobby you like.', promptZh: '介绍一个你喜欢的爱好。', keywords: ['hobby', 'like', 'because', 'interesting'], sample: 'My hobby is reading because it is interesting and relaxing.', sampleZh: '我的爱好是阅读，因为它有趣又放松。' },
  { mapId: 'examfront', tier: 4, prompt: 'Describe a skill you want to learn and why.', promptZh: '描述一项你想学的技能及原因。', keywords: ['skill', 'learn', 'because', 'practice'], sample: 'I want to learn public speaking because it is helpful for my future career.', sampleZh: '我想学演讲，因为它对未来职业有帮助。' },
  { mapId: 'examfront', tier: 4, prompt: 'Do you prefer online or classroom learning? Why?', promptZh: '你更喜欢线上学习还是课堂学习？为什么？', keywords: ['prefer', 'online', 'classroom', 'because'], sample: 'I prefer classroom learning because I can interact with teachers and classmates.', sampleZh: '我更喜欢课堂教学，因为可以和老师同学互动。' },
  { mapId: 'examfront', tier: 4, prompt: 'Talk about a memorable trip.', promptZh: '谈谈一次难忘的旅行。', keywords: ['trip', 'went', 'enjoyed', 'because'], sample: 'Last summer I went to the mountains with my family. I enjoyed the beautiful views.', sampleZh: '去年夏天我和家人去了山里，很享受美景。' },
  { mapId: 'examfront', tier: 4, prompt: 'What makes a good friend?', promptZh: '好朋友应具备什么品质？', keywords: ['friend', 'honest', 'kind', 'support'], sample: 'A good friend is honest and kind. They support you when you need help.', sampleZh: '好朋友诚实善良，在你需要时支持你。' },
  { mapId: 'examfront', tier: 4, prompt: 'How do you manage stress before exams?', promptZh: '考试前你如何缓解压力？', keywords: ['stress', 'exam', 'relax', 'plan'], sample: 'I make a study plan, exercise, and sleep well.', sampleZh: '我会制定学习计划，锻炼并保证睡眠。' },
  { mapId: 'toeflcity', tier: 5, prompt: 'Prefer team work or working alone? Why?', promptZh: '你更喜欢团队合作还是独自工作？为什么？', keywords: ['prefer', 'team', 'alone', 'because'], sample: 'I prefer working in teams because we can share ideas and finish complex tasks more efficiently.', sampleZh: '我更喜欢团队合作，因为可以分享想法并更高效完成复杂任务。' },
  { mapId: 'toeflcity', tier: 5, prompt: 'Should students have part-time jobs? Explain.', promptZh: '学生应不应该做兼职？请说明。', keywords: ['students', 'job', 'experience', 'balance'], sample: 'I agree students can have part-time jobs if they balance study and work.', sampleZh: '我同意学生可以兼职，但要平衡学习与工作。' },
  { mapId: 'toeflcity', tier: 5, prompt: 'Describe a community problem and a solution.', promptZh: '描述一个社区问题及可能的解决方案。', keywords: ['problem', 'community', 'solution', 'improve'], sample: 'Traffic congestion is a problem. The city should improve public transport.', sampleZh: '交通拥堵是个问题。城市应改善公共交通。' },
  { mapId: 'toeflcity', tier: 5, prompt: 'Is technology making people more isolated?', promptZh: '科技是否让人更孤立？给出理由。', keywords: ['technology', 'isolated', 'social', 'connect'], sample: 'Technology can isolate people, but it can also help them connect globally.', sampleZh: '科技可能让人孤立，也能帮助人们全球连接。' },
  { mapId: 'ielstower', tier: 6, prompt: 'Do you like reading? What kind of books?', promptZh: '雅思 Part1：你喜欢阅读吗？喜欢什么书？', keywords: ['reading', 'like', 'books', 'because'], sample: 'Yes, I like reading novels because they help me relax and improve my vocabulary.', sampleZh: '喜欢，我喜欢读小说，因为能放松并扩大词汇量。' },
  { mapId: 'ielstower', tier: 6, prompt: 'Describe a person who inspired you.', promptZh: '雅思 Part2：描述一个激励过你的人。', keywords: ['person', 'inspired', 'because', 'hardworking'], sample: 'My high school teacher inspired me. She was hardworking and kind.', sampleZh: '我的高中老师激励了我。她勤奋又善良。' },
  { mapId: 'ielstower', tier: 6, prompt: 'How can schools better prepare students for work?', promptZh: '雅思 Part3：学校如何更好帮助学生适应职场？', keywords: ['schools', 'skills', 'internship', 'prepare'], sample: 'Schools should offer internships and teach communication skills.', sampleZh: '学校应提供实习并教授沟通技能。' },
  { mapId: 'ielstower', tier: 6, prompt: 'What do you usually do on weekends?', promptZh: '雅思 Part1：周末你通常做什么？', keywords: ['weekend', 'usually', 'friends', 'rest'], sample: 'On weekends I usually meet friends, play sports, and rest with my family.', sampleZh: '周末我通常见朋友、运动，并和家人休息。' },
  { mapId: 'ielstower', tier: 6, prompt: 'Advantages of learning a foreign language?', promptZh: '学习外语有哪些好处？', keywords: ['language', 'career', 'travel', 'culture'], sample: 'Learning a foreign language opens career opportunities and helps you travel and understand cultures.', sampleZh: '学外语能拓展职业机会，方便旅行并理解文化。' }
]

const reorders = [
  { words: ['I', 'love', 'learning', 'English'], zh: '我热爱学习英语' },
  { words: ['She', 'is', 'my', 'best', 'friend'], zh: '她是我最好的朋友' },
  { words: ['Where', 'is', 'the', 'library'], zh: '图书馆在哪里' },
  { words: ['I', 'would', 'like', 'a', 'coffee'], zh: '我想要一杯咖啡' },
  { words: ['Practice', 'makes', 'perfect'], zh: '熟能生巧' },
  { words: ['Could', 'you', 'help', 'me'], zh: '你能帮我吗' },
  { words: ['It', 'is', 'a', 'sunny', 'day'], zh: '今天是晴天' },
  { words: ['I', 'am', 'looking', 'forward', 'to', 'it'], zh: '我很期待' },
  { words: ['Please', 'speak', 'more', 'slowly'], zh: '请说慢一点' },
  { words: ['How', 'can', 'I', 'get', 'there'], zh: '我怎么去那里' },
  { words: ['Let', 'us', 'study', 'together'], zh: '我们一起学习吧' },
  { words: ['This', 'is', 'very', 'important'], zh: '这非常重要' }
]

const fills = [
  ['I go to the ______ to borrow books.', 'library', '我去______借书。', '图书馆'],
  ['My ______ gives us homework.', 'teacher', '我的______给我们布置作业。', '老师'],
  ['I eat ______ at 7 a.m.', 'breakfast', '我早上七点吃______。', '早餐'],
  ['She is my best ______.', 'friend', '她是我最好的______。', '朋友'],
  ['Please speak more ______.', 'carefully', '请更______地说话。', '小心/仔细'],
  ['Protecting the ______ is important.', 'environment', '保护______很重要。', '环境'],
  ['This question is a real ______.', 'challenge', '这道题是真正的______。', '挑战'],
  ['Learning ______ takes time.', 'vocabulary', '学习______需要时间。', '词汇'],
  ['Write a complete ______.', 'sentence', '写一个完整的______。', '句子'],
  ['English ______ helps you speak correctly.', 'grammar', '英语______帮助你正确表达。', '语法'],
  ['I need to ______ English every day.', 'practice', '我需要每天______英语。', '练习'],
  ['We had a long ______ about the project.', 'conversation', '我们就项目进行了很长的______。', '对话'],
  ['Please ______ the door when you leave.', 'close', '离开时请______门。', '关闭'],
  ['I ______ to school by bus.', 'go', '我坐公交______学校。', '去'],
  ['Can you ______ me with this problem?', 'help', '你能______我解决这个问题吗？', '帮助']
]

// ─── Build ───────────────────────────────────────────────────────────
const questions = []
const vocabulary = []
let n = 0
const id = (p) => `${p}_${String(++n).padStart(5, '0')}`

function push(q) {
  questions.push(q)
}

// Vocabulary book
for (const [word, meaningZh, pos, level] of ALL_WORDS) {
  vocabulary.push({
    id: `v_${word}`,
    word,
    meaningZh,
    pos: pos || '',
    level: level || 'basic',
    mapId: level === 'A1' ? 'yayacun' : level === 'A2' ? 'wordtown' : level === 'B1' ? 'campusport' : 'examfront',
    example: `I can use the word "${word}" in a sentence.`,
    exampleZh: `我可以在句子里使用单词“${word}”。`,
    tags: ['core']
  })
}

// Word practice — full expansion for every word
for (const [word, meaningZh, , level] of ALL_WORDS) {
  const mapId = level === 'A1' ? 'yayacun' : level === 'A2' ? 'wordtown' : level === 'B1' ? 'dialoguevalley' : 'campusport'
  const tier = level === 'A1' ? 0 : level === 'A2' ? 1 : level === 'B1' ? 2 : 3
  const wrong = distractors(word, wordPool, 3)
  const choices = shuffle([word, ...wrong])

  push({
    id: id('wc'),
    mapId,
    tier,
    type: 'word_choose',
    prompt: `Choose the English word for: ${meaningZh}`,
    promptZh: `「${meaningZh}」用英语怎么说？选择正确单词。`,
    choices,
    answer: word,
    audioText: word,
    tags: ['word'],
    allowPopup: true,
    estSeconds: 20,
    explanation: `${word} = ${meaningZh}`
  })

  push({
    id: id('lc'),
    mapId,
    tier,
    type: 'listen_choose',
    prompt: `Listen (imagine the sound) and choose the meaning of: ${word}`,
    promptZh: `听一听（或看词想象读音），选出 “${word}” 的中文意思。`,
    choices: shuffle([
      meaningZh,
      ...distractors(meaningZh, ALL_WORDS.map((x) => x[1]), 3)
    ]),
    answer: meaningZh,
    audioText: word,
    tags: ['word'],
    allowPopup: true,
    estSeconds: 22,
    explanation: `${word} = ${meaningZh}`
  })

  push({
    id: id('sr'),
    mapId,
    tier,
    type: 'shadow_read',
    prompt: `Shadow read: ${word}`,
    promptZh: `跟读单词：${word}（${meaningZh}）。点击麦克风朗读，或打字输入。`,
    answer: word,
    audioText: word,
    sampleAnswer: word,
    sampleAnswerZh: meaningZh,
    tags: ['word', 'speaking'],
    allowPopup: true,
    estSeconds: 25,
    explanation: `跟读 ${word}（${meaningZh}）`
  })
}

// Fills
for (const [prompt, answer, promptZh, ansZh] of fills) {
  const wrong = distractors(answer, wordPool, 3)
  push({
    id: id('fb'),
    mapId: 'wordtown',
    tier: 1,
    type: 'fill_blank',
    prompt: `Fill in the blank: ${prompt}`,
    promptZh: `选词填空：${promptZh}`,
    choices: shuffle([answer, ...wrong]),
    answer,
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 28,
    explanation: `${answer}（${ansZh}）`
  })
}

// Dialogues → dialogue_next + shadow
for (const d of dialogues) {
  push({
    id: id('dv'),
    mapId: 'dialoguevalley',
    tier: 2,
    type: 'dialogue_next',
    prompt: d.prompt,
    promptZh: d.promptZh,
    choices: shuffle([d.answer, ...d.wrong]),
    answer: d.answer,
    sampleAnswer: d.answer,
    sampleAnswerZh: d.answerZh,
    tags: ['sentence', 'topic'],
    allowPopup: true,
    estSeconds: 30,
    explanation: d.answerZh
  })
  push({
    id: id('dv'),
    mapId: 'dialoguevalley',
    tier: 2,
    type: 'shadow_read',
    prompt: `Shadow read: ${d.answer}`,
    promptZh: `情景跟读：${d.answer}（${d.answerZh}）`,
    answer: d.answer,
    audioText: d.answer,
    sampleAnswer: d.answer,
    sampleAnswerZh: d.answerZh,
    tags: ['speaking', 'sentence'],
    allowPopup: true,
    estSeconds: 35
  })
}

// Reorder
for (const r of reorders) {
  const answer = r.words.join(' ')
  for (const [mapId, tier] of [
    ['wordtown', 1],
    ['dialoguevalley', 2]
  ]) {
    push({
      id: id('ro'),
      mapId,
      tier,
      type: 'reorder',
      prompt: 'Tap words in the correct order to build the sentence.',
      promptZh: `把单词排成正确句子（按顺序点选）：${r.zh}`,
      choices: shuffle([...r.words]),
      answer,
      tags: ['sentence'],
      allowPopup: true,
      estSeconds: 35,
      explanation: `${answer}（${r.zh}）`
    })
  }
}

// Topics / short speak / topic cards
for (const t of topics) {
  const type = t.tier >= 4 ? 'topic_card' : 'short_speak'
  push({
    id: id('tp'),
    mapId: t.mapId,
    tier: t.tier,
    type,
    prompt: t.prompt,
    promptZh: t.promptZh,
    answer: t.sample,
    keywords: t.keywords,
    sampleAnswer: t.sample,
    sampleAnswerZh: t.sampleZh,
    tags: ['speaking', 'topic'],
    allowPopup: false,
    estSeconds: t.tier >= 5 ? 70 : 45
  })
}

// Exam skill MC with zh
const examMc = [
  ['I agree with you.', '表达同意可以说', '我同意你的看法。'],
  ["I see your point, but...", '礼貌表达不同意见', '我理解你的观点，但是…'],
  ['often / usually', '描述频率「经常」', '经常/通常'],
  ['First... Moreover... Finally...', '口语过渡结构', '首先…此外…最后…'],
  ['In conclusion...', '结尾总结可说', '总之…'],
  ['state a clear position and give reasons', '独立口语要点', '先表明立场再给理由'],
  ['key points from reading/listening', '综合口语需要', '抓住阅读/听力要点'],
  ['完整句子 + 简单理由', 'Part 1 回答宜', '用完整句子并加简单理由'],
  ['who/what → details → why memorable', 'Part 2 结构', '人物/事物→细节→为何难忘'],
  ['抽象一点 + 举例对比', 'Part 3 提升', '更抽象并举例对比']
]
for (const [answer, promptZh, expl] of examMc) {
  const mapId = promptZh.includes('Part') || promptZh.includes('独立') ? 'ielstower' : 'examfront'
  const tier = mapId === 'ielstower' ? 6 : 4
  push({
    id: id('ex'),
    mapId,
    tier,
    type: 'word_choose',
    prompt: promptZh,
    promptZh: `考试技巧：${promptZh}`,
    choices: shuffle([
      answer,
      'I am a banana.',
      'Silence only forever.',
      'Random numbers 123'
    ]),
    answer,
    tags: ['topic'],
    allowPopup: true,
    estSeconds: 25,
    explanation: expl
  })
}

// High-level shadow sentences
const advancedLines = [
  ['In my opinion, practice is the key to improvement.', '在我看来，练习是进步的关键。', 'examfront', 4],
  ['This experience taught me the value of perseverance.', '这段经历让我懂得坚持的价值。', 'ielstower', 6],
  ["That's a good point. I'd also add that preparation matters.", '说得好。我还想补充：准备很重要。', 'toeflcity', 5],
  ['I believe clear communication builds trust.', '我认为清晰沟通能建立信任。', 'campusport', 3],
  ['Technology can connect people across the world.', '科技能连接世界各地的人。', 'toeflcity', 5],
  ['I would like to discuss both sides of the issue.', '我想讨论这个问题的两个方面。', 'ielstower', 6],
  ['From my perspective, education opens many doors.', '在我看来，教育能打开许多机会。', 'examfront', 4],
  ['One possible solution is to improve public transport.', '一个可能的方案是改善公共交通。', 'toeflcity', 5],
  ['It is important to give reasons and examples.', '给出理由和例子很重要。', 'examfront', 4],
  ['I completely agree with this statement because...', '我完全同意这个说法，因为…', 'ielstower', 6]
]
for (const [line, zh, mapId, tier] of advancedLines) {
  for (let i = 0; i < 6; i++) {
    push({
      id: id('as'),
      mapId,
      tier,
      type: 'shadow_read',
      prompt: `Shadow read the sentence.`,
      promptZh: `跟读句子：${zh}`,
      answer: line,
      audioText: line,
      sampleAnswer: line,
      sampleAnswerZh: zh,
      tags: ['speaking', 'sentence'],
      allowPopup: true,
      estSeconds: 35
    })
  }
}

// Extra B2 words on exam/toefl/ielts maps for free practice volume
for (const [word, meaningZh] of BASIC_B2) {
  for (const [mapId, tier] of [
    ['examfront', 4],
    ['toeflcity', 5],
    ['ielstower', 6]
  ]) {
    const wrong = distractors(word, wordPool, 3)
    push({
      id: id('hi'),
      mapId,
      tier,
      type: 'word_choose',
      prompt: `Academic word: choose English for「${meaningZh}」`,
      promptZh: `学术词汇：「${meaningZh}」对应哪个英文？`,
      choices: shuffle([word, ...wrong]),
      answer: word,
      audioText: word,
      tags: ['word'],
      allowPopup: true,
      estSeconds: 22,
      explanation: `${word} = ${meaningZh}`
    })
    push({
      id: id('hi'),
      mapId,
      tier,
      type: 'shadow_read',
      prompt: `Shadow read: ${word}`,
      promptZh: `跟读：${word}（${meaningZh}）`,
      answer: word,
      audioText: word,
      sampleAnswer: word,
      sampleAnswerZh: meaningZh,
      tags: ['word', 'speaking'],
      allowPopup: true,
      estSeconds: 25
    })
  }
}

// Deduplicate vocabulary ids if any collision
const seenV = new Set()
const vocabUnique = []
for (const v of vocabulary) {
  if (seenV.has(v.id)) continue
  seenV.add(v.id)
  vocabUnique.push(v)
}

fs.mkdirSync(path.dirname(outQ), { recursive: true })
fs.writeFileSync(outQ, JSON.stringify({ version: 2, questions }, null, 0), 'utf8')
fs.writeFileSync(outV, JSON.stringify({ version: 1, words: vocabUnique }, null, 0), 'utf8')

const byMap = {}
for (const q of questions) byMap[q.mapId] = (byMap[q.mapId] || 0) + 1
console.log('Questions:', questions.length)
console.log('Vocabulary:', vocabUnique.length)
console.log('Per map:', byMap)
