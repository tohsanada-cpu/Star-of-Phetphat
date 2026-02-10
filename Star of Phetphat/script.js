const space = document.getElementById('space');
let currentWishId = null; 

function createStar(name, text, color, size, isPublic, wishId,style = 'star1.png') {
    const space = document.getElementById('space');
    if (!space) return;

const star = document.createElement('div');
star.className = 'star';

const starIcon = document.createElement('div');
starIcon.className = 'star-icon';
//ดาว**************************************************
const img = document.createElement('img');
img.src = `assets/images/star/${style}`;
img.style.width = '100%';
img.style.height = '100%';

starIcon.appendChild(img);
//ดาว**************************************************
starIcon.style.color = color;

const starName = document.createElement('div');
starName.className = 'star-name';
starName.textContent = name;

star.appendChild(starIcon);
star.appendChild(starName);

    if (size === 'random' || size === '') {
        const randomSize = Math.floor(Math.random() * (48 - 16 + 1)) + 16;
        star.style.fontSize = randomSize + 'px';
    } else {
        star.style.fontSize = size;
    }

    star.style.left = (Math.random() * 90 + 5) + 'vw';
    const duration = Math.random() * 10 + 15;
    starIcon.style.animationDuration = duration + 's';
    star.style.animationDuration = duration + 's';

    if (isPublic === 'public') {
        star.style.cursor = 'pointer';
        star.onclick = (e) => {
            e.stopPropagation();
            openModal(name, text, wishId); 
        };
    }
    space.appendChild(star);
    
    setTimeout(() => {
        star.classList.add('fade-out');
    }, (duration - 1.5) * 1000); 

    setTimeout(() => {
        if (star.parentNode) star.remove();
    }, duration * 1000);
}

function sendWish() {
    const nameInput = document.getElementById('userName');
    const textInput = document.getElementById('wishText');
    const colorInput = document.getElementById('starColor');
    const sizeInput = document.getElementById('starSize');
    const privacyInput = document.querySelector('input[name="privacy"]:checked');

//เพิ่มดาว********
    const styleInput = document.getElementById('starStyle');
    const starStyle = styleInput.value;
//เพิ่มดาว********	

    const text = textInput.value.trim();
    if (!text) {
        alert("กรุณาใส่คำอธิษฐานก่อนนะ ✨");
        return;
    }

    const name = nameInput.value.trim() || "ผู้ไม่ประสงค์ออกนาม";
    const color = colorInput.value;
    const selectedSize = sizeInput.value;
    const privacy = privacyInput ? privacyInput.value : "public";

    database.ref('wishes').push({
        name: name,
        text: text,
        color: color,
        size: selectedSize,
	style: starStyle, // เพิ่มบรรทัดนี้
        privacy: privacy,
        timestamp: Date.now()
    }).then(() => {
        textInput.value = ""; 
        if(typeof playSound === 'function') playSound('sfx-launch');
    }).catch((err) => {
        console.error('Failed to send wish:', err);
    });
}

function openModal(name, text, wishId) {
    if (!wishId) return;

    if (currentWishId) {
        database.ref(`wishes/${currentWishId}/supports`).off();
    }

    currentWishId = wishId;
    const modal = document.getElementById('wishModal');
    const supportList = document.getElementById('supportList');

    if (!modal || !supportList) return;

    modal.style.display = "block";
    document.getElementById('modalName').innerText = "จาก: " + name;
    document.getElementById('modalText').innerText = text;

    supportList.innerHTML = '<p style="font-size:12px; color:#555;">กำลังดึงข้อความ...</p>';

    database.ref(`wishes/${wishId}/supports`).on('value', (snapshot) => {
        supportList.innerHTML = "";
        if (!snapshot.exists()) {
            supportList.innerHTML = '<p style="font-size:12px; color:#555;">ยังไม่มีข้อความส่งต่อ... เป็นคนแรกที่ให้กำลังใจดูไหม?</p>';
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const div = document.createElement('div');
            div.style = "background: rgba(255,255,255,0.07); padding: 10px; margin-bottom: 8px; border-radius: 12px; font-size: 13px; border-left: 3px solid #f1c40f; text-align: left;";
            div.innerHTML = `<span style="color:#f1c40f; font-size:11px; display:block; margin-bottom:3px;">เพื่อนรักแห่งดวงดาว :</span> ${data.message}`;
            supportList.appendChild(div);
        });
        supportList.scrollTop = supportList.scrollHeight;
    });
}

function sendSupport() {
    const input = document.getElementById('supportInput');
    const message = input.value.trim();
    if (!message || !currentWishId) return;

    database.ref(`wishes/${currentWishId}/supports`).push({
        message: message,
        timestamp: Date.now()
    }).then(() => {
        input.value = ""; 
    });
}

function giveHeart() {
    if (!currentWishId) return;
    database.ref(`wishes/${currentWishId}/hearts`).transaction((currentHearts) => {
        return (currentHearts || 0) + 1;
    });
    if (typeof playSound === 'function') playSound('sfx-heart');
}

window.onload = function() {
//เพิ่ม รูปแบบ
    const starStyles = [
        'star1.png',
        'star2.png',
        'star3.png',
        'star4.png'
    ];
//เพิ่ม
    const systemWishes = [
        ["ระบบ", "ขอให้เป็นวันที่สดใส", "#ffffff", "random", "public"],
        ["ระบบ", "ขอให้ทุกอย่างเป็นไปตามที่ต้องการ", "#ffffff", "random", "public"],
        ["ระบบ", "แค่นี้ก็เก่งมากแล้วนะ", "#ffffff", "random", "public"],
        ["ระบบ", "เราเชื่อในตัวแกนะ", "#ffffff", "random", "public"]
    ];

    systemWishes.forEach((wish, i) => {
        setTimeout(() => {
            createStar(
            wish[0],
            wish[1],
            wish[2],
            wish[3],
            wish[4],
            "system-star",
            starStyles[Math.floor(Math.random() * starStyles.length)]//เพิ่ม
        );
        }, i * 2500); 
    });

    setInterval(() => {
        const randomIndex = Math.floor(Math.random() * systemWishes.length);
        const wish = systemWishes[randomIndex];
        createStar(
        wish[0],
        wish[1],
        wish[2],
        "random",
        "public",
        "system-star",
        starStyles[Math.floor(Math.random() * starStyles.length)]//เพิ่ม
    );
    }, 6000); 
};

function toggleMusic() {
    const music = document.getElementById('bg-music');
    const btn = document.getElementById('music-toggle');
    if (music.paused) {
        music.play();
        music.volume = 0.1;
        btn.innerText = "🔊 ปิดเพลง";
    } else {
        music.pause();
        btn.innerText = "🔈 เปิดเพลง";
    }
}

function enableAutoplay() {
    const music = document.getElementById('bg-music');
    if(!music) return;
    music.volume = 0.1; 
    music.play().then(() => {
        const btn = document.getElementById('music-toggle');
        if (btn) btn.innerHTML = "🔊 ปิดเพลง";
    }).catch(e => console.log("Autoplay blocked"));
}

document.addEventListener('click', enableAutoplay, { once: true });

database.ref('wishes').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const wishId = snapshot.key; 

    if (data.privacy === 'public') {
        createStar(
            data.name,
            data.text,
            data.color,
            data.size,
            'public',
            wishId,
            data.style || 'star1.png' // ⭐ fallback
        );
    }
});

function closeModal() {
    const modal = document.getElementById('wishModal');
    if (modal) {
        modal.style.display = "none";
        if (currentWishId) {
            database.ref(`wishes/${currentWishId}/supports`).off();
        }
        currentWishId = null;
    }
}

function closeModalOutside(event) {
    const modal = document.getElementById('wishModal');
    if (event.target === modal) {
        closeModal();
    }
}

function toggleUI() {
    const ui = document.querySelector('.ui-container');
    const btn = document.getElementById('toggle-ui-btn');
    ui.classList.toggle('hidden');
    if (ui.classList.contains('hidden')) {
        btn.innerHTML = "👁️ แสดงเมนู";
    } else {
        btn.innerHTML = "👁️ ซ่อนเมนู";
    }
}