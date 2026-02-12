document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule');
    const searchInput = document.getElementById('search');

    let talks = [];

    fetch('talks.json')
        .then(response => response.json())
        .then(data => {
            talks = data;
            renderSchedule(talks);
        });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTalks = talks.filter(talk => 
            talk.categories.some(category => category.toLowerCase().includes(searchTerm))
        );
        renderSchedule(filteredTalks);
    });

    function renderSchedule(talksToRender) {
        scheduleContainer.innerHTML = '';
        let currentTime = new Date();
        currentTime.setHours(10, 0, 0, 0);

        const formatTime = (date) => {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        let talkIndex = 0;
        for (let i = 0; i < 8; i++) { // 6 talks + 1 lunch + 1 for last break slot
            if (i === 3) {
                const lunchEndTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
                const breakElement = document.createElement('div');
                breakElement.className = 'break';
                breakElement.innerHTML = `<h3>${formatTime(currentTime)} - ${formatTime(lunchEndTime)}</h3><p>Lunch Break</p>`;
                scheduleContainer.appendChild(breakElement);
                currentTime = lunchEndTime;
                continue;
            }

            if (talkIndex < talksToRender.length) {
                const talk = talksToRender[talkIndex];
                const talkEndTime = new Date(currentTime.getTime() + 60 * 60 * 1000);

                const talkElement = document.createElement('div');
                talkElement.className = 'talk';

                const categories = talk.categories.map(cat => `<span class="category">${cat}</span>`).join('');

                talkElement.innerHTML = `
                    <h3>${formatTime(currentTime)} - ${formatTime(talkEndTime)}</h3>
                    <h2>${talk.title}</h2>
                    <div class="meta">
                        <p><strong>Speakers:</strong> ${talk.speakers.join(', ')}</p>
                    </div>
                    <p>${talk.description}</p>
                    <div class="categories">${categories}</div>
                `;
                scheduleContainer.appendChild(talkElement);

                currentTime = talkEndTime;
                talkIndex++;

                if (i < 7 && i !== 2) { // Add breaks after talks, but not after the last one or before lunch
                    const breakEndTime = new Date(currentTime.getTime() + 10 * 60 * 1000);
                     if (talkIndex < talksToRender.length) {
                        const breakElement = document.createElement('div');
                        breakElement.className = 'break';
                        breakElement.innerHTML = `<p>Transition</p>`;
                        scheduleContainer.appendChild(breakElement);
                    }
                    currentTime = breakEndTime;
                }
            }
        }
    }
});
