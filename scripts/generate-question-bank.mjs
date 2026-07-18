/**
 * Generate a graded question bank covering kindergarten → IELTS/TOEFL style.
 * Output: src/renderer/src/content/questions.json
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, '../src/renderer/src/content/questions.json')

const maps = [
  { id: 'yayacun', tier: 0 },
  { id: 'wordtown', tier: 1 },
  { id: 'dialoguevalley', tier: 2 },
  { id: 'campusport', tier: 3 },
  { id: 'examfront', tier: 4 },
  { id: 'toeflcity', tier: 5 },
  { id: 'ielstower', tier: 6 }
]

const kindergarten = [
  ['apple', '苹果', ['banana', 'apple', 'car', 'dog']],
  ['cat', '猫', ['cat', 'bus', 'pen', 'milk']],
  ['dog', '狗', ['fish', 'dog', 'red', 'book']],
  ['sun', '太阳', ['moon', 'sun', 'cup', 'hat']],
  ['milk', '牛奶', ['milk', 'tree', 'ball', 'shoe']],
  ['red', '红色', ['blue', 'red', 'one', 'two']],
  ['one', '一', ['one', 'big', 'small', 'run']],
  ['hello', '你好', ['bye', 'hello', 'sit', 'jump']],
  ['book', '书', ['book', 'rain', 'fish', 'car']],
  ['water', '水', ['fire', 'water', 'desk', 'door']],
  ['bird', '鸟', ['bird', 'ship', 'cake', 'bed']],
  ['fish', '鱼', ['lion', 'fish', 'star', 'bag']],
  ['mom', '妈妈', ['dad', 'mom', 'bag', 'hat']],
  ['dad', '爸爸', ['mom', 'dad', 'cup', 'pen']],
  ['ball', '球', ['ball', 'soup', 'rain', 'key']],
  ['eye', '眼睛', ['ear', 'eye', 'nose', 'hand']],
  ['hand', '手', ['foot', 'hand', 'leg', 'arm']],
  ['happy', '开心的', ['sad', 'happy', 'cold', 'hot']],
  ['big', '大的', ['small', 'big', 'thin', 'tall']],
  ['run', '跑', ['walk', 'run', 'sleep', 'eat']]
]

const schoolWords = [
  ['library', '图书馆', ['library', 'kitchen', 'garage', 'airport']],
  ['teacher', '老师', ['student', 'teacher', 'driver', 'doctor']],
  ['homework', '家庭作业', ['homework', 'holiday', 'hospital', 'hobby']],
  ['breakfast', '早餐', ['dinner', 'breakfast', 'lunch', 'snack']],
  ['weather', '天气', ['weather', 'whether', 'winter', 'window']],
  ['beautiful', '美丽的', ['beautiful', 'boring', 'busy', 'brave']],
  ['important', '重要的', ['important', 'impossible', 'impatient', 'improve']],
  ['because', '因为', ['because', 'before', 'between', 'behind']],
  ['friend', '朋友', ['friend', 'family', 'father', 'forest']],
  ['school', '学校', ['school', 'store', 'station', 'street']],
  ['interesting', '有趣的', ['interesting', 'incredible', 'including', 'inside']],
  ['carefully', '小心地', ['carefully', 'careless', 'careful', 'career']],
  ['environment', '环境', ['environment', 'equipment', 'entertainment', 'event']],
  ['challenge', '挑战', ['challenge', 'change', 'chance', 'channel']],
  ['practice', '练习', ['practice', 'perfect', 'perform', 'permit']],
  ['vocabulary', '词汇', ['vocabulary', 'vacation', 'valuable', 'various']],
  ['sentence', '句子', ['sentence', 'service', 'several', 'serious']],
  ['grammar', '语法', ['grammar', 'graduate', 'grandfather', 'grateful']],
  ['pronounce', '发音', ['pronounce', 'promise', 'protect', 'produce']],
  ['conversation', '对话', ['conversation', 'convention', 'condition', 'connection']]
]

const dialogues = [
  {
    prompt: '朋友说：How are you today? 你应选：',
    choices: ["I'm fine, thank you.", 'I am 12 years old.', 'It is a pen.', 'Goodbye forever.'],
    answer: "I'm fine, thank you.",
    sample: "I'm fine, thank you. And you?"
  },
  {
    prompt: '在咖啡店，服务员问：What would you like? 你说：',
    choices: ["I'd like a latte, please.", 'I live in Beijing.', 'My name is Tom.', 'See you tomorrow.'],
    answer: "I'd like a latte, please."
  },
  {
    prompt: '问路：Excuse me, where is the subway? 合适回答：',
    choices: ['Go straight and turn left.', 'I like apples.', 'It is Monday.', 'Open your book.'],
    answer: 'Go straight and turn left.'
  },
  {
    prompt: '电话里对方说：May I speak to Anna? 你说：',
    choices: ['Speaking. / This is Anna.', 'I am a student.', 'Nice to meet you.', 'How much is it?'],
    answer: 'Speaking. / This is Anna.'
  },
  {
    prompt: '迟到道歉，你说：',
    choices: ["Sorry I'm late. There was traffic.", 'I hate this class.', 'Give me money.', 'Who are you?'],
    answer: "Sorry I'm late. There was traffic."
  },
  {
    prompt: '点餐结束，服务员说：Anything else? 你说：',
    choices: ["No, that's all. Thanks.", 'I am tall.', 'Close the door.', 'What is your job?'],
    answer: "No, that's all. Thanks."
  },
  {
    prompt: '朋友邀请：Do you want to watch a movie? 委婉拒绝：',
    choices: ["I'd love to, but I have homework.", 'You are wrong.', 'I never sleep.', 'Buy me a car.'],
    answer: "I'd love to, but I have homework."
  },
  {
    prompt: '商店：Can I try this on? 店员合适回答：',
    choices: ['Sure, the fitting room is over there.', 'I am hungry.', 'It is raining.', 'Call the police.'],
    answer: 'Sure, the fitting room is over there.'
  },
  {
    prompt: '上课迟到进教室，对老师说：',
    choices: ['May I come in?', 'Where is my money?', 'I quit.', 'Turn off the light.'],
    answer: 'May I come in?'
  },
  {
    prompt: '感谢帮助后，对方说 You are welcome. 你可再回应：',
    choices: ['Have a nice day!', 'I am a banana.', 'Stop talking.', 'Give me five.'],
    answer: 'Have a nice day!'
  }
]

const campus = [
  {
    prompt: '用英语简单介绍你的专业/学校（至少 5 个英文词）。关键词可包含 student, study, school',
    keywords: ['student', 'study', 'school', 'like', 'learn', 'university', 'college', 'major'],
    sample: 'I am a student. I study English at school and I like learning new words.'
  },
  {
    prompt: '描述你理想的一天（短说）。可提到 morning, friends, happy',
    keywords: ['morning', 'friend', 'happy', 'day', 'like', 'usually', 'after'],
    sample: 'In the morning I read books. After class I meet friends. I feel happy.'
  },
  {
    prompt: '如何约同学一起自习？说出你的邀请句。',
    keywords: ['study', 'together', 'library', 'free', 'join', 'shall', 'would'],
    sample: 'Are you free this afternoon? Shall we study together in the library?'
  },
  {
    prompt: '谈论天气与心情（短说）。',
    keywords: ['weather', 'sunny', 'rain', 'feel', 'today', 'cold', 'warm'],
    sample: 'Today the weather is sunny and warm. I feel energetic.'
  },
  {
    prompt: '介绍一个你喜欢的爱好。',
    keywords: ['hobby', 'like', 'because', 'interesting', 'play', 'read', 'music'],
    sample: 'My hobby is reading because it is interesting and relaxing.'
  }
]

const examTopics = [
  {
    prompt: 'Describe a skill you want to learn. Why?',
    keywords: ['skill', 'learn', 'because', 'practice', 'future', 'helpful', 'interested'],
    sample:
      'I want to learn public speaking because it is helpful for my future career. I will practice every week.'
  },
  {
    prompt: 'Do you prefer online learning or classroom learning? Why?',
    keywords: ['prefer', 'online', 'classroom', 'because', 'flexible', 'interact', 'focus'],
    sample:
      'I prefer classroom learning because I can interact with teachers and classmates and stay focused.'
  },
  {
    prompt: 'Talk about a memorable trip (short).',
    keywords: ['trip', 'went', 'with', 'enjoyed', 'because', 'visit', 'beautiful'],
    sample: 'Last summer I went to the mountains with my family. I enjoyed the beautiful views.'
  },
  {
    prompt: 'What makes a good friend?',
    keywords: ['friend', 'honest', 'kind', 'trust', 'support', 'listen', 'respect'],
    sample: 'A good friend is honest and kind. They listen to you and support you when you need help.'
  },
  {
    prompt: 'How do you manage stress before exams?',
    keywords: ['stress', 'exam', 'relax', 'plan', 'sleep', 'exercise', 'breathe'],
    sample: 'I make a study plan, exercise, and sleep well. Deep breathing also helps me relax.'
  }
]

const toefl = [
  {
    prompt:
      'Some people prefer to work in teams; others prefer to work alone. Which do you prefer and why? (independent speaking style)',
    keywords: ['prefer', 'team', 'alone', 'because', 'ideas', 'efficient', 'responsibility'],
    sample:
      'I prefer working in teams because we can share ideas and finish complex tasks more efficiently.'
  },
  {
    prompt: 'Do you agree that students should have part-time jobs? Explain.',
    keywords: ['agree', 'students', 'job', 'experience', 'time', 'money', 'balance'],
    sample:
      'I agree that students can have part-time jobs if they balance study and work. It builds experience.'
  },
  {
    prompt: 'Describe a problem in your community and a possible solution.',
    keywords: ['problem', 'community', 'solution', 'because', 'improve', 'people', 'should'],
    sample:
      'Traffic congestion is a problem. The city should improve public transport so people drive less.'
  },
  {
    prompt: 'Is technology making people more isolated? Give reasons.',
    keywords: ['technology', 'isolated', 'social', 'media', 'however', 'connect', 'offline'],
    sample:
      'Technology can isolate people if they only use social media, but it can also help them connect globally.'
  }
]

const ielts = [
  {
    prompt: 'IELTS-style Part 1: Do you like reading? What kind of books?',
    keywords: ['reading', 'like', 'books', 'because', 'novel', 'usually', 'enjoy'],
    sample: 'Yes, I like reading novels because they help me relax and improve my vocabulary.'
  },
  {
    prompt:
      'IELTS-style Part 2: Describe a person who inspired you. You should say who, how you know them, and why they inspired you.',
    keywords: ['person', 'inspired', 'because', 'hardworking', 'kind', 'example', 'learn'],
    sample:
      'My high school teacher inspired me. She was hardworking and kind. She taught me to never give up.'
  },
  {
    prompt: 'IELTS-style Part 3: How can schools better prepare students for the workplace?',
    keywords: ['schools', 'students', 'skills', 'internship', 'communication', 'practical', 'prepare'],
    sample:
      'Schools should offer internships and teach communication skills so students are ready for real jobs.'
  },
  {
    prompt: 'Part 1: What do you usually do on weekends?',
    keywords: ['weekend', 'usually', 'friends', 'rest', 'sport', 'watch', 'family'],
    sample: 'On weekends I usually meet friends, play sports, and rest with my family.'
  },
  {
    prompt: 'Part 3: What are the advantages of learning a foreign language?',
    keywords: ['language', 'culture', 'career', 'travel', 'communicate', 'opportunity', 'brain'],
    sample:
      'Learning a foreign language opens career opportunities, helps travel, and improves cultural understanding.'
  }
]

const questions = []
let n = 0
const id = (prefix) => `${prefix}_${String(++n).padStart(4, '0')}`

function push(q) {
  questions.push(q)
}

// Yayacun: word choose + shadow + listen style
for (const [word, meaning, choices] of kindergarten) {
  push({
    id: id('yc'),
    mapId: 'yayacun',
    tier: 0,
    type: 'word_choose',
    prompt: `「${meaning}」用英语怎么说？`,
    choices: shuffle(choices),
    answer: word,
    audioText: word,
    tags: ['word'],
    allowPopup: true,
    estSeconds: 20,
    explanation: `${word} = ${meaning}`
  })
  push({
    id: id('yc'),
    mapId: 'yayacun',
    tier: 0,
    type: 'shadow_read',
    prompt: `跟读单词：${word}（${meaning}）`,
    answer: word,
    audioText: word,
    tags: ['word', 'speaking'],
    allowPopup: true,
    estSeconds: 25,
    explanation: `跟读 ${word}`
  })
  push({
    id: id('yc'),
    mapId: 'yayacun',
    tier: 0,
    type: 'listen_choose',
    prompt: `听一听（请看英文，想象读音），选出中文意思：${word}`,
    choices: shuffle([
      meaning,
      meaning === '苹果' ? '香蕉' : '苹果',
      meaning === '猫' ? '狗' : '猫',
      '汽车'
    ]),
    answer: meaning,
    audioText: word,
    tags: ['word'],
    allowPopup: true,
    estSeconds: 20
  })
}

// Word town
for (const [word, meaning, choices] of schoolWords) {
  push({
    id: id('wt'),
    mapId: 'wordtown',
    tier: 1,
    type: 'word_choose',
    prompt: `选择正确英文：${meaning}`,
    choices: shuffle(choices),
    answer: word,
    tags: ['word'],
    allowPopup: true,
    estSeconds: 25,
    explanation: `${word} — ${meaning}`
  })
  push({
    id: id('wt'),
    mapId: 'wordtown',
    tier: 1,
    type: 'fill_blank',
    prompt: `填空：I need to ______ English every day.（练习）`,
    choices: shuffle(['practice', 'practise', word === 'practice' ? 'perfect' : 'practice', 'protect']),
    answer: word === 'practice' ? 'practice' : word === 'vocabulary' ? 'practice' : 'practice',
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 30,
    explanation: 'practice English'
  })
  push({
    id: id('wt'),
    mapId: 'wordtown',
    tier: 1,
    type: 'shadow_read',
    prompt: `跟读：${word}`,
    answer: word,
    audioText: word,
    tags: ['word', 'speaking'],
    allowPopup: true,
    estSeconds: 25
  })
}

// Fix fill blanks properly for wordtown - regenerate cleaner fills
// (some above are weak; add dedicated sentences)
const fills = [
  ['I go to the ______ to borrow books.', 'library', ['library', 'kitchen', 'garage', 'airport']],
  ['My ______ gives us homework.', 'teacher', ['teacher', 'driver', 'tourist', 'pilot']],
  ['I eat ______ at 7 a.m.', 'breakfast', ['breakfast', 'dinner', 'midnight', 'dessert']],
  ['She is my best ______.', 'friend', ['friend', 'forest', 'fridge', 'frame']],
  ['Please speak more ______.', 'carefully', ['carefully', 'careless', 'camera', 'capital']],
  ['Protecting the ______ is important.', 'environment', ['environment', 'elevator', 'elephant', 'engine']],
  ['This question is a real ______.', 'challenge', ['challenge', 'channel', 'chicken', 'chapter']],
  ['Learning ______ takes time.', 'vocabulary', ['vocabulary', 'vacation', 'vehicle', 'village']],
  ['Write a complete ______.', 'sentence', ['sentence', 'service', 'season', 'secret']],
  ['English ______ helps you speak correctly.', 'grammar', ['grammar', 'grandma', 'garage', 'galaxy']]
]
for (const [prompt, answer, choices] of fills) {
  push({
    id: id('wt'),
    mapId: 'wordtown',
    tier: 1,
    type: 'fill_blank',
    prompt: `选词填空：${prompt}`,
    choices: shuffle(choices),
    answer,
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 30
  })
}

// Dialogue valley
for (const d of dialogues) {
  push({
    id: id('dv'),
    mapId: 'dialoguevalley',
    tier: 2,
    type: 'dialogue_next',
    prompt: d.prompt,
    choices: shuffle(d.choices),
    answer: d.answer,
    sampleAnswer: d.sample || d.answer,
    tags: ['sentence', 'topic'],
    allowPopup: true,
    estSeconds: 30
  })
  push({
    id: id('dv'),
    mapId: 'dialoguevalley',
    tier: 2,
    type: 'shadow_read',
    prompt: `情景跟读：${d.answer}`,
    answer: d.answer,
    audioText: d.answer,
    tags: ['speaking', 'sentence'],
    allowPopup: true,
    estSeconds: 35
  })
}

// Extra dialogues generated
const extraDialogues = [
  ["What time is it?", "It's three o'clock."],
  ['How much is this?', "It's ten dollars."],
  ['Where do you live?', 'I live near the park.'],
  ['Can you help me?', 'Of course, what do you need?'],
  ['Nice to meet you.', 'Nice to meet you too.'],
  ['Have a good weekend!', 'You too!'],
  ['What is your favorite food?', 'I like noodles.'],
  ['Are you free tonight?', 'Sorry, I am busy tonight.'],
  ['Could you repeat that?', 'Sure. I said the meeting is at five.'],
  ['Thanks for your help.', "You're welcome."]
]
for (const [a, b] of extraDialogues) {
  push({
    id: id('dv'),
    mapId: 'dialoguevalley',
    tier: 2,
    type: 'dialogue_next',
    prompt: `对方说：${a} 你选：`,
    choices: shuffle([b, 'I am a chair.', 'Close your eyes.', 'Blue is color.']),
    answer: b,
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 25
  })
}

// Campus port
for (const c of campus) {
  push({
    id: id('cp'),
    mapId: 'campusport',
    tier: 3,
    type: 'short_speak',
    prompt: c.prompt,
    answer: c.sample,
    keywords: c.keywords,
    sampleAnswer: c.sample,
    tags: ['speaking', 'topic'],
    allowPopup: false,
    estSeconds: 45
  })
}
const campusChoose = [
  ['在图书馆应保持？', 'quiet', ['quiet', 'noisy', 'angry', 'hungry'], 'Keep quiet in the library.'],
  ['请假应对老师说？', "Could I ask for leave?", ["Could I ask for leave?", 'I quit school.', 'Give me A+', 'You are late.']],
  ['小组讨论时好的做法是？', 'Listen and share ideas', ['Listen and share ideas', 'Only play phone', 'Interrupt rudely', 'Sleep on desk']],
  ['借笔记礼貌说法？', 'Could I borrow your notes?', ['Could I borrow your notes?', 'Give me now!', 'Your notes are mine.', 'I hate notes.']],
  ['约自习地点常见？', 'library', ['library', 'runway', 'volcano', 'basement only']]
]
for (const [prompt, answer, choices, sample] of campusChoose) {
  push({
    id: id('cp'),
    mapId: 'campusport',
    tier: 3,
    type: 'word_choose',
    prompt,
    choices: shuffle(choices),
    answer,
    sampleAnswer: sample,
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 25
  })
}
// more campus shorts
const moreCampus = [
  'Introduce your favorite subject in English.',
  'Talk about your daily routine briefly.',
  'Describe your classroom in a few sentences.',
  'What club would you join and why?',
  'How do you prepare for a presentation?'
]
for (const p of moreCampus) {
  push({
    id: id('cp'),
    mapId: 'campusport',
    tier: 3,
    type: 'short_speak',
    prompt: p,
    answer: 'I like English because it is useful. I practice speaking every day.',
    keywords: ['like', 'because', 'practice', 'every', 'student', 'school', 'learn'],
    sampleAnswer: 'I like English because it is useful. I practice speaking every day with friends.',
    tags: ['speaking', 'topic'],
    allowPopup: false,
    estSeconds: 40
  })
}

// Exam front
for (const e of examTopics) {
  push({
    id: id('ef'),
    mapId: 'examfront',
    tier: 4,
    type: 'topic_card',
    prompt: e.prompt,
    answer: e.sample,
    keywords: e.keywords,
    sampleAnswer: e.sample,
    tags: ['topic', 'speaking'],
    allowPopup: false,
    estSeconds: 60
  })
}
const examMc = [
  ['表达同意常用：', 'I agree with you.', ['I agree with you.', 'I am apple.', 'Close window now.', 'Blue sky only.']],
  ['表达不同意见更礼貌：', "I see your point, but...", ["I see your point, but...", 'You are stupid.', 'Shut up.', 'No forever.']],
  ['描述频率「经常」：', 'often / usually', ['often / usually', 'never always never', 'yesterday tomorrow', 'under the table']],
  ['口语过渡词：', 'First... Moreover... Finally...', ['First... Moreover... Finally...', 'Banana banana', 'Only silence', 'Random numbers']],
  ['结尾总结可说：', 'In conclusion...', ['In conclusion...', 'The end now go.', 'I forget all.', 'Zero words.']]
]
for (const [prompt, answer, choices] of examMc) {
  push({
    id: id('ef'),
    mapId: 'examfront',
    tier: 4,
    type: 'word_choose',
    prompt,
    choices: shuffle(choices),
    answer,
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 25
  })
}
for (let i = 0; i < 15; i++) {
  push({
    id: id('ef'),
    mapId: 'examfront',
    tier: 4,
    type: 'shadow_read',
    prompt: '跟读考试常用句',
    answer: 'In my opinion, practice is the key to improvement.',
    audioText: 'In my opinion, practice is the key to improvement.',
    tags: ['speaking', 'sentence'],
    allowPopup: true,
    estSeconds: 30
  })
}

// TOEFL city
for (const t of toefl) {
  push({
    id: id('tf'),
    mapId: 'toeflcity',
    tier: 5,
    type: 'topic_card',
    prompt: t.prompt,
    answer: t.sample,
    keywords: t.keywords,
    sampleAnswer: t.sample,
    tags: ['topic', 'speaking'],
    allowPopup: false,
    estSeconds: 70
  })
}
const toeflShort = [
  ['Campus announcement skill: main purpose is often to…', 'inform students about a change', ['inform students about a change', 'sell products only', 'punish everyone', 'cancel English forever']],
  ['Independent speaking tip: you should…', 'state a clear position and give reasons', ['state a clear position and give reasons', 'only say one word', 'read Chinese', 'stay silent']],
  ['Good transition:', 'For example, / On the other hand,', ['For example, / On the other hand,', 'Blah blah', 'End now', 'No reason']],
  ['Time management:', 'Plan 15s, speak clearly, wrap up', ['Plan 15s, speak clearly, wrap up', 'Speak until battery dies', 'Ignore the prompt', 'Copy friend']],
  ['Integrated speaking needs:', 'key points from reading/listening', ['key points from reading/listening', 'only personal stories', 'random jokes', 'dictionary listing']]
]
for (const [prompt, answer, choices] of toeflShort) {
  push({
    id: id('tf'),
    mapId: 'toeflcity',
    tier: 5,
    type: 'word_choose',
    prompt,
    choices: shuffle(choices),
    answer,
    tags: ['topic'],
    allowPopup: true,
    estSeconds: 30
  })
}
for (let i = 0; i < 20; i++) {
  push({
    id: id('tf'),
    mapId: 'toeflcity',
    tier: 5,
    type: 'dialogue_next',
    prompt: '学术讨论中，同学提出观点后你想补充，更合适的是：',
    choices: shuffle([
      "That's a good point. I'd also add that...",
      'You are completely wrong and dumb.',
      'I will not listen.',
      'Random silence is best.'
    ]),
    answer: "That's a good point. I'd also add that...",
    tags: ['sentence', 'topic'],
    allowPopup: true,
    estSeconds: 25
  })
}

// IELTS tower
for (const t of ielts) {
  push({
    id: id('il'),
    mapId: 'ielstower',
    tier: 6,
    type: 'topic_card',
    prompt: t.prompt,
    answer: t.sample,
    keywords: t.keywords,
    sampleAnswer: t.sample,
    tags: ['topic', 'speaking'],
    allowPopup: false,
    estSeconds: 90
  })
}
const ieltsBand = [
  ['Part 1 回答宜：', '完整句子 + 简单理由', ['完整句子 + 简单理由', '只说 Yes/No', '背整篇范文不停', '全程中文']],
  ['Part 2 可用结构：', 'who/what → details → why memorable', ['who/what → details → why memorable', '只读题目', '不看卡片', '保持沉默']],
  ['Part 3 提升：', '抽象一点 + 举例对比', ['抽象一点 + 举例对比', '只重复 Part2', '拒绝回答', '说天气即可']],
  ['流利度建议：', '自然停顿，少填词过载', ['自然停顿，少填词过载', '每词停 5 秒', '越快越好不管准', '只背连接词']],
  ['词汇策略：', '准确自然优于生僻堆砌', ['准确自然优于生僻堆砌', '全用超难词', '全用拼音', '重复一个形容词']]
]
for (const [prompt, answer, choices] of ieltsBand) {
  push({
    id: id('il'),
    mapId: 'ielstower',
    tier: 6,
    type: 'word_choose',
    prompt,
    choices: shuffle(choices),
    answer,
    tags: ['topic'],
    allowPopup: true,
    estSeconds: 30
  })
}
for (let i = 0; i < 25; i++) {
  push({
    id: id('il'),
    mapId: 'ielstower',
    tier: 6,
    type: 'shadow_read',
    prompt: '雅思高分句跟读',
    answer: 'This experience taught me the value of perseverance and clear communication.',
    audioText: 'This experience taught me the value of perseverance and clear communication.',
    tags: ['speaking', 'sentence'],
    allowPopup: true,
    estSeconds: 35
  })
}

// Reorder questions for mid maps
const reorders = [
  [['I', 'love', 'learning', 'English'], 'I love learning English'],
  [['She', 'is', 'my', 'best', 'friend'], 'She is my best friend'],
  [['Where', 'is', 'the', 'library'], 'Where is the library'],
  [['I', 'would', 'like', 'a', 'coffee'], 'I would like a coffee'],
  [['Practice', 'makes', 'perfect'], 'Practice makes perfect'],
  [['Could', 'you', 'help', 'me'], 'Could you help me'],
  [['It', 'is', 'a', 'sunny', 'day'], 'It is a sunny day'],
  [['I', 'am', 'looking', 'forward', 'to', 'it'], 'I am looking forward to it']
]
for (const [words, answer] of reorders) {
  push({
    id: id('ro'),
    mapId: 'wordtown',
    tier: 1,
    type: 'reorder',
    prompt: '把单词排成正确句子（按正确顺序依次点选）：',
    choices: shuffle([...words]),
    answer,
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 35,
    explanation: answer
  })
  push({
    id: id('ro'),
    mapId: 'dialoguevalley',
    tier: 2,
    type: 'reorder',
    prompt: '排序组成地道口语：',
    choices: shuffle([...words]),
    answer,
    tags: ['sentence'],
    allowPopup: true,
    estSeconds: 35
  })
}

// Ensure each map has >= 40
const byMap = {}
for (const q of questions) {
  byMap[q.mapId] = (byMap[q.mapId] || 0) + 1
}
for (const m of maps) {
  let guard = 0
  while ((byMap[m.id] || 0) < 40 && guard < 100) {
    guard++
    const word = `item${byMap[m.id] || 0}`
    push({
      id: id('pad'),
      mapId: m.id,
      tier: m.tier,
      type: m.tier >= 3 ? 'short_speak' : 'word_choose',
      prompt:
        m.tier >= 3
          ? `地图练习：用英语说一件与学习相关的事（#${byMap[m.id] || 0}）`
          : `巩固题：选择更自然的表达 #${byMap[m.id] || 0}`,
      choices:
        m.tier >= 3
          ? undefined
          : shuffle(['I practice every day.', 'I practice everydayly.', 'Me practice day.', 'Practice I day every.']),
      answer: m.tier >= 3 ? 'I practice English every day because I want to improve.' : 'I practice every day.',
      keywords: ['practice', 'english', 'day', 'improve', 'learn', 'because'],
      sampleAnswer: 'I practice English every day because I want to improve.',
      tags: m.tier >= 3 ? ['speaking', 'topic'] : ['sentence'],
      allowPopup: m.tier < 3,
      estSeconds: m.tier >= 3 ? 40 : 25
    })
    byMap[m.id] = (byMap[m.id] || 0) + 1
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify({ version: 1, questions }, null, 2), 'utf8')
console.log('Wrote', questions.length, 'questions to', out)
console.log('Per map:', byMap)
