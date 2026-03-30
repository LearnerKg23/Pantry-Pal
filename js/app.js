// ═══════════════════════════════════════════════
// DATA STORE
// ═══════════════════════════════════════════════
let state = {
  currentUser: null,
  currentPage: 'home',
  prevPage: null,
  selectedRecipeId: null,
  currentStep: 1,
  selectedPantryIng: null,
  searchHistory: [],
  pendingIngRows: [{name:'', qty:'', unit:'cups', notes:''}]
};

const SAMPLE_DATA = {
  users: [
    { id:1, email:'admin@pantrypal.com', password:'admin123', fullName:'Admin Chef', isStaff:true },
    { id:2, email:'jane@example.com',    password:'jane123',  fullName:'Jane Smith',  isStaff:false },
    { id:3, email:'marcos@example.com',  password:'marcos123',fullName:'Marcos Rivera',isStaff:false }
  ],
  tags: ['vegetarian','vegan','gluten-free','quick','spicy','comfort food','healthy','keto','dairy-free','Italian','Indian','Asian'],
  ingredients: [
    {id:1,name:'Pasta',category:'Grains'},{id:2,name:'Garlic',category:'Vegetables'},
    {id:3,name:'Olive Oil',category:'Condiments'},{id:4,name:'Tomatoes',category:'Vegetables'},
    {id:5,name:'Onion',category:'Vegetables'},{id:6,name:'Chicken',category:'Proteins'},
    {id:7,name:'Heavy Cream',category:'Dairy'},{id:8,name:'Parmesan',category:'Dairy'},
    {id:9,name:'Basil',category:'Spices'},{id:10,name:'Salt',category:'Spices'},
    {id:11,name:'Black Pepper',category:'Spices'},{id:12,name:'Butter',category:'Dairy'},
    {id:13,name:'Eggs',category:'Proteins'},{id:14,name:'Rice',category:'Grains'},
    {id:15,name:'Cumin',category:'Spices'},{id:16,name:'Coconut Milk',category:'Dairy'},
    {id:17,name:'Lemon',category:'Fruits'},{id:18,name:'Ginger',category:'Spices'},
    {id:19,name:'Soy Sauce',category:'Condiments'},{id:20,name:'Bell Pepper',category:'Vegetables'}
  ],
  recipes: [
    {
      id:1,title:'Creamy Tuscan Pasta',cuisine:'Italian',prepTime:25,calories:520,
      emoji:'🍝',status:'approved',authorId:2,authorName:'Jane Smith',
      instructions:'Boil pasta until al dente.\nSauté garlic in olive oil until fragrant.\nAdd sun-dried tomatoes and heavy cream.\nSimmer for 5 minutes.\nToss pasta in the sauce.\nFinish with fresh basil and parmesan.',
      ingredients:[{id:1,name:'Pasta',qty:'300',unit:'grams'},{id:2,name:'Garlic',qty:'4',unit:'cloves'},
        {id:3,name:'Olive Oil',qty:'3',unit:'tbsp'},{id:7,name:'Heavy Cream',qty:'200',unit:'ml'},
        {id:8,name:'Parmesan',qty:'50',unit:'grams'},{id:9,name:'Basil',qty:'1',unit:'handful'}],
      tags:['Italian','comfort food','vegetarian'],rating:4.7,reviewCount:23,
      reviews:[
        {id:1,author:'Marcos Rivera',rating:5,comment:'Absolutely delicious! The cream sauce is perfect.',date:'2 days ago'},
        {id:2,author:'Sara Chen',rating:4,comment:'Really tasty, I added some spinach for extra greens.',date:'1 week ago'}
      ]
    },
    {
      id:2,title:'Butter Chicken',cuisine:'Indian',prepTime:45,calories:680,
      emoji:'🍛',status:'approved',authorId:3,authorName:'Marcos Rivera',
      instructions:'Marinate chicken in yogurt and spices for 30 min.\nGrill or pan-fry chicken until cooked.\nMake tomato-butter sauce with onions and cream.\nAdd cooked chicken to sauce.\nSimmer 10 minutes.\nGarnish with cream and cilantro.',
      ingredients:[{id:6,name:'Chicken',qty:'500',unit:'grams'},{id:4,name:'Tomatoes',qty:'4',unit:'pieces'},
        {id:12,name:'Butter',qty:'3',unit:'tbsp'},{id:16,name:'Coconut Milk',qty:'200',unit:'ml'},
        {id:15,name:'Cumin',qty:'1',unit:'tsp'},{id:18,name:'Ginger',qty:'1',unit:'tbsp'}],
      tags:['Indian','spicy','comfort food'],rating:4.9,reviewCount:47,
      reviews:[{id:3,author:'Lisa Park',rating:5,comment:'Better than any restaurant! So rich and flavorful.',date:'3 days ago'}]
    },
    {
      id:3,title:'Avocado Toast',cuisine:'American',prepTime:10,calories:290,
      emoji:'🥑',status:'approved',authorId:2,authorName:'Jane Smith',
      instructions:'Toast sourdough bread slices.\nMash avocado with lemon juice.\nSeason with salt and red pepper flakes.\nSpread avocado on toast.\nTop with poached egg.\nDrizzle olive oil and serve.',
      ingredients:[{id:17,name:'Lemon',qty:'1',unit:'pieces'},{id:3,name:'Olive Oil',qty:'1',unit:'tbsp'},
        {id:13,name:'Eggs',qty:'2',unit:'pieces'},{id:10,name:'Salt',qty:'1',unit:'pinch'}],
      tags:['quick','healthy','vegetarian'],rating:4.2,reviewCount:15,reviews:[]
    },
    {
      id:4,title:'Chicken Fried Rice',cuisine:'Chinese',prepTime:20,calories:420,
      emoji:'🍳',status:'approved',authorId:3,authorName:'Marcos Rivera',
      instructions:'Cook rice and let it cool completely.\nScramble eggs in wok.\nAdd garlic, ginger and vegetables.\nAdd rice and stir-fry on high heat.\nSeason with soy sauce.\nGarnish with spring onions.',
      ingredients:[{id:14,name:'Rice',qty:'300',unit:'grams'},{id:6,name:'Chicken',qty:'200',unit:'grams'},
        {id:13,name:'Eggs',qty:'3',unit:'pieces'},{id:19,name:'Soy Sauce',qty:'3',unit:'tbsp'},
        {id:2,name:'Garlic',qty:'3',unit:'cloves'},{id:20,name:'Bell Pepper',qty:'1',unit:'pieces'}],
      tags:['Asian','quick'],rating:4.5,reviewCount:31,reviews:[]
    },
    {
      id:5,title:'Greek Salad',cuisine:'Mediterranean',prepTime:15,calories:220,
      emoji:'🥗',status:'approved',authorId:2,authorName:'Jane Smith',
      instructions:'Chop tomatoes, cucumber and red onion.\nAdd olives and crumbled feta.\nDress with olive oil, lemon juice, oregano.\nToss gently and serve immediately.',
      ingredients:[{id:4,name:'Tomatoes',qty:'3',unit:'pieces'},{id:3,name:'Olive Oil',qty:'4',unit:'tbsp'},
        {id:17,name:'Lemon',qty:'1',unit:'pieces'},{id:10,name:'Salt',qty:'1',unit:'pinch'}],
      tags:['healthy','vegetarian','quick'],rating:4.3,reviewCount:19,reviews:[]
    },
    {
      id:6,title:'Mushroom Risotto',cuisine:'Italian',prepTime:40,calories:460,
      emoji:'🍄',status:'approved',authorId:3,authorName:'Marcos Rivera',
      instructions:'Sauté shallots in butter until soft.\nToast arborio rice for 2 minutes.\nAdd white wine and stir until absorbed.\nAdd warm broth ladle by ladle, stirring constantly.\nFold in parmesan and butter.\nSeason and serve immediately.',
      ingredients:[{id:12,name:'Butter',qty:'50',unit:'grams'},{id:8,name:'Parmesan',qty:'80',unit:'grams'},
        {id:2,name:'Garlic',qty:'2',unit:'cloves'},{id:5,name:'Onion',qty:'1',unit:'pieces'}],
      tags:['Italian','vegetarian','comfort food'],rating:4.8,reviewCount:28,reviews:[]
    },
    {
      id:7,title:'Tacos al Pastor',cuisine:'Mexican',prepTime:30,calories:380,
      emoji:'🌮',status:'pending',authorId:2,authorName:'Jane Smith',
      instructions:'Marinate pork in achiote and pineapple.\nGrill until caramelized.\nWarm tortillas.\nAssemble with salsa, onion, cilantro.\nServe with lime.',
      ingredients:[{id:5,name:'Onion',qty:'1',unit:'pieces'},{id:17,name:'Lemon',qty:'2',unit:'pieces'}],
      tags:['Mexican','spicy'],rating:0,reviewCount:0,reviews:[]
    }
  ],
  pantry: [
    {id:1,ingId:1,name:'Pasta',qty:'400',unit:'grams'},
    {id:2,ingId:2,name:'Garlic',qty:'6',unit:'cloves'},
    {id:3,ingId:3,name:'Olive Oil',qty:'1',unit:'cups'}
  ]
};

let db = JSON.parse(JSON.stringify(SAMPLE_DATA));
let nextRecipeId = 8;
let nextIngId = 21;
let nextPantryId = 4;

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
function navigate(page) {
  state.prevPage = state.currentPage;
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if(page==='home') document.querySelectorAll('.nav-link')[0].classList.add('active');
  if(page==='create') document.querySelectorAll('.nav-link')[1].classList.add('active');
  if(page==='my-recipes') document.querySelectorAll('.nav-link')[2].classList.add('active');
  if(page==='pantry') document.querySelectorAll('.nav-link')[3].classList.add('active');
  window.scrollTo(0,0);
  if(page==='home') renderHome();
  if(page==='my-recipes') renderMyRecipes();
  if(page==='pantry') renderPantry();
  if(page==='admin') renderAdmin();
  if(page==='create') { state.currentStep=1; renderStep(); resetCreateForm(); }
  if(page==='search') renderSearchPage();
}

function requireAuth(page) {
  if(!state.currentUser) { navigate('login'); return; }
  navigate(page);
}

function goBack() { navigate(state.prevPage || 'home'); }

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
function updateNavAuth() {
  const a = document.getElementById('nav-actions');
  const adminLink = document.getElementById('admin-nav-link');
  if(state.currentUser) {
    a.innerHTML = `<div class="user-avatar" onclick="showUserMenu()" title="${state.currentUser.fullName}">${state.currentUser.fullName.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
    <button class="btn btn-secondary btn-sm" onclick="doLogout()">Sign Out</button>`;
    adminLink.style.display = state.currentUser.isStaff ? 'block' : 'none';
  } else {
    a.innerHTML = `<button class="btn btn-secondary btn-sm" onclick="navigate('login')">Sign In</button>
    <button class="btn btn-primary btn-sm" onclick="navigate('register')">Get Started</button>`;
    adminLink.style.display = 'none';
  }
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const user = db.users.find(u => u.email === email && u.password === pass);
  if(!user) {
    document.getElementById('login-alert').innerHTML = '<div class="alert alert-error">Invalid email or password.</div>';
    return;
  }
  state.currentUser = user;
  updateNavAuth();
  showToast(`Welcome back, ${user.fullName.split(' ')[0]}! 👋`);
  navigate('home');
}

function demoLogin(type) {
  const user = type==='admin' ? db.users[0] : db.users[1];
  state.currentUser = user;
  updateNavAuth();
  showToast(`Signed in as ${user.fullName} 👋`);
  navigate('home');
}

function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  if(!name || !email || !pass) {
    document.getElementById('register-alert').innerHTML = '<div class="alert alert-error">Please fill in all fields.</div>';
    return;
  }
  if(db.users.find(u=>u.email===email)) {
    document.getElementById('register-alert').innerHTML = '<div class="alert alert-error">An account with this email already exists.</div>';
    return;
  }
  const newUser = {id: db.users.length+1, email, password:pass, fullName:name, isStaff:false};
  db.users.push(newUser);
  state.currentUser = newUser;
  updateNavAuth();
  showToast(`Welcome to PantryPal, ${name.split(' ')[0]}! 🎉`);
  navigate('home');
}

function doLogout() {
  state.currentUser = null;
  updateNavAuth();
  showToast('Signed out. See you soon!');
  navigate('home');
}

// ═══════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════
function renderHome() {
  const cuisines = [...new Set(db.recipes.filter(r=>r.status==='approved').map(r=>r.cuisine))];
  const fc = document.getElementById('cuisine-filters');
  fc.innerHTML = `<span style="font-size:13px;font-weight:700;color:var(--text-muted);margin-right:4px;">Cuisine:</span>
    <div class="filter-pill active" onclick="filterCuisine(this,'')">All</div>
    ${cuisines.map(c=>`<div class="filter-pill" onclick="filterCuisine(this,'${c}')">${c}</div>`).join('')}`;
  renderRecipeGrid(db.recipes.filter(r=>r.status==='approved'), 'home-recipe-grid');
}

function filterCuisine(el, cuisine) {
  document.querySelectorAll('.filter-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  const filtered = cuisine ? db.recipes.filter(r=>r.status==='approved'&&r.cuisine===cuisine)
                           : db.recipes.filter(r=>r.status==='approved');
  renderRecipeGrid(filtered, 'home-recipe-grid');
}

function renderRecipeGrid(recipes, containerId) {
  const el = document.getElementById(containerId);
  if(!recipes.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🍽️</div><h3>No recipes found</h3><p>Try a different search or filter.</p></div>`;
    return;
  }
  el.innerHTML = recipes.map(r => `
    <div class="recipe-card" onclick="openRecipe(${r.id})">
      <div class="recipe-card-img">${r.emoji || '🍽️'}</div>
      <div class="recipe-card-body">
        <div class="recipe-card-cuisine">${r.cuisine}</div>
        <div class="recipe-card-title">${r.title}</div>
        <div class="recipe-card-meta">
          <span>⏱ ${r.prepTime} min</span>
          ${r.calories ? `<span>🔥 ${r.calories} cal</span>` : ''}
          ${r.rating > 0 ? `<span><span class="stars">★</span> ${r.rating.toFixed(1)} (${r.reviewCount})</span>` : '<span>No reviews yet</span>'}
        </div>
        <div class="recipe-card-tags">${(r.tags||[]).slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════
// RECIPE DETAIL
// ═══════════════════════════════════════════════
function openRecipe(id) {
  const r = db.recipes.find(r=>r.id===id);
  if(!r) return;
  state.selectedRecipeId = id;
  const steps = r.instructions.split('\n').filter(s=>s.trim());
  const avgRating = r.reviews.length ? (r.reviews.reduce((s,rv)=>s+rv.rating,0)/r.reviews.length).toFixed(1) : 'No reviews';
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-hero">
      <div class="detail-hero-img">${r.emoji||'🍽️'}</div>
      <div class="detail-hero-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
          <h1>${r.title}</h1>
          <span class="badge badge-${r.status}">${r.status.charAt(0).toUpperCase()+r.status.slice(1)}</span>
        </div>
        <div class="detail-meta">
          <div class="detail-meta-item"><span class="label">Cuisine</span><span class="value">${r.cuisine}</span></div>
          <div class="detail-meta-item"><span class="label">Prep Time</span><span class="value">${r.prepTime} min</span></div>
          ${r.calories ? `<div class="detail-meta-item"><span class="label">Calories</span><span class="value">${r.calories} kcal</span></div>` : ''}
          <div class="detail-meta-item"><span class="label">Rating</span><span class="value">★ ${avgRating}${r.reviews.length ? ` (${r.reviews.length})` : ''}</span></div>
          <div class="detail-meta-item"><span class="label">By</span><span class="value">${r.authorName}</span></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${(r.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="detail-grid">
      <div>
        <div class="section-card">
          <h3>Ingredients</h3>
          ${r.ingredients.map(i=>`
            <div class="ingredient-row">
              <span class="ingredient-name">${i.name}</span>
              <span class="ingredient-qty">${i.qty} ${i.unit}</span>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div class="section-card">
          <h3>Instructions</h3>
          <ol class="instructions-list">
            ${steps.map((s,i)=>`<li><span class="step-num">${i+1}</span><span>${s}</span></li>`).join('')}
          </ol>
        </div>
        <div class="section-card">
          <h3>Reviews (${r.reviews.length})</h3>
          ${r.reviews.length ? r.reviews.map(rv=>`
            <div class="review-item">
              <div class="review-header">
                <span class="reviewer-name">${rv.author}</span>
                <div>
                  <span class="stars">${'★'.repeat(rv.rating)}<span style="color:#ddd">${'★'.repeat(5-rv.rating)}</span></span>
                  <span class="review-date" style="margin-left:8px">${rv.date}</span>
                </div>
              </div>
              <div class="review-text">${rv.comment}</div>
            </div>`).join('') : '<p style="color:var(--text-muted);font-size:14px">No reviews yet. Be the first to review!</p>'}
          ${state.currentUser ? `
          <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--bg)">
            <h4 style="font-size:16px;margin-bottom:14px;font-family:'Nunito',sans-serif;font-weight:700">Write a Review</h4>
            <div style="display:flex;gap:6px;margin-bottom:12px" id="star-pick">
              ${[1,2,3,4,5].map(n=>`<span style="font-size:24px;cursor:pointer;color:#ddd" onclick="pickStar(${n})" data-star="${n}">★</span>`).join('')}
            </div>
            <div class="form-group"><textarea id="review-text" rows="3" placeholder="Share your experience with this recipe…"></textarea></div>
            <button class="btn btn-primary btn-sm" onclick="submitReview(${r.id})">Post Review</button>
          </div>` : `<p style="margin-top:16px;font-size:14px;color:var(--text-muted)"><a onclick="navigate('login')" style="color:var(--primary);cursor:pointer;font-weight:600">Sign in</a> to leave a review.</p>`}
        </div>
      </div>
    </div>
  `;
  navigate('detail');
}

let selectedStar = 0;
function pickStar(n) {
  selectedStar = n;
  document.querySelectorAll('#star-pick span').forEach((s,i)=>{
    s.style.color = i < n ? 'var(--amber)' : '#ddd';
  });
}

function submitReview(recipeId) {
  if(!selectedStar) { showToast('Please select a star rating.'); return; }
  const text = document.getElementById('review-text').value.trim();
  if(!text) { showToast('Please write a comment.'); return; }
  const recipe = db.recipes.find(r=>r.id===recipeId);
  recipe.reviews.push({id: Date.now(), author: state.currentUser.fullName, rating: selectedStar, comment: text, date: 'Just now'});
  recipe.reviewCount = recipe.reviews.length;
  recipe.rating = parseFloat((recipe.reviews.reduce((s,r)=>s+r.rating,0)/recipe.reviews.length).toFixed(1));
  selectedStar = 0;
  showToast('Review posted! ⭐');
  openRecipe(recipeId);
}

// ═══════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════
function doSearch() {
  const q = document.getElementById('home-search-input').value.trim();
  if(!q) return;
  if(state.currentUser) {
    state.searchHistory.unshift({query:q, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
    if(state.searchHistory.length > 10) state.searchHistory.pop();
  }
  state.lastSearch = q;
  navigate('search');
}

function renderSearchPage() {
  const q = state.lastSearch || '';
  document.getElementById('search-subtitle').textContent = q ? `Showing results for "${q}"` : 'All recipes';
  const results = q ? db.recipes.filter(r=>r.status==='approved' && (
    r.title.toLowerCase().includes(q.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(q.toLowerCase()) ||
    (r.tags||[]).some(t=>t.toLowerCase().includes(q.toLowerCase())) ||
    r.ingredients.some(i=>i.name.toLowerCase().includes(q.toLowerCase()))
  )) : db.recipes.filter(r=>r.status==='approved');
  renderRecipeGrid(results, 'search-results-grid');
  const hcard = document.getElementById('history-card');
  const hlist = document.getElementById('search-history-list');
  if(state.currentUser && state.searchHistory.length) {
    hcard.style.display = 'block';
    hlist.innerHTML = state.searchHistory.map((h,i)=>`
      <div class="history-item" onclick="rerunSearch('${h.query}')">
        <span class="history-query">🔍 ${h.query}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="history-time">${h.time}</span>
          <span onclick="deleteHistory(event,${i})" style="cursor:pointer;color:var(--text-muted);font-size:11px;padding:2px 6px;border-radius:4px;background:var(--bg)">✕</span>
        </div>
      </div>`).join('');
  } else hcard.style.display = 'none';
}

function rerunSearch(q) { state.lastSearch = q; document.getElementById('home-search-input').value = q; renderSearchPage(); }
function deleteHistory(e, idx) { e.stopPropagation(); state.searchHistory.splice(idx,1); renderSearchPage(); }

// ═══════════════════════════════════════════════
// CREATE RECIPE
// ═══════════════════════════════════════════════
function resetCreateForm() {
  ['r-title','r-instructions','r-tags'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['r-cal','r-prep'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('submit-info').style.display='none';
  state.pendingIngRows = [{name:'', qty:'', unit:'cups', notes:''}];
  renderIngRows();
}

function nextStep(n) {
  if(n===2) {
    if(!document.getElementById('r-title').value.trim()) { showToast('Please enter a recipe title.'); return; }
    if(!document.getElementById('r-cuisine').value) { showToast('Please select a cuisine.'); return; }
  }
  state.currentStep = n;
  renderStep();
}

function renderStep() {
  for(let i=1;i<=3;i++) {
    document.getElementById('step'+i).classList.toggle('active', i===state.currentStep);
    const dot = document.getElementById('sdot'+i);
    dot.classList.toggle('active', i===state.currentStep);
    dot.classList.toggle('done', i<state.currentStep);
    if(i<3) document.getElementById('sline'+i).classList.toggle('done', i<state.currentStep);
  }
  if(state.currentStep===2) renderIngRows();
}

function addIngRow() { state.pendingIngRows.push({name:'',qty:'',unit:'cups',notes:''}); renderIngRows(); }

function renderIngRows() {
  const el = document.getElementById('ingredient-rows');
  if(!el) return;
  el.innerHTML = state.pendingIngRows.map((row,i)=>`
    <div class="add-ingredient-row">
      <div class="form-group" style="margin:0">
        <input type="text" placeholder="Ingredient name" value="${row.name}" oninput="state.pendingIngRows[${i}].name=this.value">
      </div>
      <div class="form-group" style="margin:0">
        <input type="text" placeholder="Qty" value="${row.qty}" oninput="state.pendingIngRows[${i}].qty=this.value">
      </div>
      <div class="form-group" style="margin:0">
        <select oninput="state.pendingIngRows[${i}].unit=this.value">
          ${['cups','grams','kg','ml','tbsp','tsp','pieces','oz'].map(u=>`<option${u===row.unit?' selected':''}>${u}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeIngRow(${i})">✕</button>
    </div>`).join('');
}

function removeIngRow(i) { if(state.pendingIngRows.length>1) { state.pendingIngRows.splice(i,1); renderIngRows(); } }

function submitRecipe() {
  const title = document.getElementById('r-title').value.trim();
  const cuisine = document.getElementById('r-cuisine').value;
  const prep = parseInt(document.getElementById('r-prep').value) || 30;
  const cal = parseInt(document.getElementById('r-cal').value) || null;
  const instructions = document.getElementById('r-instructions').value.trim();
  const tags = document.getElementById('r-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const emoji = document.getElementById('r-emoji').value;
  const ingredients = state.pendingIngRows.filter(r=>r.name.trim()).map((r,i)=>({id:nextIngId+i,name:r.name,qty:r.qty||'1',unit:r.unit}));
  const newRecipe = {
    id: nextRecipeId++, title, cuisine, prepTime:prep, calories:cal,
    emoji, status:'pending', authorId:state.currentUser.id, authorName:state.currentUser.fullName,
    instructions, ingredients, tags, rating:0, reviewCount:0, reviews:[]
  };
  db.recipes.push(newRecipe);
  document.getElementById('submit-info').style.display='block';
  showToast('Recipe submitted for review! 🎉');
}

// ═══════════════════════════════════════════════
// MY RECIPES
// ═══════════════════════════════════════════════
function renderMyRecipes() {
  if(!state.currentUser) return;
  const mine = db.recipes.filter(r=>r.authorId===state.currentUser.id);
  const el = document.getElementById('my-recipes-list');
  if(!mine.length) {
    el.innerHTML = `<div class="empty-state"><div class="emoji">📝</div><h3>No recipes yet</h3><p>Share your first recipe with the community!</p><br><button class="btn btn-primary" onclick="navigate('create')">Share a Recipe</button></div>`;
    return;
  }
  el.innerHTML = mine.map(r=>`
    <div class="my-recipe-row">
      <div class="my-recipe-emoji">${r.emoji||'🍽️'}</div>
      <div class="my-recipe-info">
        <div class="my-recipe-title">${r.title}</div>
        <div class="my-recipe-sub">${r.cuisine} · ${r.prepTime} min · <span class="badge badge-${r.status}">${r.status}</span></div>
      </div>
      <div class="my-recipe-actions">
        <button class="btn btn-secondary btn-sm" onclick="openRecipe(${r.id})">View</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMyRecipe(${r.id})">Delete</button>
      </div>
    </div>`).join('');
}

function deleteMyRecipe(id) {
  if(!confirm('Delete this recipe?')) return;
  db.recipes = db.recipes.filter(r=>r.id!==id);
  showToast('Recipe deleted.');
  renderMyRecipes();
}

// ═══════════════════════════════════════════════
// PANTRY
// ═══════════════════════════════════════════════
function searchIngredients(q) {
  const dd = document.getElementById('ing-dropdown');
  if(!q.trim()) { dd.style.display='none'; return; }
  const matches = db.ingredients.filter(i=>i.name.toLowerCase().includes(q.toLowerCase())).slice(0,6);
  if(!matches.length) { dd.style.display='none'; return; }
  dd.style.display='block';
  dd.innerHTML = matches.map(i=>`<div class="dropdown-item" onclick="selectIngredient(${i.id},'${i.name}')">${i.name} <span style="font-size:11px;color:var(--text-muted)">${i.category}</span></div>`).join('');
}

function selectIngredient(id, name) {
  state.selectedPantryIng = {id, name};
  document.getElementById('pantry-search').value = name;
  document.getElementById('ing-dropdown').style.display = 'none';
}

function addToPantry() {
  if(!state.selectedPantryIng) { showToast('Please search and select an ingredient.'); return; }
  const qty = document.getElementById('pantry-qty').value.trim();
  const unit = document.getElementById('pantry-unit').value;
  if(!qty) { showToast('Please enter a quantity.'); return; }
  const existing = db.pantry.find(p=>p.ingId===state.selectedPantryIng.id);
  if(existing) { existing.qty = qty; existing.unit = unit; }
  else db.pantry.push({id:nextPantryId++, ingId:state.selectedPantryIng.id, name:state.selectedPantryIng.name, qty, unit});
  state.selectedPantryIng = null;
  document.getElementById('pantry-search').value = '';
  document.getElementById('pantry-qty').value = '';
  showToast(`${state.selectedPantryIng?.name || 'Ingredient'} added to pantry! ✅`);
  renderPantry();
}

function renderPantry() {
  const el = document.getElementById('pantry-list');
  const count = document.getElementById('pantry-count');
  if(!db.pantry.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:14px">Your pantry is empty. Add some ingredients!</p>';
    count.textContent = '';
    return;
  }
  count.textContent = `(${db.pantry.length} items)`;
  el.innerHTML = db.pantry.map(p=>`
    <div class="pantry-item">
      <div>
        <div class="pantry-item-name">${p.name}</div>
        <div class="pantry-item-qty">${p.qty} ${p.unit}</div>
      </div>
      <div class="pantry-actions">
        <button class="icon-btn" onclick="removePantryItem(${p.id})">🗑️</button>
      </div>
    </div>`).join('');
}

function removePantryItem(id) {
  db.pantry = db.pantry.filter(p=>p.id!==id);
  showToast('Removed from pantry.');
  renderPantry();
}

function findPantryRecipes() {
  const pantryNames = db.pantry.map(p=>p.name.toLowerCase());
  const scored = db.recipes.filter(r=>r.status==='approved').map(r=>{
    const matches = r.ingredients.filter(i=>pantryNames.includes(i.name.toLowerCase())).length;
    return {...r, matchScore:matches};
  }).filter(r=>r.matchScore>0).sort((a,b)=>b.matchScore-a.matchScore);
  state.lastSearch = `Pantry (${db.pantry.length} items)`;
  navigate('search');
  document.getElementById('search-subtitle').textContent = `Recipes you can make with your pantry — sorted by ingredient match`;
  renderRecipeGrid(scored, 'search-results-grid');
  document.getElementById('history-card').style.display = 'none';
}

// ═══════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════
function adminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach((t,i)=>t.classList.toggle('active', ['pending','users','ingredients'][i]===tab));
  document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('admin-'+tab).classList.add('active');
}

function renderAdmin() {
  // Pending
  const pending = db.recipes.filter(r=>r.status==='pending');
  const pl = document.getElementById('pending-list');
  if(!pending.length) pl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:16px 0">No pending recipes. All caught up! ✅</p>';
  else pl.innerHTML = pending.map(r=>`
    <div class="my-recipe-row">
      <div class="my-recipe-emoji">${r.emoji||'🍽️'}</div>
      <div class="my-recipe-info">
        <div class="my-recipe-title">${r.title}</div>
        <div class="my-recipe-sub">${r.cuisine} · by ${r.authorName} · <span class="badge badge-pending">Pending</span></div>
      </div>
      <div class="my-recipe-actions">
        <button class="btn btn-green btn-sm" onclick="approveRecipe(${r.id})">✓ Approve</button>
        <button class="btn btn-danger btn-sm" onclick="rejectRecipe(${r.id})">✕ Reject</button>
        <button class="btn btn-secondary btn-sm" onclick="openRecipe(${r.id})">View</button>
      </div>
    </div>`).join('');
  // Users
  document.getElementById('users-table').innerHTML = db.users.map(u=>`
    <tr><td><strong>${u.fullName}</strong></td><td>${u.email}</td>
    <td><span class="badge ${u.isStaff?'badge-approved':'badge-pending'}">${u.isStaff?'Admin':'User'}</span></td>
    <td style="color:var(--text-muted)">2024</td>
    <td>${db.recipes.filter(r=>r.authorId===u.id).length}</td></tr>`).join('');
  // Ingredients
  document.getElementById('ingredients-table').innerHTML = db.ingredients.map(i=>`
    <tr><td>${i.name}</td><td><span class="tag">${i.category}</span></td></tr>`).join('');
}

function approveRecipe(id) {
  db.recipes.find(r=>r.id===id).status = 'approved';
  showToast('Recipe approved and published! ✅');
  renderAdmin();
}
function rejectRecipe(id) {
  db.recipes.find(r=>r.id===id).status = 'rejected';
  showToast('Recipe rejected.');
  renderAdmin();
}
function addIngredient() {
  const name = document.getElementById('new-ing-name').value.trim();
  const cat  = document.getElementById('new-ing-cat').value;
  if(!name) { showToast('Please enter a name.'); return; }
  db.ingredients.push({id:nextIngId++, name, category:cat});
  document.getElementById('new-ing-name').value = '';
  showToast(`"${name}" added to ingredients! ✅`);
  renderAdmin();
}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 3000);
}

// Close dropdown on outside click
document.addEventListener('click', e => {
  if(!e.target.closest('.ingredient-search')) document.getElementById('ing-dropdown').style.display = 'none';
});

// Init
renderHome();
