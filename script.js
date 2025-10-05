// Dynamic Island Main Functionality
class DynamicIsland {
    constructor() {
        this.island = null;
        this.collapsedContent = null;
        this.navbarContent = null;
        this.navLinks = null;
        this.musicActivity = null;
        this.callActivity = null;
        this.timeDisplay = null;
        
        this.isExpanded = false;
        this.currentActivity = null;
        this.callStartTime = null;
        this.callInterval = null;
        this.floatInterval = null;
        
        this.init();
    }

    init() {
        try {
            this.selectElements();
            this.setupEventListeners();
            this.startTimeUpdate();
            this.startFloatingAnimation();
            console.log('Dynamic Island initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Dynamic Island:', error);
            this.showErrorFallback();
        }
    }

    selectElements() {
        this.island = document.getElementById('dynamic-island');
        this.collapsedContent = document.getElementById('island-collapsed');
        this.navbarContent = document.getElementById('navbar-content');
        this.navLinks = document.querySelectorAll('.navbar-content a');
        this.musicActivity = document.querySelector('.music-activity');
        this.callActivity = document.querySelector('.call-activity');
        this.timeDisplay = document.getElementById('time-display');
        
        // Demo control buttons
        this.showMusicBtn = document.getElementById('show-music-btn');
        this.showCallBtn = document.getElementById('show-call-btn');
        this.hideActivityBtn = document.getElementById('hide-activity-btn');
        this.resetIslandBtn = document.getElementById('reset-island-btn');

        // Validate required elements
        if (!this.island) throw new Error('Dynamic island element not found');
        if (!this.timeDisplay) throw new Error('Time display element not found');
    }

    setupEventListeners() {
        // Island interactions
        this.island.addEventListener('click', (e) => this.handleIslandClick(e));
        this.island.addEventListener('mouseenter', () => this.handleIslandHover());
        this.island.addEventListener('mouseleave', () => this.handleIslandLeave());
        
        // Touch support for mobile
        this.island.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleIslandClick(e);
        });

        // Demo controls
        if (this.showMusicBtn) {
            this.showMusicBtn.addEventListener('click', () => this.showMusicActivity());
        }
        if (this.showCallBtn) {
            this.showCallBtn.addEventListener('click', () => this.showCallActivity());
        }
        if (this.hideActivityBtn) {
            this.hideActivityBtn.addEventListener('click', () => this.hideActivity());
        }
        if (this.resetIslandBtn) {
            this.resetIslandBtn.addEventListener('click', () => this.resetIsland());
        }

        // Nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e, link));
        });

        // Close navbar when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isExpanded && !this.island.contains(e.target)) {
                this.collapseIsland();
            }
        });

        // Escape key support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentActivity) {
                    this.hideActivity();
                } else if (this.isExpanded) {
                    this.collapseIsland();
                }
            }
        });
    }

    handleIslandClick(e) {
        e.stopPropagation();
        this.createRipple(e);
        
        if (this.currentActivity) {
            this.hideActivity();
        } else {
            this.toggleIsland();
        }
    }

    handleIslandHover() {
        if (!this.isExpanded && !this.currentActivity) {
            this.island.style.transform = 'translateX(-50%) scale(1.05)';
        }
    }

    handleIslandLeave() {
        if (!this.isExpanded && !this.currentActivity) {
            this.island.style.transform = 'translateX(-50%) scale(1)';
        }
    }

    handleNavLinkClick(e, link) {
        e.stopPropagation();
        e.preventDefault();
        
        // Update active state
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Close island after navigation
        this.collapseIsland();
        
        console.log(`Navigating to: ${link.textContent.trim()}`);
        
        // Here you would typically handle actual navigation
        // For demo purposes, we'll just log it
    }

    createRipple(event) {
        const ripple = document.createElement('span');
        const rect = this.island.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        // Get position for both mouse and touch events
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        const x = clientX - rect.left - size / 2;
        const y = clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            z-index: 10001;
        `;

        this.island.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Activity Management
    showMusicActivity() {
        if (this.currentActivity === 'music') return;
        
        this.hideCurrentActivity();
        this.collapseIsland();
        
        gsap.to(this.collapsedContent, { opacity: 0, duration: 0.2 });
        
        gsap.to(this.island, {
            width: 280,
            height: 44,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(this.musicActivity, { 
                    opacity: 1, 
                    duration: 0.3,
                    onComplete: () => {
                        this.musicActivity.hidden = false;
                    }
                });
                this.currentActivity = 'music';
                this.updateAccessibility();
            }
        });
    }

    showCallActivity() {
        if (this.currentActivity === 'call') return;
        
        this.hideCurrentActivity();
        this.collapseIsland();
        
        gsap.to(this.collapsedContent, { opacity: 0, duration: 0.2 });
        this.startCallTimer();
        
        gsap.to(this.island, {
            width: 200,
            height: 44,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(this.callActivity, { 
                    opacity: 1, 
                    duration: 0.3,
                    onComplete: () => {
                        this.callActivity.hidden = false;
                    }
                });
                this.currentActivity = 'call';
                this.updateAccessibility();
            }
        });
    }

    hideActivity() {
        if (!this.currentActivity) return;
        
        this.hideCurrentActivity();
        
        gsap.to(this.island, {
            width: 146,
            height: 44,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(this.collapsedContent, { 
                    opacity: 1, 
                    duration: 0.3 
                });
                this.currentActivity = null;
                this.updateAccessibility();
            }
        });
    }

    hideCurrentActivity() {
        if (this.currentActivity === 'music') {
            gsap.to(this.musicActivity, { 
                opacity: 0, 
                duration: 0.2,
                onComplete: () => {
                    this.musicActivity.hidden = true;
                }
            });
        } else if (this.currentActivity === 'call') {
            gsap.to(this.callActivity, { 
                opacity: 0, 
                duration: 0.2,
                onComplete: () => {
                    this.callActivity.hidden = true;
                }
            });
            this.stopCallTimer();
        }
    }

    // Island Expansion/Collapse
    toggleIsland() {
        if (this.isExpanded) {
            this.collapseIsland();
        } else {
            this.expandIsland();
        }
    }

    expandIsland() {
        if (this.isExpanded) return;
        
        const timeline = gsap.timeline();
        
        timeline
            .to(this.island, {
                width: '88%',
                maxWidth: '480px',
                height: '56px',
                duration: 0.6,
                ease: 'power2.out'
            })
            .to(this.collapsedContent, { 
                opacity: 0, 
                duration: 0.2 
            }, '-=0.3')
            .to(this.navbarContent, { 
                opacity: 1, 
                duration: 0.3 
            }, '-=0.2')
            .to(this.navLinks, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.1');
        
        this.navbarContent.hidden = false;
        this.island.classList.add('expanded');
        this.isExpanded = true;
        this.updateAccessibility();
    }

    collapseIsland() {
        if (!this.isExpanded) return;
        
        const timeline = gsap.timeline();
        
        timeline
            .to(this.navLinks, { 
                opacity: 0, 
                y: 10, 
                duration: 0.2, 
                stagger: 0.05 
            })
            .to(this.navbarContent, { 
                opacity: 0, 
                duration: 0.2 
            }, '-=0.1')
            .to(this.island, {
                width: '146px',
                height: '44px',
                duration: 0.5,
                ease: 'power2.out'
            })
            .to(this.collapsedContent, { 
                opacity: 1, 
                duration: 0.3 
            }, '-=0.2');
        
        this.island.classList.remove('expanded');
        this.isExpanded = false;
        this.navbarContent.hidden = true;
        this.updateAccessibility();
    }

    resetIsland() {
        this.hideActivity();
        this.collapseIsland();
        this.navLinks.forEach(link => link.classList.remove('active'));
    }

    // Utility Functions
    startTimeUpdate() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.timeDisplay.textContent = `${hours}:${minutes}`;
    }

    startCallTimer() {
        this.callStartTime = new Date();
        this.callInterval = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.callStartTime) / 1000);
            const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
            const seconds = (diff % 60).toString().padStart(2, '0');
            const callTimer = document.getElementById('call-timer');
            if (callTimer) {
                callTimer.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    stopCallTimer() {
        if (this.callInterval) {
            clearInterval(this.callInterval);
            this.callInterval = null;
        }
        const callTimer = document.getElementById('call-timer');
        if (callTimer) {
            callTimer.textContent = '00:00';
        }
    }

    startFloatingAnimation() {
        let floatUp = true;
        this.floatInterval = setInterval(() => {
            if (!this.isExpanded && !this.currentActivity) {
                this.island.style.transform = `translateX(-50%) translateY(${floatUp ? '-2px' : '2px'})`;
                floatUp = !floatUp;
            }
        }, 3000);
    }

    updateAccessibility() {
        // Update ARIA labels based on current state
        const expanded = this.isExpanded || this.currentActivity;
        this.island.setAttribute('aria-expanded', expanded);
        
        if (this.currentActivity === 'music') {
            this.island.setAttribute('aria-label', 'Music player controls');
        } else if (this.currentActivity === 'call') {
            this.island.setAttribute('aria-label', 'Active call controls');
        } else if (this.isExpanded) {
            this.island.setAttribute('aria-label', 'Expanded navigation menu');
        } else {
            this.island.setAttribute('aria-label', 'Dynamic Island navigation');
        }
    }

    showErrorFallback() {
        console.error('Dynamic Island failed to initialize');
        // You could show a user-friendly error message here
    }

    // Cleanup method for when component is destroyed
    destroy() {
        if (this.floatInterval) {
            clearInterval(this.floatInterval);
        }
        if (this.callInterval) {
            clearInterval(this.callInterval);
        }
        // Remove event listeners if needed
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Remove loading state
    document.body.classList.remove('loading');
    
    // Initialize Dynamic Island
    window.dynamicIsland = new DynamicIsland();
    
    // Auto-demo sequences (optional)
    setTimeout(() => {
        if (window.dynamicIsland && !window.dynamicIsland.currentActivity) {
            window.dynamicIsland.showMusicActivity();
        }
    }, 2000);
    
    setTimeout(() => {
        if (window.dynamicIsland && window.dynamicIsland.currentActivity === 'music') {
            window.dynamicIsland.hideActivity();
        }
    }, 5000);
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicIsland;
}
