document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const header = document.querySelector('.header');
    
    // Intelligent Search Elements
    const searchToggle = document.getElementById('searchToggle');
    const mainSearchInput = document.getElementById('mainSearchInput');
    const liveSuggestions = document.getElementById('liveSuggestions');
    
    // Faceted Collection Elements
    const facetItems = document.querySelectorAll('.facet-group li');
    const productsGrid = document.getElementById('productsGrid');
    const currentViewTitle = document.getElementById('currentViewTitle');
    const resultsCount = document.getElementById('resultsCount');
    const sortSelect = document.getElementById('sortSelect');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    // Concierge Elements
    const conciergeTrigger = document.getElementById('conciergeTrigger');
    const conciergePanel = document.getElementById('conciergePanel');
    const closeConcierge = document.getElementById('closeConcierge');
    const conciergeChat = document.getElementById('conciergeChat');
    const conciergeInput = document.getElementById('conciergeInput');
    const conciergeSend = document.getElementById('conciergeSend');
    const conciergeSuggestions = document.querySelectorAll('#conciergeSuggestions button');

    // Modal Elements
    const productModal = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');
    const modalImg = document.getElementById('modalImg');
    const modalSeries = document.getElementById('modalSeries');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalFormat = document.getElementById('modalFormat');
    const modalColor = document.getElementById('modalColor');
    const modalStyle = document.getElementById('modalStyle');
    const modalBox = document.getElementById('modalBox');
    const modalTags = document.getElementById('modalTags');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    
    // Mobile Filter
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const exploreCategories = document.querySelector('.explore-categories');
    
    // Create overlay for mobile filter
    const mobileFilterOverlay = document.createElement('div');
    mobileFilterOverlay.className = 'mobile-filter-overlay';
    document.body.appendChild(mobileFilterOverlay);

    if (typeof products === 'undefined') {
        console.error('Products data not loaded');
        return;
    }

    // State
    let activeFilters = {
        colours: [],
        styles: [],
        occasions: [],
        formats: []
    };
    let currentFilteredProducts = [...products];
    let displayedCount = 0;
    const itemsPerPage = 24;

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // Toggle search from header
    searchToggle.addEventListener('click', () => {
        document.getElementById('find-card').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => mainSearchInput.focus(), 500);
    });

    // --- Intelligent Search (Live Suggestions) ---
    mainSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        liveSuggestions.innerHTML = '';
        
        if (query.length < 2) {
            liveSuggestions.classList.remove('active');
            return;
        }

        // Tokenize query
        const tokens = query.split(' ');

        // Find matches
        const matches = products.filter(p => {
            const searchableText = [
                p.code, p.name, 
                ...p.colours, ...p.styles, ...p.occasions, ...p.tags, ...p.formats
            ].join(' ').toLowerCase();

            // All tokens must be present in searchableText
            return tokens.every(token => searchableText.includes(token));
        });

        if (matches.length === 0) {
            liveSuggestions.innerHTML = '<div class="suggestion-group">No results found</div>';
            liveSuggestions.classList.add('active');
            return;
        }

        // Group by Categories for UI (Styles, Colours, Cards)
        const matchedStyles = [...new Set(matches.flatMap(p => p.styles).filter(s => s.includes(tokens[0])))].slice(0, 3);
        const matchedColours = [...new Set(matches.flatMap(p => p.colours).filter(c => c.includes(tokens[0])))].slice(0, 3);
        const cardMatches = matches.slice(0, 5);

        let html = '';
        
        if (matchedStyles.length > 0) {
            html += `<div class="suggestion-group">Styles</div>`;
            matchedStyles.forEach(s => {
                html += `<div class="suggestion-item" onclick="applySearchFilter('styles', '${s}')">
                            <i class="fas fa-search" style="color:#ccc;"></i> ${capitalize(s)}
                         </div>`;
            });
        }
        
        if (matchedColours.length > 0) {
            html += `<div class="suggestion-group">Colours</div>`;
            matchedColours.forEach(c => {
                html += `<div class="suggestion-item" onclick="applySearchFilter('colours', '${c}')">
                            <i class="fas fa-search" style="color:#ccc;"></i> ${capitalize(c)}
                         </div>`;
            });
        }

        if (cardMatches.length > 0) {
            html += `<div class="suggestion-group">Cards</div>`;
            cardMatches.forEach(c => {
                html += `<div class="suggestion-item" onclick="openProductByCode('${c.code}')">
                            <img src="${c.image}" class="suggestion-img" alt="${c.code}">
                            <div>
                                <div style="font-family: 'Playfair Display', serif;">${c.name}</div>
                                <div style="font-size:0.8rem; color:#888;">₹${c.price} • ${c.formats[0] || 'Card'}</div>
                            </div>
                         </div>`;
            });
        }

        html += `<div class="suggestion-item" style="justify-content:center; color:var(--color-gold); text-transform:uppercase; font-size:0.8rem; letter-spacing:1px;" onclick="executeFullSearch('${query}')">
                    View all ${matches.length} results
                 </div>`;

        liveSuggestions.innerHTML = html;
        liveSuggestions.classList.add('active');
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.intelligent-search-box')) {
            liveSuggestions.classList.remove('active');
        }
    });

    document.querySelectorAll('.popular-searches .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            executeFullSearch(tag.textContent);
            mainSearchInput.value = tag.textContent;
        });
    });

    // --- Faceted Explore Section ---
    
    facetItems.forEach(item => {
        item.addEventListener('click', () => {
            const facetType = item.getAttribute('data-facet');
            const facetValue = item.getAttribute('data-value');
            
            // Toggle active class
            item.classList.toggle('active');
            
            // Update activeFilters
            if (item.classList.contains('active')) {
                activeFilters[facetType].push(facetValue);
            } else {
                activeFilters[facetType] = activeFilters[facetType].filter(v => v !== facetValue);
            }
            
            updateGridTitle();
            applyFilters();
        });
    });

    sortSelect.addEventListener('change', () => {
        applyFilters();
    });

    function updateGridTitle() {
        const activeLabels = [];
        facetItems.forEach(item => {
            if (item.classList.contains('active')) activeLabels.push(item.textContent);
        });

        if (activeLabels.length === 0) {
            currentViewTitle.textContent = "All Invitations";
        } else {
            currentViewTitle.textContent = activeLabels.join(', ');
        }
    }

    function applyFilters(customMatchList = null) {
        let results = customMatchList || products;

        if (!customMatchList) {
            // Apply Facets
            const { colours, styles, occasions, formats } = activeFilters;
            
            results = results.filter(p => {
                if (colours.length > 0 && !colours.some(c => p.colours.includes(c))) return false;
                if (styles.length > 0 && !styles.some(s => p.styles.includes(s))) return false;
                if (occasions.length > 0 && !occasions.some(o => p.occasions.includes(o))) return false;
                if (formats.length > 0 && !formats.some(f => p.formats.includes(f))) return false;
                return true;
            });
        }

        // Apply Sorting
        const sortVal = sortSelect.value;
        if (sortVal === 'price-asc') results.sort((a,b) => a.price - b.price);
        else if (sortVal === 'price-desc') results.sort((a,b) => b.price - a.price);
        else if (sortVal === 'newest') results.sort((a,b) => b.code.localeCompare(a.code));
        else results.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

        currentFilteredProducts = results;
        
        // Reset and Render
        displayedCount = 0;
        productsGrid.innerHTML = '';
        resultsCount.textContent = `${results.length} items found`;
        
        if (results.length === 0) {
            productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 4rem 0; color:#888;">No invitations match your exact criteria. Try adjusting your filters.</div>';
            loadMoreContainer.style.display = 'none';
        } else {
            renderNextBatch();
        }
        
        document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
        
        // Close mobile filter if open
        exploreCategories.classList.remove('active');
        mobileFilterOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Mobile filter toggle
    if (mobileFilterBtn) {
        mobileFilterBtn.addEventListener('click', () => {
            exploreCategories.classList.add('active');
            mobileFilterOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    mobileFilterOverlay.addEventListener('click', () => {
        exploreCategories.classList.remove('active');
        mobileFilterOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    function renderNextBatch() {
        const batch = currentFilteredProducts.slice(displayedCount, displayedCount + itemsPerPage);
        
        batch.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.onclick = () => openModal(product);
            
            const formatText = (product.formats && product.formats.length) ? capitalize(product.formats[0]) : 'Premium Invitation';
            const priceText = product.price > 0 ? ` • ₹${product.price}` : '';

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.code}" class="product-image" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-meta">${formatText}${priceText}</div>
                    <h3 class="product-title">${product.name}</h3>
                </div>
            `;
            productsGrid.appendChild(card);
        });

        displayedCount += batch.length;
        
        if (displayedCount >= currentFilteredProducts.length) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
        }
    }

    loadMoreBtn.addEventListener('click', renderNextBatch);

    // Global Functions for inline onclick handlers
    window.applySearchFilter = (facetType, value) => {
        liveSuggestions.classList.remove('active');
        mainSearchInput.value = '';
        
        // Reset all facets visually and logically
        facetItems.forEach(i => i.classList.remove('active'));
        activeFilters = { colours: [], styles: [], occasions: [], formats: [] };
        
        // Find the specific facet and activate it
        const targetFacet = Array.from(facetItems).find(i => i.getAttribute('data-facet') === facetType && i.getAttribute('data-value') === value);
        if (targetFacet) {
            targetFacet.classList.add('active');
            activeFilters[facetType].push(value);
            updateGridTitle();
            applyFilters();
        }
    };

    window.openProductByCode = (code) => {
        liveSuggestions.classList.remove('active');
        const product = products.find(p => p.code === code);
        if (product) openModal(product);
    };

    window.executeFullSearch = (query) => {
        query = query.toLowerCase().trim();
        liveSuggestions.classList.remove('active');
        
        const tokens = query.split(' ');
        const matches = products.filter(p => {
            const searchableText = [p.code, p.name, ...p.colours, ...p.styles, ...p.occasions, ...p.tags, ...p.formats].join(' ').toLowerCase();
            return tokens.every(token => searchableText.includes(token));
        });

        // Clear visual active facets
        facetItems.forEach(i => i.classList.remove('active'));
        activeFilters = { colours: [], styles: [], occasions: [], formats: [] };
        
        currentViewTitle.textContent = `Search: "${capitalize(query)}"`;
        applyFilters(matches);
    };

    // --- AI Concierge ---
    conciergeTrigger.addEventListener('click', () => {
        conciergePanel.classList.toggle('active');
        if (conciergePanel.classList.contains('active')) {
            conciergeInput.focus();
        }
    });

    closeConcierge.addEventListener('click', () => {
        conciergePanel.classList.remove('active');
    });

    function appendMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `message ${sender}`;
        msg.innerHTML = text;
        
        // Insert before the input area
        conciergeChat.insertBefore(msg, document.getElementById('conciergeSuggestions'));
        conciergeChat.scrollTop = conciergeChat.scrollHeight;
    }

    function processConciergeQuery(query) {
        query = query.toLowerCase();
        
        // Simple Intent/Keyword Matching Algorithm
        let priceMatch = query.match(/under (\d+)/);
        let maxPrice = priceMatch ? parseInt(priceMatch[1]) : Infinity;
        
        let foundColours = [];
        let foundStyles = [];
        let foundOccasions = [];
        
        const possibleColours = ['red', 'burgundy', 'maroon', 'gold', 'ivory', 'pink', 'green'];
        const possibleStyles = ['royal', 'traditional', 'minimal', 'contemporary', 'elegant'];
        const possibleOccasions = ['wedding', 'engagement', 'reception'];
        
        possibleColours.forEach(c => { if (query.includes(c)) foundColours.push(c); });
        possibleStyles.forEach(s => { if (query.includes(s)) foundStyles.push(s); });
        possibleOccasions.forEach(o => { if (query.includes(o)) foundOccasions.push(o); });

        const isBox = query.includes('box');

        // Filter products based on detected intent
        const matches = products.filter(p => {
            if (p.price > maxPrice) return false;
            if (foundColours.length > 0 && !foundColours.some(c => p.colours.includes(c))) return false;
            if (foundStyles.length > 0 && !foundStyles.some(s => p.styles.includes(s))) return false;
            if (foundOccasions.length > 0 && !foundOccasions.some(o => p.occasions.includes(o))) return false;
            if (isBox && !p.formats.includes('premium box')) return false;
            return true;
        });

        // Generate response
        setTimeout(() => {
            if (matches.length > 0) {
                let responseText = "I found some beautiful options for you. ";
                if (foundStyles.length > 0) responseText += `These ${foundStyles[0]} designs match perfectly. `;
                else if (foundColours.length > 0) responseText += `I've selected our finest ${foundColours[0]} invitations. `;
                
                if (maxPrice < Infinity) responseText += `All under ₹${maxPrice}.`;

                appendMessage(responseText, 'bot');
                
                // Show top 3 matches as interactive cards in chat
                const topMatches = matches.slice(0, 3);
                let cardsHtml = '<div style="display:flex; flex-direction:column; gap:10px; margin-top:10px; width:85%;">';
                topMatches.forEach(m => {
                    cardsHtml += `
                        <div style="background:#fff; border:1px solid #EDE8E3; border-radius:4px; padding:10px; display:flex; gap:15px; cursor:pointer;" onclick="openProductByCode('${m.code}')">
                            <img src="${m.image}" style="width:60px; height:60px; object-fit:cover;">
                            <div>
                                <div style="font-family:'Playfair Display',serif;">${m.name}</div>
                                <div style="font-size:0.8rem; color:#888;">₹${m.price}</div>
                            </div>
                        </div>
                    `;
                });
                cardsHtml += `</div>
                    <div style="margin-top:10px;">
                        <button onclick="executeFullSearch('${query}')" style="background:transparent; border:1px solid #C5A059; color:#C5A059; padding:5px 15px; border-radius:20px; font-size:0.8rem; cursor:pointer;">
                            View all ${matches.length} matches
                        </button>
                    </div>`;
                
                appendMessage(cardsHtml, 'bot');
            } else {
                appendMessage("I couldn't find exact matches for that description. Could you try adjusting your requirements? Perhaps a different style or colour?", 'bot');
            }
        }, 800);
    }

    conciergeSend.addEventListener('click', () => {
        const val = conciergeInput.value.trim();
        if (val) {
            appendMessage(val, 'user');
            document.getElementById('conciergeSuggestions').style.display = 'none';
            conciergeInput.value = '';
            processConciergeQuery(val);
        }
    });

    conciergeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') conciergeSend.click();
    });

    conciergeSuggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            appendMessage(query, 'user');
            document.getElementById('conciergeSuggestions').style.display = 'none';
            processConciergeQuery(query);
        });
    });

    // --- Lightbox Modal ---

    function openModal(product) {
        modalImg.src = product.image;
        modalSeries.textContent = product.group ? `Series ${product.group}` : product.id;
        modalTitle.textContent = product.name;
        modalPrice.textContent = product.price > 0 ? `₹${product.price}` : 'Price on Request';
        
        // Hide missing specs dynamically
        const formatContainer = modalFormat.parentElement;
        if (product.formats && product.formats.length) {
            modalFormat.textContent = capitalize(product.formats[0]);
            formatContainer.style.display = 'flex';
        } else {
            formatContainer.style.display = 'none';
        }

        const colorContainer = modalColor.parentElement;
        if (product.colours && product.colours.length) {
            modalColor.textContent = product.colours.map(capitalize).join(', ');
            colorContainer.style.display = 'flex';
        } else {
            colorContainer.style.display = 'none';
        }

        const styleContainer = modalStyle.parentElement;
        if (product.styles && product.styles.length) {
            modalStyle.textContent = product.styles.map(capitalize).join(', ');
            styleContainer.style.display = 'flex';
        } else {
            styleContainer.style.display = 'none';
        }

        const boxContainer = modalBox.parentElement;
        if (product.boxTypes && product.boxTypes.length) {
            modalBox.textContent = capitalize(product.boxTypes[0]);
            boxContainer.style.display = 'flex';
        } else {
            boxContainer.style.display = 'none';
        }

        // Tags
        modalTags.innerHTML = '';
        if (product.tags) {
            product.tags.forEach(tag => {
                const span = document.createElement('span');
                span.textContent = tag;
                modalTags.appendChild(span);
            });
        }

        // Pre-fill WhatsApp message
        const message = encodeURIComponent(`Hi BhatiaCards, I'm interested in card ${product.id} (${product.name}).`);
        whatsappBtn.href = `https://wa.me/919815882824?text=${message}`;

        productModal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
        
        // Zoom reset
        modalImg.classList.remove('zoomed');

        downloadPdfBtn.onclick = () => generatePDF(product);
    }

    closeModal.addEventListener('click', () => {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    modalImg.addEventListener('click', () => {
        modalImg.classList.toggle('zoomed');
    });

    // --- Utilities ---

    function capitalize(str) {
        if (!str) return '';
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function generatePDF(product) {
        if (typeof window.jspdf === 'undefined') {
            alert('PDF Library not loaded yet.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(`BhatiaCards - ${product.id}`, 10, 20);
        doc.setFontSize(12);
        doc.text(product.name, 10, 30);
        
        const img = new Image();
        img.src = product.image;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg');
            
            doc.addImage(imgData, 'JPEG', 10, 40, 180, (180 * img.height) / img.width);
            doc.save(`BhatiaCards_${product.code}.pdf`);
        };
        img.onerror = function() {
            doc.text('(Image could not be loaded into PDF)', 10, 40);
            doc.save(`BhatiaCards_${product.code}.pdf`);
        };
    }

    // Initial Render
    applyFilters();
});
