const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const instruction = document.getElementById('instruction');

let currentStep = 'license_front'; 
let collectedPhotos = {};

const constraints = {
    video: {
        facingMode: "environment", 
        width: { ideal: 1920 }, // Янада юқорироқ сифат (Full HD)
        height: { ideal: 1080 }
    },
    audio: false
};

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play().catch(e => console.log(e));
        };
    })
    .catch(err => {
        alert("Камера хатолиги: " + err);
    });

captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Расм сифатини 0.85 қиламиз, бу сервер тезроқ қабул қилиши ва қотмаслигига ёрдам беради
    const photoData = canvas.toDataURL('image/jpeg', 0.85);

    if (currentStep === 'license_front') {
        collectedPhotos.license_front = photoData;
        currentStep = 'license_back';
        instruction.innerHTML = "🪪 ПРАВАНИНГ ОРҚА ТОМОНИНИ РАМКАГА ЖОЙЛАШТИРИНГ";
    } 
    else if (currentStep === 'license_back') {
        collectedPhotos.license_back = photoData;
        currentStep = 'passport_front';
        instruction.innerHTML = "📄 ТЕХПАСПОРТНИНГ ОЛДИ ТОМОНИНИ РАМКАГА ЖОЙЛАШТИРИНГ";
    }
    else if (currentStep === 'passport_front') {
        collectedPhotos.passport_front = photoData;
        currentStep = 'passport_back';
        instruction.innerHTML = "📄 ТЕХПАСПОРТНИНГ ОРҚА ТОМОНИНИ РАМКАГА ЖОЙЛАШТИРИНГ";
    }
    else if (currentStep === 'passport_back') {
        collectedPhotos.passport_back = photoData;
        
        instruction.innerHTML = "⏳ МАЪЛУМОТЛАР ЮБОРЕЛИШМОҚДА, КУТИНГ...";
        captureButton.style.display = 'none'; // Қайта босмаслик учун тугмани яширамиз

        // Қотиб қолмаслик учун Telegram-га маълумотни хавфсиз юбориш
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                window.Telegram.WebApp.sendData(JSON.stringify(collectedPhotos));
                // Юборилгандан сўнг ойнани мажбурий ёпиш
                setTimeout(() => {
                    window.Telegram.WebApp.close();
                }, 300);
            } catch (e) {
                alert("Юборишда хатолик: " + e);
            }
        }
    }
});

if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}
