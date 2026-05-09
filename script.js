// Data Models
let currentUser = JSON.parse(localStorage.getItem('closetUser')) || null;
let closetItems = JSON.parse(localStorage.getItem('closetItems')) || [];
let closetFavorites = JSON.parse(localStorage.getItem('closetFavorites')) || [];
let outfits365 = JSON.parse(localStorage.getItem('outfits365')) || [];
let recentDailyOutfits = JSON.parse(sessionStorage.getItem('recentDailyOutfits')) || [];

// Page check
const isIndex = document.getElementById('splash-screen') !== null;
const isDashboard = document.getElementById('upload-section') !== null;

// ================= INDEX PAGE LOGIC =================
if (isIndex) {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.style.display = 'none';
        
        if (currentUser && currentUser.isLoggedIn) {
          if (currentUser.gender) {
            window.location.href = 'dashboard.html';
          } else {
            document.getElementById('setup-section').style.display = 'flex';
          }
        } else {
          document.getElementById('login-section').style.display = 'flex';
        }
      }, 600);
    }
  }, 2000);

  // Login Flow
  const loginForm = document.getElementById('login-form');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const otpContainer = document.getElementById('otp-container');
  
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      const name = document.getElementById('login-name').value;
      const phone = document.getElementById('login-phone').value;
      
      if(name && phone.length === 10) {
        sendOtpBtn.innerText = "OTP Sent!";
        setTimeout(() => {
          sendOtpBtn.style.display = 'none';
          otpContainer.style.display = 'block';
        }, 500);
      } else {
        alert("Please enter a valid name and 10-digit phone number.");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const otp = document.getElementById('login-otp').value;
      if (otp === '1234') {
        const name = document.getElementById('login-name').value;
        const phone = document.getElementById('login-phone').value;
        
        currentUser = { name, phone, isLoggedIn: true };
        localStorage.setItem('closetUser', JSON.stringify(currentUser));
        
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('setup-section').style.display = 'flex';
      } else {
        alert('Invalid OTP. Use 1234.');
      }
    });
  }

  // Setup Flow
  const setupGender = document.getElementById('setup-gender');
  const setupBodyType = document.getElementById('setup-bodyType');
  const bodyHint = document.getElementById('bodyType-hint');
  
  if (setupGender) {
    setupGender.addEventListener('change', (e) => {
      const val = e.target.value;
      setupBodyType.innerHTML = '<option value="" disabled selected>Select an option</option>';
      if (val === 'Female') {
        setupBodyType.innerHTML += `
          <option value="Pear">Pear (Wider hips)</option>
          <option value="Apple">Apple (Wider upper body)</option>
          <option value="Hourglass">Hourglass (Balanced)</option>
          <option value="Rectangle">Rectangle (Straight)</option>
        `;
        bodyHint.innerText = "This helps us suggest flattering outfit silhouettes.";
      } else if (val === 'Male') {
        setupBodyType.innerHTML += `
          <option value="Triangle">Triangle (Wider waist)</option>
          <option value="Inverted Triangle">Inverted Triangle (Broad shoulders)</option>
          <option value="Rectangle">Rectangle (Straight)</option>
          <option value="Oval">Oval (Rounded middle)</option>
        `;
        bodyHint.innerText = "This helps us suggest flattering outfit silhouettes.";
      }
    });
  }

  const setupForm = document.getElementById('setup-form');
  if (setupForm) {
    setupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentUser.gender = document.getElementById('setup-gender').value;
      currentUser.bodyType = document.getElementById('setup-bodyType').value;
      currentUser.height = parseInt(document.getElementById('setup-height').value);
      currentUser.age = parseInt(document.getElementById('setup-age').value);
      
      localStorage.setItem('closetUser', JSON.stringify(currentUser));
      window.location.href = 'dashboard.html';
    });
  }
}

// ================= DASHBOARD LOGIC =================
if (isDashboard) {
  if (!currentUser || !currentUser.isLoggedIn || !currentUser.gender) {
    window.location.href = 'index.html';
  } else {
    // Check for Refresh Popup
    if (closetItems.length > 0 && !sessionStorage.getItem('refreshPopupShown')) {
      const modal = document.getElementById('refresh-modal');
      modal.style.display = 'flex';
      
      document.getElementById('keep-data-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        sessionStorage.setItem('refreshPopupShown', 'true');
        initDashboard();
      });
      
      document.getElementById('clear-data-btn').addEventListener('click', () => {
        closetItems = [];
        outfits365 = [];
        closetFavorites = [];
        localStorage.setItem('closetItems', JSON.stringify(closetItems));
        localStorage.setItem('outfits365', JSON.stringify(outfits365));
        localStorage.setItem('closetFavorites', JSON.stringify(closetFavorites));
        modal.style.display = 'none';
        sessionStorage.setItem('refreshPopupShown', 'true');
        initDashboard();
      });
    } else {
      initDashboard();
    }
  }
}

function initDashboard() {
  // 1. Setup User Profile
  document.getElementById('display-name').innerText = currentUser.name;
  document.getElementById('user-avatar').innerText = currentUser.name.charAt(0).toUpperCase();

  document.getElementById('relogin-btn').addEventListener('click', () => {
    localStorage.removeItem('closetUser');
    window.location.href = 'index.html';
  });

  // Populate Edit Profile Form
  const editForm = document.getElementById('edit-profile-form');
  if (editForm) {
    document.getElementById('edit-gender').value = currentUser.gender || 'Female';
    document.getElementById('edit-bodyType').value = currentUser.bodyType || 'Pear';
    document.getElementById('edit-height').value = currentUser.height || 165;
    document.getElementById('edit-age').value = currentUser.age || 25;
    
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentUser.gender = document.getElementById('edit-gender').value;
      currentUser.bodyType = document.getElementById('edit-bodyType').value;
      currentUser.height = parseInt(document.getElementById('edit-height').value);
      currentUser.age = parseInt(document.getElementById('edit-age').value);
      
      localStorage.setItem('closetUser', JSON.stringify(currentUser));
      alert('Profile updated successfully!');
      generate365Outfits(); // Regenerate based on new profile
    });
  }

  // 2. Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      const targetId = item.getAttribute('data-target');
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
      
      if (targetId === 'closet-section') renderCloset();
      if (targetId === 'analysis-section') renderAnalysis();
      if (targetId === 'favorites-section') renderFavorites();
    });
  });

  // 3. Confirm Upload Logic
  const fileUpload = document.getElementById('file-upload');
  const uploadArea = document.querySelector('.upload-area');
  const uploadConfirm = document.getElementById('upload-confirm');
  const previewImage = document.getElementById('preview-image');
  let currentBase64 = null;
  let selectedCategory = null;

  // Handle Category Grid Clicks
  const uploadGridItems = document.querySelectorAll('#upload-category-grid .cat-item');
  uploadGridItems.forEach(item => {
    item.addEventListener('click', () => {
      uploadGridItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      selectedCategory = item.getAttribute('data-cat');
    });
  });

  if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            currentBase64 = canvas.toDataURL('image/jpeg', 0.6);
            previewImage.src = currentBase64;
            
            // Smart Suggestion
            const suggestion = autoCategorize(file.name);
            document.getElementById('smart-suggestion').innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> We think this is: ${suggestion}`;
            
            uploadGridItems.forEach(i => {
              i.classList.remove('active');
              if (i.getAttribute('data-cat') === suggestion || i.getAttribute('data-cat').includes(suggestion)) {
                i.classList.add('active');
                selectedCategory = i.getAttribute('data-cat');
              }
            });
            
            uploadArea.style.display = 'none';
            uploadConfirm.style.display = 'block';
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  if(cancelUploadBtn) {
    cancelUploadBtn.addEventListener('click', () => {
      uploadArea.style.display = 'block';
      uploadConfirm.style.display = 'none';
      fileUpload.value = '';
      currentBase64 = null;
    });
  }

  const confirmSaveBtn = document.getElementById('confirm-save-btn');
  if(confirmSaveBtn) {
    confirmSaveBtn.addEventListener('click', () => {
      if (!selectedCategory) {
        alert("Please select a category to continue!");
        return;
      }
      
      const color = document.getElementById('upload-color').value;
      
      const newItem = {
        id: Date.now(),
        image: currentBase64,
        category: selectedCategory,
        color: color,
        dateAdded: new Date().toISOString()
      };
      
      try {
        closetItems.unshift(newItem);
        localStorage.setItem('closetItems', JSON.stringify(closetItems));
        generate365Outfits(); // Regenerate 365 outfits whenever closet changes
        
        // Reset UI
        uploadArea.style.display = 'block';
        uploadConfirm.style.display = 'none';
        fileUpload.value = '';
        currentBase64 = null;
        alert("Item saved to your closet successfully!");
      } catch (err) {
        console.error("Storage error:", err);
        alert('Storage limit reached! Please delete some items first.');
      }
    });
  }

  function autoCategorize(filename) {
    const name = filename.toLowerCase();
    if(name.includes('shirt')) return 'Shirts';
    if(name.includes('t-shirt') || name.includes('tee')) return 'T-shirts';
    if(name.includes('pant') || name.includes('jean') || name.includes('trouser')) return 'Pants / Jeans';
    if(name.includes('skirt')) return 'Skirts';
    if(name.includes('dress') || name.includes('frock')) return 'Dresses / Frocks';
    if(name.includes('kurti') || name.includes('ethnic')) return 'Kurtis / Ethnic wear';
    if(name.includes('shoe') || name.includes('sneaker') || name.includes('boot')) return 'Shoes';
    if(name.includes('bag')) return 'Bags';
    if(name.includes('jewel') || name.includes('ring')) return 'Jewellery';
    return 'Tops'; // Default
  }

  // 4. Closet Rendering & Edit System
  function renderCloset(filter = 'All') {
    const grid = document.getElementById('closet-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    let filtered = closetItems;
    
    if (filter !== 'All') {
       const map = {
         'Tops': ['Tops', 'Shirts', 'T-shirts'],
         'Bottoms': ['Pants / Jeans', 'Skirts'],
         'Dresses': ['Dresses / Frocks', 'Kurtis / Ethnic wear'],
         'Footwear': ['Shoes'],
         'Accessories': ['Bags', 'Jewellery']
       };
       filtered = closetItems.filter(i => map[filter].includes(i.category));
    }
    
    document.getElementById('total-items').innerText = `${filtered.length} items`;
    
    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">No items found. Add some clothes!</div>';
    }
    
    filtered.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <img src="${item.image}" class="item-img" alt="clothing">
        <div class="item-actions">
          <button class="icon-btn edit-btn" data-id="${item.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn delete-btn" data-id="${item.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="item-details">
          <div class="item-category">${item.category}</div>
          <div style="font-weight: 500;">${item.color}</div>
        </div>
      `;
      grid.appendChild(div);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(confirm("Are you sure you want to delete this item?")) {
          const id = parseInt(e.currentTarget.getAttribute('data-id'));
          closetItems = closetItems.filter(i => i.id !== id);
          localStorage.setItem('closetItems', JSON.stringify(closetItems));
          generate365Outfits();
          renderCloset(filter);
        }
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        openEditModal(id);
      });
    });
  }

  document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      renderCloset(e.target.getAttribute('data-filter'));
    });
  });

  // Edit Item Logic
  let editingItemId = null;
  let editingCategory = null;
  const editModal = document.getElementById('edit-modal');
  const editGridItems = document.querySelectorAll('#edit-category-grid .cat-item');

  editGridItems.forEach(item => {
    item.addEventListener('click', () => {
      editGridItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      editingCategory = item.getAttribute('data-cat');
    });
  });

  function openEditModal(id) {
    const item = closetItems.find(i => i.id === id);
    if (!item) return;
    
    editingItemId = id;
    editingCategory = item.category;
    document.getElementById('edit-color').value = item.color;
    
    editGridItems.forEach(i => {
      i.classList.remove('active');
      if (i.getAttribute('data-cat') === item.category) {
        i.classList.add('active');
      }
    });
    
    editModal.style.display = 'flex';
  }

  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    editModal.style.display = 'none';
    editingItemId = null;
  });

  document.getElementById('save-edit-btn').addEventListener('click', () => {
    if (!editingCategory) {
      alert("Please select a category!");
      return;
    }
    const color = document.getElementById('edit-color').value;
    const index = closetItems.findIndex(i => i.id === editingItemId);
    if (index !== -1) {
      closetItems[index].category = editingCategory;
      closetItems[index].color = color;
      localStorage.setItem('closetItems', JSON.stringify(closetItems));
      generate365Outfits();
      renderCloset();
      editModal.style.display = 'none';
      editingItemId = null;
    }
  });

  // ================= SMART OUTFIT ENGINE =================

  function isColorMatch(c1, c2) {
    if (c1 === c2) return true; // Monochrome always matches

    // Enhanced Trendy Color Matching rules
    const rules = {
      'Black': ['White', 'Beige', 'Grey', 'Red', 'Blue', 'Pink', 'Yellow', 'Cream'],
      'White': ['Black', 'Blue', 'Brown', 'Pink', 'Navy', 'Red', 'Green', 'Maroon'],
      'Grey': ['Black', 'White', 'Blue', 'Pink', 'Navy', 'Maroon'],
      'Red': ['Black', 'White', 'Navy', 'Beige'],
      'Blue': ['White', 'Grey', 'Beige', 'Black', 'Yellow'],
      'Green': ['White', 'Beige', 'Brown', 'Cream'],
      'Yellow': ['White', 'Navy', 'Black', 'Blue'],
      'Orange': ['White', 'Navy', 'Brown'],
      'Pink': ['White', 'Grey', 'Black', 'Navy'],
      'Beige': ['Brown', 'White', 'Black', 'Navy', 'Green', 'Red'],
      'Brown': ['Beige', 'White', 'Cream', 'Green', 'Orange'],
      'Cream': ['Brown', 'Green', 'Navy', 'Maroon', 'Black'],
      'Purple': ['White', 'Grey', 'Black', 'Cream'],
      'Maroon': ['White', 'Cream', 'Black', 'Grey', 'Beige'],
      'Navy': ['White', 'Yellow', 'Pink', 'Grey', 'Beige', 'Red', 'Orange']
    };
    
    if (rules[c1] && rules[c1].includes(c2)) return true;
    if (rules[c2] && rules[c2].includes(c1)) return true;
    
    return false;
  }

  function isLight(color) {
    return ['White', 'Beige', 'Pink', 'Cream', 'Yellow'].includes(color);
  }
  function isDark(color) {
    return ['Black', 'Brown', 'Blue', 'Grey', 'Red', 'Maroon', 'Navy', 'Purple'].includes(color);
  }

  function getItemsByCat(categories) {
    return closetItems.filter(i => categories.includes(i.category));
  }

  // 365 OUTFIT GENERATOR
  function generate365Outfits() {
    if (closetItems.length < 3) return; // Need at least some items
    
    const tops = getItemsByCat(['Tops', 'Shirts', 'T-shirts']).sort(() => 0.5 - Math.random());
    const bottoms = getItemsByCat(['Pants / Jeans', 'Skirts']).sort(() => 0.5 - Math.random());
    const dresses = getItemsByCat(['Dresses / Frocks', 'Kurtis / Ethnic wear']).sort(() => 0.5 - Math.random());
    const shoes = getItemsByCat(['Shoes']).sort(() => 0.5 - Math.random());
    
    let allValidCombos = [];

    // Find all valid combinations based on color logic
    tops.forEach(t => {
      bottoms.forEach(b => {
        if (isColorMatch(t.color, b.color)) {
          if (shoes.length > 0) {
            shoes.forEach(s => {
              if (isColorMatch(s.color, t.color) || isColorMatch(s.color, b.color) || s.color === 'Black' || s.color === 'White') {
                allValidCombos.push([t.id, b.id, s.id]);
              }
            });
          } else {
            allValidCombos.push([t.id, b.id]);
          }
        }
      });
    });

    dresses.forEach(d => {
      if(shoes.length > 0) {
        shoes.forEach(s => {
           if (isColorMatch(d.color, s.color) || s.color === 'Black' || s.color === 'White') {
              allValidCombos.push([d.id, s.id]);
           }
        });
      } else {
        allValidCombos.push([d.id]);
      }
    });

    // Shuffle and slice to max 365
    allValidCombos = allValidCombos.sort(() => 0.5 - Math.random());
    
    // De-duplicate exactly identical combinations
    const uniqueCombos = [];
    const comboStrings = new Set();
    for (const combo of allValidCombos) {
      const sortedIds = [...combo].sort().join(',');
      if (!comboStrings.has(sortedIds)) {
        comboStrings.add(sortedIds);
        uniqueCombos.push(combo);
      }
    }

    outfits365 = uniqueCombos.slice(0, 365);
    localStorage.setItem('outfits365', JSON.stringify(outfits365));
  }

  // Run on startup
  if (outfits365.length === 0) {
    generate365Outfits();
  }

  // Render Outfits (Generator Tab)
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const occasion = document.getElementById('gen-occasion').value;
      const season = document.getElementById('gen-season').value;
      
      const grid = document.getElementById('generated-outfits');
      grid.innerHTML = '';
      
      let combos = outfits365.map(ids => ids.map(id => closetItems.find(i => i.id === id)).filter(Boolean));
      
      // Filter by season logic
      if (season === 'Summer') {
        combos = combos.filter(combo => combo.some(item => isLight(item.color)));
      } else if (season === 'Winter') {
        combos = combos.filter(combo => combo.some(item => isDark(item.color)));
      } else if (season === 'Rainy') {
        combos = combos.filter(combo => !combo.some(item => ['White', 'Cream', 'Beige'].includes(item.color)));
      }

      // Shuffle
      combos = combos.sort(() => 0.5 - Math.random()).slice(0, 12);
      
      if (combos.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; background: var(--surface-light); border-radius: 12px;">No matching outfits found for this criteria. Try changing the season or adding more clothes!</div>';
        return;
      }
      
      // Age rules logic
      let ageStyleTag = "Trendy";
      if (currentUser.age >= 23 && currentUser.age <= 35) ageStyleTag = "Smart Casual";
      else if (currentUser.age > 35) ageStyleTag = "Elegant";

      combos.forEach((combo, index) => {
        const div = document.createElement('div');
        div.className = 'outfit-card';
        
        let imgHtml = '';
        combo.forEach(i => {
          imgHtml += `<img src="${i.image}" alt="item">`;
        });
        
        div.innerHTML = `
          <div class="outfit-images">${imgHtml}</div>
          <div class="outfit-tags" style="margin-bottom: 10px;">
            <span class="tag"><i class="fa-solid fa-star"></i> ${occasion}</span>
            <span class="tag"><i class="fa-solid fa-cloud"></i> ${season}</span>
            <span class="tag" style="background: var(--info-color); color: #fff;">${ageStyleTag}</span>
          </div>
          <button class="btn-primary fav-btn" data-index="${index}" style="padding: 0.5rem; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 5px;">
            <i class="fa-solid fa-heart"></i> Save to Favorites
          </button>
        `;
        grid.appendChild(div);
      });
      
      document.querySelectorAll('#generated-outfits .fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.currentTarget.getAttribute('data-index');
          const comboIds = combos[index].map(item => item.id);
          closetFavorites.push(comboIds);
          localStorage.setItem('closetFavorites', JSON.stringify(closetFavorites));
          e.currentTarget.innerText = "Saved!";
          e.currentTarget.style.background = "var(--success-color)";
        });
      });
    });
  }

  // 6. Daily Outfit engine
  function renderDailyOutfits() {
    const display = document.getElementById('ootd-display');
    if(!display) return;
    
    const pref = document.getElementById('daily-preference').value;
    
    // We fetch combinations from the 365 array
    let pool = outfits365.map(ids => ids.map(id => closetItems.find(i => i.id === id)).filter(Boolean));
    
    if (pref !== 'Any') {
      pool = pool.filter(combo => combo.some(item => item.category.includes(pref) || pref.includes(item.category)));
    }
    
    // Filter out recently shown
    let freshPool = pool.filter(combo => {
      const idsStr = combo.map(i=>i.id).sort().join(',');
      return !recentDailyOutfits.includes(idsStr);
    });
    
    // If we run out of fresh outfits, reset history
    if (freshPool.length < 4) {
      recentDailyOutfits = [];
      freshPool = pool;
    }

    freshPool = freshPool.sort(() => 0.5 - Math.random());
    const dailySelections = freshPool.slice(0, 4); // Show 4 options
    
    if (dailySelections.length > 0) {
      display.innerHTML = '';
      
      dailySelections.forEach((combo, index) => {
        // Record as recently shown
        recentDailyOutfits.push(combo.map(i=>i.id).sort().join(','));
        sessionStorage.setItem('recentDailyOutfits', JSON.stringify(recentDailyOutfits));

        const div = document.createElement('div');
        div.className = 'outfit-card';
        div.style.background = 'var(--surface-color)';
        div.style.padding = '1rem';
        div.style.borderRadius = 'var(--border-radius)';
        div.style.boxShadow = 'var(--card-shadow)';
        
        let imgHtml = '';
        combo.forEach(item => {
          imgHtml += `<img src="${item.image}" alt="item" style="flex: 1; height: 120px; object-fit: cover; border-radius: 8px; width: 0;">`;
        });
        
        div.innerHTML = `
          <h4 style="margin-bottom: 10px; font-weight: 500;">Option ${index + 1}</h4>
          <div class="outfit-images" style="display: flex; gap: 8px; margin-bottom: 10px;">${imgHtml}</div>
          <button class="btn-primary daily-fav-btn" data-index="${index}" style="padding: 0.5rem; width: 100%; font-size: 0.85rem;"><i class="fa-solid fa-heart"></i> Save to Favorites</button>
        `;
        display.appendChild(div);
      });
      
      document.querySelectorAll('.daily-fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.currentTarget.getAttribute('data-index');
          const comboIds = dailySelections[index].map(item => item.id);
          closetFavorites.push(comboIds);
          localStorage.setItem('closetFavorites', JSON.stringify(closetFavorites));
          e.currentTarget.innerText = "Saved!";
          e.currentTarget.style.background = "var(--success-color)";
        });
      });

    } else {
      display.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem; grid-column: 1 / -1;"><i class="fa-solid fa-shirt" style="font-size: 3rem; margin-bottom: 1rem;"></i><p>No outfits found matching your preference! Upload more items.</p></div>';
    }
  }
  
  const refreshOotdBtn = document.getElementById('refresh-ootd');
  if(refreshOotdBtn) {
    refreshOotdBtn.addEventListener('click', renderDailyOutfits);
  }
  
  const dailyPrefSelect = document.getElementById('daily-preference');
  if(dailyPrefSelect) {
    dailyPrefSelect.addEventListener('change', renderDailyOutfits);
  }
  
  renderDailyOutfits();

  // Favorites Rendering
  function renderFavorites() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (closetFavorites.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 2rem;">No favorites yet! Heart some outfits first.</div>';
      return;
    }
    
    closetFavorites.forEach((comboIds, index) => {
      const combo = comboIds.map(id => closetItems.find(i => i.id === id)).filter(Boolean);
      if (combo.length === 0) return; // Ignore if items were deleted
      
      const div = document.createElement('div');
      div.className = 'outfit-card';
      
      let imgHtml = '';
      combo.forEach(i => {
        imgHtml += `<img src="${i.image}" alt="item">`;
      });
      
      div.innerHTML = `
        <div class="outfit-images" style="margin-bottom: 10px;">${imgHtml}</div>
        <button class="btn-secondary remove-fav-btn" data-index="${index}" style="width: 100%; padding: 0.5rem; color: var(--error-color);"><i class="fa-solid fa-trash"></i> Remove</button>
      `;
      grid.appendChild(div);
    });
    
    document.querySelectorAll('.remove-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        closetFavorites.splice(index, 1);
        localStorage.setItem('closetFavorites', JSON.stringify(closetFavorites));
        renderFavorites();
      });
    });
  }

  // 7. Analysis & Shopping Suggestions
  function renderAnalysis() {
    const tops = getItemsByCat(['Tops', 'Shirts', 'T-shirts']);
    const bottoms = getItemsByCat(['Pants / Jeans', 'Skirts']);
    const shoes = getItemsByCat(['Shoes']);
    
    let feedback = "";
    const suggestions = [];
    
    if (!tops.some(t => t.color === 'White')) {
      suggestions.push({
        name: "Classic White Shirt", price: "₹799",
        img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80",
        link: "https://www.myntra.com/white-shirt"
      });
    }
    if (!bottoms.some(b => b.color === 'Blue' && b.category === 'Pants / Jeans')) {
      suggestions.push({
        name: "Blue Denim Jeans", price: "₹1299",
        img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80",
        link: "https://www.amazon.in/s?k=blue+jeans"
      });
    }
    if (!shoes.some(s => s.color === 'Black')) {
      suggestions.push({
        name: "Black Casual Shoes", price: "₹1499",
        img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80",
        link: "https://www.flipkart.com/search?q=black+casual+shoes"
      });
    }
    
    if(suggestions.length > 0) {
      feedback = "You are missing some essential pieces. Fill these gaps to drastically increase your 365 possible outfits!";
    } else {
      feedback = "Your closet is extremely versatile! You have all the core essentials.";
    }
    
    const feedbackEl = document.getElementById('style-feedback');
    if(feedbackEl) feedbackEl.innerText = feedback;
    
    const shopDiv = document.getElementById('shop-suggestions');
    if(shopDiv) {
      shopDiv.innerHTML = '';
      suggestions.forEach(s => {
        shopDiv.innerHTML += `
          <div class="shop-card">
            <img src="${s.img}" alt="${s.name}">
            <h4 style="margin-bottom: 0.5rem; font-weight: 500;">${s.name}</h4>
            <p style="color: var(--accent-color); font-weight: 600; margin-bottom: 10px;">${s.price}</p>
            <a href="${s.link}" target="_blank" style="text-decoration: none;">
              <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem; width: 100%;">Buy Now</button>
            </a>
          </div>
        `;
      });
    }
  }

  // Feedback Submission
  const feedbackForm = document.getElementById('feedback-form');
  if(feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rating = document.getElementById('feedback-rating').value;
      const comment = document.getElementById('feedback-comment').value;
      
      let storedFeedback = JSON.parse(localStorage.getItem('closetFeedback')) || [];
      storedFeedback.push({ rating, comment, date: new Date().toISOString() });
      localStorage.setItem('closetFeedback', JSON.stringify(storedFeedback));
      
      alert('Thank you for your feedback! It has been recorded.');
      document.getElementById('feedback-comment').value = '';
    });
  }
}
