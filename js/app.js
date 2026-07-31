/* ============ LOGIN NETWORK VISUAL ============ */
// Decorative animated background for the login screen; it keeps the current visual identity intact.
(function(){
  const nodesG = document.getElementById('net-nodes');
  const linksG = document.getElementById('net-links');
  const pts = [];
  for(let i=0;i<18;i++){ pts.push({x: 30+Math.random()*340, y: 30+Math.random()*340}); }
  pts.forEach((p,i)=>{
    pts.forEach((q,j)=>{
      if(j>i && Math.hypot(p.x-q.x,p.y-q.y) < 130){
        const l = document.createElementNS('http://www.w3.org/2000/svg','line');
        l.setAttribute('x1',p.x); l.setAttribute('y1',p.y); l.setAttribute('x2',q.x); l.setAttribute('y2',q.y);
        l.setAttribute('class','link');
        linksG.appendChild(l);
      }
    });
  });
  pts.forEach((p,i)=>{
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',p.x); c.setAttribute('cy',p.y); c.setAttribute('r', 3+Math.random()*4);
    c.setAttribute('class','node');
    c.style.animation = `pulse ${2+Math.random()*2}s ease-in-out infinite`;
    c.style.animationDelay = (Math.random()*2)+'s';
    nodesG.appendChild(c);
  });
  const style = document.createElement('style');
  style.textContent = '@keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}';
  document.head.appendChild(style);
})();

/* ============ STATE & ACCESSIBILITY HELPERS ============ */
const state = {
  user: { name: 'Student' },
  stats: { quizzesCompleted: 0, studyHours: 12.5, upcomingAssignments: 3, aiQuestionsAsked: 0 },
  chat: [],
  tasks: [
    { id:1, title:'Submit Lab Report', course:'Organic Chemistry', date: daysFromNow(-1), done:false },
    { id:2, title:'Review ER Diagrams', course:'Database Systems', date: daysFromNow(2), done:false },
    { id:3, title:'Practice Recursion', course:'Java Programming', date: daysFromNow(5), done:false },
  ],
  courses: [
    { name:'Organic Chemistry', progress:64, color:'#2954E5' },
    { name:'Database Systems', progress:80, color:'#0EA5A0' },
    { name:'Java Programming', progress:45, color:'#F59E0B' },
    { name:'Machine Learning', progress:30, color:'#8B5CF6' },
  ],
  studyPlans: []
};
function daysFromNow(n){ const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }

function setFieldState(field, stateName){
  const fieldContainer = field.closest('.field');
  if(!fieldContainer) return;
  fieldContainer.classList.remove('error','success');
  if(stateName === 'error'){
    fieldContainer.classList.add('error');
    field.setAttribute('aria-invalid','true');
  } else if(stateName === 'success'){
    fieldContainer.classList.add('success');
    field.setAttribute('aria-invalid','false');
  } else {
    field.setAttribute('aria-invalid','false');
  }
}

function showFormFeedback(element, message, type){
  if(!element) return;
  element.textContent = message;
  element.className = `form-feedback ${type}`;
}

function clearFormFeedback(element){
  if(!element) return;
  element.textContent = '';
  element.className = 'form-feedback';
}

/* ============ LOGIN ============ */
const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('email');
const loginPasswordInput = document.getElementById('password');
const loginFeedback = document.getElementById('login-feedback');

loginForm.addEventListener('submit', function(e){
  e.preventDefault();

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  clearFormFeedback(loginFeedback);
  setFieldState(loginEmailInput, '');
  setFieldState(loginPasswordInput, '');

  if(!emailPattern.test(email)){
    setFieldState(loginEmailInput, 'error');
    showFormFeedback(loginFeedback, 'Please enter a valid university email address.', 'error');
    loginEmailInput.focus();
    return;
  }

  if(password.length < 6){
    setFieldState(loginPasswordInput, 'error');
    showFormFeedback(loginFeedback, 'Please enter a password with at least 6 characters.', 'error');
    loginPasswordInput.focus();
    return;
  }

  const name = email.split('@')[0] || 'Student';
  state.user.name = name.charAt(0).toUpperCase()+name.slice(1);
  document.getElementById('user-name').textContent = state.user.name;
  document.getElementById('user-avatar').textContent = state.user.name.charAt(0).toUpperCase();
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');
  renderDashboard();
  renderStudyPlanner();
  seedChat();
  document.getElementById('main-content').focus();
});

[loginEmailInput, loginPasswordInput].forEach(input=>{
  input.addEventListener('input', ()=>{
    clearFormFeedback(loginFeedback);
    setFieldState(input, '');
  });
});

/* ============ NAV / VIEWS ============ */
const views = ['dashboard','chat','quiz','planner'];
const titles = { dashboard:'Dashboard', chat:'AI Academic Chat', quiz:'Quiz Generator', planner:'Study Planner' };
document.querySelectorAll('[data-view]').forEach(btn=>{
  btn.addEventListener('click', ()=> switchView(btn.dataset.view));
});
function switchView(v){
  views.forEach(x=>{
    document.getElementById('view-'+x).classList.toggle('active', x===v);
  });
  document.querySelectorAll('.nav-item').forEach(n=>{
    const isActive = n.dataset.view === v;
    n.classList.toggle('active', isActive);
    n.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  document.getElementById('topbar-title').textContent = titles[v];
  document.getElementById('sidebar').classList.remove('mobile-open');
  if(v==='chat') scrollChatToBottom();
  document.getElementById('main-content').focus();
}

/* ============ SIDEBAR COLLAPSE ============ */
const collapseButton = document.getElementById('collapse-btn');
const mobileMenuButton = document.getElementById('mobile-menu-btn');

collapseButton.addEventListener('click', ()=>{
  const sidebar = document.getElementById('sidebar');
  const isCollapsed = sidebar.classList.toggle('collapsed');
  collapseButton.setAttribute('aria-expanded', String(!isCollapsed));
});

mobileMenuButton.addEventListener('click', ()=>{
  const sidebar = document.getElementById('sidebar');
  const isOpen = sidebar.classList.toggle('mobile-open');
  mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
});

document.getElementById('logout-btn').addEventListener('click', ()=>{
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').style.display = 'flex';
  loginEmailInput.value = '';
  loginPasswordInput.value = '';
  clearFormFeedback(loginFeedback);
  setFieldState(loginEmailInput, '');
  setFieldState(loginPasswordInput, '');
  loginEmailInput.focus();
});

/* ============ DASHBOARD ============ */
function renderDashboard(){
  document.getElementById('stat-quizzes').textContent = state.stats.quizzesCompleted;
  document.getElementById('stat-hours').textContent = state.stats.studyHours.toFixed(1);
  document.getElementById('stat-assignments').textContent = state.tasks.filter(t=>!t.done).length;
  document.getElementById('stat-questions').textContent = state.stats.aiQuestionsAsked;

  const cl = document.getElementById('course-list');
  cl.innerHTML = state.courses.map(c=>`
    <div class="course-row">
      <div style="width:34px;height:34px;border-radius:9px;background:${c.color}22;color:${c.color};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">${c.progress}%</div>
      <div style="flex:1;">
        <div style="font-size:13.5px;font-weight:600;margin-bottom:6px;">${c.name}</div>
        <div class="course-bar-bg"><div class="course-bar-fill" style="width:${c.progress}%;background:${c.color};"></div></div>
      </div>
    </div>`).join('');

  const dl = document.getElementById('deadline-list');
  const upcoming = [...state.tasks].filter(t=>!t.done).sort((a,b)=> a.date.localeCompare(b.date)).slice(0,5);
  dl.innerHTML = upcoming.length ? upcoming.map(t=>`
    <div class="task-mini">
      <div style="width:8px;height:8px;border-radius:50%;background:${isOverdue(t.date)?'#E4534B':'#2954E5'};flex-shrink:0;"></div>
      <div style="flex:1;"><div style="font-weight:600;">${t.title}</div><div style="color:var(--text-faint);font-size:12px;">${t.course} Â· ${formatDate(t.date)}</div></div>
    </div>`).join('') : `<p style="color:var(--text-faint);font-size:13px;">No upcoming deadlines. ðŸŽ‰</p>`;
}
function isOverdue(d){ return d < daysFromNow(0); }
function formatDate(d){ const dt = new Date(d+'T00:00:00'); return dt.toLocaleDateString(undefined,{month:'short',day:'numeric'}); }

/* ============ AI ACADEMIC CHAT ============ */
const chatMessagesEl = document.getElementById('chat-messages');
const suggestedWrap = document.getElementById('suggested-wrap');

// Simulated knowledge base â€” deterministic, client-side only, no real API calls.
const KB = {
  'machine learning': {
    text: "Machine Learning (ML) is a branch of AI where systems learn patterns from data instead of following hand-written rules.\n\nâ€¢ Supervised learning â€” trains on labeled examples (input â†’ correct output), e.g. predicting grades from study hours.\nâ€¢ Unsupervised learning â€” finds structure in unlabeled data, e.g. grouping similar students by study habits.\nâ€¢ Reinforcement learning â€” an agent learns by trial and error, guided by rewards.\n\nMost models follow the same loop: collect data â†’ train â†’ evaluate â†’ improve.",
    source: "ML Fundamentals â€” Week 3 slides, Ch. 1â€“2"
  },
  'database normalization': {
    text: "Database normalization organizes tables to reduce redundancy and avoid update anomalies.\n\nâ€¢ 1NF â€” every column holds atomic (indivisible) values, no repeating groups.\nâ€¢ 2NF â€” 1NF, plus every non-key column depends on the whole primary key (not just part of it).\nâ€¢ 3NF â€” 2NF, plus no non-key column depends on another non-key column (no transitive dependency).\n\nIn short: each fact should live in exactly one place.",
    source: "Database Systems â€” Lecture 5, 'Normal Forms'"
  },
  'java': {
    text: "Here's a quick Java quiz to test your basics:\n\n1) What keyword creates a new object?\n   â†’ new\n2) Which loop guarantees at least one execution?\n   â†’ do-while\n3) What does 'public static void main' represent?\n   â†’ the entry point of a Java program\n\nWant a full interactive quiz instead? Head to the Quiz Generator and select 'Programming'.",
    source: "Java Programming â€” Practice Set 2"
  },
  'organic chemistry': {
    text: "In organic chemistry, functional groups determine a molecule's reactivity. For example, an -OH group (alcohol) makes a molecule more polar and able to hydrogen-bond, while a C=O (carbonyl) group is highly reactive toward nucleophiles.\n\nWhen studying reaction mechanisms, always track electron movement with curved arrows â€” it's the fastest way to predict products.",
    source: "Organic Chemistry â€” Unit 4, Functional Groups"
  },
  'default': {
    text: "That's a great question. Based on your course materials, the key idea is to break the concept into smaller parts, connect it to something you already know, and test yourself with a few practice questions.\n\nTry rephrasing your question with a specific topic (e.g. 'Explain recursion in Java' or 'Summarize SQL joins') and I'll pull the most relevant explanation from your materials.",
    source: "General study guidance"
  }
};

function pickResponse(query){
  const q = query.toLowerCase();
  if(q.includes('machine learning')) return KB['machine learning'];
  if(q.includes('normaliz')) return KB['database normalization'];
  if(q.includes('java') || q.includes('quiz')) return KB['java'];
  if(q.includes('organic') || q.includes('chemistry')) return KB['organic chemistry'];
  return KB['default'];
}

function seedChat(){
  chatMessagesEl.innerHTML = '';
  addMessage('ai', "Hi " + state.user.name + "! I'm your AI Academic Assistant. Ask me about any topic in your courses, or tap a suggestion below to get started.", "General study guidance", false);
}

function nowTime(){
  return new Date().toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
}

function addMessage(role, text, source, animate){
  const row = document.createElement('div');
  row.className = 'msg-row ' + role;
  const avatar = role === 'ai' ? 'ðŸ¤–' : (state.user.name.charAt(0).toUpperCase() || 'S');
  row.innerHTML = `
    <div class="msg-avatar ${role}">${avatar}</div>
    <div class="msg-bubble-col">
      <div class="msg-bubble">${escapeHtml(text)}</div>
      ${role==='ai' ? `<div class="msg-source">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        Based on uploaded course materials â€” ${escapeHtml(source||'General')}
      </div>` : `<div class="msg-time" style="text-align:right;">${nowTime()}</div>`}
    </div>`;
  chatMessagesEl.appendChild(row);
  scrollChatToBottom();
}
function escapeHtml(s){
  const div = document.createElement('div'); div.textContent = s; return div.innerHTML;
}
function scrollChatToBottom(){
  requestAnimationFrame(()=>{ chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight; });
}

let typingRow = null;
function showTyping(){
  typingRow = document.createElement('div');
  typingRow.className = 'typing-row';
  typingRow.innerHTML = `
    <div class="msg-avatar ai">ðŸ¤–</div>
    <div class="typing-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  chatMessagesEl.appendChild(typingRow);
  scrollChatToBottom();
}
function hideTyping(){
  if(typingRow){ typingRow.remove(); typingRow = null; }
}

function sendUserMessage(text){
  if(!text.trim()) return;
  addMessage('user', text.trim());
  state.stats.aiQuestionsAsked++;
  renderDashboard();
  document.getElementById('send-btn').disabled = true;
  document.getElementById('chat-input').disabled = true;
  showTyping();
  const delay = 900 + Math.random()*900;
  setTimeout(()=>{
    hideTyping();
    const resp = pickResponse(text);
    addMessage('ai', resp.text, resp.source);
    document.getElementById('send-btn').disabled = false;
    document.getElementById('chat-input').disabled = false;
    document.getElementById('chat-input').focus();
  }, delay);
}

document.getElementById('chat-form').addEventListener('submit', function(e){
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value;
  input.value = '';
  sendUserMessage(text);
});
document.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click', ()=> sendUserMessage(chip.dataset.q));
});
document.getElementById('clear-chat-btn').addEventListener('click', ()=>{
  seedChat();
});

/* ============ QUIZ GENERATOR ============ */
// Simulated question bank â€” fully client-side, no backend or API calls.
const QUIZ_BANK = {
  'Programming': [
    { q:"What keyword is used to create a new object in Java?", options:["new","create","object","make"], correct:0 },
    { q:"Which data structure uses LIFO (Last In, First Out) ordering?", options:["Queue","Stack","Array","Linked List"], correct:1 },
    { q:"What is the time complexity of binary search on a sorted array?", options:["O(n)","O(nÂ²)","O(log n)","O(1)"], correct:2 },
    { q:"Which loop is guaranteed to execute its body at least once?", options:["for","while","do-while","foreach"], correct:2 },
    { q:"What does 'recursion' mean in programming?", options:["A loop that never ends","A function calling itself","A variable that changes type","A sorting algorithm"], correct:1 },
  ],
  'Database': [
    { q:"What does SQL stand for?", options:["Structured Query Language","Simple Query Logic","Sequential Query List","Structured Question Language"], correct:0 },
    { q:"Which normal form requires atomic column values?", options:["2NF","3NF","1NF","BCNF"], correct:2 },
    { q:"What type of key uniquely identifies each row in a table?", options:["Foreign key","Primary key","Composite key","Index key"], correct:1 },
    { q:"Which SQL clause is used to filter grouped results?", options:["WHERE","HAVING","FILTER","GROUP"], correct:1 },
    { q:"What does a JOIN operation do?", options:["Deletes rows from a table","Combines rows from two or more tables","Creates a new database","Sorts a table"], correct:1 },
  ],
  'Artificial Intelligence': [
    { q:"Which learning type trains a model using labeled data?", options:["Unsupervised learning","Supervised learning","Reinforcement learning","Semi-random learning"], correct:1 },
    { q:"What is 'overfitting' in machine learning?", options:["The model is too simple","The model memorizes training data but fails to generalize","The model trains too quickly","The dataset is too small"], correct:1 },
    { q:"What does a neural network's 'activation function' do?", options:["Stores training data","Introduces non-linearity into the model","Deletes unused neurons","Compresses the dataset"], correct:1 },
    { q:"What is the purpose of a loss function?", options:["To measure error between predictions and actual values","To visualize data","To store model weights","To clean the dataset"], correct:0 },
    { q:"Which of these is a common application of AI?", options:["Spreadsheet formatting","Natural language processing","File compression","Screen resolution scaling"], correct:1 },
  ],
  'Web Development': [
    { q:"What does HTML stand for?", options:["Hyper Trainer Marking Language","HyperText Markup Language","Hyper Text Modern Layout","Home Tool Markup Language"], correct:1 },
    { q:"Which CSS property changes text color?", options:["font-color","text-style","color","background-color"], correct:2 },
    { q:"What does the DOM represent in a web page?", options:["A styling framework","A structured object representation of the page","A database of user data","A server-side script"], correct:1 },
    { q:"Which HTTP method is typically used to submit form data to create a resource?", options:["GET","POST","DELETE","HEAD"], correct:1 },
    { q:"What is JavaScript primarily used for?", options:["Styling pages","Adding interactivity and logic to web pages","Structuring page content","Storing databases"], correct:1 },
  ]
};

let currentQuiz = null; // { subject, questions:[{q,options,correct}], answers:[null,...] }

document.querySelectorAll('.subject-opt').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.subject-opt').forEach(b=> b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('generate-quiz-btn').disabled = false;
    document.getElementById('generate-quiz-btn').dataset.subject = btn.dataset.subject;
  });
});

document.getElementById('generate-quiz-btn').addEventListener('click', function(){
  const subject = this.dataset.subject;
  if(!subject) return;
  const pool = QUIZ_BANK[subject];
  currentQuiz = {
    subject,
    questions: pool.map(q=> ({ ...q })),
    answers: new Array(pool.length).fill(null),
    submitted: false
  };
  document.getElementById('quiz-setup-wrap').style.display = 'none';
  document.getElementById('quiz-result-wrap').style.display = 'none';
  document.getElementById('quiz-play-wrap').style.display = 'block';
  renderQuiz();
});

function renderQuiz(){
  const wrap = document.getElementById('quiz-play-wrap');
  const total = currentQuiz.questions.length;
  const answeredCount = currentQuiz.answers.filter(a=> a!==null).length;

  const cardsHtml = currentQuiz.questions.map((q,qi)=>{
    const picked = currentQuiz.answers[qi];
    const optionsHtml = q.options.map((opt,oi)=>{
      let cls = 'q-option-label';
      let tag = '';
      if(currentQuiz.submitted){
        cls += ' disabled';
        if(oi===q.correct){ cls += ' opt-correct'; tag = '<span class="opt-tag">âœ“ Correct</span>'; }
        else if(oi===picked){ cls += ' opt-wrong'; tag = '<span class="opt-tag">âœ• Your answer</span>'; }
      } else if(picked===oi){
        cls += ' picked';
      }
      return `<label class="${cls}">
        <input type="radio" name="q${qi}" value="${oi}" ${picked===oi?'checked':''} ${currentQuiz.submitted?'disabled':''}>
        <span>${escapeHtml(opt)}</span>${tag}
      </label>`;
    }).join('');

    let gradedClass = '';
    let noteHtml = '';
    if(currentQuiz.submitted){
      const isCorrect = picked===q.correct;
      gradedClass = isCorrect ? ' graded-correct' : ' graded-wrong';
      if(!isCorrect){
        noteHtml = `<div class="q-correct-note">Correct answer: <strong>${escapeHtml(q.options[q.correct])}</strong>${picked===null ? ' â€” you left this unanswered.' : ''}</div>`;
      }
    }

    return `
    <div class="q-card${gradedClass}">
      <div class="q-index">Question ${qi+1} of ${total}</div>
      <h3 style="margin-bottom:14px; font-size:15.5px;">${escapeHtml(q.q)}</h3>
      <div class="quiz-options-group" data-qi="${qi}">${optionsHtml}</div>
      ${noteHtml}
    </div>`;
  }).join('');

  const progressHtml = `
    <div class="quiz-progress-wrap">
      <div class="quiz-progress-label"><span>${currentQuiz.subject}</span><span>${answeredCount} of ${total} answered</span></div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(answeredCount/total)*100}%;"></div></div>
    </div>`;

  const actionHtml = currentQuiz.submitted ? '' : `
    <button class="btn-solid" id="submit-quiz-btn" style="width:100%;" ${answeredCount<total?'disabled':''}>Submit Quiz</button>`;

  wrap.innerHTML = progressHtml + cardsHtml + actionHtml;

  if(!currentQuiz.submitted){
    wrap.querySelectorAll('.quiz-options-group').forEach(group=>{
      const qi = parseInt(group.dataset.qi,10);
      group.querySelectorAll('input[type=radio]').forEach(radio=>{
        radio.addEventListener('change', ()=>{
          currentQuiz.answers[qi] = parseInt(radio.value,10);
          renderQuiz();
        });
      });
    });
    const submitBtn = document.getElementById('submit-quiz-btn');
    if(submitBtn) submitBtn.addEventListener('click', submitQuiz);
  }
}

function submitQuiz(){
  currentQuiz.submitted = true;
  const total = currentQuiz.questions.length;
  const score = currentQuiz.questions.reduce((acc,q,qi)=> acc + (currentQuiz.answers[qi]===q.correct ? 1 : 0), 0);
  currentQuiz.score = score;
  state.stats.quizzesCompleted++;
  renderDashboard();
  renderQuiz();
  showQuizResult(score, total);
}

function showQuizResult(score, total){
  const pct = Math.round((score/total)*100);
  const resultWrap = document.getElementById('quiz-result-wrap');
  resultWrap.style.display = 'block';
  resultWrap.style.marginTop = '20px';
  resultWrap.innerHTML = `
    <div class="quiz-score-card">
      <div class="score-ring" style="--pct:${pct};">
        <div class="score-ring-inner">${pct}%<small>${score}/${total} correct</small></div>
      </div>
      <h3 style="font-size:19px;">Quiz Complete â€” ${escapeHtml(currentQuiz.subject)}</h3>
      <p style="color:var(--text-soft); font-size:13.5px; margin-top:6px;">You answered ${score} out of ${total} questions correctly.</p>
      ${pct > 80 ? `<div class="success-banner">ðŸŽ‰ Excellent work! You've mastered this topic.</div>` : ''}
      <button class="btn-solid" id="try-again-btn" style="margin-top:20px;">Try Again</button>
    </div>`;
  resultWrap.scrollIntoView({ behavior:'smooth', block:'nearest' });
  document.getElementById('try-again-btn').addEventListener('click', resetQuiz);
}

function resetQuiz(){
  currentQuiz = null;
  document.querySelectorAll('.subject-opt').forEach(b=> b.classList.remove('selected'));
  document.getElementById('generate-quiz-btn').disabled = true;
  delete document.getElementById('generate-quiz-btn').dataset.subject;
  document.getElementById('quiz-play-wrap').style.display = 'none';
  document.getElementById('quiz-play-wrap').innerHTML = '';
  document.getElementById('quiz-result-wrap').style.display = 'none';
  document.getElementById('quiz-result-wrap').innerHTML = '';
  document.getElementById('quiz-setup-wrap').style.display = 'block';
}

/* ============ STUDY PLANNER ============ */
// Simulated 7-day plan generator â€” fully client-side, no backend or API calls.
const TOPIC_TEMPLATE = [
  "Introduction & Core Concepts",
  "Key Definitions & Terminology",
  "Practice Problems â€” Basics",
  "Deep Dive: Advanced Topics",
  "Past Papers / Sample Questions",
  "Weak Areas Review & Revision",
  "Final Recap & Mock Test"
];
const SUBJECT_ICONS = ['ðŸ“˜','ðŸ§ª','ðŸ’»','ðŸ—„ï¸','ðŸ¤–','ðŸŒ','ðŸ“','ðŸ§¬','ðŸ“Š','ðŸŒ'];
let planIdSeq = 1;

const plannerFeedback = document.getElementById('planner-feedback');
const plannerSubjectInput = document.getElementById('plan-subject');
const plannerExamDateInput = document.getElementById('plan-exam-date');
const plannerHoursInput = document.getElementById('plan-daily-hours');
const plannerPrioritySelect = document.getElementById('plan-priority');

[plannerSubjectInput, plannerExamDateInput, plannerHoursInput, plannerPrioritySelect].forEach(input=>{
  input.addEventListener('input', ()=>{
    clearFormFeedback(plannerFeedback);
    setFieldState(input, '');
  });
  input.addEventListener('change', ()=>{
    clearFormFeedback(plannerFeedback);
    setFieldState(input, '');
  });
});

document.getElementById('generate-plan-btn').addEventListener('click', ()=>{
  const subject = plannerSubjectInput.value.trim();
  const examDate = plannerExamDateInput.value;
  const dailyHours = parseFloat(plannerHoursInput.value);
  const priority = plannerPrioritySelect.value;

  clearFormFeedback(plannerFeedback);
  setFieldState(plannerSubjectInput, '');
  setFieldState(plannerExamDateInput, '');
  setFieldState(plannerHoursInput, '');

  if(!subject){
    setFieldState(plannerSubjectInput, 'error');
    showFormFeedback(plannerFeedback, 'Please enter a subject name.', 'error');
    plannerSubjectInput.focus();
    return;
  }

  if(!examDate){
    setFieldState(plannerExamDateInput, 'error');
    showFormFeedback(plannerFeedback, 'Please choose an exam date.', 'error');
    plannerExamDateInput.focus();
    return;
  }

  if(!Number.isFinite(dailyHours) || dailyHours < 0.5 || dailyHours > 12){
    setFieldState(plannerHoursInput, 'error');
    showFormFeedback(plannerFeedback, 'Please enter between 0.5 and 12 study hours.', 'error');
    plannerHoursInput.focus();
    return;
  }

  const schedule = TOPIC_TEMPLATE.map((topic,i)=> ({
    day: i+1,
    date: daysFromNow(i),
    topic: `${subject}: ${topic}`,
    hours: dailyHours,
    status: 'Pending'
  }));

  state.studyPlans.push({
    id: planIdSeq++,
    subject, examDate, dailyHours, priority,
    icon: SUBJECT_ICONS[(planIdSeq-1) % SUBJECT_ICONS.length],
    schedule
  });

  plannerSubjectInput.value = '';
  plannerExamDateInput.value = '';
  plannerHoursInput.value = 2;
  setFieldState(plannerSubjectInput, 'success');
  setFieldState(plannerExamDateInput, 'success');
  setFieldState(plannerHoursInput, 'success');
  showFormFeedback(plannerFeedback, 'Study plan created successfully.', 'success');
  renderStudyPlanner();
});

function renderStudyPlanner(){
  const plans = state.studyPlans;

  // Summary stat cards
  document.getElementById('plan-stat-subjects').textContent = plans.length;
  const totalHours = plans.reduce((sum,p)=> sum + p.schedule.reduce((s,d)=> s + d.hours, 0), 0);
  document.getElementById('plan-stat-hours').textContent = totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1);
  const today = daysFromNow(0);
  const upcomingExams = plans.map(p=> Math.ceil((new Date(p.examDate) - new Date(today)) / 86400000)).filter(d=> d>=0);
  document.getElementById('plan-stat-days').textContent = upcomingExams.length ? Math.min(...upcomingExams) : 'â€”';

  // Overall completion progress (hour-weighted)
  let totalPlannedHours = 0, completedHours = 0;
  plans.forEach(p=> p.schedule.forEach(d=>{
    totalPlannedHours += d.hours;
    if(d.status === 'Completed') completedHours += d.hours;
  }));
  const pct = totalPlannedHours > 0 ? Math.round((completedHours/totalPlannedHours)*100) : 0;
  document.getElementById('planner-progress-pct').textContent = pct + '%';
  document.getElementById('planner-progress-bar-fill').style.width = pct + '%';

  const motivEl = document.getElementById('planner-motivation');
  if(pct === 0){
    motivEl.innerHTML = '';
  } else if(pct >= 100){
    motivEl.innerHTML = `<div class="motivation-banner">ðŸŽ‰ All sessions complete â€” you're fully prepared for your exam!</div>`;
  } else {
    motivEl.innerHTML = `<div class="motivation-banner">ðŸ’ª Great job! Stay consistent and you'll be ready for your exam.</div>`;
  }

  // Plan cards
  const wrap = document.getElementById('plan-cards-wrap');
  if(!plans.length){
    wrap.innerHTML = `<div class="planner-empty">No study plans yet â€” fill out the form above and click <strong>Generate Study Plan</strong> to build your first 7-day schedule.</div>`;
    return;
  }
  wrap.innerHTML = plans.map(p=>{
    const done = p.schedule.filter(d=> d.status==='Completed').length;
    const planPct = Math.round((done/p.schedule.length)*100);
    const daysLeft = Math.ceil((new Date(p.examDate) - new Date(today)) / 86400000);
    const daysLeftLabel = daysLeft >= 0 ? `${daysLeft} day${daysLeft===1?'':'s'} left` : 'Exam date passed';

    const rows = p.schedule.map((d,i)=> `
      <tr class="${d.status==='Completed' ? 'completed' : ''}">
        <td>Day ${d.day}</td>
        <td class="topic-cell">${escapeHtml(d.topic)}</td>
        <td>${d.hours}h</td>
        <td><span class="status-pill ${d.status==='Completed' ? 'completed' : 'pending'}">${d.status==='Completed' ? 'âœ“ Completed' : 'â³ Pending'}</span></td>
        <td><button class="mark-complete-btn ${d.status==='Completed' ? 'is-done' : ''}" data-plan="${p.id}" data-day="${i}">${d.status==='Completed' ? 'Undo' : 'Mark Completed'}</button></td>
      </tr>`).join('');

    return `
    <div class="plan-card">
      <div class="plan-card-header">
        <div class="plan-card-title">
          <div class="plan-subject-icon">${p.icon}</div>
          <div>
            <div class="plan-subject-name">${escapeHtml(p.subject)}</div>
            <div class="plan-subject-meta">Exam: ${formatDate(p.examDate)} Â· ${daysLeftLabel}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="priority-badge priority-${p.priority}">${p.priority}</span>
          <button class="plan-remove-btn" data-remove-plan="${p.id}" title="Remove plan" aria-label="Remove plan">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
          </button>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div class="plan-mini-bar-bg"><div class="plan-mini-bar-fill" style="width:${planPct}%;"></div></div>
        <span style="font-size:12px; color:var(--text-faint); font-weight:600; white-space:nowrap;">${done}/${p.schedule.length} sessions</span>
      </div>
      <div style="overflow-x:auto;">
        <table class="schedule-table">
          <thead><tr><th>Day</th><th>Topic to Study</th><th>Hours</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }).join('');

  wrap.querySelectorAll('.mark-complete-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const plan = state.studyPlans.find(p=> p.id == btn.dataset.plan);
      const day = plan.schedule[parseInt(btn.dataset.day,10)];
      day.status = day.status === 'Completed' ? 'Pending' : 'Completed';
      renderStudyPlanner();
      renderDashboard();
    });
  });
  wrap.querySelectorAll('[data-remove-plan]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.studyPlans = state.studyPlans.filter(p=> p.id != btn.dataset.removePlan);
      renderStudyPlanner();
      renderDashboard();
    });
  });
}
