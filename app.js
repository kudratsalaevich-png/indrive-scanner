const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const instruction = document.getElementById('instruction');

let currentStep = 'license_front'; // Қадамлар: license_front, license_back, passport_front, passport_back
let collectedPhotos = {};

// 1. Телефон камерасини ишга тушириш (Орқа камера устувор)
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        alert("Камерага рухсат берилмади ёки хатолик: " + err);
    });

// 2. Расмга олиш тугмаси босилганда
captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Расмни Base64 (матн) форматига ўтказамиз
    const photoData = canvas.toDataURL('image/jpeg');

    if (currentStep === 'license_front') {
        collectedPhotos.license_front = photoData;
        currentStep = 'license_back';
        instruction.innerHTML = "🪪 ЭНДИ ПРАВАНИНГ ОРҚА ТОМОНИНИ РАМКАГА ЖОЙЛАШТИРИНГ";
        alert("Олди томони олинди! Энди орқа томонини туширинг.");
    } 
    else if (currentStep === 'license_back') {
        collectedPhotos.license_back = photoData;
        currentStep = 'passport_front';
        instruction.innerHTML = "📄 ТЕХПАСПОРТНИНГ ОЛДИ ТОМОНИНИ РАМКАГА ЖОЙЛАШТИРИНГ";
        alert("Права тўлиқ олинди! Энди Техпаспорт олди томонини туширинг.");
    }
    else if (currentStep === 'passport_front') {
        collectedPhotos.passport_front = photoData;
        currentStep = 'passport_back';
        instruction.innerHTML = "📄 ТЕХПАСПОРТНИНГ ОРҚА ТОМОНИНИ РАМКАГА ЖОЙЛАШТИРИНГ";
        alert("Энди Техпаспорт орқа томонини туширинг.");
    }
    else if (currentStep === 'passport_back') {
        collectedPhotos.passport_back = photoData;
        
        // Ҳамма расмлар йиғилди, маълумотни Telegram ботга қайтарамиз
        Telegram.WebApp.sendData(JSON.stringify(collectedPhotos));
        Telegram.WebApp.close(); // Ойнани ёпамиз
    }
});

// Telegram ойнасини тўлиқ экранда очиш
Telegram.WebApp.ready();
Telegram.WebApp.expand();
