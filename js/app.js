// ═══════════════════════════════════════════════
// SUPABASE CONFIG — Live Database Connection
// ═══════════════════════════════════════════════
const SUPABASE_URL = 'https://nhaeqaiolsnevsnivoyh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYWVxYWlvbHNuZXZzbml2b3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTMyMDAsImV4cCI6MjA5MDQ2OTIwMH0.lZbT4_fIrmx8V5M57sqqkSCw_eLV47fhNFBbt44c6ZQ';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let state = {
  currentUser: null,
  currentProfile: null,
  currentPage: 'home',
  prevPage: null,
  selectedRecipeId: null,
  currentStep: 1,
  selectedPantryIng: null,
  searchHistory: [],
  pendingIngRows: [{ name: '', qty: '', unit: 'cups' }],
  allIngredients: [],
  allRecipes: []
};

// ═══════════════════════════════════════════════
// INIT — runs on page load
// ═══════════════════════════════════════════════
async function init() {
  showLoading(true);
  // Check if user is already logged in
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    state.currentUser = session.user;
    await loadProfile();
  }
  await loadIngredients();
  updateNavAuth();
  await renderHome();
  showLoading(false);

  // Listen for auth changes (login/logout)
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      state.currentUser = session.user;
      await loadProfile();
      updateNavAuth();
    } else if (event === 'SIGNED_OUT') {
      state.currentUser = null;
      state.currentProfile = null;
      updateNavAuth();
    }
  });
}

async function loadProfile() {
  const { data } = await sb.from('profiles').select('*').eq('id', state.currentUser.id).single();
  state.currentProfile = data;
}

async function loadIngredients() {
  const { data } = await sb.from('ingredients').select('*').order('name');
  state.allIngredients = data || [];
}

function showLoading(on) {
  document.getElementById('loading-overlay').style.display = on ? 'flex' : 'none';
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
async function navigate(page) {
  state.prevPage = state.currentPage;
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (page === 'home') document.querySelectorAll('.nav-link')[0].classList.add('active');
  if (page === 'create') document.querySelectorAll('.nav-link')[1].classList.add('active');
  if (page === 'my-recipes') document.querySelectorAll('.nav-link')[2].classList.add('active');
  if (page === 'pantry') document.querySelectorAll('.nav-link')[3].classList.add('active');
  window.scrollTo(0, 0);
  if (page === 'home') await renderHome();
  if (page === 'my-recipes') await renderMyRecipes();
  if (page === 'pantry') await renderPantry();
  if (page === 'admin') await renderAdmin();
  if (page === 'create') { state.currentStep = 1; renderStep(); resetCreateForm(); }
  if (page === 'search') await renderSearchPage();
}

function requireAuth(page) {
  if (!state.currentUser) { navigate('login'); return; }
  navigate(page);
}

function goBack() { navigate(state.prevPage || 'home'); }

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
function updateNavAuth() {
  const a = document.getElementById('nav-actions');
  const adminLink = document.getElementById('admin-nav-link');
  if (state.currentUser && state.currentProfile) {
    const initials = state.currentProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    a.innerHTML = `<div class="user-avatar" title="${state.currentProfile.full_name}">${initials}</div>
      <button class="btn btn-secondary btn-sm" onclick="doLogout()">Sign Out</button>`;
    adminLink.style.display = state.currentProfile.is_staff ? 'block' : 'none';
  } else {
    a.innerHTML = `<button class="btn btn-secondary btn-sm" onclick="navigate('login')">Sign In</button>
      <button class="btn btn-primary btn-sm" onclick="navigate('register')">Get Started</button>`;
    adminLink.style.display = 'none';
  }
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const alertEl = document.getElementById('login-alert');
  alertEl.innerHTML = '';

  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) {
    alertEl.innerHTML = `<div class="alert alert-error">Invalid email or password.</div>`;
    return;
  }
  showToast(`Welcome back! 👋`);
  navigate('home');
}

async function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const alertEl = document.getElementById('register-alert');
  alertEl.innerHTML = '';

  if (!name || !email || !pass) {
    alertEl.innerHTML = `<div class="alert alert-error">Please fill in all fields.</div>`; return;
  }
  if (pass.length < 6) {
    alertEl.innerHTML = `<div class="alert alert-error">Password must be at least 6 characters.</div>`; return;
  }

  const { data, error } = await sb.auth.signUp({ email, password: pass });
  if (error) {
    alertEl.innerHTML = `<div class="alert alert-error">${error.message}</div>`; return;
  }

  // Create profile row
  await sb.from('profiles').insert({ id: data.user.id, full_name: name, email, is_staff: false });
  showToast(`Welcome to PantryPal, ${name.split(' ')[0]}! 🎉`);
  navigate('home');
}

async function doLogout() {
  await sb.auth.signOut();
  showToast('Signed out. See you soon!');
  navigate('home');
}

// ═══════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════
async function renderHome() {
  showLoading(true);
  const { data: recipes } = await sb.from('recipes')
    .select('*, recipe_ingredients(*, ingredients(name))')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  state.allRecipes = recipes || [];
  showLoading(false);

  const cuisines = [...new Set(state.allRecipes.map(r => r.cuisine))];
  const fc = document.getElementById('cuisine-filters');
  fc.innerHTML = `<span style="font-size:13px;font-weight:700;color:var(--text-muted);margin-right:4px;">Cuisine:</span>
    <div class="filter-pill active" onclick="filterCuisine(this,'')">All</div>
    ${cuisines.map(c => `<div class="filter-pill" onclick="filterCuisine(this,'${c}')">${c}</div>`).join('')}`;
  renderRecipeGrid(state.allRecipes, 'home-recipe-grid');
}

function filterCuisine(el, cuisine) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const filtered = cuisine ? state.allRecipes.filter(r => r.cuisine === cuisine) : state.allRecipes;
  renderRecipeGrid(filtered, 'home-recipe-grid');
}

function renderRecipeGrid(recipes, containerId) {
  const el = document.getElementById(containerId);
  if (!recipes.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🍽️</div><h3>No recipes found</h3><p>Try a different search or filter.</p></div>`;
    return;
  }
  el.innerHTML = recipes.map(r => `
    <div class="recipe-card" onclick="openRecipe('${r.id}')">
      <div class="recipe-card-img">${r.emoji || '🍽️'}</div>
      <div class="recipe-card-body">
        <div class="recipe-card-cuisine">${r.cuisine}</div>
        <div class="recipe-card-title">${r.title}</div>
        <div class="recipe-card-meta">
          <span>⏱ ${r.prep_time} min</span>
          ${r.calories ? `<span>🔥 ${r.calories} cal</span>` : ''}
          ${r.avg_rating ? `<span><span class="stars">★</span> ${parseFloat(r.avg_rating).toFixed(1)}</span>` : '<span>No reviews</span>'}
        </div>
        <div class="recipe-card-tags">${(r.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════
// RECIPE DETAIL
// ═══════════════════════════════════════════════
async function openRecipe(id) {
  showLoading(true);
  const { data: r } = await sb.from('recipes')
    .select('*, recipe_ingredients(qty, unit, ingredients(name)), reviews(*, profiles(full_name))')
    .eq('id', id)
    .single();
  showLoading(false);
  if (!r) return;
  state.selectedRecipeId = id;

  const steps = (r.instructions || '').split('\n').filter(s => s.trim());
  const avgRating = r.reviews?.length
    ? (r.reviews.reduce((s, rv) => s + rv.rating, 0) / r.reviews.length).toFixed(1)
    : null;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-hero">
      <div class="detail-hero-img">${r.emoji || '🍽️'}</div>
      <div class="detail-hero-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
          <h1>${r.title}</h1>
          <span class="badge badge-${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
        </div>
        <div class="detail-meta">
          <div class="detail-meta-item"><span class="label">Cuisine</span><span class="value">${r.cuisine}</span></div>
          <div class="detail-meta-item"><span class="label">Prep Time</span><span class="value">${r.prep_time} min</span></div>
          ${r.calories ? `<div class="detail-meta-item"><span class="label">Calories</span><span class="value">${r.calories} kcal</span></div>` : ''}
          <div class="detail-meta-item"><span class="label">Rating</span><span class="value">${avgRating ? `★ ${avgRating} (${r.reviews.length})` : 'No reviews'}</span></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${(r.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="detail-grid">
      <div>
        <div class="section-card">
          <h3>Ingredients</h3>
          ${(r.recipe_ingredients || []).map(i => `
            <div class="ingredient-row">
              <span class="ingredient-name">${i.ingredients?.name || ''}</span>
              <span class="ingredient-qty">${i.qty} ${i.unit}</span>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div class="section-card">
          <h3>Instructions</h3>
          <ol class="instructions-list">
            ${steps.map((s, i) => `<li><span class="step-num">${i + 1}</span><span>${s}</span></li>`).join('')}
          </ol>
        </div>
        <div class="section-card">
          <h3>Reviews (${r.reviews?.length || 0})</h3>
          ${r.reviews?.length ? r.reviews.map(rv => `
            <div class="review-item">
              <div class="review-header">
                <span class="reviewer-name">${rv.profiles?.full_name || 'Anonymous'}</span>
                <div>
                  <span class="stars">${'★'.repeat(rv.rating)}<span style="color:#ddd">${'★'.repeat(5 - rv.rating)}</span></span>
                  <span class="review-date" style="margin-left:8px">${new Date(rv.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div class="review-text">${rv.comment}</div>
            </div>`).join('') : '<p style="color:var(--text-muted);font-size:14px">No reviews yet. Be the first!</p>'}
          ${state.currentUser ? `
            <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--bg)">
              <h4 style="font-size:16px;margin-bottom:14px;font-family:'Nunito',sans-serif;font-weight:700">Write a Review</h4>
              <div style="display:flex;gap:6px;margin-bottom:12px" id="star-pick">
                ${[1,2,3,4,5].map(n => `<span style="font-size:24px;cursor:pointer;color:#ddd" onclick="pickStar(${n})" data-star="${n}">★</span>`).join('')}
              </div>
              <div class="form-group"><textarea id="review-text" rows="3" placeholder="Share your experience…"></textarea></div>
              <button class="btn btn-primary btn-sm" onclick="submitReview('${r.id}')">Post Review</button>
            </div>` : `<p style="margin-top:16px;font-size:14px;color:var(--text-muted)"><a onclick="navigate('login')" style="color:var(--primary);cursor:pointer;font-weight:600">Sign in</a> to leave a review.</p>`}
        </div>
      </div>
    </div>`;
  navigate('detail');
}

let selectedStar = 0;
function pickStar(n) {
  selectedStar = n;
  document.querySelectorAll('#star-pick span').forEach((s, i) => {
    s.style.color = i < n ? 'var(--amber)' : '#ddd';
  });
}

async function submitReview(recipeId) {
  if (!selectedStar) { showToast('Please select a star rating.'); return; }
  const text = document.getElementById('review-text').value.trim();
  if (!text) { showToast('Please write a comment.'); return; }

  await sb.from('reviews').insert({
    recipe_id: recipeId,
    user_id: state.currentUser.id,
    rating: selectedStar,
    comment: text
  });
  selectedStar = 0;
  showToast('Review posted! ⭐');
  openRecipe(recipeId);
}

// ═══════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════
async function doSearch() {
  const q = document.getElementById('home-search-input').value.trim();
  if (!q) return;
  if (state.currentUser) {
    state.searchHistory.unshift({ query: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (state.searchHistory.length > 10) state.searchHistory.pop();
  }
  state.lastSearch = q;
  navigate('search');
}

async function renderSearchPage() {
  const q = state.lastSearch || '';
  document.getElementById('search-subtitle').textContent = q ? `Showing results for "${q}"` : 'All recipes';

  showLoading(true);
  const { data: recipes } = await sb.from('recipes')
    .select('*, recipe_ingredients(*, ingredients(name))')
    .eq('status', 'approved');
  showLoading(false);

  const results = q ? (recipes || []).filter(r =>
    r.title.toLowerCase().includes(q.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(q.toLowerCase()) ||
    (r.tags || []).some(t => t.toLowerCase().includes(q.toLowerCase()))
  ) : (recipes || []);

  renderRecipeGrid(results, 'search-results-grid');

  const hcard = document.getElementById('history-card');
  const hlist = document.getElementById('search-history-list');
  if (state.currentUser && state.searchHistory.length) {
    hcard.style.display = 'block';
    hlist.innerHTML = state.searchHistory.map((h, i) => `
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
function deleteHistory(e, idx) { e.stopPropagation(); state.searchHistory.splice(idx, 1); renderSearchPage(); }

// ═══════════════════════════════════════════════
// CREATE RECIPE
// ═══════════════════════════════════════════════
function resetCreateForm() {
  ['r-title', 'r-instructions', 'r-tags'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['r-cal', 'r-prep'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('submit-info').style.display = 'none';
  state.pendingIngRows = [{ name: '', qty: '', unit: 'cups' }];
  renderIngRows();
}

function nextStep(n) {
  if (n === 2) {
    if (!document.getElementById('r-title').value.trim()) { showToast('Please enter a recipe title.'); return; }
    if (!document.getElementById('r-cuisine').value) { showToast('Please select a cuisine.'); return; }
  }
  state.currentStep = n;
  renderStep();
}

function renderStep() {
  for (let i = 1; i <= 3; i++) {
    document.getElementById('step' + i).classList.toggle('active', i === state.currentStep);
    const dot = document.getElementById('sdot' + i);
    dot.classList.toggle('active', i === state.currentStep);
    dot.classList.toggle('done', i < state.currentStep);
    if (i < 3) document.getElementById('sline' + i).classList.toggle('done', i < state.currentStep);
  }
  if (state.currentStep === 2) renderIngRows();
}

function addIngRow() { state.pendingIngRows.push({ name: '', qty: '', unit: 'cups' }); renderIngRows(); }

function renderIngRows() {
  const el = document.getElementById('ingredient-rows');
  if (!el) return;
  el.innerHTML = state.pendingIngRows.map((row, i) => `
    <div class="add-ingredient-row">
      <div class="form-group" style="margin:0">
        <input type="text" placeholder="Ingredient name" value="${row.name}" oninput="state.pendingIngRows[${i}].name=this.value" list="ing-suggestions">
      </div>
      <div class="form-group" style="margin:0">
        <input type="text" placeholder="Qty" value="${row.qty}" oninput="state.pendingIngRows[${i}].qty=this.value">
      </div>
      <div class="form-group" style="margin:0">
        <select oninput="state.pendingIngRows[${i}].unit=this.value">
          ${['cups','grams','kg','ml','tbsp','tsp','pieces','oz'].map(u => `<option${u === row.unit ? ' selected' : ''}>${u}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeIngRow(${i})">✕</button>
    </div>`).join('');
}

function removeIngRow(i) { if (state.pendingIngRows.length > 1) { state.pendingIngRows.splice(i, 1); renderIngRows(); } }

async function submitRecipe() {
  const title = document.getElementById('r-title').value.trim();
  const cuisine = document.getElementById('r-cuisine').value;
  const prep = parseInt(document.getElementById('r-prep').value) || 30;
  const cal = parseInt(document.getElementById('r-cal').value) || null;
  const instructions = document.getElementById('r-instructions').value.trim();
  const tags = document.getElementById('r-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const emoji = document.getElementById('r-emoji').value;

  showLoading(true);

  // Insert recipe
  const { data: recipe, error } = await sb.from('recipes').insert({
    title, cuisine, prep_time: prep, calories: cal,
    instructions, tags, emoji,
    status: 'pending',
    author_id: state.currentUser.id
  }).select().single();

  if (error) { showLoading(false); showToast('Error submitting recipe. Try again.'); return; }

  // Insert ingredients — find or create each one
  for (const row of state.pendingIngRows.filter(r => r.name.trim())) {
    let ing = state.allIngredients.find(i => i.name.toLowerCase() === row.name.toLowerCase());
    if (!ing) {
      const { data: newIng } = await sb.from('ingredients').insert({ name: row.name, category: 'Other' }).select().single();
      ing = newIng;
      state.allIngredients.push(ing);
    }
    await sb.from('recipe_ingredients').insert({
      recipe_id: recipe.id,
      ingredient_id: ing.id,
      qty: row.qty || '1',
      unit: row.unit
    });
  }

  showLoading(false);
  document.getElementById('submit-info').style.display = 'block';
  showToast('Recipe submitted for review! 🎉');
}

// ═══════════════════════════════════════════════
// MY RECIPES
// ═══════════════════════════════════════════════
async function renderMyRecipes() {
  if (!state.currentUser) return;
  showLoading(true);
  const { data: mine } = await sb.from('recipes')
    .select('*')
    .eq('author_id', state.currentUser.id)
    .order('created_at', { ascending: false });
  showLoading(false);

  const el = document.getElementById('my-recipes-list');
  if (!mine?.length) {
    el.innerHTML = `<div class="empty-state"><div class="emoji">📝</div><h3>No recipes yet</h3><p>Share your first recipe!</p><br><button class="btn btn-primary" onclick="navigate('create')">Share a Recipe</button></div>`;
    return;
  }
  el.innerHTML = mine.map(r => `
    <div class="my-recipe-row">
      <div class="my-recipe-emoji">${r.emoji || '🍽️'}</div>
      <div class="my-recipe-info">
        <div class="my-recipe-title">${r.title}</div>
        <div class="my-recipe-sub">${r.cuisine} · ${r.prep_time} min · <span class="badge badge-${r.status}">${r.status}</span></div>
      </div>
      <div class="my-recipe-actions">
        <button class="btn btn-secondary btn-sm" onclick="openRecipe('${r.id}')">View</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMyRecipe('${r.id}')">Delete</button>
      </div>
    </div>`).join('');
}

async function deleteMyRecipe(id) {
  if (!confirm('Delete this recipe?')) return;
  await sb.from('recipes').delete().eq('id', id);
  showToast('Recipe deleted.');
  renderMyRecipes();
}

// ═══════════════════════════════════════════════
// PANTRY
// ═══════════════════════════════════════════════
function searchIngredients(q) {
  const dd = document.getElementById('ing-dropdown');
  if (!q.trim()) { dd.style.display = 'none'; return; }
  const matches = state.allIngredients.filter(i => i.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  if (!matches.length) { dd.style.display = 'none'; return; }
  dd.style.display = 'block';
  dd.innerHTML = matches.map(i => `<div class="dropdown-item" onclick="selectIngredient('${i.id}','${i.name}')">${i.name} <span style="font-size:11px;color:var(--text-muted)">${i.category}</span></div>`).join('');
}

function selectIngredient(id, name) {
  state.selectedPantryIng = { id, name };
  document.getElementById('pantry-search').value = name;
  document.getElementById('ing-dropdown').style.display = 'none';
}

async function addToPantry() {
  if (!state.selectedPantryIng) { showToast('Please search and select an ingredient.'); return; }
  const qty = document.getElementById('pantry-qty').value.trim();
  const unit = document.getElementById('pantry-unit').value;
  if (!qty) { showToast('Please enter a quantity.'); return; }

  // Upsert — update if exists, insert if not
  const { data: existing } = await sb.from('pantry')
    .select('id')
    .eq('user_id', state.currentUser.id)
    .eq('ingredient_id', state.selectedPantryIng.id)
    .single();

  if (existing) {
    await sb.from('pantry').update({ qty, unit }).eq('id', existing.id);
  } else {
    await sb.from('pantry').insert({
      user_id: state.currentUser.id,
      ingredient_id: state.selectedPantryIng.id,
      qty, unit
    });
  }

  const ingName = state.selectedPantryIng.name;
  state.selectedPantryIng = null;
  document.getElementById('pantry-search').value = '';
  document.getElementById('pantry-qty').value = '';
  showToast(`${ingName} added to pantry! ✅`);
  renderPantry();
}

async function renderPantry() {
  if (!state.currentUser) return;
  showLoading(true);
  const { data: pantry } = await sb.from('pantry')
    .select('*, ingredients(name, category)')
    .eq('user_id', state.currentUser.id);
  showLoading(false);

  const el = document.getElementById('pantry-list');
  const count = document.getElementById('pantry-count');
  if (!pantry?.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:14px">Your pantry is empty. Add some ingredients!</p>';
    count.textContent = '';
    return;
  }
  count.textContent = `(${pantry.length} items)`;
  el.innerHTML = pantry.map(p => `
    <div class="pantry-item">
      <div>
        <div class="pantry-item-name">${p.ingredients?.name}</div>
        <div class="pantry-item-qty">${p.qty} ${p.unit}</div>
      </div>
      <div class="pantry-actions">
        <button class="icon-btn" onclick="removePantryItem('${p.id}')">🗑️</button>
      </div>
    </div>`).join('');
}

async function removePantryItem(id) {
  await sb.from('pantry').delete().eq('id', id);
  showToast('Removed from pantry.');
  renderPantry();
}

async function findPantryRecipes() {
  showLoading(true);
  const { data: pantry } = await sb.from('pantry')
    .select('ingredient_id')
    .eq('user_id', state.currentUser.id);
  const { data: recipes } = await sb.from('recipes')
    .select('*, recipe_ingredients(ingredient_id)')
    .eq('status', 'approved');
  showLoading(false);

  const myIngIds = new Set((pantry || []).map(p => p.ingredient_id));
  const scored = (recipes || []).map(r => {
    const matches = (r.recipe_ingredients || []).filter(i => myIngIds.has(i.ingredient_id)).length;
    return { ...r, matchScore: matches };
  }).filter(r => r.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);

  state.lastSearch = null;
  navigate('search');
  document.getElementById('search-subtitle').textContent = `Recipes you can make with your pantry — sorted by ingredient match`;
  renderRecipeGrid(scored, 'search-results-grid');
  document.getElementById('history-card').style.display = 'none';
}

// ═══════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════
function adminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach((t, i) => t.classList.toggle('active', ['pending', 'users', 'ingredients'][i] === tab));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('admin-' + tab).classList.add('active');
}

async function renderAdmin() {
  if (!state.currentProfile?.is_staff) { navigate('home'); return; }
  showLoading(true);
  const [{ data: pending }, { data: users }, { data: ingredients }] = await Promise.all([
    sb.from('recipes').select('*, profiles(full_name)').eq('status', 'pending'),
    sb.from('profiles').select('*, recipes(count)'),
    sb.from('ingredients').select('*').order('name')
  ]);
  showLoading(false);

  // Pending
  const pl = document.getElementById('pending-list');
  if (!pending?.length) {
    pl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:16px 0">No pending recipes. All caught up! ✅</p>';
  } else {
    pl.innerHTML = pending.map(r => `
      <div class="my-recipe-row">
        <div class="my-recipe-emoji">${r.emoji || '🍽️'}</div>
        <div class="my-recipe-info">
          <div class="my-recipe-title">${r.title}</div>
          <div class="my-recipe-sub">${r.cuisine} · by ${r.profiles?.full_name} · <span class="badge badge-pending">Pending</span></div>
        </div>
        <div class="my-recipe-actions">
          <button class="btn btn-green btn-sm" onclick="approveRecipe('${r.id}')">✓ Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectRecipe('${r.id}')">✕ Reject</button>
          <button class="btn btn-secondary btn-sm" onclick="openRecipe('${r.id}')">View</button>
        </div>
      </div>`).join('');
  }

  // Users
  document.getElementById('users-table').innerHTML = (users || []).map(u => `
    <tr><td><strong>${u.full_name}</strong></td><td>${u.email}</td>
    <td><span class="badge ${u.is_staff ? 'badge-approved' : 'badge-pending'}">${u.is_staff ? 'Admin' : 'User'}</span></td>
    <td style="color:var(--text-muted)">${new Date(u.created_at).toLocaleDateString()}</td>
    <td>${u.recipes?.[0]?.count || 0}</td></tr>`).join('');

  // Ingredients
  document.getElementById('ingredients-table').innerHTML = (ingredients || []).map(i => `
    <tr><td>${i.name}</td><td><span class="tag">${i.category}</span></td></tr>`).join('');
}

async function approveRecipe(id) {
  await sb.from('recipes').update({ status: 'approved' }).eq('id', id);
  showToast('Recipe approved and published! ✅');
  renderAdmin();
}

async function rejectRecipe(id) {
  await sb.from('recipes').update({ status: 'rejected' }).eq('id', id);
  showToast('Recipe rejected.');
  renderAdmin();
}

async function addIngredient() {
  const name = document.getElementById('new-ing-name').value.trim();
  const cat = document.getElementById('new-ing-cat').value;
  if (!name) { showToast('Please enter a name.'); return; }
  await sb.from('ingredients').insert({ name, category: cat });
  document.getElementById('new-ing-name').value = '';
  showToast(`"${name}" added! ✅`);
  await loadIngredients();
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
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

document.addEventListener('click', e => {
  if (!e.target.closest('.ingredient-search')) document.getElementById('ing-dropdown').style.display = 'none';
});

// Start the app
init();
