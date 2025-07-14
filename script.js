function getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Inter';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Hello, world!', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Hello, world!', 4, 17);
    const fullFingerprint = canvas.toDataURL();
    return fullFingerprint.substring(0, fullFingerprint.indexOf('iVBORw0KGgoAAAA') + 15);
}

function collectFingerprint() {
    return {
        canvasFingerprint: getCanvasFingerprint(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
    };
}

async function sendFingerprint() {
    const fingerprintData = collectFingerprint();
    try {
        const response = await fetch('http://127.0.0.1:3000/get-fingerprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fingerprintData)
        });
        const data = await response.json();
        if (data.error) {
            console.error('Error:', data.error);
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('error-message').style.display = 'block';
            return false;
        }
        updateFingerprintInfo(data.clickCount);
        document.getElementById('click-circle').textContent = data.clickCount;
        window.canvasFingerprint = fingerprintData.canvasFingerprint;
        // Hide loading overlay and show main content only on success
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        return true;
    } catch (error) {
        console.error('Error sending fingerprint:', error);
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
        return false;
    }
}

async function updateClickCountPeriodically() {
    const fingerprintData = collectFingerprint();
    try {
        const response = await fetch('http://127.0.0.1:3000/get-fingerprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fingerprintData)
        });
        const data = await response.json();
        if (!data.error) {
            updateFingerprintInfo(data.clickCount);
            document.getElementById('click-circle').textContent = data.clickCount;
        }
    } catch (error) {
        console.error('Error updating click count:', error);
    }
}

async function decrementClick() {
    let clickCount = parseInt(document.getElementById('click-circle').textContent);
    if (clickCount > 0) {
        clickCount--;
        document.getElementById('click-circle').textContent = clickCount;
        updateFingerprintInfo(clickCount);
        try {
            await fetch('http://127.0.0.1:3000/update-clicks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ canvasFingerprint: window.canvasFingerprint, clickCount })
            });
        } catch (error) {
            console.error('Error updating click count:', error);
        }
    }
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(particle);
    }
}

let isArabic = false;

function updateFingerprintInfo(clickCount) {
    const fingerprintInfo = document.getElementById('fingerprint-info');
    fingerprintInfo.innerHTML = `
        <ul>
            <li><strong>${isArabic ? 'عدد الضغطات' : 'Click Count'}:</strong> ${clickCount}</li>
        </ul>
    `;
}

function toggleLanguage() {
    isArabic = !isArabic;
    const html = document.documentElement;
    const toggleButton = document.getElementById('language-toggle');
    const mainTitle = document.querySelector('.main-title');
    const subtitle = document.querySelector('.subtitle');
    const submitButton = document.querySelector('.submit-btn');

    if (isArabic) {
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
        toggleButton.textContent = 'English';
        mainTitle.textContent = 'بصمه الجهاز';
        subtitle.textContent = 'افتح هذه الصفحة في متصفحات او مصتفح خفي لترى اذا كان يعمل والضغطات تغيرت او لا';
        submitButton.textContent = 'اضغط هنا';
        updateFingerprintInfo(parseInt(document.getElementById('click-circle').textContent));
    } else {
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
        toggleButton.textContent = 'العربية';
        mainTitle.textContent = 'Device Fingerprint Information';
        subtitle.textContent = 'Open this page in browsers or incognito browser to see if it works and the clicks have changed or not.';
        submitButton.textContent = 'Click Here';
        updateFingerprintInfo(parseInt(document.getElementById('click-circle').textContent));
    }
}

window.onload = async () => {
    createParticles();
    const success = await sendFingerprint();
    if (success) {
        // Start periodic updates every 0.25 seconds (250ms)
        setInterval(updateClickCountPeriodically, 250);
    }
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
};