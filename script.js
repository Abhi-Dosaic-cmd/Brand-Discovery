document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('discoveryForm');
    const sections = document.querySelectorAll('.form-section');
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const bgMesh = document.getElementById('bgMesh');

    let currentStep = 1;
    const totalSteps = sections.length;

    // --- Premium Background Generation ---
    function initBackground() {
        const colors = ['#f3a93b', '#ffffff', '#222222'];
        for (let i = 0; i < 6; i++) {
            const dot = document.createElement('div');
            dot.className = 'bg-dot';
            const size = Math.random() * 400 + 200;
            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.backgroundColor = colors[i % colors.length];
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.top = `${Math.random() * 100}%`;
            dot.style.animationDelay = `${Math.random() * -20}s`;
            bgMesh.appendChild(dot);
        }
    }

    // --- Mouse Parallax Effect ---
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        const dots = document.querySelectorAll('.bg-dot');
        dots.forEach((dot, index) => {
            const speed = (index + 1) * 20;
            dot.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    initBackground();

    // --- Initialize Linear Scales ---
    document.querySelectorAll('.scale-options').forEach(container => {
        const options = container.querySelectorAll('.scale-option');
        const scaleName = container.dataset.scale;

        // Create hidden input for each scale if it doesn't exist
        let hiddenInput = form.querySelector(`input[name="${scaleName}"]`);
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = scaleName;
            hiddenInput.value = "";
            form.appendChild(hiddenInput);
        }

        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                hiddenInput.value = option.dataset.value;

                option.style.transform = 'scale(1.2) rotate(5deg)';
                setTimeout(() => option.style.transform = 'scale(1.15)', 200);
            });
        });
    });

    function updateUI() {
        // Update Sections
        sections.forEach(section => {
            section.classList.remove('active');
            if (parseInt(section.dataset.step) === currentStep) {
                section.classList.add('active');
            }
        });

        // Update Progress
        const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${percent}%`;

        // Update Buttons
        prevBtn.disabled = currentStep === 1;

        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateCurrentStep() {
        const currentSection = document.querySelector(`.form-section[data-step="${currentStep}"]`);
        const inputs = currentSection.querySelectorAll('input[required], textarea[required]');

        let isValid = true;
        inputs.forEach(input => {
            if (input.type === 'radio') {
                const name = input.name;
                const checked = currentSection.querySelector(`input[name="${name}"]:checked`);
                if (!checked) isValid = false;
            } else if (!input.value.trim()) {
                isValid = false;
            }
        });

        // Check active scales in this section
        const scales = currentSection.querySelectorAll('.scale-options');
        scales.forEach(scale => {
            const inputName = scale.dataset.scale;
            const hiddenInput = form.querySelector(`input[name="${inputName}"]`);
            if (!hiddenInput.value) isValid = false;
        });

        if (!isValid) {
            const warning = document.createElement('div');
            warning.textContent = 'Please fill in all required fields to continue.';
            warning.style.color = 'var(--accent-color)';
            warning.style.marginTop = '1rem';
            warning.style.textAlign = 'center';
            warning.classList.add('validation-warning');

            const existing = currentSection.querySelector('.validation-warning');
            if (!existing) {
                currentSection.querySelector('.card').appendChild(warning);
                setTimeout(() => warning.remove(), 3000);
            }
        }
        return isValid;
    }

    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (validateCurrentStep()) {
            const submitBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

            const formData = new FormData(form);
            const data = {};

            // Correctly handle multi-select checkboxes
            formData.forEach((value, key) => {
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            });

            // Convert arrays to comma-separated strings for Google Sheets
            for (let key in data) {
                if (Array.isArray(data[key])) {
                    data[key] = data[key].join(', ');
                }
            }

            // --- GOOGLE SHEETS INTEGRATION ---
            // Replace the URL below with your deployed Google Apps Script Web App URL
            const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby1lba0v4akRGfz-liPu7oqBAcgNysfaH3rJwSKjmRzvR5CjGVWE4aAoqmZgQB2x8uO/exec";

            try {
                if (SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_URL_HERE" && SCRIPT_URL !== "") {
                    // Use URLSearchParams for a 'simple' POST request that avoids CORS preflight
                    const params = new URLSearchParams();
                    for (const key in data) {
                        params.append(key, data[key]);
                    }

                    await fetch(SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params.toString()
                    });
                } else {
                    console.log("Mock Submission (No URL provided):", data);
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
                }

                // UI Transition on Success
                sections.forEach(s => s.style.display = 'none');
                document.getElementById('discoveryCard').style.display = 'none'; // Hide form card
                document.getElementById('completionCard').style.display = 'block';
                document.querySelector('.nav-buttons').style.display = 'none';
                document.querySelector('.progress-container').style.opacity = '0';

                // Add Download Button to Completion Card
                const actionContainer = document.getElementById('pdfActionContainer');
                actionContainer.innerHTML = ''; // Clear existing

                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'btn btn-primary';
                downloadBtn.style.margin = '10px';
                downloadBtn.innerHTML = '📥 Download Brand strategy PDF';
                downloadBtn.onclick = () => generatePDF(data);

                const printBtn = document.createElement('button');
                printBtn.className = 'btn btn-secondary';
                printBtn.style.margin = '10px';
                printBtn.innerHTML = '🖨️ Print Response copy';
                printBtn.onclick = () => window.print();

                actionContainer.appendChild(downloadBtn);
                actionContainer.appendChild(printBtn);

                createFloatingSparkles();

            } catch (error) {
                console.error('Submission failed:', error);
                alert('There was an error submitting your form. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtnText;
            }
        }
    });

    function generatePDF(data) {
        if (!window.jspdf) {
            alert("PDF library is still loading. Please wait a moment and try again.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const primaryColor = [243, 169, 59]; // #f3a93b

        // --- Document Header ---
        doc.setFillColor(30, 30, 30);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("BRAND STRATEGY BRIEF", 20, 25);

        doc.setFontSize(10);
        doc.text("Generated by Polaroid Dosa", 150, 25);

        // --- Content ---
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(16);
        doc.text(`Platform: ${data.platform_name || 'N/A'}`, 20, 55);

        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(1);
        doc.line(20, 60, 190, 60);

        let yPos = 75;
        const margin = 20;
        const pageWidth = 170;

        const sections = [
            { title: "Core Essence", key: "platform_description" },
            { title: "Target Audience", key: "usage_group" },
            { title: "Brand Personality", key: "personality" },
            { title: "Visual Style", key: "mood" },
            { title: "The 'X for Y' Statement", key: "brand_essence" }
        ];

        sections.forEach(section => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(section.title.toUpperCase(), margin, yPos);

            yPos += 7;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);

            const text = data[section.key] || "No data provided";
            const splitText = doc.splitTextToSize(text, pageWidth);
            doc.text(splitText, margin, yPos);

            yPos += (splitText.length * 5) + 15;
        });

        // --- Footer ---
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`© ${new Date().getFullYear()} Polaroid Dosa | Private & Confidential`, 20, 285);

        doc.save(`${data.platform_name || 'Brand'}_Strategy_Brief.pdf`);
    }

    function createFloatingSparkles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.width = Math.random() * 8 + 4 + 'px';
            sparkle.style.height = sparkle.style.width;
            sparkle.style.background = Math.random() > 0.5 ? 'var(--primary-color)' : 'var(--secondary-color)';
            if (Math.random() > 0.8) sparkle.style.background = 'var(--accent-color)';

            sparkle.style.borderRadius = '50%';
            sparkle.style.left = Math.random() * 100 + 'vw';
            sparkle.style.top = '105vh';
            sparkle.style.zIndex = '1000';
            sparkle.style.filter = 'blur(1px)';
            sparkle.style.boxShadow = `0 0 15px ${sparkle.style.background}`;
            document.body.appendChild(sparkle);

            const anim = sparkle.animate([
                { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translateY(-120vh) translateX(${Math.random() * 300 - 150}px) scale(0) rotate(720deg)`, opacity: 0 }
            ], {
                duration: 1500 + Math.random() * 2500,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            });

            anim.onfinish = () => sparkle.remove();
        }
    }

    updateUI();
});
