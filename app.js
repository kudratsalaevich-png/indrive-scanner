const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const instruction = document.getElementById('instruction');

let currentStep = 'license_front'; 
let collectedPhotos = {};

// 1. Камерани юқори сифатда (HD) ва мажбурий ишга тушириш
const constraints = {
    video: {
        facingMode: "environment", // Орқа камера
        width: { ideal: 1280 },
        height: { ideal: 720 }
    },
    audio: false
};

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        video.srcObject = stream;
        // Баъзи телефонларда мажбурий юргизиш
        video.onloadedmetadata = () => {
            video.play().catch(e => console.log("Камера авто-плей бўлмади:", e));
        };
    })
    .catch(err => {
        alert("Камерани очиб бўлмади. Рухсатларни текширинг: " + err);
    });

// 2. Расмга олиш
captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    // Расм сифати юқори бўлиши учун видеонинг асл ўлчамини оламиз
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Сифатли сурат олиш (JPEG, 0.9 сифат)
    const photoData = canvas.toDataURL('image/jpeg', 0.9);

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
        
        // Ҳамма расмлар йиғилди! Маълумотни Telegram-га юборамиз
        // Нариги бетга ўтиши учун Telegram WebApp нинг махсус функциясини чақирамиз
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify(collectedPhotos));
            setTimeout(() => {
                window.Telegram.WebApp.close(); // Ойнани ёпиш
            }, 500);
        } else {
            alert("Рўйхатдан ўтиш якунланди! (Ботдан ташқарида)");
        }
    }
});

// Ойнани тўлиқ экран қилиш
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}
