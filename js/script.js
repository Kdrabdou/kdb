document.addEventListener('DOMContentLoaded', () => {

            /* ==========================================================================
               1. BARRE DE DEFILEMENT ET GESTION DU HEADER
               ========================================================================== */
            const header = document.getElementById('main-header');
            const burgerMenu = document.getElementById('burger-menu');
            const navMenu = document.getElementById('nav-menu');
            const navLinks = document.querySelectorAll('.nav-link');
            const scrollProgress = document.getElementById('scroll-progress');
            const backToTop = document.getElementById('back-to-top');

            // Sections mises en cache une seule fois (évite une requête DOM à chaque scroll)
            const trackedSections = document.querySelectorAll('section[id], header[id]');

            function handleScroll() {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;

                header.classList.toggle('scrolled', scrollTop > 50);

                if (docHeight > 0) {
                    scrollProgress.style.width = `${(scrollTop / docHeight) * 100}%`;
                }

                backToTop.style.display = scrollTop > 500 ? 'flex' : 'none';

                // Liaison active dynamique des liens de navigation
                trackedSections.forEach(section => {
                    const sectionTop = section.offsetTop - 120;
                    const sectionHeight = section.offsetHeight;
                    const id = section.getAttribute('id');
                    if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                        navLinks.forEach(link => {
                            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                        });
                    }
                });
            }

            // Limite les recalculs au rythme d'affichage (requestAnimationFrame) pour de meilleures performances
            let scrollTicking = false;
            window.addEventListener('scroll', () => {
                if (!scrollTicking) {
                    window.requestAnimationFrame(() => {
                        handleScroll();
                        scrollTicking = false;
                    });
                    scrollTicking = true;
                }
            }, { passive: true });

            // Action de défilement vers le haut
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // Menu Burger mobile
            burgerMenu.addEventListener('click', () => {
                const isOpen = navMenu.classList.toggle('open');
                burgerMenu.classList.toggle('open', isOpen);
                burgerMenu.setAttribute('aria-expanded', String(isOpen));

                // Change burger color if header not scrolled
                const burgerBars = document.querySelectorAll('.burger-menu .bar');
                burgerBars.forEach(bar => bar.style.backgroundColor = isOpen ? 'var(--secondary-color)' : '#ffffff');
            });

            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    burgerMenu.classList.remove('open');
                    navMenu.classList.remove('open');
                    burgerMenu.setAttribute('aria-expanded', 'false');
                    document.querySelectorAll('.burger-menu .bar').forEach(bar => bar.style.backgroundColor = '#ffffff');
                });
            });

            /* ==========================================================================
               2. EFFET MACHINE A ECRIRE (TYPEWRITER HERO)
               ========================================================================== */
            const typewriterEl = document.getElementById('typewriter-text');
            if (typewriterEl) {
                const words = JSON.parse(typewriterEl.getAttribute('data-words'));
                let wordIdx = 0, charIdx = 0, isDeleting = false, currentText = '';

                function type() {
                    const fullWord = words[wordIdx];
                    if (isDeleting) {
                        currentText = fullWord.substring(0, charIdx - 1);
                        charIdx--;
                    } else {
                        currentText = fullWord.substring(0, charIdx + 1);
                        charIdx++;
                    }

                    typewriterEl.innerHTML = `L'étude : <span style="color:var(--secondary-color)">${currentText}</span><span class="cursor" style="animation: blink 0.8s infinite">|</span>`;
                    let typeSpeed = isDeleting ? 40 : 80;

                    if (!isDeleting && currentText === fullWord) {
                        typeSpeed = 2000;
                        isDeleting = true;
                    } else if (isDeleting && currentText === '') {
                        isDeleting = false;
                        wordIdx = (wordIdx + 1) % words.length;
                        typeSpeed = 500;
                    }
                    setTimeout(type, typeSpeed);
                }
                setTimeout(type, 500);
            }

            /* ==========================================================================
               3. DIAPORAMA DE L'ACCUEIL (HERO SLIDER)
               ========================================================================== */
            const slides = document.querySelectorAll('.hero-slider .slide');
            if (slides.length > 0) {
                let currentSlide = 0;
                setInterval(() => {
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add('active');
                }, 6000);
            }

            /* ==========================================================================
               4. ANIMATION AU SCROLL & COMPTEURS STATISTIQUES (OBSERVER)
               ========================================================================== */
            const revealElements = document.querySelectorAll('.reveal');
            const scrollObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        if (entry.target.classList.contains('stat-item')) {
                            animateCounter(entry.target.querySelector('.stat-number'));
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            revealElements.forEach(el => scrollObserver.observe(el));

            function animateCounter(counterEl) {
                if (!counterEl) return;
                const target = +counterEl.getAttribute('data-target');
                const count = +counterEl.innerText;
                const increment = target / 60;
                if (count < target) {
                    counterEl.innerText = Math.ceil(count + increment);
                    setTimeout(() => animateCounter(counterEl), 25);
                } else { 
                    counterEl.innerText = target; 
                }
            }

            /* ==========================================================================
               5. SYSTEME DE FILTRAGE DES ACTUALITES
               ========================================================================== */
            const filterButtons = document.querySelectorAll('.filter-btn');
            const articles = document.querySelectorAll('.news-card');

            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    const filterValue = button.getAttribute('data-filter');

                    articles.forEach((article, idx) => {
                        const cat = article.getAttribute('data-category');
                        if (filterValue === 'all' || cat === filterValue) {
                            article.classList.remove('hide');
                            article.style.transitionDelay = `${idx * 0.05}s`;
                            setTimeout(() => article.classList.add('active'), 50);
                        } else {
                            article.classList.add('hide');
                            article.classList.remove('active');
                        }
                    });
                });
            });

            /* ==========================================================================
               6. MEDIATHEQUE VIDEO HTML5 ROBUSTE ET VISIONNEUSE PHOTO
               ========================================================================== */
            // --- Galerie d'images ---
            const lightboxModal = document.getElementById('lightbox-modal');
            const lightboxImg = document.getElementById('lightbox-img');
            const modalCaption = document.getElementById('modal-caption');
            const galleryTriggers = document.querySelectorAll('.lightbox-trigger');
            let currentImgIdx = 0;
            const imagesArray = Array.from(galleryTriggers).map(img => ({
                src: img.getAttribute('src'), alt: img.getAttribute('alt')
            }));

            function openLightbox(index) {
                currentImgIdx = index;
                lightboxImg.src = imagesArray[currentImgIdx].src;
                modalCaption.innerText = imagesArray[currentImgIdx].alt;
                lightboxModal.classList.add('open');
            }

            galleryTriggers.forEach((trigger, idx) => {
                trigger.addEventListener('click', () => openLightbox(idx));
            });

            document.querySelector('.next-modal').addEventListener('click', (e) => {
                e.stopPropagation();
                currentImgIdx = (currentImgIdx + 1) % imagesArray.length;
                openLightbox(currentImgIdx);
            });

            document.querySelector('.prev-modal').addEventListener('click', (e) => {
                e.stopPropagation();
                currentImgIdx = (currentImgIdx - 1 + imagesArray.length) % imagesArray.length;
                openLightbox(currentImgIdx);
            });

            // --- Lecteur Vidéo (Iframe YouTube officielle + vidéos MP4 directes) ---
            const videoModal = document.getElementById('video-modal');
            const customVideoPlayer = document.getElementById('custom-video-player');
            const videoTriggers = document.querySelectorAll('.video-thumbnail-wrapper');

            /**
             * Construit une URL d'embed YouTube valide et complète à partir d'un ID de vidéo.
             * Utilise youtube-nocookie.com (mode confidentialité renforcée) et transmet
             * le paramètre "origin" requis par l'API YouTube pour éviter l'erreur 153.
             */
            function buildYoutubeEmbedUrl(videoId) {
                const origin = window.location.origin;
                const params = new URLSearchParams({
                    autoplay: '1',
                    rel: '0',
                    modestbranding: '1',
                    playsinline: '1',
                    enablejsapi: '1',
                    origin: origin
                });
                return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
            }

            function openVideoModal(trigger) {
                if (!customVideoPlayer) return;
                const videoId = trigger.getAttribute('data-video-id');
                const directUrl = trigger.getAttribute('data-video-url');
                const src = videoId ? buildYoutubeEmbedUrl(videoId) : directUrl;
                if (!src) return;
                customVideoPlayer.src = src;
                videoModal.classList.add('open');
            }

            function closeVideoModal() {
                videoModal.classList.remove('open');
                if (customVideoPlayer) {
                    customVideoPlayer.src = ''; // Stoppe totalement la lecture (YouTube et MP4)
                }
            }

            videoTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => openVideoModal(trigger));
                // Accessibilité clavier : Entrée ou Espace ouvrent la vidéo
                trigger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openVideoModal(trigger);
                    }
                });
            });

            // Fermeture globale des modales ouvertes (clic en dehors du contenu)
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target.classList.contains('modal-content') || e.target.id === 'custom-video-player') return;
                    modal.classList.remove('open');
                    closeVideoModal();
                });
            });

            document.querySelectorAll('.close-modal').forEach(closeBtn => {
                closeBtn.addEventListener('click', () => {
                    lightboxModal.classList.remove('open');
                    closeVideoModal();
                });
            });

            // Fermeture au clavier (touche Échap) pour toutes les modales
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    lightboxModal.classList.remove('open');
                    closeVideoModal();
                }
            });

            /* ==========================================================================
               7. CONFIGURATION DU CAROUSEL DE TEMOIGNAGES
               ========================================================================== */
            const slider = document.getElementById('testimonial-slider');
            const slidesTesti = document.querySelectorAll('.testimonial-slide');
            const prevBtn = document.getElementById('slider-prev');
            const nextBtn = document.getElementById('slider-next');
            const dotsContainer = document.getElementById('slider-dots');
            let testiIdx = 0, autoSlideInterval;

            if (slidesTesti.length > 0) {
                slidesTesti.forEach((_, idx) => {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    if (idx === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => goToTesti(idx));
                    dotsContainer.appendChild(dot);
                });

                const dots = document.querySelectorAll('.dot');

                function updateSliderState() {
                    slider.style.transform = `translateX(-${testiIdx * 100}%)`;
                    dots.forEach(d => d.classList.remove('active'));
                    dots[testiIdx].classList.add('active');
                }

                function nextTesti() { 
                    testiIdx = (testiIdx + 1) % slidesTesti.length; 
                    updateSliderState(); 
                }
                function prevTesti() { 
                    testiIdx = (testiIdx - 1 + slidesTesti.length) % slidesTesti.length; 
                    updateSliderState(); 
                }
                function goToTesti(index) { 
                    testiIdx = index; 
                    updateSliderState(); 
                    resetAutoSlide(); 
                }

                nextBtn.addEventListener('click', () => { nextTesti(); resetAutoSlide(); });
                prevBtn.addEventListener('click', () => { prevTesti(); resetAutoSlide(); });

                function startAutoSlide() { autoSlideInterval = setInterval(nextTesti, 6000); }
                function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }
                startAutoSlide();
            }

            /* ==========================================================================
               8. QUESTIONS ACCORDEONS
               ========================================================================== */
            const faqQuestions = document.querySelectorAll('.faq-question');
            faqQuestions.forEach(q => {
                q.setAttribute('aria-expanded', 'false');
                q.addEventListener('click', () => {
                    const item = q.parentElement;
                    const isOpen = item.classList.contains('active');
                    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                    document.querySelectorAll('.faq-question').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
                    if (!isOpen) {
                        item.classList.add('active');
                        q.setAttribute('aria-expanded', 'true');
                    }
                });
            });

            /* ==========================================================================
               9. VALIDATION DES ENTREES DU FORMULAIRE DE CONTACT
               ========================================================================== */
            const form = document.getElementById('contact-form');
            const formResponse = document.getElementById('form-response');

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    let isValid = true;

                    const name = document.getElementById('name');
                    if (name.value.trim().length < 3) { showInvalid(name); isValid = false; } else { removeInvalid(name); }

                    const email = document.getElementById('email');
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showInvalid(email); isValid = false; } else { removeInvalid(email); }

                    const phone = document.getElementById('phone');
                    if (phone.value.trim().length < 8) { showInvalid(phone); isValid = false; } else { removeInvalid(phone); }

                    const subject = document.getElementById('subject');
                    if (subject.value === "") { showInvalid(subject); isValid = false; } else { removeInvalid(subject); }

                    const message = document.getElementById('message');
                    if (message.value.trim().length < 10) { showInvalid(message); isValid = false; } else { removeInvalid(message); }

                    if (isValid) {
                        formResponse.className = "form-response success";
                        formResponse.innerHTML = `<i class="fas fa-check-circle"></i> Demande reçue avec succès. L'Étude de Maître Kane Dan Baou Siradji vous contactera rapidement.`;
                        form.reset();
                    }
                });

                function showInvalid(el) { el.parentElement.classList.add('invalid'); }
                function removeInvalid(el) { el.parentElement.classList.remove('invalid'); }
            }

            /* ==========================================================================
               10. GESTION DU MODE SOMBRE / CLAIR (BASCULE)
               ========================================================================== */
            const themeToggle = document.getElementById('theme-toggle');
            const storedTheme = localStorage.getItem('theme');

            if (storedTheme) {
                document.documentElement.setAttribute('data-theme', storedTheme);
                if (storedTheme === 'dark') { themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
            }

            themeToggle.addEventListener('click', () => {
                let current = document.documentElement.getAttribute('data-theme');
                if (current === 'dark') {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                }
            });

            // Injection dynamique de l'année au footer
            const yearEl = document.getElementById('current-year');
            if (yearEl) { yearEl.innerText = new Date().getFullYear(); }
        });
