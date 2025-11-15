// Animations - Visual effects and celebrations
// Auto-generated from monolithic HTML - duplicates removed


// createDamageNumber
        function createDamageNumber(x, y, value, type = 'normal') {
            const damageEl = document.createElement('div');
            damageEl.className = `damage-number ${type}`;
            damageEl.textContent = type === 'heal' ? `+${value}` : `-${value}`;
            damageEl.style.left = `${x}px`;
            damageEl.style.top = `${y}px`;
            document.body.appendChild(damageEl);

            setTimeout(() => {
                damageEl.remove();
            }, 1000);
        }

// createParticle
        function createParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
            particle.style.animation = `particleFloat ${1 + Math.random()}s ease-out`;
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }

// showSuccess
        function showSuccess() {
            const successEl = document.querySelector('.success-pulse');
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 1000);
        }

// showTutorialStep
        function showTutorialStep(step) {
            const tooltip = document.querySelector('.tutorial-tooltip');
            const hole = document.querySelector('.spotlight-hole');
            const dots = document.querySelectorAll('.progress-dot');

            // Update progress dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index <= step);
            });

            // Update content
            tooltip.querySelector('.tutorial-title').textContent = tutorialSteps[step].title;
            tooltip.querySelector('.tutorial-text').textContent = tutorialSteps[step].text;

            // Position spotlight and tooltip
            // (In real implementation, position based on actual element coordinates)
        }

// triggerDivineFavor
        function triggerDivineFavor(amount) {
            const favorEl = document.querySelector('.divine-favor-gain');
            const amountEl = favorEl.querySelector('.favor-amount');
            amountEl.textContent = `+${amount}`;
            favorEl.style.display = 'block';

            setTimeout(() => {
                favorEl.style.display = 'none';
            }, 2000);
        }

// triggerLevelUp
        function triggerLevelUp() {
            const levelUpEl = document.querySelector('.level-up-burst');
            levelUpEl.style.display = 'block';

            // Create particles
            for (let i = 0; i < 30; i++) {
                createParticle(window.innerWidth / 2, window.innerHeight / 2);
            }

            setTimeout(() => {
                levelUpEl.style.display = 'none';
            }, 2000);
        }

// triggerQuestComplete
        function triggerQuestComplete() {
            const questEl = document.querySelector('.quest-complete');
            questEl.style.display = 'block';

            setTimeout(() => {
                questEl.style.display = 'none';
            }, 3000);
        }